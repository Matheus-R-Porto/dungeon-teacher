import {visualCases} from './iteration31-visual.mjs';
// Real production Electron, isolated local server and profiles. Never opens a real save.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {startHub} from '../server/hub.js';
import {adoptJobs} from '../src/domain/character/job-progress.js';
import {Inventory} from '../src/domain/items/inventory.js';
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'.logs','iteration31-art-'+(process.env.BASELINE?'before-':'')+Date.now());fs.mkdirSync(output,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,timeout=25000){const end=Date.now()+timeout;while(Date.now()<end){if(await fn())return;await wait(30);}throw Error('Tempo limite Electron');}
async function port(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
const children=[],sessions=[],report={checks:[],screenshots:[],errors:[]};let hub;
async function start(label){
 const debugPort=await port(),profile='school31-'+label+'-'+Date.now().toString(36);
 const child=spawn(path.join(root,'node_modules/electron/dist/electron.exe'),[root,'--disable-backgrounding-occluded-windows','--disable-features=CalculateNativeWinOcclusion','--test-profile='+profile,'--server=ws://127.0.0.1:'+hub.port+'/hub','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+debugPort],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);
 child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});child.on('error',e=>report.errors.push(e.message));
 let tab;await until(async()=>{try{tab=(await(await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find(t=>t.type==='page'&&t.url.startsWith('dungeon://'));return tab;}catch{return false;}});
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});let id=0;const pending=new Map();
 ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error('CDP timeout: '+method));},12000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
 await send('Runtime.enable');const api={label,profile,child,ws,send,evaluate};sessions.push(api);
 const url=await evaluate('location.href');await send('Page.navigate',{url:url+'&school=1'});await until(()=>evaluate("!!document.querySelector('.school-lobby input[name=username]')"));return api;
}
async function capture(s,name){await s.send('Page.bringToFront');await s.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');const r=await s.send('Page.captureScreenshot',{format:'png'});const file=path.join(output,name+'.png');fs.writeFileSync(file,Buffer.from(r.data,'base64'));report.screenshots.push(file);}

try{
 hub=await startHub({school:true,port:0,worldDataDir:path.join(output,'maps'),characterDataDir:path.join(output,'characters'),log(){},worldOptions:{random:()=>.5}});
 const secret='isolated-test-password-31';await hub.school.createAccount({username:'professor',password:secret,role:'teacher'});await hub.school.createAccount({username:'aluno_a',password:secret,cohort:'A'});const admin=await hub.school.login('professor',secret,'fixture');
 const a=await start('A');
 await visualCases({a,report,capture});report.ok=report.errors.length===0;
}catch(error){report.ok=false;report.errors.push(error.stack);for(const s of sessions)try{await capture(s,'falha-'+s.label);}catch{}}
finally{for(const s of sessions)s.ws.close();for(const c of children)c.kill();await hub?.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({ok:report.ok,errors:report.errors,checks:report.checks,output}));process.exitCode=report.ok?0:1;}
