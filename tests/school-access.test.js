import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {OnlineStore} from '../server/online-store.js';
import {SchoolAccess} from '../server/school-access.js';
import {defaultAppearance} from '../src/domain/appearance.js';
import {startHub} from '../server/hub.js';
import WebSocket from '../server/node_modules/ws/wrapper.mjs';
const secret='a-test-password-31';
function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dt-school-'));let now=1000000;const store=new OnlineStore(dir),access=new SchoolAccess(store,{now:()=>now});t.after(()=>{store.close();fs.rmSync(dir,{recursive:true,force:true});});return {dir,store,access,advance:n=>now+=n};}
async function accounts(access){const teacher=await access.createAccount({username:'teacher',password:secret,role:'teacher'}),student=await access.createAccount({username:'student',password:secret,cohort:'A'}),other=await access.createAccount({username:'other',password:secret,cohort:'B'});const admin=await access.login('teacher',secret,'local');return {teacher,student,other,admin};}
test('school: password hashing, closed independent cohorts, teacher-only controls, unique character and opaque sessions',async t=>{
 const {store,access}=fixture(t),{student,admin}=await accounts(access);
 const row=store.db.prepare('SELECT * FROM school_accounts WHERE id=?').get(student.id);assert.match(row.password_hash,/^scrypt:131072/);assert.ok(!row.password_hash.includes(secret));
 await assert.rejects(access.login('student',secret,'local'),/fechada/);access.admin(admin.token,'open','A');await assert.rejects(access.login('other',secret,'local'),/fechada/);
 const s=await access.login('student',secret,'local');assert.equal(s.account.hasCharacter,false);assert.throws(()=>access.admin(s.token,'open','B'),/professor/);assert.throws(()=>access.enter(s.token),/Crie/);
 const look=defaultAppearance();access.createCharacter(s.token,'Ária',look);assert.throws(()=>access.createCharacter(s.token,'Outro',look),/já possui/);const a=access.enter(s.token);assert.deepEqual(store.read(a.character_id).character.appearance,look);assert.equal(store.read(a.character_id).character.inventory.slots.length,32);
 const stored=store.db.prepare('SELECT * FROM school_sessions WHERE account_id=?').get(a.id);assert.notEqual(stored.token_hash,s.token);assert.ok(!JSON.stringify(s).includes(row.world_key));assert.ok(!JSON.stringify(access.overview(admin.token,{people:new Map()})).includes(row.world_key));
 const second=await access.login('student',secret,'local');assert.throws(()=>access.session(s.token),/expirada/);assert.equal(access.enter(second.token).character_id,a.character_id);
});
test('school: closing admission preserves current session; end/cancel deadline persists across access restart; blocking survives reopen',async t=>{
 const {store,access,advance}=fixture(t),{student,admin}=await accounts(access);access.admin(admin.token,'open','A');const s=await access.login('student',secret,'local');access.createCharacter(s.token,'Aventureiro',defaultAppearance());
 access.admin(admin.token,'close','A');assert.ok(access.session(s.token));assert.throws(()=>access.enter(s.token),/fechada/);
 access.admin(admin.token,'open','A');access.admin(admin.token,'end','A');const deadline=access.countdown(access.session(s.token)).closesAt;assert.equal(deadline,1060000);assert.throws(()=>access.enter(s.token),/fechada/);advance(30000);
 const restart=new SchoolAccess(store,{now:()=>1030000});assert.equal(restart.countdown(restart.session(s.token)).closesAt,deadline);access.admin(admin.token,'cancel-end','A');assert.equal(access.countdown(access.session(s.token)).closesAt,null);assert.throws(()=>access.enter(s.token),/fechada/);
 access.admin(admin.token,'open','A');access.admin(admin.token,'block',student.id);assert.throws(()=>access.session(s.token),/expirada/);await assert.rejects(access.login('student',secret,'local'),/bloqueado/);access.admin(admin.token,'unblock',student.id);const fresh=await access.login('student',secret,'local');access.admin(admin.token,'end','A');advance(60001);assert.throws(()=>access.session(fresh.token),/encerrada/);access.expire();assert.equal(store.db.prepare('SELECT count(*) n FROM school_sessions WHERE account_id=?').get(student.id).n,0);assert.throws(()=>access.admin(admin.token,'cancel-end','A'),/cancelável/);
});
test('school: admission is rechecked after async password work, limits and idle expiry do not extend on passive polls',async t=>{
 const {access,advance}=fixture(t),{student,admin}=await accounts(access);access.admin(admin.token,'open','A');const pending=access.login('student',secret,'local');access.admin(admin.token,'block',student.id);await assert.rejects(pending,/bloqueado/);access.admin(admin.token,'unblock',student.id);
 access.admin(admin.token,'capacity','A',1);await assert.rejects(access.createAccount({username:'extra',password:secret,cohort:'A'}),/Capacidade/);
 const s=await access.login('student',secret,'local');advance(1000000);assert.ok(access.session(s.token,{touch:false}));advance(800001);assert.throws(()=>access.session(s.token),/expirada/);
 for(let i=0;i<8;i++)access.rate('test',8);assert.throws(()=>access.rate('test',8),/tentativas/);
});
test('school: WebSocket rejects anonymous protocols, accepts authenticated world and disconnects blocked student without leaking account secrets',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dt-school-hub-'));const hub=await startHub({host:'127.0.0.1',port:0,school:true,worldDataDir:path.join(dir,'world'),characterDataDir:path.join(dir,'chars'),log:()=>{}});const sockets=[];t.after(async()=>{for(const ws of sockets)ws.terminate();await hub.close();fs.rmSync(dir,{recursive:true,force:true});});const {access}= {access:hub.school};const {student,admin}=await accounts(access);access.admin(admin.token,'open','A');const login=await access.login('student',secret,'local');access.createCharacter(login.token,'Validado',defaultAppearance());
 const open=()=>new Promise(resolve=>{const ws=new WebSocket(`ws://127.0.0.1:${hub.port}/hub`,{origin:'dungeon://game'});sockets.push(ws);ws.once('open',()=>resolve(ws));});
 const receive=(ws,predicate)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Mensagem ausente')),8000);const fn=data=>{const m=JSON.parse(data);if(predicate(m)){clearTimeout(timer);ws.off('message',fn);resolve(m);}};ws.on('message',fn);});
 const anon=await open(),denied=receive(anon,m=>m.type==='server:error');anon.send(JSON.stringify({v:2,type:'world:hello',name:'Intruso',token:null}));assert.match((await denied).message,/conta/);
 const ws=await open(),welcome=receive(ws,m=>m.type==='world:welcome');ws.send(JSON.stringify({v:4,type:'world:hello',name:'Nome forjado',credential:login.token}));const w=await welcome;assert.equal(ws.readyState,1);assert.equal(hub.online.people.get(w.id).name,'Validado');assert.ok(!JSON.stringify(w).includes(login.token));
 const ended=receive(ws,m=>m.type==='school:ended');access.admin(admin.token,'block',student.id);assert.match((await ended).message,/expirada|bloqueado/);
});

test('school: linked legacy character migrates once with free points and preserves inventory, gold, attributes and Base',async t=>{const {store,access}=fixture(t),{admin}=await accounts(access);access.admin(admin.token,'open','A');const session=await access.login('student',secret,'fixture');access.createCharacter(session.token,'Legado',defaultAppearance());const account=access.enter(session.token),record=store.read(account.character_id);delete record.character.jobs;delete record.character.appearance;record.character.knownAbilities=['powerStrike'];record.character.skillSpaces=4;record.character.gold=125;const inventory=structuredClone(record.character.inventory),attributes=structuredClone(record.character.attributes);store.save(record.id,{character:record.character,floor:record.floor,reached:record.reached,area:record.area});access.enter(session.token);const after=store.read(record.id);assert.equal(after.character.jobs.origins.novice.earned,5);assert.equal(after.character.gold,125);assert.deepEqual(after.character.inventory,inventory);assert.deepEqual(after.character.attributes,attributes);access.enter(session.token);assert.deepEqual(store.read(record.id),after);});
