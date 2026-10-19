const {createRequire}=require('node:module'),crypto=require('node:crypto');
const WS=createRequire(require('node:path').resolve('server/package.json'))('ws');
const url=require('../config/multiplayer.json').serverUrl;
const clients=[],report={endpoint:url,at:new Date().toISOString(),checks:[]};
const timer=setTimeout(()=>finish(false,'timeout'),90000);let ended=false;
function finish(ok,error){if(ended)return;ended=true;clearTimeout(timer);for(const c of clients)c.ws.close();report.ok=ok;if(error)report.error=error;require('node:fs').writeFileSync('.logs/export-050-public.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));setTimeout(()=>process.exit(ok?0:1),500);}
for(let i=0;i<2;i++){
 const c={ws:new WS(url,{origin:'dungeon://game'})};clients.push(c);
 c.ws.on('open',()=>c.ws.send(JSON.stringify({v:4,type:'world:hello',name:'Export Test '+i,credential:crypto.randomBytes(32).toString('hex')})));
 c.ws.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='server:error')return finish(false,m.message);if(m.type==='world:welcome'){c.id=m.id;report.checks.push({client:i,protocol:m.v,map:m.map?.id});}if(m.type==='world:snapshot'){c.players=m.players?.map(p=>p.id);if(clients.every(c=>c.id&&clients.every(o=>c.players?.includes(o.id))))finish(true);}});
 c.ws.on('error',e=>finish(false,e.message));c.ws.on('close',(code,reason)=>{if(!ended)finish(false,'closed '+code+' '+reason);});
}
