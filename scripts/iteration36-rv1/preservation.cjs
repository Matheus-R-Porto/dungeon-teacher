const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),asar=require('@electron/asar');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),out={ok:false,preserved:[],art:[]};
const old=JSON.parse(fs.readFileSync('.logs/iteration36-preserved-packages.json'));
for(const a of JSON.parse(fs.readFileSync('release/iteration36/manifest.json')).artifacts)old.push({path:a.relativePath,sha256:a.sha256});
for(const a of old){assert.equal(sha(fs.readFileSync(a.path)),a.sha256,'Pacote anterior alterado: '+a.path);out.preserved.push(a);}
const file='release/iteration36/student/win-unpacked/resources/app.asar';
for(const p of asar.listPackage(file).map(p=>p.replaceAll('\\','/').replace(/^\//,'')).filter(p=>/^dist\/assets\/.*\.png$/.test(p))){const local=p.replace(/^dist\//,'public/');if(!fs.existsSync(local))continue;const a=sha(asar.extractFile(file,p.split('/').join(path.sep))),b=sha(fs.readFileSync(local));assert.equal(a,b,'Arte original alterada: '+p);out.art.push({path:local,sha256:b});}
out.ok=true;fs.writeFileSync('.logs/iteration36-rv1/preservation.json',JSON.stringify(out,null,2));console.log(JSON.stringify({ok:out.ok,preserved:out.preserved.length,art:out.art.length}));
