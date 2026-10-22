import {startHub} from './hub.js';
const population=process.env.TOWER_POPULATION??'high';
if(!['high','reduced'].includes(population))throw Error('TOWER_POPULATION: high or reduced');
const hub=await startHub({worldOptions:{population},compression:process.env.SNAPSHOT_COMPRESSION!=='0'});
let closing=false;
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{if(closing)return;closing=true;await hub.close();process.exit(0);});
