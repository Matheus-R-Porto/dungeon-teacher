import test from 'node:test';import assert from 'node:assert/strict';import path from 'node:path';import {createRequire} from 'node:module';
const {profileDirectory}=createRequire(import.meta.url)('../desktop/profile.cjs');
test('41: instalador e portátil mantêm AppData existente; isolamento explícito não enfraquece produção',()=>{
 const root=path.resolve('fixture-profile'),app={isPackaged:true,getPath:key=>{assert.equal(key,'appData');return root;}};
 assert.equal(profileDirectory(app,'Dungeon Teacher',[],{DT_TEST_PROFILE:'ignored'}),path.join(root,'Dungeon Teacher'));
 assert.equal(profileDirectory(app,'Dungeon Teacher ADM',[],{}),path.join(root,'Dungeon Teacher ADM'));
 assert.equal(profileDirectory(app,'Dungeon Teacher ADM',['--user-data-dir='+path.join(root,'isolated')],{}),path.join(root,'isolated'));
 assert.throws(()=>profileDirectory(app,'ADM',['--user-data-dir=relative'],{}),/absoluto/);
});
