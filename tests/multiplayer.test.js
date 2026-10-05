import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {NET,TYPE,message,encode,decode,presenceState} from '../shared/multiplayer.js';
import {startHub} from '../server/hub.js';
import {HubClient} from '../src/multiplayer/client.js';
import {RemoteState} from '../src/multiplayer/remote-state.js';
import {loadIdentity} from '../src/multiplayer/identity.js';
import {resolveFacing} from '../src/core/actor-animation.js';
import network from '../desktop/network.cjs';
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws');
const state={x:0,z:4.8,heading:Math.PI,moving:false};
const hello=(id=randomUUID(),name='Viajante')=>message(TYPE.hello,{id,name,state:{...state}});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,timeout=2500){const start=Date.now();while(!check()){if(Date.now()-start>timeout)throw Error('Condição não atingida');await sleep(10);}}
async function peer(port,options={}){
  const ws=new WebSocket(`ws://127.0.0.1:${port}/hub`,{origin:'dungeon://game',...options});const received=[];
  ws.on('error',()=>{});ws.on('message',data=>received.push(JSON.parse(data.toString())));
  await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
  return {ws,received,send:m=>ws.send(JSON.stringify(m)),next:async(type,predicate=()=>true)=>{await until(()=>received.some(m=>m.type===type&&predicate(m)));const index=received.findIndex(m=>m.type===type&&predicate(m));return received.splice(index,1)[0];}};
}
async function fixture(t,options={}){const hub=await startHub({port:0,log(){},...options});t.after(()=>hub.close());return hub;}

test('multiplayer protocol round-trips minimal presence without character or camera',()=>{const m=hello();assert.deepEqual(decode(encode(m)),m);assert.deepEqual(presenceState({...state,gold:300,cameraYaw:1},true),state);});
test('multiplayer rejects version, unknown types, invalid JSON and excessive payload',()=>{for(const raw of ['{','null',JSON.stringify({...hello(),v:2}),JSON.stringify(message('arbitrary')),JSON.stringify(hello())+' '.repeat(NET.maxPayload)])assert.throws(()=>decode(raw));});
test('multiplayer validates identity and bounded safe names',()=>{for(const change of [{id:'name-only'},{name:'<script>'},{name:'x'},{name:'x'.repeat(25)},{name:'\nNome'},{name:' Nome'}])assert.throws(()=>encode({...hello(),...change}));assert.doesNotThrow(()=>encode(hello(randomUUID(),'João 2')));});
test('multiplayer rejects out-of-bounds/non-finite state and extra private data',()=>{for(const patch of [{x:13},{z:-13},{x:Infinity},{z:NaN},{heading:4},{moving:1},{gold:2}])assert.throws(()=>encode(message(TYPE.state,{state:{...state,...patch}})));assert.throws(()=>encode({...hello(),inventory:[]}));});
test('server snapshots and server-only messages validate separately',()=>{const p=hello();assert.doesNotThrow(()=>encode(message(TYPE.snapshot,{players:[{id:p.id,name:p.name,state}]}),'server'));assert.throws(()=>encode(message(TYPE.leave,{id:p.id})));assert.throws(()=>decode(JSON.stringify(message(TYPE.snapshot,{players:[{id:p.id,name:p.name,state,inventory:[]}]})),'server'));});
test('desktop allowlist accepts only exact configured WebSocket endpoint',()=>{const url='wss://example.org/hub';assert.equal(network.networkAllowed(url,url),true);for(const address of ['https://example.org/hub','wss://example.org/other','wss://example.org/hub?secret=x','wss://example.org.evil/hub','ws://example.org/hub'])assert.equal(network.networkAllowed(address,url),false);assert.equal(network.networkAllowed(url,''),false);});
test('desktop endpoint forbids credentials, unsafe remote ws and CSP injection',()=>{for(const url of ['ws://example.org/hub','wss://a:b@example.org/hub','wss://example.org/hub?x=y','wss://example.org/hub#x',"wss://example.org/hub; *",'https://example.org/hub'])assert.throws(()=>network.endpoint(url));assert.equal(network.endpoint('ws://127.0.0.1:8787/hub'),'ws://127.0.0.1:8787/hub');});
test('identity persists independently without touching character save',()=>{const data=new Map([['character','unchanged']]),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};const first=loadIdentity(storage,randomUUID);first.saveName('Bilbo');const second=loadIdentity(storage,randomUUID);assert.equal(first.identity.id,second.identity.id);assert.equal(second.identity.name,'Bilbo');assert.equal(data.get('character'),'unchanged');assert.throws(()=>second.saveName('<b>'));});
test('remote interpolation smooths positions, follows shortest heading arc and does not extrapolate',()=>{const remote=new RemoteState({id:randomUUID(),name:'A',state:{...state,heading:3,moving:true}},0);remote.push({...state,x:6,heading:-3,moving:true},200);const middle=remote.sample(200,100);assert.equal(middle.x,3);assert.ok(Math.abs(middle.heading-Math.PI)<.001);assert.equal(remote.sample(2000).x,6);assert.equal(remote.sample(2000).moving,false);});
test('remote facing is derived from each viewer camera without changing world orientation',()=>{const a=resolveFacing(0,0),b=resolveFacing(0,Math.PI/2);assert.notEqual(a.direction,b.direction);assert.equal(a.worldFacing,b.worldFacing);});

