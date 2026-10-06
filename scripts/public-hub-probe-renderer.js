import {HubClient} from './src/multiplayer/client.js';
const config=await (await fetch('/config.json')).json();
const stateA={x:0,z:4.8,heading:Math.PI,moving:false},stateB={x:1,z:4.8,heading:0,moving:false};
const identityA={id:crypto.randomUUID(),name:'Probe A'},identityB={id:crypto.randomUUID(),name:'Probe B'};
const a=new HubClient({url:config.serverUrl,identity:identityA,getPlayer:()=>stateA});
const b=new HubClient({url:config.serverUrl,identity:identityB,getPlayer:()=>stateB});
const checks=[];
async function until(check,label,timeout=120000){const start=performance.now();while(!check()){if(performance.now()-start>timeout)throw Error(label+': '+a.status+' / '+a.detail+'; '+b.status+' / '+b.detail);await new Promise(resolve=>setTimeout(resolve,25));}checks.push(label);}
try {
  a.connect();await until(()=>a.status==='Online','TLS/handshake/hello A accepted');
  b.connect();await until(()=>b.status==='Online'&&b.remotes.has(identityA.id)&&a.remotes.has(identityB.id),'late snapshot and join');
  if(a.remotes.has(identityA.id)||b.remotes.has(identityB.id))throw Error('Local player duplicated');
  stateA.x=2;stateA.heading=1;stateA.moving=true;
  await until(()=>b.remotes.get(identityA.id)?.samples.at(-1)?.x===2,'state A to B',10000);
  stateB.z=2;stateB.heading=-1;stateB.moving=true;
  await until(()=>a.remotes.get(identityB.id)?.samples.at(-1)?.heading===-1,'state B to A with facing',10000);
  await until(()=>a.ping!==null&&b.ping!==null,'ping/pong',15000);const ping={a:a.ping,b:b.ping};
  a.disconnect();await until(()=>!b.remotes.has(identityA.id),'disconnect removes A',10000);
  a.connect();await until(()=>a.status==='Online'&&b.remotes.has(identityA.id)&&a.remotes.has(identityB.id),'reconnect and fresh snapshot');
  a.setHub(false);await until(()=>!b.remotes.has(identityA.id),'Tower removes presence',10000);
  a.setHub(true);await until(()=>a.status==='Online'&&b.remotes.has(identityA.id),'return rejoins room');
  a.disconnect();b.disconnect();console.log('PUBLIC_PROBE:'+JSON.stringify({ok:true,checks,pingMs:ping,locationOrigin:location.origin}));
}catch(error){a.disconnect();b.disconnect();console.log('PUBLIC_PROBE:'+JSON.stringify({ok:false,checks,error:error.message}));}
