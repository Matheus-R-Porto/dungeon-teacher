import {NET} from '../shared/multiplayer.js';
const number=(env,key,fallback,min,max)=>{const value=env[key]===undefined?fallback:Number(env[key]);if(!Number.isInteger(value)||value<min||value>max)throw Error('Configuração inválida: '+key);return value;};
export function serverConfig(env=process.env){return {
  host:env.HOST||'127.0.0.1',port:number(env,'PORT',8787,0,65535),
  origins:(env.ALLOWED_ORIGINS||'dungeon://game,http://127.0.0.1:5173,http://localhost:5173').split(',').map(s=>s.trim()).filter(Boolean),
  capacity:number(env,'ROOM_CAPACITY',16,2,NET.maxPlayers),maxConnections:number(env,'MAX_CONNECTIONS',64,2,256),
  maxPerIp:number(env,'MAX_CONNECTIONS_PER_IP',8,2,64),maxMessages:number(env,'MAX_MESSAGES_PER_SECOND',45,NET.updateHz+2,120),
  heartbeatMs:number(env,'HEARTBEAT_MS',10000,1000,30000),helloMs:5000,maxPayload:NET.maxPayload,
  upgradeWindowMs:10000,maxUpgrades:20,maxTrackedIps:2048,maxBuffered:65536
};}
