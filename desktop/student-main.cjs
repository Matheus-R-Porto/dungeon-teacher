const {profileDirectory}=require('./profile.cjs');
const {app,BrowserWindow,Menu,protocol,session,ipcMain,dialog}=require('electron');
const path=require('node:path'),fs=require('node:fs');
const {ORIGIN,assetHandler}=require('./protocol.cjs');
const {networkAllowed}=require('./network.cjs');
const {Connection,probe}=require('./lan-client.cjs');
const {discover}=require('./discovery.cjs');
app.setName('Dungeon Teacher Aluno');
const test=!app.isPackaged&&process.env.DT_TEST_PROFILE;
const diagnostic=!!test||process.argv.includes('--diagnostic');
const profile=profileDirectory(app,'Dungeon Teacher');
fs.mkdirSync(profile,{recursive:true});app.setPath('userData',profile);app.setPath('sessionData',profile);
const connection=new Connection(profile);
protocol.registerSchemesAsPrivileged([{scheme:'dungeon',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
let window,closing=false,ready=false,timer;
const trusted=e=>window&&e.sender===window.webContents&&e.senderFrame===window.webContents.mainFrame&&e.senderFrame.url.startsWith(ORIGIN+'/');
if(!app.requestSingleInstanceLock())app.quit();else{
 app.on('second-instance',()=>{window?.show();window?.focus();});
 app.whenReady().then(()=>{
  Menu.setApplicationMenu(null);const s=session.defaultSession;
  s.protocol.handle('dungeon',request=>assetHandler(path.join(__dirname,'../dist'),connection.value?.url??'')(request));
  s.setCertificateVerifyProc((request,callback)=>callback(connection.verify(request.hostname,request.certificate.data)?0:-2));
  s.setPermissionRequestHandler((_w,_p,c)=>c(false));s.setPermissionCheckHandler(()=>false);
  s.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(d,c)=>c({cancel:!networkAllowed(d.url,connection.value?.url??'')}));s.on('will-download',e=>e.preventDefault());
  window=new BrowserWindow({title:'Dungeon Teacher Aluno — 0.6.15 — Playtest Escolar',width:1280,height:800,minWidth:1024,minHeight:700,show:false,backgroundColor:'#142b28',webPreferences:{preload:path.join(__dirname,'student-preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,devTools:!!test}});
  window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith(ORIGIN+'/'))e.preventDefault();});window.webContents.on('will-attach-webview',e=>e.preventDefault());window.on('page-title-updated',e=>e.preventDefault());
  ipcMain.handle('desktop:mode',e=>{if(!trusted(e))throw Error('Origem inválida.');return {development:!!test,diagnostic,schoolOnly:true,serverUrl:connection.value?.url??''};});
  ipcMain.handle('school:connection',async(e,action,data)=>{if(!trusted(e))throw Error('Origem inválida.');if(action==='get')return connection.value;if(action==='discover')return discover();if(action==='probe')return probe(data);if(action==='trust')return connection.trust(data);throw Error('Operação inválida.');});
  ipcMain.on('desktop:ready',e=>{if(trusted(e))ready=true;});
  const fail=async()=>{clearTimeout(timer);if(!window||window.isDestroyed())return;const r=await dialog.showMessageBox(window,{type:'warning',message:'O servidor ainda não confirmou a saída.',detail:'As operações já confirmadas continuam salvas no servidor.',buttons:['Continuar no jogo','Fechar aplicativo'],defaultId:0,cancelId:0});closing=false;if(r.response===1)window.destroy();};
  ipcMain.on('desktop:close-result',(e,result)=>{if(!trusted(e)||!closing)return;clearTimeout(timer);if(result?.ok)window.destroy();else fail();});
  window.on('close',e=>{if(!ready)return;e.preventDefault();if(closing)return;closing=true;window.webContents.send('desktop:prepare-close');timer=setTimeout(fail,15000);});
  window.on('closed',()=>{clearTimeout(timer);window=null;});window.once('ready-to-show',()=>window.show());
  window.loadURL(ORIGIN+'/index.html?school=1'+(diagnostic?'&diagnostic=1':''));
 }).catch(e=>{dialog.showErrorBox('Dungeon Teacher',e.message);app.quit();});app.on('window-all-closed',()=>app.quit());
}