test('two real WebSocket peers exchange initial snapshot, join, bidirectional movement, leave and reconnect',async t=>{
  const hub=await fixture(t),a=await peer(hub.port),aid=randomUUID(),bid=randomUUID();a.send(hello(aid,'Gandalf'));await a.next(TYPE.welcome);await a.next(TYPE.snapshot);
  const b=await peer(hub.port);b.send(hello(bid,'Bilbo'));const snapshot=await b.next(TYPE.snapshot);assert.deepEqual(new Set(snapshot.players.map(p=>p.id)),new Set([aid,bid]));assert.equal((await a.next(TYPE.join)).player.id,bid);
  a.send(message(TYPE.state,{state:{...state,x:2,heading:0,moving:true}}));assert.equal((await b.next(TYPE.state)).state.x,2);
  b.send(message(TYPE.state,{state:{...state,z:2,heading:1,moving:true}}));assert.equal((await a.next(TYPE.state)).state.heading,1);
  b.ws.close();assert.equal((await a.next(TYPE.leave)).id,bid);assert.equal(hub.players.size,1);
  const again=await peer(hub.port);again.send(hello(bid,'Bilbo'));assert.equal((await again.next(TYPE.snapshot)).players.length,2);assert.equal((await a.next(TYPE.join)).player.id,bid);
});
test('server refuses state before hello and removes invalid established session',async t=>{const hub=await fixture(t);const p=await peer(hub.port);p.send(message(TYPE.state,{state}));assert.match((await p.next(TYPE.error)).message,/Entre/);const q=await peer(hub.port);q.send(hello());await q.next(TYPE.welcome);q.ws.send('{');assert.match((await q.next(TYPE.error)).message,/JSON/);await until(()=>hub.players.size===0);});
test('server rejects incompatible protocol with understandable error',async t=>{const hub=await fixture(t),p=await peer(hub.port);p.send({...hello(),v:99});assert.match((await p.next(TYPE.error)).message,/Versão incompatível/);});
test('server enforces duplicate identity and capacity without evicting existing peers',async t=>{const hub=await fixture(t,{capacity:2}),id=randomUUID(),a=await peer(hub.port);a.send(hello(id));await a.next(TYPE.welcome);const duplicate=await peer(hub.port);duplicate.send(hello(id));assert.match((await duplicate.next(TYPE.error)).message,/identidade/);const b=await peer(hub.port);b.send(hello());await b.next(TYPE.welcome);const c=await peer(hub.port);c.send(hello());assert.match((await c.next(TYPE.error)).message,/cheio/);assert.equal(hub.players.size,2);});
test('heartbeat removes a dead connection and notifies its peer',async t=>{const hub=await fixture(t,{heartbeatMs:50});const a=await peer(hub.port),b=await peer(hub.port,{autoPong:false}),bid=randomUUID();a.send(hello());await a.next(TYPE.welcome);b.send(hello(bid));await b.next(TYPE.welcome);assert.equal((await a.next(TYPE.leave)).id,bid);assert.equal(hub.players.size,1);});
test('server bounds message frequency and oversized payloads',async t=>{const hub=await fixture(t);const p=await peer(hub.port);p.send(hello());await p.next(TYPE.welcome);for(let i=0;i<70;i++)p.send(message(TYPE.state,{state}));assert.match((await p.next(TYPE.error)).message,/Muitas/);const q=await peer(hub.port);q.ws.send('x'.repeat(NET.maxPayload+1));await until(()=>q.ws.readyState===WebSocket.CLOSED);assert.equal(hub.players.size,0);});
test('server rejects unlisted origins and expires idle handshakes',async t=>{const hub=await fixture(t,{helloMs:60});await assert.rejects(peer(hub.port,{origin:'https://evil.invalid'}));const p=await peer(hub.port);assert.match((await p.next(TYPE.error)).message,/Tempo/);});
test('client connects, measures ping, leaves for Tower and rejoins with a fresh snapshot',async t=>{
  const hub=await fixture(t);class Socket extends WebSocket{constructor(url){super(url,{origin:'dungeon://game'});}}
  const other=await peer(hub.port),otherId=randomUUID();other.send(hello(otherId,'Bilbo'));await other.next(TYPE.welcome);
  const client=new HubClient({url:`ws://127.0.0.1:${hub.port}/hub`,identity:{id:randomUUID(),name:'Gandalf'},getPlayer:()=>state,Socket,timing:{pingMs:50}});t.after(()=>client.dispose());client.connect();
  await until(()=>client.status==='Online'&&client.remotes.size===1);await until(()=>client.ping!==null);assert.ok(client.ping>=0&&client.ping<500);
  client.setHub(false);await other.next(TYPE.leave);assert.equal(client.remotes.size,0);assert.equal(client.desired,true);assert.equal(client.socket,null);
  client.setHub(true);await until(()=>client.status==='Online'&&client.remotes.has(otherId));client.disconnect();await until(()=>hub.players.size===1);assert.equal(client.desired,false);
});
test('client reconnects after server restart and clears stale remote players',async t=>{
  let hub=await startHub({port:0,log(){}});t.after(()=>hub.close());const port=hub.port;
  class Socket extends WebSocket{constructor(url){super(url,{origin:'dungeon://game'});}}
  const client=new HubClient({url:`ws://127.0.0.1:${port}/hub`,identity:{id:randomUUID(),name:'Gandalf'},getPlayer:()=>state,Socket,timing:{retryMs:60,maxRetryMs:100}});t.after(()=>client.dispose());client.connect();await until(()=>client.status==='Online');await hub.close();await until(()=>client.status==='Reconectando…');assert.equal(client.remotes.size,0);hub=await startHub({port,log(){}});await until(()=>client.status==='Online');assert.equal(hub.players.size,1);
});
test('missing endpoint never opens a socket or blocks offline character state',()=>{let opened=false;const player={...state};const c=new HubClient({url:'',identity:{id:randomUUID(),name:'Viajante'},getPlayer:()=>player,Socket:class{constructor(){opened=true;}}});c.connect();assert.equal(c.status,'Erro');assert.equal(opened,false);assert.deepEqual(player,state);assert.equal(c.desired,false);c.dispose();});

