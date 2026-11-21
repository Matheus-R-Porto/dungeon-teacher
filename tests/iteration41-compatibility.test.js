import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import WebSocket from '../server/node_modules/ws/wrapper.mjs';
import {AdminService} from '../server/admin-service.js';
import {SchoolClient} from '../src/multiplayer/school-client.js';
import {RELEASE} from '../shared/release.js';
import {defaultAppearance} from '../src/domain/appearance.js';
test('41: ADM recusa cliente antigo antes do login e hello antigo mesmo com token válido',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dt41-version-')),service=new AdminService(dir,{host:'127.0.0.1',port:0,discoveryPort:0}),password='compatibility-test-password',sockets=[];
 t.after(async()=>{sockets.forEach(s=>s.terminate());await service.dispose();assert.equal(path.dirname(dir),os.tmpdir());fs.rmSync(dir,{recursive:true,force:true});});
 await service.bootstrap({username:'professor',password});const {token}=await service.unlock({username:'professor',password});await service.start(token);
 const open=async()=>{const ws=new WebSocket(`wss://127.0.0.1:${service.hub.port}/hub`,{origin:'dungeon://game',ca:service.identity.cert});sockets.push(ws);await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});return ws;};
 const request=(ws,m)=>new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('timeout')),5000);ws.once('message',raw=>{clearTimeout(timer);r(JSON.parse(raw));});ws.send(JSON.stringify(m));});
 const old=await open(),rejected=await request(old,{school:1,id:'1',action:'login',data:{username:'professor',password}});assert.equal(rejected.ok,false);assert.match(rejected.message,/incompatíveis/);
 const current=await open(),status=await request(current,{school:1,id:'2',action:'status',data:{},build:RELEASE.compatibility});assert.equal(status.result.build,RELEASE.compatibility);
 await service.school.createAccount({username:'aluno',password});const login=await service.school.login('aluno',password,'fixture');service.school.createCharacter(login.token,'Aluno Atual',defaultAppearance());
 const expired=await open(),hello=await request(expired,{v:4,type:'world:hello',name:'Aluno Atual',credential:login.token});assert.equal(hello.type,'server:error');assert.match(hello.message,/incompatíveis/);assert.equal(service.overview(token).players.length,0);
 const valid=await open(),welcome=await request(valid,{v:4,type:'world:hello',name:'Aluno Atual',credential:login.token,build:RELEASE.compatibility});assert.equal(welcome.type,'world:welcome');assert.equal(welcome.build,RELEASE.compatibility);
 const received=[];valid.on('message',raw=>received.push(JSON.parse(raw)));const closed=new Promise(resolve=>valid.once('close',code=>resolve(code)));
 await service.stop(token,{confirmed:true});assert.equal(await closed,4003);assert.ok(received.some(m=>m.type==='school:ended'&&m.message.includes('progresso foi salvo')));
});
test('41: Aluno recusa status de ADM sem contrato de compatibilidade',async()=>{
 class OldSocket extends EventTarget {constructor(){super();this.readyState=1;queueMicrotask(()=>this.dispatchEvent(new Event('open')));}send(raw){const m=JSON.parse(raw);queueMicrotask(()=>this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({school:1,id:m.id,ok:true,result:{online:true}})})));}close(){this.readyState=3;}}
 const client=new SchoolClient('wss://test',{Socket:OldSocket});await assert.rejects(client.request('status'),/incompatíveis/);client.close();
});
