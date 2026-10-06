// Automated transport integration, not a manual gameplay/UI test.
// Uses Chromium's WebSocket with its natural Origin and production security helpers.
const {app,BrowserWindow,protocol,session}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const root=path.resolve(__dirname,'..');
const shellRoot=process.argv[2]?path.resolve(process.argv[2]):root;
const {ORIGIN,assetHandler}=require(path.join(shellRoot,'desktop/protocol.cjs'));
const {networkAllowed}=require(path.join(shellRoot,'desktop/network.cjs'));
const config=JSON.parse(fs.readFileSync(path.join(shellRoot,'config/multiplayer.json'),'utf8'));
if(!config.serverUrl.startsWith('wss://'))throw Error('Configure o endpoint público antes deste teste.');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'dungeon-public-probe-'));
app.setPath('userData',path.join(temporary,'profile'));
protocol.registerSchemesAsPrivileged([{scheme:'dungeon',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
for(const file of ['src/multiplayer/client.js','src/multiplayer/remote-state.js','shared/multiplayer.js']){const destination=path.join(temporary,file);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(root,file),destination);}
fs.copyFileSync(path.join(__dirname,'public-hub-probe-renderer.js'),path.join(temporary,'probe.js'));
fs.writeFileSync(path.join(temporary,'config.json'),JSON.stringify(config));
fs.writeFileSync(path.join(temporary,'index.html'),'<!doctype html><meta charset="utf-8"><title>Teste de transporte</title><script type="module" src="/probe.js"></script>');
let window,finished=false;const origins=[];const start=Date.now();
function finish(result){if(finished)return;finished=true;clearTimeout(deadline);const report={at:new Date().toISOString(),electron:process.versions.electron,endpoint:config.serverUrl,shellRoot,elapsedMs:Date.now()-start,origins:[...new Set(origins)],...result};if(report.ok&&(!origins.length||origins.some(origin=>origin!==ORIGIN))){report.ok=false;report.error='Origin inesperada';}fs.writeFileSync(path.join(root,'docs/MULTIPLAYER-01.1-PUBLIC-PROBE.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));window?.destroy();app.exit(report.ok?0:1);}
const deadline=setTimeout(()=>finish({ok:false,error:'Tempo limite do teste público (180 s).'}),180000);
app.whenReady().then(async()=>{
  const ses=session.defaultSession;
  ses.protocol.handle('dungeon',assetHandler(temporary,config.serverUrl));
  ses.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(details,callback)=>callback({cancel:!networkAllowed(details.url,config.serverUrl)}));
  ses.webRequest.onSendHeaders({urls:[config.serverUrl]},details=>{const entry=Object.entries(details.requestHeaders).find(([key])=>key.toLowerCase()==='origin');origins.push(entry?.[1]??'missing');});
  window=new BrowserWindow({show:false,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
  window.webContents.on('console-message',details=>{if(details.message.startsWith('PUBLIC_PROBE:'))finish(JSON.parse(details.message.slice('PUBLIC_PROBE:'.length)));});
  window.webContents.on('render-process-gone',(_event,details)=>finish({ok:false,error:details.reason}));
  await window.loadURL(ORIGIN+'/index.html');
}).catch(error=>finish({ok:false,error:error.message}));
