import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {pathToFileURL} from 'node:url';
const [base,label,out]=process.argv.slice(2),url=p=>pathToFileURL(path.join(base,p));
const {SharedWorld}=await import(url('server/world.js')),{generateFloor}=await import(url('src/world/tower.js')),{awakenTower}=await import(url('src/world/awakened-tower.js'));
const stat=a=>{a.sort((a,b)=>a-b);return {mean:a.reduce((s,x)=>s+x,0)/a.length,p95:a[Math.floor(a.length*.95)],max:a.at(-1)};};
const report={label,environment:{node:process.version,cpu:os.cpus()[0].model},kind:'deterministic simulation, not network or physical clients',rows:[]};
for(const count of [4,32])for(const phase of ['idle','combat']){
 const worlds=[1,2,3].map(floor=>new SharedWorld({map:awakenTower(generateFloor(36,floor,'shared-city')),random:()=>.5}));
 for(let i=0;i<count;i++){const w=worlds[i%3],ws={close(){}},p=w.join(ws,'Measure '+i);ws.worldPlayer=p;if(phase==='combat'){const e=w.enemies.find(e=>e.alive&&!e.isMiniBoss);Object.assign(p.game.player,{...e.spawnPosition,x:e.x+1.5});p.target={id:e.id,generation:e.generation};}}
 const ticks=[],snapshots=[];let bytes=0,decisions=0,moved=0;const cpu=process.cpuUsage(),at=performance.now();
 for(let tick=0;tick<600;tick++){
  const start=performance.now();for(const w of worlds){const prior=w.enemies.map(e=>[e.roam?.decisions??0,e.x,e.z]);w.step(.05);for(let i=0;i<w.enemies.length;i++){const e=w.enemies[i];if((e.roam?.decisions??0)>prior[i][0])decisions++;if(e.x!==prior[i][1]||e.z!==prior[i][2])moved++;}}ticks.push(performance.now()-start);
  if(tick%2===0){const start=performance.now();for(const w of worlds){const json=JSON.stringify(w.snapshot());bytes+=Buffer.byteLength(json)*w.players.size;}snapshots.push(performance.now()-start);}
 }
 const used=process.cpuUsage(cpu);report.rows.push({count,phase,secondsSimulated:30,ticks:stat(ticks),snapshots:stat(snapshots),bytes,bytesPerSecond:bytes/30,decisions,moved,cpuMs:(used.user+used.system)/1000,elapsedMs:performance.now()-at,rss:process.memoryUsage().rss,heap:process.memoryUsage().heapUsed});
}
fs.writeFileSync(out,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
