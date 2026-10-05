import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {generateFloor} from '../src/world/tower.js';
import {findPath} from '../src/world/navigation.js';
const summarize=values=>{const a=[...values].sort((a,b)=>a-b);return {min:a[0],median:a[Math.floor(a.length/2)],p95:a[Math.floor(a.length*.95)],max:a.at(-1)};};
const results=[];
for(let floor=1;floor<=3;floor++){
 const samples=[],routes=[],lengths=[],regions=[],widths=[],depths=[];let retries=0;
 for(let seed=1;seed<=100;seed++){
  const w=generateFloor(seed,floor,'hub');samples.push(w.generationMetrics);retries+=w.generationAttempt;
  const t=performance.now(),path=findPath(w,w.spawn,w.portal,.45);routes.push(performance.now()-t);
  if(!path)throw Error('Missing open route');
  lengths.push(w.trails.filter(t=>t.main).reduce((sum,t)=>sum+t.points.slice(1).reduce((s,p,i)=>s+Math.hypot(p.x-t.points[i].x,p.z-t.points[i].z),0),0));
  regions.push(w.graph.regions.length);widths.push(w.bounds.maxX-w.bounds.minX);depths.push(w.bounds.maxZ-w.bounds.minZ);
 }
 results.push({floor,seeds:100,retries,generationMs:Object.fromEntries(Object.keys(samples[0]).map(k=>[k,summarize(samples.map(s=>s[k]))])),openRouteMs:summarize(routes),mainTrailMeters:summarize(lengths),regions:summarize(regions),width:summarize(widths),depth:summarize(depths)});
}
const report={fixture:'Node CPU; 100 seeds per floor, gates open for complete-route timing. Not renderer FPS or a manual playtest.',results};
fs.writeFileSync(new URL('../docs/ITERACAO-10-PERFORMANCE.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

