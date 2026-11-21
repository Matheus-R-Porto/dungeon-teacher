const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),os=require('node:os');app.setPath('userData',fs.mkdtempSync(os.tmpdir()+'/dt36-rv-matrix-'));
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1536,height:1024,webPreferences:{backgroundThrottling:false}}),report={rows:[],errors:[]};try{await w.loadURL('http://127.0.0.1:5198/.logs/iteration36-rv2/lab.html');await w.webContents.executeJavaScript("import('/scripts/iteration36-rv2/lab.js').then(m=>{window.lab=m;return true;})");
 report.pixels=await w.webContents.executeJavaScript('window.lab.pixelChecks()');
 for(const version of ['before','after'])for(const cls of ['novice','warrior','archer','rogue','priest','mage'])for(const body of ['masculine','feminine']){
  for(let combo=0;combo<8;combo++){const r=await w.webContents.executeJavaScript(`window.lab.matrix('${version}','${cls}','${body}',${combo})`);const name=`matrix-${version}-${cls}-${body}-${combo}.png`;fs.writeFileSync('.logs/iteration36-rv2/'+name,Buffer.from(r.png.split(',')[1],'base64'));delete r.png;r.file=name;report.rows.push(r);if(r.maxGripError>.5)throw Error('Erro de encaixe projetado '+name+' '+r.maxGripError);}
  console.log(version,cls,body,'384 quadros');
 }
 report.ok=report.rows.length===192;fs.writeFileSync('.logs/iteration36-rv2/matrix.json',JSON.stringify(report,null,2));

 }catch(e){report.ok=false;report.errors.push(e.stack);fs.writeFileSync('.logs/iteration36-rv2/matrix.json',JSON.stringify(report,null,2));console.error(e);process.exitCode=1;}finally{w.destroy();app.quit();}});
