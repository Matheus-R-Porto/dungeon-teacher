import fs from 'node:fs';
const dirs=fs.readdirSync('.logs').filter(n=>/^iteration242-sprites281b-(before|after|perf)-/.test(n)).sort();
const rows=[];for(const dir of dirs){const file='.logs/'+dir+'/report.json';if(!fs.existsSync(file))continue;const r=JSON.parse(fs.readFileSync(file,'utf8'));rows.push({directory:dir,ok:r.ok,errors:r.errors,checks:r.checks,empty:r.inventoryPerf,full:r.fullInventoryPerf,cycleHeap:r.cycleHeap,heapBeforeCycles:r.heapBeforeCycles,heapAfterCycles:r.heapAfterCycles,openDurations:r.openDurations,resourceBytes:r.resourceBytes});}
fs.writeFileSync('docs/iteration281b-validation.json',JSON.stringify(rows,null,2));
console.log(JSON.stringify(rows.map(r=>({directory:r.directory,ok:r.ok,checks:r.checks.length,empty:r.empty,full:r.full,cycleHeap:r.cycleHeap,openDurations:r.openDurations})),null,2));
