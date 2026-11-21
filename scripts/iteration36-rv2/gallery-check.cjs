const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'dt-rv2-gallery-')));
const root=String.raw`C:\Users\theuz\Documents\Codex\2026-10-26\voc-ser-responsanvel-pela-continua-o-4\outputs\capturas\iteration36-rv2`;
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1400,height:1100,webPreferences:{offscreen:true,backgroundThrottling:false}}),errors=[];w.webContents.on('console-message',details=>{if(details.level==='error')errors.push(details.message);});try{
 await w.loadFile(path.join(root,'index.html'));await w.webContents.executeJavaScript('draw()');
 let r=await w.webContents.executeJavaScript(`({heading:document.querySelector('h1').textContent,description:document.getElementById('description').textContent,states:document.getElementById('state').options.length,classes:document.getElementById('cls').options.length,images:[...document.querySelectorAll('img')].length,video:document.querySelector('video').readyState,provisional:document.body.innerText.includes('Aprovação visual provisória')})`);
 assert.equal(r.states,20);assert.equal(r.classes,6);assert.ok(r.provisional);assert.ok(r.description.includes('caminhada 1'));
 fs.writeFileSync(path.join(root,'galeria-preview.png'),(await w.webContents.capturePage()).toPNG());
 await w.webContents.executeJavaScript("document.getElementById('cls').value='mage';document.getElementById('body').value='feminine';document.getElementById('combo').value='6';document.getElementById('dir').selectedIndex=3;document.getElementById('state').value='11';draw()");
 assert.equal(fs.readdirSync(root).filter(n=>/^matrix-.*\.png$/.test(n)).length,192);
 for(const f of ['comparacao-focada.webm','referencia-costas.png','referencia-lateral.png','online/caminhada-proprio.png','online/caminhada-observador.png'])assert.ok(fs.statSync(path.join(root,f)).size>1000);
 assert.equal(errors.length,0,errors.join('\n'));r={...r,ok:true,alternateSelection:true,offline:true,errors};fs.writeFileSync(path.join(root,'gallery-check.json'),JSON.stringify(r,null,2));console.log(JSON.stringify(r));
 }catch(e){console.error(e);process.exitCode=1;}finally{w.destroy();app.exit(process.exitCode||0);}});
