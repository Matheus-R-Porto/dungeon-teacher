const {contextBridge,ipcRenderer} = require('electron');
// Only a close/save handshake. No paths, arbitrary channels or Node access.
contextBridge.exposeInMainWorld('desktopLifecycle',Object.freeze({
  onCloseRequested(handler) {
    const listener = async () => {
      try { await handler(); ipcRenderer.send('desktop:close-result',{ok:true}); }
      catch(error) { ipcRenderer.send('desktop:close-result',{ok:false,message:String(error?.message??error).slice(0,300)}); }
    };
    ipcRenderer.on('desktop:prepare-close',listener);
    ipcRenderer.send('desktop:ready');
    return () => ipcRenderer.removeListener('desktop:prepare-close',listener);
  }
}));
