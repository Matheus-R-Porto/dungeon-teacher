const path=require('node:path');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs');
const send=m=>process.parentPort?process.parentPort.postMessage(m):process.send?.(m);
let service,chain=Promise.resolve();
const ready=(async()=>{const {AdminService}=await import(pathToFileURL(path.join(__dirname,'../server/admin-service.js')));const activities=JSON.parse(fs.readFileSync(path.join(__dirname,'../config/education.json'),'utf8')).activities;service=new AdminService(process.env.DT_ADMIN_DATA_DIR,{activities,host:process.env.DT_TEST_HOST??'0.0.0.0',...(process.env.DT_TEST_PORT?{port:Number(process.env.DT_TEST_PORT)}:{})});send({event:'ready',status:service.status()});})();
const allowed=new Set(['shutdown','importLegacy','status','bootstrap','unlock','lock','overview','start','stop','kick','backup','restore','closeSeason','cleanSeason','createSeason','setRetention','removeExpired','education','createOperator','integrity']);
function receive(m){chain=chain.then(async()=>{await ready;if(!m||!Number.isSafeInteger(m.id)||!allowed.has(m.action))return;try{let value;if(m.action==='shutdown'){await service.dispose();send({id:m.id,ok:true});setTimeout(()=>process.exit(0),50);return;}if(m.action==='importLegacy')value=await service.importLegacy(m.data??{});else if(['status','lock'].includes(m.action))value=service[m.action]();else if(['bootstrap','unlock'].includes(m.action))value=await service[m.action](m.data??{});else if(m.action==='integrity'){service.authorize(m.token);value=service.integrity();}else value=await service[m.action](m.token,m.data??{});send({id:m.id,ok:true,value});}catch(e){send({id:m.id,ok:false,error:String(e.message).slice(0,300)});}}).catch(()=>send({event:'failed',message:'O processo de administração não conseguiu acessar seus dados.'}));}
if(process.parentPort)process.parentPort.on('message',({data})=>receive(data));else process.on('message',receive);
ready.catch(()=>{send({event:'failed',message:'Não foi possível abrir o armazenamento. Os dados foram preservados.'});process.exitCode=1;});
async function shutdown(){try{await chain;await service?.dispose();}finally{process.exit(0);}}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
