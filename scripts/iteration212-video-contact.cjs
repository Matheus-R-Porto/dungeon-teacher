// Inspect recorded gameplay over time; does not modify source art or recordings.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path');
app.whenReady().then(async()=>{
 const directory=path.resolve(process.argv[2]),win=new BrowserWindow({show:false,webPreferences:{contextIsolation:true}});
 await win.loadURL('data:text/html,<html><body></body></html>');
 for(const name of fs.readdirSync(directory).filter(n=>n.endsWith('.webm')&&(!process.argv[3]||n.includes(process.argv[3])))){
  const src='data:video/webm;base64,'+fs.readFileSync(path.join(directory,name)).toString('base64');
  const result=await win.webContents.executeJavaScript(`(async()=>{const v=document.createElement('video');v.muted=true;v.src=${JSON.stringify(src)};await new Promise((r,j)=>{v.onloadeddata=r;v.onerror=j;});if(!Number.isFinite(v.duration)){v.currentTime=1e6;await new Promise(r=>v.onseeked=r);}const duration=v.duration,c=document.createElement('canvas');c.width=1280;c.height=720;const g=c.getContext('2d');for(let i=0;i<8;i++){v.currentTime=Math.max(.01,duration*(i+.5)/8);await new Promise(r=>v.onseeked=r);const x=i%4*320,y=Math.floor(i/4)*360;const side=Math.min(640,v.videoHeight);g.drawImage(v,(v.videoWidth-side)/2,(v.videoHeight-side)/2,side,side,x,y,320,320);g.fillStyle='#000';g.fillRect(x,y,130,20);g.fillStyle='#fff';g.fillText(v.currentTime.toFixed(2)+'s',x+4,y+14);}return {duration,png:c.toDataURL('image/png').split(',')[1]};})()`);
  fs.writeFileSync(path.join(directory,name.replace('.webm','-contact.png')),Buffer.from(result.png,'base64'));
  console.log(name,result.duration);
 }
 win.destroy();app.quit();
}).catch(e=>{console.error(e);app.exit(1);});
