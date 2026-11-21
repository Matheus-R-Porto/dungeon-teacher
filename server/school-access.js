import {Seasons} from './seasons.js';
import {defaultAppearance} from '../src/domain/appearance.js';
import {adoptJobs} from '../src/domain/character/job-progress.js';
import {randomBytes,randomUUID,createHash,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {validateAppearance,characterName} from '../src/domain/appearance.js';
const derive=promisify(scrypt),digest=s=>createHash('sha256').update(s).digest('hex');
const username=s=>{if(typeof s!=='string'||!/^[a-zA-Z0-9_.-]{3,32}$/.test(s))throw Error('Identificador inválido.');return s.toLowerCase();};
const password=s=>{if(typeof s!=='string'||s.length<10||s.length>128)throw Error('A senha precisa de 10 a 128 caracteres.');return s;};
export const SCHOOL_CONFIG=Object.freeze({cohortCapacity:30,sessionMs:4*3600000,idleMs:30*60000,shutdownMs:60000,loginWindowMs:15*60000,loginAttempts:8,ipAttempts:120,hashConcurrency:2});
const hashOptions={N:131072,r:8,p:1,maxmem:192*1024*1024};
export async function passwordHash(value){const salt=randomBytes(16).toString('hex'),key=await derive(password(value),salt,32,hashOptions);return `scrypt:131072:8:1:${salt}:${key.toString('hex')}`;}
export async function passwordMatches(value,encoded){const parts=encoded.split(':'),key=await derive(typeof value==='string'&&value.length<=128?value:'invalid',parts[4],32,hashOptions);return timingSafeEqual(key,Buffer.from(parts[5],'hex'));}
const dummy='scrypt:131072:8:1:98a83fc6a184bc912d33e0d88e56b338f:'+ '00'.repeat(32);

export class SchoolAccess {
 constructor(store,{now=()=>Date.now(),config={}}={}){
  this.store=store;this.db=store.db;this.now=now;this.config={...SCHOOL_CONFIG,...config};this.hashing=0;this.attempts=new Map();this.singleWorld=!!config.singleWorld;this.loginConnections=new Map();
  this.db.exec(`CREATE TABLE IF NOT EXISTS school_cohorts(id TEXT PRIMARY KEY,capacity INTEGER NOT NULL,open INTEGER NOT NULL DEFAULT 0,closes_at INTEGER);
   CREATE TABLE IF NOT EXISTS school_accounts(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('teacher','student')),cohort TEXT REFERENCES school_cohorts(id),blocked INTEGER NOT NULL DEFAULT 0,world_key TEXT NOT NULL UNIQUE,character_id TEXT UNIQUE REFERENCES characters(id));
   CREATE TABLE IF NOT EXISTS school_sessions(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL UNIQUE REFERENCES school_accounts(id),created INTEGER NOT NULL,expires INTEGER NOT NULL,touched INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS school_audit(id INTEGER PRIMARY KEY,at INTEGER NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL,target TEXT NOT NULL);`);
  for(const id of ['A','B'])this.db.prepare('INSERT OR IGNORE INTO school_cohorts(id,capacity,open) VALUES(?,?,0)').run(id,this.config.cohortCapacity);
  if(this.singleWorld)this.seasons=new Seasons(this);
 }
 audit(actor,action,target=''){this.db.prepare('INSERT INTO school_audit(at,actor,action,target) VALUES(?,?,?,?)').run(this.now(),actor,action,String(target).slice(0,128));}
 async hash(fn){if(this.hashing>=this.config.hashConcurrency)throw Error('Servidor conferindo acessos. Aguarde e tente novamente.');this.hashing++;try{return await fn();}finally{this.hashing--;}}
 async createAccount({username:login,password:secret,role='student',cohort},actor='bootstrap',authorize=()=>{}){
  login=username(login);password(secret);if(this.singleWorld&&role==='student')this.seasons.active();if(!['teacher','student'].includes(role)||role==='student'&&!this.singleWorld&&!['A','B'].includes(cohort))throw Error('Papel ou turma inválidos.');
  const encoded=await this.hash(()=>passwordHash(secret));
  return this.store.transaction(()=>{
   authorize();if(this.draining)throw Error('O servidor está encerrando.');if(this.db.prepare('SELECT id FROM school_accounts WHERE username=?').get(login))throw Error('Identificador já cadastrado.');
   if(role==='student'&&!this.singleWorld){const group=this.db.prepare('SELECT * FROM school_cohorts WHERE id=?').get(cohort),count=this.db.prepare("SELECT count(*) n FROM school_accounts WHERE cohort=? AND role='student'").get(cohort).n;if(count>=group.capacity)throw Error('Capacidade da turma atingida.');}
   const id=randomUUID();this.db.prepare('INSERT INTO school_accounts(id,username,password_hash,role,cohort,world_key) VALUES(?,?,?,?,?,?)').run(id,login,encoded,role,role==='student'&&!this.singleWorld?cohort:null,randomBytes(32).toString('hex'));if(this.singleWorld&&role==='student')this.db.prepare('UPDATE school_accounts SET season_id=? WHERE id=?').run(this.seasons.active().id,id);this.audit(actor,'account:create',id);return {id,username:login,role,cohort:role==='student'&&!this.singleWorld?cohort:null};
  });
 }
 rate(key,limit){const now=this.now();for(const [k,v]of this.attempts)if(now-v.at>this.config.loginWindowMs)this.attempts.delete(k);if(!this.attempts.has(key)){if(this.attempts.size>=4096)throw Error('Aguarde antes de tentar novamente.');this.attempts.set(key,{at:now,count:0});}if(++this.attempts.get(key).count>limit)throw Error('Muitas tentativas. Aguarde antes de tentar novamente.');}
 admission(account){if(this.draining)throw Error('O servidor está encerrando. Aguarde.');if(this.singleWorld){if(account.blocked)throw Error('Acesso bloqueado pelo professor.');this.seasons.admit(account);return;}if(account.role==='teacher')return;if(account.blocked)throw Error('Acesso bloqueado pelo professor.');const group=this.db.prepare('SELECT * FROM school_cohorts WHERE id=?').get(account.cohort);if(!group?.open||group.closes_at!==null)throw Error('Sua turma está fechada. Aguarde a liberação do professor.');}
 publicAccount(a){return {id:a.id,username:a.username,role:a.role,cohort:a.cohort,hasCharacter:!!a.character_id};}
 async authenticateCredentials(login,secret,ip){login=username(login);this.rate('u:'+login,this.config.loginAttempts);this.rate('ip:'+ip,this.config.ipAttempts);const account=this.db.prepare('SELECT * FROM school_accounts WHERE username=?').get(login),valid=await this.hash(()=>passwordMatches(secret,account?.password_hash??dummy));if(!valid||!account)throw Error('Usuário ou senha inválidos.');return this.db.prepare('SELECT * FROM school_accounts WHERE id=?').get(account.id);}
 async login(login,secret,ip){const account=await this.authenticateCredentials(login,secret,ip);this.admission(account);if(this.singleWorld&&(this.isOnline?.(account.id)||this.loginConnections.get(account.id)?.readyState===1))throw Error('Esta conta já está conectada. Saia no outro computador ou aguarde a recuperação da conexão.');
  // In the distributed school mode, live sessions were checked above; only disconnected credentials can be replaced.
  const token=randomBytes(32).toString('hex'),now=this.now();this.store.transaction(()=>{this.db.prepare('DELETE FROM school_sessions WHERE account_id=?').run(account.id);this.db.prepare('INSERT INTO school_sessions VALUES(?,?,?,?,?)').run(digest(token),account.id,now,now+this.config.sessionMs,now);this.audit(account.id,'login',account.id);});return {token,expires:now+this.config.sessionMs,account:this.publicAccount(account)};
 }
 session(token,{entry=false,teacher=false,touch=true}={}){
  if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))throw Error('Entre novamente para continuar.');
  const s=this.db.prepare('SELECT a.*,s.expires,s.touched,s.token_hash FROM school_sessions s JOIN school_accounts a ON a.id=s.account_id WHERE s.token_hash=?').get(digest(token)),now=this.now();
  if(!s||s.expires<=now||s.touched+this.config.idleMs<=now)throw Error('Sessão expirada. Entre novamente.');
  if(s.blocked)throw Error('Acesso bloqueado pelo professor.');if(teacher&&s.role!=='teacher')throw Error('Acesso reservado ao professor.');if(entry)this.admission(s);
  if(this.singleWorld)this.admission(s);const group=!this.singleWorld&&s.cohort&&this.db.prepare('SELECT * FROM school_cohorts WHERE id=?').get(s.cohort);if(group?.closes_at!==null&&group?.closes_at!==undefined&&group.closes_at<=now)throw Error('A aula foi encerrada pelo professor.');
  if(touch&&s.touched+30000<now)this.db.prepare('UPDATE school_sessions SET touched=? WHERE token_hash=?').run(now,s.token_hash);return s;
 }
 enter(token){const a=this.session(token,{entry:true});if(a.role!=='student'&&!this.singleWorld)throw Error('Use o painel do professor.');if(this.singleWorld&&this.isOnline?.(a.id))throw Error('Esta conta já está conectada no mundo. Aguarde a desconexão anterior.');if(!a.character_id)throw Error('Crie seu personagem primeiro.');const record=this.store.read(a.character_id);if(!record.character.jobs){adoptJobs(record.character);record.character.appearance??=defaultAppearance();this.store.save(record.id,{character:record.character,floor:record.floor,reached:record.reached,area:record.area});}return a;}
 createCharacter(token,name,appearance){const a=this.session(token,{entry:true});if(a.role!=='student'&&!this.singleWorld)throw Error('Conta de professor não cria personagem de aluno.');name=characterName(name);appearance=validateAppearance(appearance);
  return this.store.transaction(()=>{if(this.db.prepare('SELECT character_id FROM school_accounts WHERE id=?').get(a.id).character_id)throw Error('Esta conta já possui um personagem.');const record=this.store.authenticate(a.world_key,name);record.character.appearance=appearance;adoptJobs(record.character);record.character.jobs.visitedFloors=[];this.store.save(record.id,{character:record.character,floor:record.floor,reached:record.reached,area:record.area});this.db.prepare('UPDATE school_accounts SET character_id=? WHERE id=?').run(record.id,a.id);this.seasons?.attach(record.id);this.audit(a.id,'character:create',record.id);return {account:{...this.publicAccount(a),hasCharacter:true},character:{name,appearance}};});
 }
 revoke(token){const a=this.session(token);this.db.prepare('DELETE FROM school_sessions WHERE token_hash=?').run(a.token_hash);this.loginConnections.delete(a.id);this.onRevoke?.(a.id,'Você saiu da conta.');this.audit(a.id,'logout',a.id);}
 admin(token,action,target,value){const a=this.session(token,{teacher:true});if(this.singleWorld)throw Error('Use o Dungeon Teacher ADM para operações administrativas.');return this.store.transaction(()=>{
  if(['open','close','end','cancel-end'].includes(action)){
   const group=this.db.prepare('SELECT * FROM school_cohorts WHERE id=?').get(target);if(!group)throw Error('Turma inválida.');
   if(action==='open'){if(group.closes_at!==null)throw Error('Cancele o encerramento antes de liberar a turma.');this.db.prepare('UPDATE school_cohorts SET open=1 WHERE id=?').run(target);}
   if(action==='close')this.db.prepare('UPDATE school_cohorts SET open=0 WHERE id=?').run(target);
   if(action==='end'){if(group.closes_at!==null)throw Error('Encerramento já iniciado.');this.db.prepare('UPDATE school_cohorts SET open=0,closes_at=? WHERE id=?').run(this.now()+this.config.shutdownMs,target);}
   if(action==='cancel-end'){if(group.closes_at===null||group.closes_at<=this.now())throw Error('Não há encerramento cancelável.');this.db.prepare('UPDATE school_cohorts SET closes_at=NULL WHERE id=?').run(target);}
  }else if(['block','unblock'].includes(action)){const student=this.db.prepare("SELECT id FROM school_accounts WHERE id=? AND role='student'").get(target);if(!student)throw Error('Aluno inválido.');this.db.prepare('UPDATE school_accounts SET blocked=? WHERE id=?').run(action==='block'?1:0,target);if(action==='block')this.db.prepare('DELETE FROM school_sessions WHERE account_id=?').run(target);
  }else if(action==='capacity'){if(!['A','B'].includes(target)||!Number.isInteger(value)||value<1||value>60)throw Error('Capacidade inválida.');const count=this.db.prepare('SELECT count(*) n FROM school_accounts WHERE cohort=?').get(target).n;if(value<count)throw Error('Capacidade menor que o número de alunos cadastrados.');this.db.prepare('UPDATE school_cohorts SET capacity=? WHERE id=?').run(value,target);
  }else throw Error('Operação administrativa inválida.');this.audit(a.id,action,target);return {ok:true};
 });}
 overview(token,online){this.session(token,{teacher:true});const connected=new Set([...online.people.values()].filter(p=>p.ws).map(p=>p.id));return {now:this.now(),cohorts:this.db.prepare('SELECT * FROM school_cohorts ORDER BY id').all(),students:this.db.prepare("SELECT id,username,cohort,blocked,character_id FROM school_accounts WHERE role='student' ORDER BY cohort,username").all().map(s=>({...s,connected:connected.has(s.character_id)})),audit:this.db.prepare('SELECT at,actor,action,target FROM school_audit ORDER BY id DESC LIMIT 50').all()};}
 countdown(account){const group=!this.singleWorld&&account.cohort&&this.db.prepare('SELECT closes_at FROM school_cohorts WHERE id=?').get(account.cohort);return {serverNow:this.now(),closesAt:group?.closes_at??null};}
 expire(){const now=this.now();if(this.singleWorld){this.db.prepare('DELETE FROM school_sessions WHERE expires<=? OR touched<=?').run(now,now-this.config.idleMs);return;}this.store.transaction(()=>{for(const g of this.db.prepare('SELECT * FROM school_cohorts WHERE closes_at IS NOT NULL AND closes_at<=?').all(now)){this.db.prepare('DELETE FROM school_sessions WHERE account_id IN (SELECT id FROM school_accounts WHERE cohort=?)').run(g.id);this.db.prepare('UPDATE school_cohorts SET closes_at=NULL,open=0 WHERE id=?').run(g.id);this.audit('server','cohort:ended',g.id);}this.db.prepare('DELETE FROM school_sessions WHERE expires<=? OR touched<=?').run(now,now-this.config.idleMs);});}
}
