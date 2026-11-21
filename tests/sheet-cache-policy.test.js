import test from 'node:test';
import assert from 'node:assert/strict';
import {idleSheetEvictions,sheetEntryBytes} from '../src/adapters/rendering/sheet-cache-policy.js';
const entry=(key,used,refs=0,size=2048,loaded=true)=>({key,used,refs,loaded,texture:{image:{width:size,height:size}},mask:{image:{width:size,height:size}}});
test('byte cap evicts oldest idle atlases but preserves active and loading resources',()=>{
 const values=[entry('old',1),entry('middle',2),entry('new',3),entry('active',0,12,4096),entry('pending',0,0,4096,false)];
 const evicted=idleSheetEvictions(values,8,64*1024*1024);assert.deepEqual(evicted.map(v=>v.key),['old']);
 assert.equal(values.filter(v=>!evicted.includes(v)&&v.loaded&&!v.refs).reduce((n,v)=>n+sheetEntryBytes(v),0),64*1024*1024);
});
test('small fallback atlases retain count-limited cache and byte trimming is repeatable',()=>{
 const values=Array.from({length:10},(_,i)=>entry(String(i),i,0,96));
 const evicted=idleSheetEvictions(values);assert.deepEqual(evicted.map(v=>v.key),['0','1']);
 assert.deepEqual(idleSheetEvictions(values.filter(v=>!evicted.includes(v))),[]);
 assert.deepEqual(idleSheetEvictions([entry('active',0,1)],0,0),[]);
});
