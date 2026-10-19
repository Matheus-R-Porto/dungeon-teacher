// Focused cold-load probe, no real player/map directories.
import {FloorStore,sharedFloor} from '../server/floor-store.js';
import fs from 'node:fs';import path from 'node:path';
import {stats} from './performance-stats.mjs';
const directory=path.resolve('.logs','floor-performance-'+Date.now());fs.mkdirSync(directory,{recursive:true});const records=[];
for(let i=0;i<10;i++){
 let generation=0,validation=0;
 const store=new FloorStore(path.join(directory,String(i)),{generate(...args){const at=performance.now();const map=sharedFloor(...args);generation+=performance.now()-at;return map;}});
 const read=store.read;store.read=function(...args){const at=performance.now();try{return read.apply(this,args);}finally{validation+=performance.now()-at;}};
 const at=performance.now();store.load(2);const total=performance.now()-at;
 const warm=performance.now();store.load(2);const cached=performance.now()-warm;
 records.push({total,generation,validation,filesystemHashClone:total-generation-validation,cached});
}
const report={description:'10 independent cold creations of floor 2, followed by in-memory cache lookup; synchronous production FloorStore',records,summary:Object.fromEntries(Object.keys(records[0]).map(k=>[k,stats(records.map(r=>r[k]))]))};
fs.writeFileSync('docs/DESEMPENHO-FLOOR-LOAD.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary,null,2));
