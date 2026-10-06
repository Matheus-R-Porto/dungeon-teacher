// Presence only: never serialize a Character or camera into this protocol.
export const NET = Object.freeze({version:1,room:'hub-01',updateHz:15,interpolationMs:100,maxPayload:8192,maxPlayers:32,pingMs:5000,timeoutMs:16000,connectTimeoutMs:90000,retryMs:2000,maxRetryMs:10000});
export const TYPE = Object.freeze({hello:'client:hello',welcome:'server:welcome',join:'player:join',leave:'player:leave',state:'player:state',snapshot:'room:snapshot',ping:'ping',pong:'pong',error:'server:error'});
export const validId = value => typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const validName = value => typeof value==='string' && value===value.trim() && value.length>=2 && value.length<=24 && /^[\p{L}\p{N} _.\-]+$/u.test(value);
const object = value => value && typeof value==='object' && !Array.isArray(value);
const keys = (value,expected) => object(value) && Object.keys(value).length===expected.length && expected.every(key=>Object.hasOwn(value,key));
export function validState(state) {
  return keys(state,['x','z','heading','moving']) && Number.isFinite(state.x) && Math.abs(state.x)<=12 && Number.isFinite(state.z) && Math.abs(state.z)<=12 && Number.isFinite(state.heading) && Math.abs(state.heading)<=Math.PI && typeof state.moving==='boolean';
}
const validPlayer = p => keys(p,['id','name','state']) && validId(p.id) && validName(p.name) && validState(p.state);
export const message = (type,fields={}) => ({v:NET.version,type,...fields});
export function decode(raw,direction='client') {
  if(typeof raw!=='string' || new TextEncoder().encode(raw).length>NET.maxPayload) throw Error('Mensagem grande demais.');
  let m;try{m=JSON.parse(raw);}catch{throw Error('JSON inválido.');}
  if(!object(m)||m.v!==NET.version) throw Error('Versão incompatível. Atualize o jogo.');
  const exact = fields => keys(m,['v','type',...fields]);
  let valid=false;
  if(direction==='client') {
    if(m.type===TYPE.hello)valid=exact(['id','name','state'])&&validId(m.id)&&validName(m.name)&&validState(m.state);
    if(m.type===TYPE.state)valid=exact(['state'])&&validState(m.state);
    if(m.type===TYPE.ping)valid=exact(['nonce'])&&Number.isSafeInteger(m.nonce)&&m.nonce>=0;
  } else {
    if(m.type===TYPE.welcome)valid=exact(['id','room'])&&validId(m.id)&&m.room===NET.room;
    if(m.type===TYPE.snapshot)valid=exact(['players'])&&Array.isArray(m.players)&&m.players.length<=NET.maxPlayers&&m.players.every(validPlayer)&&new Set(m.players.map(p=>p.id)).size===m.players.length;
    if(m.type===TYPE.join)valid=exact(['player'])&&validPlayer(m.player);
    if(m.type===TYPE.state)valid=exact(['id','state'])&&validId(m.id)&&validState(m.state);
    if(m.type===TYPE.leave)valid=exact(['id'])&&validId(m.id);
    if(m.type===TYPE.pong)valid=exact(['nonce'])&&Number.isSafeInteger(m.nonce)&&m.nonce>=0;
    if(m.type===TYPE.error)valid=exact(['message'])&&typeof m.message==='string'&&m.message.length<=160;
  }
  if(!valid)throw Error('Tipo ou conteúdo de mensagem inválido.');
  return m;
}
export function encode(m,direction='client'){const raw=JSON.stringify(m);decode(raw,direction);return raw;}
export function presenceState(player,paused=false){return {x:player.x,z:player.z,heading:Math.atan2(Math.sin(player.heading),Math.cos(player.heading)),moving:!paused&&player.moving===true};}
