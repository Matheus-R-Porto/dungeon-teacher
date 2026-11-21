import {spawn} from 'node:child_process';import fs from 'node:fs';
fs.mkdirSync('.logs',{recursive:true});
const reference='docs/dados/iteracao34/codigo-anterior/src/adapters/rendering/appearance-compositor.js';
const original=fs.readFileSync(fs.existsSync(reference)?reference:'.logs/iteration34-compositor-before.js','utf8').replace('../../domain/appearance.js','../src/domain/appearance.js');
fs.writeFileSync('.logs/iteration34-compositor-before.js',original);
fs.writeFileSync('.logs/iteration34-compositor-cpu.js',original.replace('c.height=h;return c;',"c.height=h;c.getContext('2d',{willReadFrequently:true});return c;"));
fs.writeFileSync('.logs/iteration34-atlas.html','<!doctype html><meta charset="utf-8"><title>Verificação local</title>');
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5194','--strictPort'],{stdio:'ignore',windowsHide:true});
try{let ready=false;for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:5194/.logs/iteration34-atlas.html')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('Vite indisponível');const child=spawn('node_modules/electron/dist/electron.exe',['scripts/iteration34/visual-verify.cjs'],{stdio:'inherit',windowsHide:true});process.exitCode=await new Promise(r=>child.once('exit',r));}finally{vite.kill();}
