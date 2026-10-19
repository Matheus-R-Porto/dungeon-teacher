import fs from 'node:fs';import path from 'node:path';
import{FloorStore}from'../server/floor-store.js';import{expandLivingTower}from'../src/world/living-tower.js';import{stats}from'./performance-stats.mjs';
const dir=path.resolve('.logs','iteration22-load-'+Date.now()),rows=[];
for(let repeat=0;repeat<10;repeat++)for(let floor=1;floor<=3;floor++){
 const store=new FloorStore(path.join(dir,String(repeat))),t=performance.now(),record=store.load(floor),baseMs=performance.now()-t,a=performance.now(),expanded=expandLivingTower(record.definition),expansionMs=performance.now()-a;
 const r=performance.now();new FloorStore(path.join(dir,String(repeat))).load(floor);const diskReloadMs=performance.now()-r;
 rows.push({floor,repeat,baseMs,expansionMs,totalMs:baseMs+expansionMs,diskReloadMs,bytesBefore:JSON.stringify(record.definition).length,bytesAfter:JSON.stringify(expanded).length});
}
const report={method:'10 cold isolated creations per floor, expansion measured separately, followed by disk reload. CPU filesystem/domain only; not GPU first-frame timing.',rows,byFloor:[1,2,3].map(floor=>({floor,...Object.fromEntries(['baseMs','expansionMs','totalMs','diskReloadMs'].map(k=>[k,stats(rows.filter(r=>r.floor===floor).map(r=>r[k]))]))}))};fs.writeFileSync('docs/ITERACAO-22-CARGA.json',JSON.stringify(report,null,2));console.log(report.byFloor);
