import {OnlineStore} from '../server/online-store.js';
import {SchoolAccess} from '../server/school-access.js';
import path from 'node:path';
const username=process.argv[2];
if(!username||process.argv.length>3)throw Error('Uso: npm run school:teacher -- identificador (senha solicitada em seguida)');
const secret=await new Promise((resolve,reject)=>{
 let value='';process.stdout.write('Senha do professor (não será exibida): ');
 const finish=()=>{if(process.stdin.isTTY)process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');resolve(value);};
 if(process.stdin.isTTY)process.stdin.setRawMode(true);process.stdin.setEncoding('utf8');process.stdin.resume();
 process.stdin.on('data',chunk=>{for(const c of chunk){if(c==='\u0003'){reject(Error('Cancelado'));process.exitCode=1;process.stdin.pause();return;}if(c==='\r'||c==='\n'){finish();return;}if(c==='\u007f'||c==='\b')value=value.slice(0,-1);else if(value.length<129)value+=c;}});
 process.stdin.on('end',finish);
});
const store=new OnlineStore(process.env.CHARACTER_DATA_DIR??path.resolve('data/online'));
try{const access=new SchoolAccess(store);await access.createAccount({username,password:secret,role:'teacher'});console.log('Conta de professor criada. As turmas continuam com o estado atual.');}finally{store.close();}
