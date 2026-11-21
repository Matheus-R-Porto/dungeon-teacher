import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {AdminService} from '../server/admin-service.js';
import {defaultAppearance} from '../src/domain/appearance.js';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
const password='iteration41-test-password';
async function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dt41-campaign-'));let service=new AdminService(dir,{host:'127.0.0.1',port:0,discoveryPort:0});t.after(async()=>{await service.dispose();assert.equal(path.dirname(dir),os.tmpdir());fs.rmSync(dir,{recursive:true,force:true});});await service.bootstrap({username:'professor',password});const unlock=async()=> (await service.unlock({username:'professor',password})).token;return {dir,get service(){return service;},unlock,replace(s){service=s;}};}
async function save(service){await service.school.createAccount({username:'aluno',password});const login=await service.school.login('aluno',password,'test');service.school.createCharacter(login.token,'Aluno Persistente',defaultAppearance());const id=service.school.enter(login.token).character_id,record=service.store.read(id),c=new Character(record.character);c.gainXP(500);c.data.gold=719;new Inventory(c).acquire('rawOre',8);new Inventory(c).acquire('travelerBackpack');c.data.tower.kills={1:3,2:4};service.store.save(id,{...record,character:c.snapshot(),floor:2,reached:3});return {id,row:{...service.db.prepare('SELECT * FROM characters WHERE id=?').get(id)}};}
test('41: recriar sala e criar campanha com saves preservam personagem inteiro e anterior selecionável',async t=>{
 const f=await fixture(t),s=f.service,token=await f.unlock(),saved=await save(s),initial=s.catalog.active.id;
 fs.mkdirSync(path.join(s.root,'maps'));fs.writeFileSync(path.join(s.root,'maps','marker.txt'),'old-world');
 await assert.rejects(s.resetWorld(token,{confirmed:true,phrase:'ERRADO'}),/Confirme/);
 await s.resetWorld(token,{confirmed:true,phrase:'REINICIAR MUNDO'});assert.deepEqual({...s.db.prepare('SELECT * FROM characters WHERE id=?').get(saved.id)},saved.row);assert.ok(fs.readdirSync(path.join(s.root,'archived-worlds')).length);
 const result=await s.createCampaign(token,{name:'Continuação da turma',confirmed:true});assert.notEqual(result.selected.id,initial);assert.equal(result.requiresLogin,true);assert.deepEqual({...s.db.prepare('SELECT * FROM characters WHERE id=?').get(saved.id)},saved.row);
 const second=s.catalog.active.id;await s.createCampaign(await f.unlock(),{name:'Outra turma vazia',mode:'empty',confirmed:true});assert.equal(s.db.prepare('SELECT count(*) n FROM characters').get().n,0);assert.equal(s.db.prepare("SELECT count(*) n FROM school_accounts WHERE role='student'").get().n,0);
 s.selectCampaign(await f.unlock(),{id:initial,confirmed:true});assert.deepEqual({...s.db.prepare('SELECT * FROM characters WHERE id=?').get(saved.id)},saved.row);
 s.selectCampaign(await f.unlock(),{id:second,confirmed:true});await s.dispose();const restarted=new AdminService(f.dir,{host:'127.0.0.1',port:0,discoveryPort:0});f.replace(restarted);assert.equal(restarted.catalog.active.id,second);assert.deepEqual({...restarted.db.prepare('SELECT * FROM characters WHERE id=?').get(saved.id)},saved.row);
 const login=await restarted.school.login('aluno',password,'after-restart');assert.equal(restarted.school.enter(login.token).character_id,saved.id);
});
test('41: recuperação não exige apagar temporadas; senha só muda com código explícito',async t=>{
 const f=await fixture(t),s=f.service,token=await f.unlock(),saved=await save(s);assert.throws(()=>s.cleanSeason(token,{}),/desativada/);
 const code=s.generateRecoveryCode(token,{confirmed:true}).code;assert.ok(!fs.readFileSync(path.join(f.dir,'recovery.json'),'utf8').includes(code));
 await s.closeSeason(token,{id:s.school.seasons.current().id,confirmed:true});await assert.rejects(s.school.login('aluno',password,'closed'),/encerrada/);
 await s.recoverSessions(token,{confirmed:true});assert.equal((await s.school.login('aluno',password,'recovered')).account.hasCharacter,true);
 await assert.rejects(s.recoverAccess({code:'0'.repeat(48),username:'professor',password:'changed-safe-password',confirmed:true}),/inválido/);
 await s.recoverAccess({code,username:'professor',password:'changed-safe-password',confirmed:true});assert.ok((await s.unlock({username:'professor',password:'changed-safe-password'})).token);assert.deepEqual({...s.db.prepare('SELECT * FROM characters WHERE id=?').get(saved.id)},saved.row);
});
test('41: seleção inválida e backup corrompido não substituem o save atual',async t=>{
 const f=await fixture(t),s=f.service,token=await f.unlock(),saved=await save(s);assert.throws(()=>s.selectCampaign(token,{id:'../../outside',confirmed:true}),/encontrada/);await assert.rejects(s.createCampaign(token,{name:'Sem confirmação'}),/Confirme/);
 const b=await s.backup(token);fs.appendFileSync(path.join(s.backups.location(b.id),'characters.sqlite'),'broken');await assert.rejects(s.restore(token,{id:b.id,confirmed:true}),/alterado/);assert.deepEqual({...s.db.prepare('SELECT * FROM characters WHERE id=?').get(saved.id)},saved.row);
});

test('41: banco ilegível abre recuperação e restaura todos os saves com código, sem remover os arquivos danificados',async t=>{
 const f=await fixture(t),s=f.service,token=await f.unlock(),saved=await save(s),code=s.generateRecoveryCode(token,{confirmed:true}).code,b=await s.backup(token);await s.dispose();const file=path.join(f.dir,'characters','characters.sqlite');fs.writeFileSync(file,'corrupted-test-database');const recovered=new AdminService(f.dir,{host:'127.0.0.1',port:0,discoveryPort:0});f.replace(recovered);assert.ok(recovered.status().storageError);assert.ok(recovered.status().recoveryBackups.some(x=>x.id===b.id));await assert.rejects(recovered.recoverStorage({code:'0'.repeat(48),id:b.id,confirmed:true}),/inválido/);assert.equal(fs.readFileSync(file,'utf8'),'corrupted-test-database');await recovered.recoverStorage({code,id:b.id,confirmed:true});assert.equal(recovered.status().storageError,null);assert.deepEqual({...recovered.db.prepare('SELECT * FROM characters WHERE id=?').get(saved.id)},saved.row);const archive=path.join(f.dir,'recovery-archive',fs.readdirSync(path.join(f.dir,'recovery-archive'))[0],'characters','characters.sqlite');assert.equal(fs.readFileSync(archive,'utf8'),'corrupted-test-database');assert.ok((await recovered.unlock({username:'professor',password})).token);
});
