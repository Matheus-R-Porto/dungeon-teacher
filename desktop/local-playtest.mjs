// Standalone distribution launcher: loopback only; no public deployment.
import {startHub} from './server/hub.js';
import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const data=path.join(process.env.APPDATA,'Dungeon Master Local 0.5.2');
fs.mkdirSync(data,{recursive:true});
let hub,child,closing=false;
async function close(code=0){if(closing)return;closing=true;try{await hub?.close();}finally{process.exit(code);}}
try{
  // Stable endpoint preserves the desktop identity between launches.
  hub=await startHub({host:'127.0.0.1',port:18787,worldDataDir:path.join(data,'maps'),characterDataDir:path.join(data,'characters'),log(){}});
  console.log('Torre local Beta 0.5.2 iniciada. Feche o jogo normalmente para salvar.');
  child=spawn(path.join(here,'..','Jogo','DungeonMaster.exe'),['--test-profile=Beta052Local','--server=ws://127.0.0.1:18787/hub'],{windowsHide:true,stdio:'ignore'});
  child.once('error',async e=>{console.error(e.message);await close(1);});
  child.once('exit',code=>close(code??1));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{child?.kill();close();});
}catch(e){console.error('Não foi possível abrir a Torre local:',e.message);console.error('Feche outra cópia da Torre local e tente novamente.');await close(1);}
