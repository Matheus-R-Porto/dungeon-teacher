import fs from 'node:fs';
import path from 'node:path';
const dir=process.argv[2];if(!dir)throw Error('Provide a benchmark output directory');
const r=JSON.parse(fs.readFileSync(path.join(dir,'report.json'))),raw=JSON.parse(fs.readFileSync(path.join(dir,'frames.json')));
const out={ok:r.ok,method:r.method,metrics:r.metrics,categories:r.categories,arenaReturn:r.arenaReturn,overhead:r.capture,worst:r.worst,samples:r.samples,transitions:r.transitions.map(t=>({name:t.name,latency:t.end-t.start,preparation:t.detail?.total,control:t.detail?.controlLatency,firstRender:t.detail?.firstRender,disposal:t.detail?.disposalMs,stages:t.detail?.stages?.filter(s=>s.ms>20)}))};
const tracePath=path.join(dir,'trace.json');if(fs.existsSync(tracePath)){
 const trace=JSON.parse(fs.readFileSync(tracePath)),events=trace.traceEvents??trace;
 const threads=events.filter(e=>e.name==='thread_name');out.threads=threads.map(e=>({pid:e.pid,tid:e.tid,name:e.args.name}));
 const anchor=events.find(e=>JSON.stringify(e.args??{}).includes('iteration233-anchor:'));
 const text=JSON.stringify(anchor?.args??{}),match=text.match(/iteration233-anchor:([\d.]+)/);const offset=match?anchor.ts/1000-Number(match[1]):null;out.anchor={event:anchor,offsetMs:offset};
 const renderer=threads.find(e=>e.args.name==='CrRendererMain'&&e.pid===anchor?.pid);
 const complete=events.filter(e=>e.ph==='X'&&e.dur>0);out.longEvents=complete.filter(e=>e.dur>10000).toSorted((a,b)=>b.dur-a.dur).slice(0,50).map(e=>({name:e.name,pid:e.pid,tid:e.tid,ms:e.dur/1000,at:e.ts/1000-offset,args:e.args}));
 out.timelines=raw.frames.toSorted((a,b)=>b.ms-a.ms).slice(0,12).map(f=>({frame:f,internal:(raw.windows.find(w=>w.at===f.at)?.events??raw.events).filter(e=>e.at>=f.start-100&&e.at<=f.at+100),trace:offset===null?[]:complete.filter(e=>e.pid===anchor.pid&&e.tid===renderer?.tid&&e.ts/1000-offset<f.at+50&&(e.ts+e.dur)/1000-offset>f.start-100).filter(e=>e.dur>500).map(e=>({name:e.name,start:e.ts/1000-offset,ms:e.dur/1000,args:e.args})).slice(0,120)}));
 const byName={};for(const e of complete){if(e.pid!==anchor?.pid||e.tid!==renderer?.tid)continue;const a=byName[e.name]??={count:0,total:0,max:0};a.count++;a.total+=e.dur/1000;a.max=Math.max(a.max,e.dur/1000);}out.rendererEvents=Object.entries(byName).sort((a,b)=>b[1].total-a[1].total);
}
fs.writeFileSync(path.join(dir,'analysis.json'),JSON.stringify(out,null,2));console.log(JSON.stringify({ok:out.ok,metrics:out.metrics,categories:out.categories,overhead:out.overhead,longEvents:out.longEvents?.slice(0,10),rendererEvents:out.rendererEvents?.slice(0,15)},null,2));
