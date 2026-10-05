import {startHub} from './hub.js';
const hub=await startHub();
let closing=false;
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{if(closing)return;closing=true;await hub.close();process.exit(0);});
