import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const bundle=path.resolve('release/DungeonMaster-Beta-0.5.2-Windows');
const {startHub}=await import(pathToFileURL(path.join(bundle,'Runtime/server/hub.js')));
const {WebSocket}=createRequire(path.join(bundle,'Runtime/server/package.json'))('ws');
const output=path.resolve('.logs/export-052-'+Date.now());fs.mkdirSync(output,{recursive:true});
const hub=await startHub({port:0,worldDataDir:path.join(output,'maps'),characterDataDir:path.join(output,'characters'),log(){}});
const exe=path.join(bundle,'Jogo/DungeonMaster.exe'),profile='Export052-'+Date.now().toString(36),port=19487;
const report={exe,node:process.version,errors:[]};let child,ws;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){const end=Date.now()+45000;while(Date.now()<end){const v=await fn();if(v)return v;await wait(250);}throw Error('Timeout');}
try{
 child=spawn(exe,['--test-profile='+profile,'--server=ws://127.0.0.1:'+hub.port+'/hub','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+port],{windowsHide:true,stdio:'ignore'});
 const tab=await until(async()=>{try{return(await(await fetch('http://127.0.0.1:'+port+'/json/list')).json()).find(t=>t.type==='page');}catch{return false;}});
 ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});let id=0;const pending=new Map();
 ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p?.reject(Error(m.error.message)):p?.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result?.value;
 await send('Runtime.enable');
 await until(()=>evaluate("document.querySelector('.shared-status strong')?.textContent==='Online'"));
 report.tower={online:true,players:hub.online.people.size,canvas:await evaluate("!!document.querySelector('canvas')")};
 await wait(2500);fs.writeFileSync(path.join(output,'tower.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await send('Page.navigate',{url:'dungeon://game/index.html'});
 await until(()=>evaluate("!!document.querySelector('.game-menu') && !!document.querySelector('canvas')"));await wait(2500);
 report.campaign={canvas:await evaluate("!!document.querySelector('canvas')"),menu:await evaluate("document.querySelector('.game-menu').innerText")};
 fs.writeFileSync(path.join(output,'campaign.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 report.ok=report.tower.online&&report.tower.canvas&&report.campaign.canvas&&report.errors.length===0;
 await evaluate('window.close()');
 await Promise.race([new Promise(r=>child.once('exit',r)),wait(18000)]);
 report.normalExit=child.exitCode===0;if(!report.normalExit)report.ok=false;
}catch(e){report.ok=false;report.errors.push(e.stack);}finally{ws?.close();if(child&&child.exitCode===null)child.kill();await hub.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,output}));process.exit(report.ok?0:1);}
