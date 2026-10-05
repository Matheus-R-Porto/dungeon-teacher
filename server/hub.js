import http from 'node:http';
import {WebSocketServer,WebSocket} from 'ws';
import {NET,TYPE,message,decode} from '../shared/multiplayer.js';
import {serverConfig} from './config.js';

export async function startHub(options={}) {
  const config={...serverConfig(),...options},log=options.log??((event,detail={})=>console.log(JSON.stringify({time:new Date().toISOString(),event,...detail})));
  const players=new Map(),connections=new Set(),attempts=new Map();
  const httpServer=http.createServer((req,res)=>{if(req.url==='/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:true,protocolVersion:NET.version,room:NET.room,players:players.size}));}else{res.writeHead(404);res.end();}});
  const wss=new WebSocketServer({noServer:true,maxPayload:config.maxPayload,perMessageDeflate:false});
  const send=(ws,m)=>{if(ws.readyState!==WebSocket.OPEN)return;if(ws.bufferedAmount>config.maxBuffered){ws.terminate();return;}ws.send(JSON.stringify(m));};
  const broadcast=(m,except)=>{for(const p of players.values())if(p.ws!==except)send(p.ws,m);};
  const publicPlayer=p=>({id:p.id,name:p.name,state:p.state});
  const leave=ws=>{const p=ws.player;if(p&&players.get(p.id)?.ws===ws){players.delete(p.id);ws.player=null;broadcast(message(TYPE.leave,{id:p.id}));log('leave',{id:p.id,count:players.size});}};
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
  await new Promise((resolve,reject)=>{httpServer.once('error',reject);httpServer.listen(config.port,config.host,resolve);});
  log('start',{host:config.host,port:httpServer.address().port,room:NET.room,capacity:config.capacity,protocol:NET.version});
  return {port:httpServer.address().port,players,connections,close:async()=>{clearInterval(heartbeat);for(const ws of connections)ws.terminate();await new Promise(resolve=>wss.close(resolve));await new Promise(resolve=>httpServer.close(resolve));}};
}
