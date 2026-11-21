import {RELEASE,COMPATIBILITY_MESSAGE} from '../shared/release.js';
import {fixedTicker} from './fixed-ticker.js';
import {OnlineTower} from './online-tower.js';
import {decodeOnline} from '../shared/online.js';
import http from 'node:http';
import https from 'node:https';
import {SchoolAccess} from './school-access.js';
import {schoolProtocol} from './school-protocol.js';
import {WebSocketServer,WebSocket} from 'ws';
import {NET,TYPE,message,decode} from '../shared/multiplayer.js';
import {serverConfig} from './config.js';
import {SharedWorld} from './world.js';
import {decodeWorld,worldMessage,WORLD_NET} from '../shared/world.js';
import {SharedTower} from './tower.js';
import {decodeTowerMessage} from '../shared/tower.js';
import path from 'node:path';

export async function startHub(options={}) {
  const defaults=serverConfig(),config={...defaults,...(options.school?{capacity:defaults.schoolCapacity,maxPerIp:defaults.schoolPerIp,maxConnections:defaults.schoolConnections,maxUpgrades:defaults.schoolUpgrades}:{}),...options},log=options.log??((event,detail={})=>console.log(JSON.stringify({time:new Date().toISOString(),event,...detail})));
  if(options.singleWorld){config.capacity=Math.min(32,config.capacity);if(!options.tls&&!options.allowInsecureTest)throw Error('O servidor escolar exige TLS.');}
  let draining=false,closePromise;const startedAt=Date.now(),metrics={ticks:0,lastTickMs:0,maxTickMs:0};
  const players=new Map(),connections=new Set(),attempts=new Map();
  const world=new SharedWorld(options.worldOptions);
  const tower=new SharedTower({directory:options.worldDataDir??process.env.WORLD_DATA_DIR??path.resolve('data/shared-tower'),seed:options.towerSeed??217021,worldOptions:options.worldOptions,capacity:config.capacity});
  const httpServer=(options.tls?handler=>https.createServer({...options.tls,minVersion:'TLSv1.2'},handler):http.createServer)((req,res)=>{if(req.url==='/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:!draining,school:!!options.school,singleWorld:!!options.singleWorld,protocolVersion:NET.version,capacity:config.capacity}));}else{res.writeHead(404);res.end();}});
  const wss=new WebSocketServer({noServer:true,maxPayload:config.maxPayload,perMessageDeflate:options.compression===false?false:{serverNoContextTakeover:true,clientNoContextTakeover:true,concurrencyLimit:4,threshold:1024,zlibDeflateOptions:{level:1}}});
  // Compressed map welcomes can temporarily exceed the queue budget. Skip replaceable snapshots
  // until the queue drains instead of disconnecting during a valid map transition.
  const send=(ws,m)=>{if(options.school&&m.type==='world:welcome')m={...m,build:RELEASE.compatibility};if(!ws||ws.readyState!==WebSocket.OPEN)return;if(ws.bufferedAmount>config.maxBuffered){if(m.type==='world:snapshot'||m.type==='school:countdown')return;if(ws.bufferedAmount>config.maxReliableBuffered){log('backpressure',{type:m.type,queuedBytes:ws.bufferedAmount});ws.terminate();return;}}const at=options.onSendSample?performance.now():0;const json=JSON.stringify(m),encoded=options.onSendSample?performance.now():0;ws.send(json);if(options.onSendSample)options.onSendSample({type:m.type,serialization:encoded-at,send:performance.now()-encoded,bytes:Buffer.byteLength(json)});};
  let online;const onlineWorld=()=>online??=new OnlineTower({directory:options.worldDataDir??process.env.WORLD_DATA_DIR??path.resolve('data/shared-tower'),characterDirectory:options.characterDataDir??process.env.CHARACTER_DATA_DIR??path.resolve('data/online'),seed:options.towerSeed??217021,worldOptions:options.worldOptions,capacity:config.capacity,send});
  const broadcast=(m,except)=>{for(const p of players.values())if(p.ws!==except)send(p.ws,m);};
  const publicPlayer=p=>({id:p.id,name:p.name,state:p.state});
  const leave=ws=>{if(school?.gameConnections?.get(ws.schoolAccountId)===ws){school.gameConnections.delete(ws.schoolAccountId);school.audit('server','player:leave',ws.schoolAccountId);}if(school?.loginConnections.get(ws.schoolLoginAccount)===ws)school.loginConnections.delete(ws.schoolLoginAccount);if(ws.onlineSession)online?.leave(ws);else if(ws.towerSession)tower.leave(ws);else world.leave(ws);const p=ws.player;if(p&&players.get(p.id)?.ws===ws){players.delete(p.id);ws.player=null;broadcast(message(TYPE.leave,{id:p.id}));log('leave',{id:p.id,count:players.size});}};
  const reject=(ws,reason,code=4002)=>{leave(ws);send(ws,message(TYPE.error,{message:reason}));ws.close(code,reason.slice(0,100));setTimeout(()=>{if(ws.readyState!==WebSocket.CLOSED)ws.terminate();},1000).unref();log('protocol error',{reason});};
  const school=options.school?new SchoolAccess(onlineWorld().db,{...options.schoolOptions,config:{...options.schoolOptions?.config,singleWorld:!!options.singleWorld}}):null;
  const disconnectAccount=(id,reason='Você foi desconectado pelo administrador do servidor.')=>{if(!school)throw Error('Servidor escolar indisponível.');const ws=school.gameConnections?.get(id);if(ws?.worldPlayer){online.checkpoint(ws.worldPlayer);online.save(ws.worldPlayer);}school.db.prepare('DELETE FROM school_sessions WHERE account_id=?').run(id);school.loginConnections.delete(id);if(ws){send(ws,{v:4,type:'school:ended',message:reason});leave(ws);ws.close(4003,'Sessão encerrada.');}school.audit('operator','player:disconnect',id);};
  if(school){school.gameConnections=new Map();school.isOnline=id=>school.gameConnections.get(id)?.readyState===WebSocket.OPEN;school.onRevoke=(id,reason)=>queueMicrotask(()=>disconnectAccount(id,reason));}
  const access=school&&schoolProtocol({access:school,online:onlineWorld,send,reject,connections,activities:options.educationActivities??{},requiredBuild:options.requiredBuild});
  const schoolTimer=access&&setInterval(()=>access.poll(),1000);schoolTimer?.unref();
  httpServer.on('upgrade',(req,socket,head)=>{
    socket.on('error',()=>{});
    const ip=req.socket.remoteAddress||'unknown',now=Date.now();
    // Trust the socket address, not a spoofable X-Forwarded-For header.
    for(const [key,v] of attempts)if(now-v.at>config.upgradeWindowMs)attempts.delete(key);
    let attempt=attempts.get(ip);
    if(!attempt){if(attempts.size>=config.maxTrackedIps){socket.destroy();return;}attempt={at:now,count:0};attempts.set(ip,attempt);}
    attempt.count++;
    if(draining||req.url!=='/hub'||!config.origins.includes(req.headers.origin)||connections.size>=config.maxConnections||[...connections].filter(ws=>ws.ip===ip).length>=config.maxPerIp||attempt.count>config.maxUpgrades){socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');socket.destroy();return;}
    wss.handleUpgrade(req,socket,head,ws=>{ws.ip=ip;wss.emit('connection',ws);});
  });
  wss.on('connection',ws=>{
    connections.add(ws);ws.lastActivity=Date.now();ws.alive=true;ws.tokens=config.maxMessages;ws.rateAt=Date.now();
    log('connection',{connections:connections.size});
    const helloTimer=setTimeout(()=>reject(ws,'Tempo de conexão esgotado.'),config.helloMs);helloTimer.unref();
    ws.on('pong',()=>{ws.alive=true;});
    ws.on('error',error=>log('error',{message:error.message}));
    ws.on('message',(data,binary)=>{
      if(ws.readyState!==WebSocket.OPEN||draining)return;
      const now=Date.now();ws.lastActivity=now;ws.tokens=Math.min(config.maxMessages,ws.tokens+(now-ws.rateAt)*config.maxMessages/1000);ws.rateAt=now;
      if(--ws.tokens<0){reject(ws,'Muitas mensagens. Aguarde para reconectar.',4008);return;}
      try {
        if(binary)throw Error('Use mensagens JSON de texto.');
        const raw=data.toString();
        const packet=JSON.parse(raw);
        if(packet?.school===1&&access){clearTimeout(helloTimer);void access.request(ws,packet);return;}
        if(access&&packet?.v!==4)throw Error('Entre com sua conta para acessar o jogo.');
        if(packet?.v===4){
          const m=decodeOnline(raw);if(ws.player||ws.worldPlayer&&!ws.onlineSession)throw Error('Conexão já usada por outro modo.');
          const o=onlineWorld();if(m.type==='world:hello'){if(options.requiredBuild&&m.build!==options.requiredBuild)throw Error(COMPATIBILITY_MESSAGE);if(ws.worldPlayer)throw Error('Sessão já iniciada.');const account=access?.enter(ws,m.credential);const welcome=o.join(ws,account?o.db.read(account.character_id).name:m.name,account?.world_key??m.credential);if(account&&options.singleWorld){school.gameConnections.set(account.id,ws);ws.schoolAccountId=account.id;ws.gameConnectedAt=Date.now();school.audit('server','player:join',account.id);}clearTimeout(helloTimer);send(ws,welcome);send(ws,o.snapshot(ws.worldPlayer));}else{access?.command(ws,m.action);const response=o.command(ws,m);if(response)send(ws,response);}return;
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
  const heartbeat=setInterval(()=>{for(const ws of connections){if(!ws.alive||access&&!ws.schoolToken&&Date.now()-ws.lastActivity>120000){leave(ws);ws.terminate();continue;}ws.alive=false;ws.ping();}},config.heartbeatMs);heartbeat.unref();
  const simulation=(options.ticker??fixedTicker)(()=>{
    const at=performance.now();
    world.step();tower.step();online?.step();
    const simulated=options.onTickSample?performance.now():0;
    if(world.tick%WORLD_NET.snapshotEvery===0){
      const snapshot=world.snapshot();
      for(const p of world.players.values())send(p.ws,snapshot);
      for(const area of tower.worlds.values()){if(!area.players.size)continue;const shared=area.snapshot();for(const p of area.players.values())send(p.ws,tower.snapshot(p,shared));}
      if(online&&!online.failed)for(const area of online.worlds.values()){if(!area.players.size)continue;const shared=area.snapshot();for(const p of area.players.values())send(p.ws,online.snapshot(p,shared));}
    }
    metrics.ticks++;metrics.lastTickMs=performance.now()-at;metrics.maxTickMs=Math.max(metrics.maxTickMs,metrics.lastTickMs);
    if(options.onTickSample)options.onTickSample({at,simulation:simulated-at,snapshots:performance.now()-simulated,total:performance.now()-at});
  },WORLD_NET.tick*1000);
  try{await new Promise((resolve,reject)=>{httpServer.once('error',reject);httpServer.listen(config.port,config.host,resolve);});}catch(error){simulation.stop();clearInterval(heartbeat);clearInterval(schoolTimer);wss.close();online?.close();throw error;}
  log('start',{host:config.host,port:httpServer.address().port,room:NET.room,capacity:config.capacity,protocol:NET.version});
  return {port:httpServer.address().port,players,world,tower,get online(){return online;},school,connections,disconnectAccount,metrics,startedAt,capacity:config.capacity,get draining(){return draining;},close:()=>closePromise??=(async()=>{draining=true;if(school)school.draining=true;simulation.stop();clearInterval(heartbeat);clearInterval(schoolTimer);for(const ws of connections){if(school)send(ws,{v:4,type:'school:ended',message:'O servidor foi encerrado pelo administrador. Seu progresso foi salvo.'});leave(ws);ws.close(school?4003:1001,'Servidor encerrando.');}const end=Date.now()+15000;while(school?.hashing&&Date.now()<end)await new Promise(r=>setTimeout(r,20));await Promise.all([...connections].map(ws=>ws.readyState===WebSocket.CLOSED?Promise.resolve():new Promise(resolve=>{const timer=setTimeout(resolve,1500);ws.once('close',()=>{clearTimeout(timer);resolve();});})));for(const ws of connections)ws.terminate();await new Promise(resolve=>wss.close(resolve));httpServer.closeAllConnections?.();await new Promise(resolve=>httpServer.close(resolve));if(school?.singleWorld)school.db.prepare('DELETE FROM school_sessions').run();online?.close();})()};
}
