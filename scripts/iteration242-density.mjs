import fs from 'node:fs';
import {sharedFloor} from '../server/floor-store.js';
import {generateFloor} from '../src/world/tower.js';
import {awakenTower} from '../src/world/awakened-tower.js';
import {findPath} from '../src/world/navigation.js';
const rows=[];
for(const seed of [1,42,217021])for(const mode of ['local','online']){
 const w=awakenTower(mode==='online'?sharedFloor(seed,1):generateFloor(seed,1,'refuge'));
 const route=findPath(w,w.spawn,w.portal,.32);if(!route)throw Error('No route');
 let previous=w.spawn,length=0,empty=0,longest=0,samples=0,near=0;const seen=new Set();
 for(const p of route){const distance=Math.hypot(p.x-previous.x,p.z-previous.z),steps=Math.max(1,Math.ceil(distance));for(let j=1;j<=steps;j++){
  const q={x:previous.x+(p.x-previous.x)*j/steps,z:previous.z+(p.z-previous.z)*j/steps};
  const visible=w.enemySpawns.filter(e=>Math.hypot(e.position.x-q.x,e.position.z-q.z)<=12);samples++;length+=distance/steps;
  if(visible.length){near++;empty=0;visible.forEach(e=>seen.add(e.id));}else{empty+=distance/steps;longest=Math.max(longest,empty);}
 }previous=p;}
 rows.push({seed,mode,population:w.enemySpawns.length,routeMeters:length,coverage:near/samples,encountered:seen.size,longestEmptyMeters:longest});
}
const file='.logs/iteration242-density-'+(process.argv[2]??'current')+'.json';fs.writeFileSync(file,JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
