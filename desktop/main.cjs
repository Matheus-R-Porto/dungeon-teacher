const {app,BrowserWindow,Menu,protocol,session,ipcMain,dialog} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const {ORIGIN,assetHandler} = require('./protocol.cjs');
const {endpoint,networkAllowed} = require('./network.cjs');
const serverUrl=endpoint(require('../config/multiplayer.json').serverUrl);

app.setName('Dungeon Master');
// Stable across installer/portable versions; never uses the extraction directory.
const profile = path.join(app.getPath('appData'),'Dungeon Master');
fs.mkdirSync(profile,{recursive:true});
app.setPath('userData',profile);
app.setPath('sessionData',profile);
protocol.registerSchemesAsPrivileged([{scheme:'dungeon',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
let window,closing=false,ready=false,closeTimer;
const trusted = event => window && event.sender === window.webContents && event.senderFrame === window.webContents.mainFrame && event.senderFrame.url.startsWith(ORIGIN+'/');
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.show();window.focus();}});
  app.whenReady().then(()=>{
    Menu.setApplicationMenu(null);
    session.defaultSession.protocol.handle('dungeon',assetHandler(path.join(__dirname,'../dist'),serverUrl));
    session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
    session.defaultSession.setPermissionCheckHandler(()=>false);
    // Only the exact configured WebSocket endpoint; no general internet access.
    session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(details,callback)=>callback({cancel:!networkAllowed(details.url,serverUrl)}));
    session.defaultSession.on('will-download',event=>event.preventDefault());
    window=new BrowserWindow({title:'Dungeon Master',width:1280,height:720,useContentSize:true,minWidth:1024,minHeight:700,show:false,backgroundColor:'#142b28',autoHideMenuBar:true,
      webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,devTools:!app.isPackaged}});
    window.on('page-title-updated',event=>event.preventDefault());
    window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith(ORIGIN+'/'))event.preventDefault();});
    window.webContents.on('will-attach-webview',event=>event.preventDefault());
    window.webContents.on('before-input-event',(event,input)=>{if(input.type==='keyDown'&&input.key==='F11'&&!input.isAutoRepeat){event.preventDefault();window.setFullScreen(!window.isFullScreen());}});
    window.once('ready-to-show',()=>window.show());
    window.webContents.on('did-fail-load',(_event,code,description,_url,isMainFrame)=>{if(isMainFrame&&code!==-3)dialog.showErrorBox('Dungeon Master','Não foi possível abrir o jogo: '+description);});
    ipcMain.on('desktop:ready',event=>{if(trusted(event))ready=true;});
    ipcMain.on('desktop:close-result',async(event,result)=>{
      if(!trusted(event)||!closing)return;
      clearTimeout(closeTimer);
      if(result?.ok===true){await session.defaultSession.flushStorageData();window.destroy();}
      else await closeFailed(result?.message);
    });
    async function closeFailed(message){
      if(!window||window.isDestroyed())return;
      window.setEnabled(true);
      const result=await dialog.showMessageBox(window,{type:'warning',title:'Não foi possível salvar',message:'O jogo ainda não foi fechado.',detail:message||'O salvamento não respondeu. Você pode continuar e tentar fechar novamente.',buttons:['Continuar no jogo','Sair sem salvar alterações pendentes'],defaultId:0,cancelId:0,noLink:true});
      closing=false;if(result.response===1)window.destroy();
    }
    window.on('close',event=>{
      if(!ready)return; // No character has loaded yet.
      event.preventDefault();if(closing)return;closing=true;window.setEnabled(false);
      window.webContents.send('desktop:prepare-close');
      closeTimer=setTimeout(()=>closeFailed('O salvamento demorou mais que o esperado.'),15000);
    });
    window.on('closed',()=>{clearTimeout(closeTimer);window=null;});
    window.loadURL(ORIGIN+'/index.html');
  }).catch(error=>{dialog.showErrorBox('Dungeon Master',error.message);app.quit();});
  app.on('window-all-closed',()=>app.quit());
}
