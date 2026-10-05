import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import protocol from '../desktop/protocol.cjs';
import {saveBeforeClose} from '../src/adapters/desktop/lifecycle.js';

test('desktop protocol resolves bundled resources independent of working directory',()=>{
  const root=path.resolve('dist');assert.equal(protocol.resolveAsset(root,'dungeon://game/'),path.join(root,'index.html'));
  assert.equal(protocol.resolveAsset(root,'dungeon://game/assets/game.js'),path.join(root,'assets/game.js'));
});
test('desktop protocol denies foreign hosts, credentials, traversal and executable files',()=>{
  for(const address of ['https://game/index.html','dungeon://evil/index.html','dungeon://user@game/index.html','dungeon://game/%2e%2e%2fsecret.js','dungeon://game/C:%5Csecret.js','dungeon://game/%00.js','dungeon://game/main.cjs'])assert.throws(()=>protocol.resolveAsset(path.resolve('dist'),address),address);
});
test('desktop resource responses enforce CSP, MIME, method and missing-file rules',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'dungeon-protocol-'));
  try{await fs.writeFile(path.join(root,'index.html'),'<h1>Dungeon</h1>');const handler=protocol.assetHandler(root);
    const response=await handler(new Request('dungeon://game/'));assert.equal(response.status,200);assert.equal(await response.text(),'<h1>Dungeon</h1>');assert.match(response.headers.get('content-security-policy'),/script-src 'self'/);assert.match(response.headers.get('content-type'),/text\/html/);
    assert.equal((await handler(new Request('dungeon://game/missing.js'))).status,404);
    assert.equal((await handler(new Request('dungeon://game/',{method:'POST'}))).status,405);
  }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('desktop close pauses and cancels before waiting for pending transaction and final save',async()=>{
  const order=[];let pending=true;
  await saveBeforeClose({pause:()=>order.push('pause'),cancel:()=>order.push('cancel'),isBusy:()=>pending,wait:async()=>{order.push('settled');pending=false;},save:async()=>order.push('save')});
  assert.deepEqual(order,['pause','cancel','settled','save']);
});
test('desktop close propagates save failure instead of reporting success',async()=>{
  await assert.rejects(saveBeforeClose({pause(){},cancel(){},isBusy:()=>false,save:async()=>{throw Error('disk failure');}}),/disk failure/);
});
test('desktop close refuses to snapshot an unfinished transaction after timeout',async()=>{
  let time=0,saved=false;await assert.rejects(saveBeforeClose({pause(){},cancel(){},isBusy:()=>true,now:()=>time,wait:async()=>{time+=5000;},save:async()=>{saved=true;}}),/andamento/);assert.equal(saved,false);
});
