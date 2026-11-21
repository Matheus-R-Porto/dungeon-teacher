const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),os=require('node:os');
app.setPath('userData',fs.mkdtempSync(os.tmpdir()+'/dt36-rv2-focus-'));app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');app.commandLine.appendSwitch('disable-features','CalculateNativeWinOcclusion');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1536,height:1024,webPreferences:{backgroundThrottling:false,offscreen:true}});w.webContents.setFrameRate(30);try{
 await w.loadURL('http://127.0.0.1:5198/.logs/iteration36-rv2/lab.html');await w.webContents.executeJavaScript("import('/scripts/iteration36-rv2/lab.js').then(m=>{window.lab=m;return true;})");
 for(const kind of ['focus','draw']){
  console.log('Recording '+kind);const movie=await Promise.race([w.webContents.executeJavaScript('window.lab.focusMovie('+(kind==='draw')+')'),new Promise((_,reject)=>setTimeout(()=>reject(Error('Video timeout')),180000))]);if(movie.frames<120)throw Error('Insufficient recording');
  fs.writeFileSync('.logs/iteration36-rv2/'+(kind==='draw'?'saque-guardar':'comparacao-focada')+'.webm',Buffer.from(movie.webm,'base64'));delete movie.webm;
  for(const [i,s]of movie.snapshots.entries()){s.file=(kind==='draw'?'saque':'foco')+'-'+String(i).padStart(2,'0')+'.png';fs.writeFileSync('.logs/iteration36-rv2/'+s.file,Buffer.from(s.png.split(',')[1],'base64'));delete s.png;}
  fs.writeFileSync('.logs/iteration36-rv2/'+kind+'.json',JSON.stringify(movie,null,2));console.log(kind+': '+movie.frames+' frames / '+movie.seconds.toFixed(1)+' s');
 }
 }catch(e){console.error(e);process.exitCode=1;}finally{w.destroy();app.exit(process.exitCode||0);}});
