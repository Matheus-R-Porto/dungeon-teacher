// Isolated server process. IPC fixtures are available only in this test executable.
import {startHub} from '../server/hub.js';
import path from 'node:path';
const directory=process.argv[2];
const server=await startHub({port:0,worldDataDir:path.join(directory,'maps'),characterDataDir:path.join(directory,'characters'),log:(event,detail)=>process.send?.({event,detail})});
process.send({ready:server.port});
let cpu=process.cpuUsage(),at=performance.now(),tick=server.world.tick;
const timer=setInterval(()=>{const now=performance.now(),usage=process.cpuUsage(),elapsed=now-at;process.send({metric:{at:Date.now(),cpuPercent:100*(usage.user+usage.system-cpu.user-cpu.system)/(elapsed*1000),rss:process.memoryUsage().rss,heap:process.memoryUsage().heapUsed,tickHz:1000*(server.world.tick-tick)/elapsed,connections:server.connections.size}});cpu=usage;at=now;tick=server.world.tick;},1000);
process.on('message',async m=>{try{
 if(m.kind==='fixture'){const result=[];for(const p of server.online?.people.values()??[]){if(!p.ws)continue;const w=server.online.world(p.mapId),e=w.enemies.find(e=>e.alive);p.target=null;p.game.cancel();p.axis={x:0,z:0};let point=w.map.spawn;if(m.mode==='portal')point=w.map.portal;else if(m.mode==='enemy'&&e)point={x:e.x+1,z:e.z};Object.assign(p.game.player,point);result.push({id:p.id,enemy:e&&{id:e.id,generation:e.generation},mapId:p.mapId});}process.send({reply:m.id,result});}
 if(m.kind==='close'){clearInterval(timer);await server.close();process.exit(0);}
 }catch(error){process.send({error:error.stack,reply:m.id});}});
