const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),os=require('node:os');
app.setPath('userData',fs.mkdtempSync(os.tmpdir()+'/dt-rv2-final-'));app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');app.commandLine.appendSwitch('disable-features','CalculateNativeWinOcclusion');
const dir='.logs/iteration36-rv2/',result={ok:false,steps:[]};
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1536,height:1024,webPreferences:{backgroundThrottling:false,offscreen:true}});w.webContents.setFrameRate(30);try{
 await w.loadURL('http://127.0.0.1:5198/.logs/iteration36-rv2/lab.html');await w.webContents.executeJavaScript("import('/scripts/iteration36-rv2/lab.js').then(m=>{window.lab=m;return true;})");
 const matrix={ok:false,rows:[],errors:[],pixels:await w.webContents.executeJavaScript('window.lab.pixelChecks()')};
 for(const version of ['before','after'])for(const cls of ['novice','warrior','archer','rogue','priest','mage'])for(const body of ['masculine','feminine']){
  for(let combo=0;combo<8;combo++){const r=await w.webContents.executeJavaScript(`window.lab.matrix('${version}','${cls}','${body}',${combo})`);r.file=`matrix-${version}-${cls}-${body}-${combo}.png`;fs.writeFileSync(dir+r.file,Buffer.from(r.png.split(',')[1],'base64'));delete r.png;matrix.rows.push(r);}
  console.log(version+' '+cls+' '+body);
 }
 matrix.ok=matrix.rows.length===192;fs.writeFileSync(dir+'matrix.json',JSON.stringify(matrix,null,2));result.steps.push('192 matrices and '+matrix.pixels.frames+' backpack poses');
 for(const [name,expression,file,prefix]of [['motion','window.lab.movie()','comparacao-em-movimento','movimento'],['focus','window.lab.focusMovie()','comparacao-focada','foco'],['draw','window.lab.focusMovie(true)','saque-guardar','saque']]){
  console.log('Recording '+name);const m=await Promise.race([w.webContents.executeJavaScript(expression),new Promise((_,j)=>setTimeout(()=>j(Error(name+' timeout')),180000))]);if(m.frames<120)throw Error(name+' insufficient frames');
  fs.writeFileSync(dir+file+'.webm',Buffer.from(m.webm,'base64'));delete m.webm;for(const [i,s]of m.snapshots.entries()){s.file=prefix+'-'+String(i).padStart(2,'0')+'.png';fs.writeFileSync(dir+s.file,Buffer.from(s.png.split(',')[1],'base64'));delete s.png;}fs.writeFileSync(dir+name+'.json',JSON.stringify(m,null,2));result.steps.push(name+': '+m.frames+' frames');console.log(result.steps.at(-1));
 }
 result.ok=true;
 }catch(e){result.error=e.stack;console.error(e);process.exitCode=1;}finally{fs.writeFileSync(dir+'visual-final.json',JSON.stringify(result,null,2));w.destroy();app.exit(process.exitCode||0);}});
