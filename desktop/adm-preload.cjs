const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('schoolAdmin',Object.freeze({request:(action,data)=>ipcRenderer.invoke('adm:command',action,data),onFailure:fn=>ipcRenderer.on('adm:failed',(_e,message)=>fn(message))}));
