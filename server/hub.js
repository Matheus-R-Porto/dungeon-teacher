import {fixedTicker} from './fixed-ticker.js';
import {OnlineTower} from './online-tower.js';
import {decodeOnline} from '../shared/online.js';
import http from 'node:http';
import {WebSocketServer,WebSocket} from 'ws';
import {NET,TYPE,message,decode} from '../shared/multiplayer.js';
import {serverConfig} from './config.js';
import {SharedWorld} from './world.js';
import {decodeWorld,worldMessage,WORLD_NET} from '../shared/world.js';
import {SharedTower} from './tower.js';
import {decodeTowerMessage} from '../shared/tower.js';
import path from 'node:path';

export async function startHub(options={}) {
  const config={...serverConfig(),...options},log=options.log??((event,detail={})=>console.log(JSON.stringify({time:new Date().toISOString(),event,...detail})));
  const players=new Map(),connections=new Set(),attempts=new Map();
  const world=new SharedWorld(options.worldOptions);
  const tower=new SharedTower({directory:options.worldDataDir??process.env.WORLD_DATA_DIR??path.resolve('data/shared-tower'),seed:options.towerSeed??217021,worldOptions:options.worldOptions,capacity:config.capacity});
  const httpServer=http.createServer((req,res)=>{if(req.url==='/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:true,protocolVersion:NET.version,room:NET.room,players:players.size}));}else{res.writeHead(404);res.end();}});
  const wss=new WebSocketServer({noServer:true,maxPayload:config.maxPayload,perMessageDeflate:false});
  const send=(ws,m)=>{if(ws.readyState!==WebSocket.OPEN)return;if(ws.bufferedAmount>config.maxBuffered){ws.terminate();return;}const at=options.onSendSample?performance.now():0;const json=JSON.stringify(m),encoded=options.onSendSample?performance.now():0;ws.send(json);if(options.onSendSample)options.onSendSample({serialization:encoded-at,send:performance.now()-encoded});};
  let online;const onlineWorld=()=>online??=new OnlineTower({directory:options.worldDataDir??process.env.WORLD_DATA_DIR??path.resolve('data/shared-tower'),characterDirectory:options.characterDataDir??process.env.CHARACTER_DATA_DIR??path.resolve('data/online'),seed:options.towerSeed??217021,worldOptions:options.worldOptions,capacity:config.capacity,send});
  const broadcast=(m,except)=>{for(const p of players.values())if(p.ws!==except)send(p.ws,m);};
  const publicPlayer=p=>({id:p.id,name:p.name,state:p.state});
  const leave=ws=>{if(ws.onlineSession)online?.leave(ws);else if(ws.towerSession)tower.leave(ws);else world.leave(ws);const p=ws.player;if(p&&players.get(p.id)?.ws===ws){players.delete(p.id);ws.player=null;broadcast(message(TYPE.leave,{id:p.id}));log('leave',{id:p.id,count:players.size});}};
  const reject=(ws,reason,code=4002)=>{leave(ws);send(ws,message(TYPE.error,{message:reason}));ws.close(code,reason.slice(0,100));setTimeout(()=>{if(ws.readyState!==WebSocket.CLOSED)ws.terminate();},1000).unref();log('protocol error',{reason});};
  httpServer.on('upgrade',(req,socket,head)=>{
    socket.on('error',()=>{});
    const ip=req.socket.remoteAddress||'unknown',now=Date.now();
    // Trust the socket address, not a spoofable X-Forwarded-For header.
    for(const [key,v] of attempts)if(now-v.at>config.upgradeWindowMs)attempts.delete(key);
    let attempt=attempts.get(ip);
    if(!attempt){if(attempts.size>=config.maxTrackedIps){socket.destroy();return;}attempt={at:now,count:0};attempts.set(ip,attempt);}
    attempt.count++;
    if(req.url!=='/hub'||!config.origins.includes(req.headers.origin)||connections.size>=config.maxConnections||[...connections].filter(ws=>ws.ip===ip).length>=config.maxPerIp||attempt.count>config.maxUpgrades){socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');socket.destroy();return;}
    wss.handleUpgrade(req,socket,head,ws=>{ws.ip=ip;wss.emit('connection',ws);});
  });
  wss.on('connection',ws=>{
    connections.add(ws);ws.alive=true;ws.tokens=config.maxMessages;ws.rateAt=Date.now();
    log('connection',{connections:connections.size});
    const helloTimer=setTimeout(()=>reject(ws,'Tempo de conexão esgotado.'),config.helloMs);helloTimer.unref();
    ws.on('pong',()=>{ws.alive=true;});
    ws.on('error',error=>log('error',{message:error.message}));
    ws.on('message',(data,binary)=>{
      if(ws.readyState!==WebSocket.OPEN)return;
      const now=Date.now();ws.tokens=Math.min(config.maxMessages,ws.tokens+(now-ws.rateAt)*config.maxMessages/1000);ws.rateAt=now;
      if(--ws.tokens<0){reject(ws,'Muitas mensagens. Aguarde para reconectar.',4008);return;}
      try {
        if(binary)throw Error('Use mensagens JSON de texto.');
        const raw=data.toString();
        if(JSON.parse(raw)?.v===4){
          const m=decodeOnline(raw);if(ws.player||ws.worldPlayer&&!ws.onlineSession)throw Error('Conexão já usada por outro modo.');
          const o=onlineWorld();if(m.type==='world:hello'){if(ws.worldPlayer)throw Error('Sessão já iniciada.');const welcome=o.join(ws,m.name,m.credential);clearTimeout(helloTimer);send(ws,welcome);send(ws,o.snapshot(ws.worldPlayer));}else{const response=o.command(ws,m);if(response)send(ws,response);}return;
        }
        if(ws.onlineSession)throw Error('Protocolo incompatível com a sessão online.');
        if(JSON.parse(raw)?.v===3){
          const m=decodeTowerMessage(raw);if(ws.player||ws.worldPlayer&&!ws.towerSession)throw Error('Conexão já usada por outro modo.');
          if(m.type==='world:hello'){if(ws.worldPlayer)throw Error('Sessão já iniciada.');const welcome=tower.join(ws,m.name,m.token);clearTimeout(helloTimer);send(ws,welcome);send(ws,tower.snapshot(ws.worldPlayer));}
          else {const response=tower.command(ws,m);if(response)send(ws,response);}
          return;
        }
        if(JSON.parse(raw)?.v===2){
          if(ws.towerSession)throw Error('Protocolo incompatível com a sessão da Torre.');
          const m=decodeWorld(raw);
          if(ws.player)throw Error('Conexão já usada pelo Refúgio.');
          if(m.type==='world:hello'){
            if(ws.worldPlayer)throw Error('Sessão já iniciada.');
            const resumed=m.token&&world.tokens.get(m.token);
            if(world.players.size>=config.capacity&&!resumed?.ws)throw Error('Mapa cheio.');
            if(world.tokens.size>=256&&!resumed)throw Error('Aguarde antes de criar outra sessão.');
            clearTimeout(helloTimer);ws.worldPlayer=world.join(ws,m.name,m.token);
            send(ws,worldMessage('world:welcome',{id:ws.worldPlayer.id,token:ws.worldPlayer.token,map:world.map}));
            send(ws,world.snapshot());
          }else world.command(ws,m);
          return;
        }
        if(ws.worldPlayer)throw Error('Protocolo incompatível com a sessão.');
        const m=decode(data.toString());
        if(m.type===TYPE.hello){
          if(ws.player)throw Error('Sessão já iniciada.');
          if(players.has(m.id)){reject(ws,'Esta identidade já está conectada.',4009);return;}
          if(players.size>=config.capacity){reject(ws,'Refúgio cheio. Tente novamente.',4010);return;}
          clearTimeout(helloTimer);ws.player={id:m.id,name:m.name,state:m.state,lastSeen:now,ws};players.set(m.id,ws.player);
          send(ws,message(TYPE.welcome,{id:m.id,room:NET.room}));
          send(ws,message(TYPE.snapshot,{players:[...players.values()].map(publicPlayer)}));
          broadcast(message(TYPE.join,{player:publicPlayer(ws.player)}),ws);log('join',{id:m.id,room:NET.room,count:players.size});
        } else {
          if(!ws.player)throw Error('Entre no Refúgio antes de enviar estado.');
          ws.player.lastSeen=now;
          if(m.type===TYPE.state){ws.player.state=m.state;broadcast(message(TYPE.state,{id:ws.player.id,state:m.state}),ws);}
          if(m.type===TYPE.ping)send(ws,message(TYPE.pong,{nonce:m.nonce}));
        }
      }catch(error){reject(ws,error.message);}
    });
    ws.on('close',()=>{clearTimeout(helloTimer);leave(ws);connections.delete(ws);log('disconnect',{connections:connections.size,count:players.size});});
  });
  const heartbeat=setInterval(()=>{for(const ws of connections){if(!ws.alive){leave(ws);ws.terminate();continue;}ws.alive=false;ws.ping();}},config.heartbeatMs);heartbeat.unref();
  const simulation=(options.ticker??fixedTicker)(()=>{
    const at=options.onTickSample?performance.now():0;
    world.step();tower.step();online?.step();
    const simulated=options.onTickSample?performance.now():0;
    if(world.tick%WORLD_NET.snapshotEvery===0){
      const snapshot=world.snapshot();
      for(const p of world.players.values())send(p.ws,snapshot);
      for(const area of tower.worlds.values())for(const p of area.players.values())send(p.ws,tower.snapshot(p));
      if(online&&!online.failed)for(const area of online.worlds.values())for(const p of area.players.values())send(p.ws,online.snapshot(p));
    }
    if(options.onTickSample)options.onTickSample({at,simulation:simulated-at,snapshots:performance.now()-simulated,total:performance.now()-at});
  },WORLD_NET.tick*1000);
  await new Promise((resolve,reject)=>{httpServer.once('error',reject);httpServer.listen(config.port,config.host,resolve);});
  log('start',{host:config.host,port:httpServer.address().port,room:NET.room,capacity:config.capacity,protocol:NET.version});
  return {port:httpServer.address().port,players,world,tower,get online(){return online;},connections,close:async()=>{simulation.stop();clearInterval(heartbeat);for(const ws of connections)ws.terminate();await new Promise(resolve=>wss.close(resolve));await new Promise(resolve=>httpServer.close(resolve));online?.close();}};
}
