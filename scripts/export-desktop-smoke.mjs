import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{WebSocket}=require('../server/node_modules/ws');
const exe=path.resolve('release/beta-0.5.0/win-unpacked/DungeonMaster.exe'),port=19487;
const child=spawn(exe,['--test-profile=Export050Check','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+port],{windowsHide:true,stdio:'ignore'});
let ws;const report={executable:exe,errors:[]};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){const end=Date.now()+45000;while(Date.now()<end){try{const v=await fn();if(v)return v;}catch{}await wait(250);}throw Error('Timeout');}
try{
 const tab=await until(async()=> (await(await fetch('http://127.0.0.1:'+port+'/json/list')).json()).find(t=>t.type==='page'));
 ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));let id=0;const pending=new Map();
 ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id){const p=pending.get(m.id);pending.delete(m.id);p?.(m.result);}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.text);});
 const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}));});
 await send('Runtime.enable');await send('Page.navigate',{url:'dungeon://game/index.html?diagnostic=1'});
 report.state=await until(async()=>{const r=await send('Runtime.evaluate',{expression:"document.querySelector('.game-menu') && JSON.stringify({menu:document.querySelector('.game-menu').innerText,canvas:!!document.querySelector('canvas'),loading:document.querySelector('#loading')?.hidden,title:document.title})",returnByValue:true});return r.result?.value&&JSON.parse(r.result.value);});
 await wait(4000);const screenshot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('.logs/export-050-smoke.png',Buffer.from(screenshot.data,'base64'));
 report.ok=report.state.canvas&&report.errors.length===0;
}catch(e){report.ok=false;report.error=e.message;}finally{ws?.close();child.kill();fs.writeFileSync('.logs/export-050-smoke.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));process.exit(report.ok?0:1);}
