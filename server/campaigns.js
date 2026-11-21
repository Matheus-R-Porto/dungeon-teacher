import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {randomUUID,randomBytes,createHash,timingSafeEqual,X509Certificate} from 'node:crypto';
import {OnlineStore} from './online-store.js';
import {SchoolAccess,passwordHash} from './school-access.js';
import {Backups} from './backups.js';
import {serverIdentity} from './tls.js';

const digest=s=>createHash('sha256').update(s).digest();
function atomic(file,value){const temp=file+'.'+randomUUID()+'.tmp',fd=fs.openSync(temp,'wx');try{fs.writeFileSync(fd,JSON.stringify(value,null,2));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}fs.renameSync(temp,file);}
export class CampaignCatalog {
 constructor(root){this.root=path.resolve(root);fs.mkdirSync(this.root,{recursive:true});this.file=path.join(this.root,'campaigns.json');
  if(!fs.existsSync(this.file))atomic(this.file,{version:1,active:'legacy',entries:[{id:'legacy',name:'Campanha existente',created:Date.now()}]});
  this.value=JSON.parse(fs.readFileSync(this.file,'utf8'));if(this.value.version!==1||!Array.isArray(this.value.entries)||!this.value.entries.length||!this.value.entries.some(e=>e.id===this.value.active))throw Error('Catálogo de campanhas inválido. O arquivo foi preservado.');
  for(const e of this.value.entries)this.directory(e.id);
 }
 directory(id){if(id==='legacy')return this.root;if(!/^[a-f0-9-]{36}$/.test(id))throw Error('Campanha inválida.');const base=path.join(this.root,'campaigns'),dir=path.join(base,id);if(fs.existsSync(base)&&fs.lstatSync(base).isSymbolicLink()||fs.existsSync(dir)&&fs.lstatSync(dir).isSymbolicLink())throw Error('Link não permitido no armazenamento de campanhas.');return dir;}
 get active(){return this.value.entries.find(e=>e.id===this.value.active);}
 commit(value){atomic(this.file,value);this.value=value;}
}