test('client rate caps state independently of rendered frames and serializes no camera',()=>{
  let now=0;const sent=[];const c=new HubClient({url:'ws://127.0.0.1/hub',identity:{id:randomUUID(),name:'Viajante'},getPlayer:()=>({...state,cameraYaw:2}),now:()=>now});
  c.status='Online';c.lastReceived=0;c.lastPing=0;c.nextSend=0;c.socket={readyState:1,bufferedAmount:0,send:raw=>sent.push(JSON.parse(raw))};
  for(now=0;now<1000;now++)c.tick();assert.ok(sent.length>=14&&sent.length<=16);assert.ok(sent.every(m=>m.type===TYPE.state&&!('cameraYaw' in m.state)));
});
test('maximum room snapshot fits bounded protocol payload',()=>{
  const players=Array.from({length:NET.maxPlayers},()=>({id:randomUUID(),name:'Á'.repeat(24),state:{x:11.999999999999,z:-11.999999999999,heading:Math.PI,moving:true}}));assert.doesNotThrow(()=>encode(message(TYPE.snapshot,{players}),'server'));
});
test('server limits simultaneous connections per socket address',async t=>{
  const hub=await fixture(t,{maxPerIp:2});await peer(hub.port);await peer(hub.port);await assert.rejects(peer(hub.port));assert.equal(hub.connections.size,2);
});

test('desktop CSP permits configured endpoint only and rejects host directive injection',async()=>{
  const {default:protocol}=await import('../desktop/protocol.cjs');const {default:path}=await import('node:path');
  const response=await protocol.assetHandler(path.resolve('dist'),'wss://example.org/hub')(new Request('dungeon://game/'));
  assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/connect-src 'self' wss:\/\/example.org\/hub;/);
  assert.throws(()=>network.endpoint('wss://example.org;unsafe/hub'));assert.throws(()=>network.endpoint("wss://example.org'unsafe/hub"));
});