export const campaignMethods={
 campaignStatus(){return {selected:this.catalog.active,campaigns:this.catalog.value.entries.map(e=>({...e,selected:e.id===this.catalog.value.active})),storageRoot:this.storageRoot,dataDirectory:this.root,storageError:this.storageError??null};},
 async createCampaign(token,{name,mode='continue',confirmed=false}={}){
  this.authorize(token);if(this.hub)throw Error('Encerre a sala antes de criar outra campanha.');if(!confirmed)throw Error('Confirme a criação; a campanha anterior será preservada.');
  if(typeof name!=='string'||!name.trim()||name.trim().length>80||!['continue','empty'].includes(mode))throw Error('Nome ou tipo de campanha inválido.');
  const backup=await this.backup(token),id=randomUUID(),directory=this.catalog.directory(id);fs.mkdirSync(path.join(directory,'characters'),{recursive:true});
  if(mode==='continue'){
   const saved=this.backups.validate(backup.id);fs.copyFileSync(saved.file,path.join(directory,'characters','characters.sqlite'));
   if(fs.existsSync(path.join(saved.dir,'maps')))fs.cpSync(path.join(saved.dir,'maps'),path.join(directory,'maps'),{recursive:true});
  }else{
   // Only the new, unpublished database is empty. Existing accounts/saves and
   // their consistent backup remain in their previous campaign, selectable.
   const fresh=new OnlineStore(path.join(directory,'characters'));
   try{new SchoolAccess(fresh,{config:{singleWorld:true}});for(const a of this.db.prepare("SELECT id,username,password_hash,role,world_key,blocked FROM school_accounts WHERE role='teacher'").all())fresh.db.prepare('INSERT INTO school_accounts(id,username,password_hash,role,world_key,blocked) VALUES(?,?,?,?,?,?)').run(a.id,a.username,a.password_hash,a.role,a.world_key,a.blocked);}finally{fresh.close();}
  }
  const verify=new Backups(directory);verify.verifyDatabase(path.join(directory,'characters','characters.sqlite'));
  const entry={id,name:name.trim(),created:this.now(),mode,derivedFrom:this.catalog.active.id,sourceBackup:backup.id};
  this.catalog.commit({...this.catalog.value,entries:[...this.catalog.value.entries,entry]});
  return this.selectCampaign(token,{id,confirmed:true});
 },
 selectCampaign(token,{id,confirmed=false}={}){
  this.authorize(token);if(this.hub)throw Error('Encerre a sala antes de trocar a campanha.');if(!confirmed)throw Error('Confirme a troca de campanha.');
  const entry=this.catalog.value.entries.find(e=>e.id===id);if(!entry)throw Error('Campanha não encontrada.');
  if(id===this.catalog.active.id)return this.campaignStatus();
  const directory=this.catalog.directory(id),backups=new Backups(directory);backups.recoverRestore();backups.verifyDatabase(path.join(directory,'characters','characters.sqlite'));
  const store=new OnlineStore(path.join(directory,'characters'));let access;
  try{access=new SchoolAccess(store,{now:this.now,config:{singleWorld:true}});store.db.prepare('DELETE FROM school_sessions').run();this.catalog.commit({...this.catalog.value,active:id});}catch(e){store.close();throw e;}
  this.store.close();this.store=store;this.access=access;this.root=directory;this.backups=backups;this.auth=null;this.storageError=null;this.integrity();this.record('campaign','Campanha selecionada. Entre novamente no ADM.');return {...this.campaignStatus(),requiresLogin:true};
 },
 async resetWorld(token,{phrase,confirmed=false}={}){
  this.authorize(token);if(this.hub)throw Error('Encerre a sala antes de reiniciar o mundo.');if(!confirmed||phrase!=='REINICIAR MUNDO')throw Error('Confirme REINICIAR MUNDO. Personagens, itens e níveis serão mantidos.');
  const backup=await this.backup(token),maps=path.join(this.root,'maps');
  if(fs.existsSync(maps)){const archive=path.join(this.root,'archived-worlds');fs.mkdirSync(archive,{recursive:true});fs.renameSync(maps,path.join(archive,randomUUID()));}
  this.db.prepare('DELETE FROM school_sessions').run();this.record('world','Mundo preparado para reinício. Todos os saves foram mantidos.');return {ok:true,backup:backup.id,preserved:'all character/account data'};
 },
 async recoverSessions(token,{confirmed=false}={}){
  this.authorize(token);if(!confirmed)throw Error('Confirme a recuperação das sessões.');if(this.hub)throw Error('Encerre a sala antes de recuperar acessos.');
  const backup=await this.backup(token);this.db.prepare('DELETE FROM school_sessions').run();this.access.attempts.clear();this.access.loginConnections.clear();
  const season=this.school.seasons.current();if(season.state==='cleaning'||season.cleaned_at)throw Error('A limpeza antiga já foi iniciada. Restaure um backup para recuperar os dados.');
  this.db.prepare("UPDATE school_seasons SET state='active' WHERE id=?").run(season.id);this.record('recovery','Sessões transitórias renovadas e campanha liberada; saves e senhas mantidos.');return {ok:true,backup:backup.id};
 },
 createSeason(token,data){return this.createCampaign(token,{...data,name:data.name||'Nova campanha',mode:'continue',confirmed:data.confirmed});},
 cleanSeason(){throw Error('A limpeza de personagens foi desativada neste ADM. Crie uma campanha separada ou reinicie apenas o mundo; os saves serão preservados.');},
 generateRecoveryCode(token,{confirmed=false}={}){
  this.authorize(token);if(!confirmed)throw Error('Confirme a emissão de um novo código de recuperação.');const code=randomBytes(24).toString('hex');atomic(path.join(this.storageRoot,'recovery.json'),{hash:digest(code).toString('hex'),created:this.now()});return {code,message:'Guarde este código fora do computador. Ele permite recuperar o acesso do professor sem apagar os saves.'};
 },
 verifyRecovery(code){
  const file=path.join(this.storageRoot,'recovery.json');if(typeof code!=='string'||!/^[a-f0-9]{48}$/.test(code)||!fs.existsSync(file))throw Error('Código de recuperação inválido ou ainda não emitido.');
  const saved=JSON.parse(fs.readFileSync(file,'utf8'));if(!/^[a-f0-9]{64}$/.test(saved.hash)||!timingSafeEqual(digest(code),Buffer.from(saved.hash,'hex')))throw Error('Código de recuperação inválido.');
 },
 async recoverAccess({code,username,password,confirmed=false}={}){
  if(this.hub)throw Error('Encerre a sala antes de recuperar a senha.');if(!confirmed)throw Error('Confirme a redefinição da senha do professor.');this.verifyRecovery(code);
  const a=this.db.prepare("SELECT id FROM school_accounts WHERE username=? AND role='teacher'").get(String(username).toLowerCase());if(!a)throw Error('Conta de professor não encontrada nesta campanha.');
  const encoded=await passwordHash(password);await this.backups.create(this.store,this.school.seasons.current());this.store.transaction(()=>{this.db.prepare('UPDATE school_accounts SET password_hash=?,blocked=0 WHERE id=?').run(encoded,a.id);this.db.prepare('DELETE FROM school_sessions').run();});this.auth=null;this.record('recovery','Senha de professor redefinida por código de recuperação. Personagens preservados.');return {ok:true};
 },
 async recoverStorage({code,id,confirmed=false}={}){
  if(this.hub)throw Error('Encerre a sala antes da recuperação.');if(!confirmed)throw Error('Confirme a restauração. A cópia atual será preservada.');this.verifyRecovery(code);this.backups.validate(id);
  this.store?.close();this.store=null;const archive=path.join(this.root,'recovery-archive',randomUUID());fs.mkdirSync(archive,{recursive:true});
  for(const name of ['characters','maps']){const source=path.join(this.root,name);if(fs.existsSync(source))fs.cpSync(source,path.join(archive,name),{recursive:true,filter:p=>!fs.lstatSync(p).isSymbolicLink()});}
  try{this.backups.restore(id);this.openStore();this.db.prepare('DELETE FROM school_sessions').run();this.integrity();this.storageError=null;this.auth=null;this.record('recovery','Backup restaurado. Arquivos anteriores preservados em recovery-archive.');return {ok:true};}catch(e){this.storageError='A recuperação não terminou. Os arquivos anteriores foram preservados.';throw e;}
 },
 async renewIdentity(token,{confirmed=false}={}){
  this.authorize(token);if(this.hub)throw Error('Encerre a sala antes de renovar a identidade TLS.');if(!confirmed)throw Error('Confirme: os alunos precisarão conferir o novo código TLS.');await this.backup(token);
  const directory=path.join(this.storageRoot,'identity'),file=path.join(directory,'server-identity.json');if(fs.existsSync(file)){const archive=path.join(this.storageRoot,'identity-archive');fs.mkdirSync(archive,{recursive:true});fs.renameSync(file,path.join(archive,randomUUID()+'.json'));}
  this.identity=await serverIdentity(directory);return {fingerprint:this.identity.fingerprint,requiresTrustConfirmation:true};
 },
 saveConnectionSettings(){atomic(path.join(this.storageRoot,'connection-settings.json'),{version:1,port:this.port});},
 async diagnose(token){
  this.authorize(token);const checks=[];try{const integrity=this.integrity();for(const r of this.db.prepare('SELECT * FROM characters').all())OnlineStore.prototype.decode(r);checks.push({name:'Banco e personagens',ok:integrity.ok});}catch{checks.push({name:'Banco e personagens',ok:false,detail:'Restaure um backup validado; os arquivos atuais serão preservados.'});}
  const file=path.join(this.root,'.write-check-'+randomUUID());try{fs.writeFileSync(file,'ok',{flag:'wx'});fs.unlinkSync(file);checks.push({name:'Gravação de dados',ok:true});}catch{checks.push({name:'Gravação de dados',ok:false,detail:'Verifique espaço disponível e permissão da conta Windows.'});}
  const identity=path.join(this.storageRoot,'identity/server-identity.json');try{if(!fs.existsSync(identity))checks.push({name:'Identidade TLS',ok:true,detail:'Será criada no primeiro início da sala.'});else{const c=new X509Certificate(JSON.parse(fs.readFileSync(identity,'utf8')).cert);checks.push({name:'Identidade TLS',ok:Date.parse(c.validTo)>this.now()&&Date.parse(c.validFrom)<=this.now(),detail:'Validade: '+c.validTo});}}catch{checks.push({name:'Identidade TLS',ok:false,detail:'Identidade ilegível. Preserve o arquivo e renove somente com confirmação.'});}
  if(this.hub)checks.push({name:'Porta',ok:true,detail:'Em uso por esta sala.'});else checks.push(await new Promise(resolve=>{const server=net.createServer();server.once('error',()=>resolve({name:'Porta',ok:false,detail:'Porta ocupada ou sem permissão. Escolha outra no painel.'}));server.listen(this.port??8787,this.host,()=>server.close(()=>resolve({name:'Porta',ok:true})));}));
  checks.push({name:'Campanha',ok:this.school.seasons.current().state==='active',detail:'Se encerrada, use Recuperar sessões para continuar sem apagar saves.'});return {at:this.now(),checks,...this.campaignStatus(),version:'0.6.15'};
 }
};
