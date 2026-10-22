import {isArenaId} from '../../shared/guardian.js';
import {worldMessage,WORLD_ID} from '../../shared/world.js';
import {RemoteState} from './remote-state.js';
import {validateHub} from '../core/config.js';
import {FLOOR_IDS} from '../../shared/tower.js';

export class WorldClient {
  constructor({url,name='Viajante',protocol=2,Socket=globalThis.WebSocket,onMap=()=>{},onSnapshot=()=>{},onStatus=()=>{},onNotice=()=>{},onChat=()=>{},credential=null,now=()=>performance.now()}){Object.assign(this,{url,name,protocol,Socket,onMap,onSnapshot,onStatus,onNotice,onChat,credential,now});this.remotes=new Map();this.token=null;this.seq=0;this.status='Offline';this.desired=false;}
  changed(status){this.status=status;this.onStatus(status);}
  connect(){this.desired=true;this.open();}
  open(){
    this.stopSocket();if(!this.desired)return;this.changed('Conectando…');this.received=this.now();this.snapshot=null;
    const ws=new this.Socket(this.url);this.socket=ws;const current=()=>this.socket===ws;
    ws.addEventListener('open',()=>{if(current())ws.send(JSON.stringify(this.protocol===4?{v:4,type:'world:hello',name:this.name,credential:this.credential}:{...worldMessage('world:hello',{name:this.name,token:this.token}),v:this.protocol}));});
    ws.addEventListener('message',event=>{if(!current())return;const measuredAt=(this.onMessageTiming||this.onPerformanceTiming)?performance.now():0;try{
      const m=JSON.parse(event.data);if(m.type==='server:error')throw Error(m.message);
      if(m.v!==this.protocol)throw Error('Servidor sem suporte ao protocolo deste modo.');
      this.received=this.now();
      if(m.type==='world:welcome'){
        if(!(this.protocol>=3?(FLOOR_IDS.includes(m.map?.id)||this.protocol===4&&(m.map?.id==='shared-city'||isArenaId(m.map?.id)))&&typeof m.epoch==='string'&&m.epoch.length===36:m.map?.id===WORLD_ID)||typeof m.id!=='string'||typeof m.token!=='string')throw Error('Mapa ou sessão incompatível.');
        validateHub(m.map);this.transitionReceivedAt=this.now();this.transitionServerWait=this.transitionRequestedAt==null?null:this.transitionReceivedAt-this.transitionRequestedAt;this.transitionRequestedAt=null;this.id=m.id;this.token=m.token;this.mapId=m.map.id;this.epoch=m.epoch;this.geography=m.geography;this.seq=0;this.lastTick=-1;this.snapshot=null;this.remotes.clear();this.mapReady=false;const generation=this.mapGeneration=(this.mapGeneration??0)+1,epoch=this.epoch,preparation=this.onMap(m.map);this.changed('Online');
        if(preparation?.then)Promise.resolve(preparation).then(()=>{if(!current()||epoch!==this.epoch||generation!==this.mapGeneration)return;this.mapReady=true;if(this.snapshot)this.onSnapshot(this.snapshot);}).catch(error=>{if(!current()||epoch!==this.epoch||generation!==this.mapGeneration)return;this.disconnect();this.changed('Falha ao preparar mapa: '+error.message);});else this.mapReady=true;
      }else if(m.type==='world:snapshot'){
        if(this.protocol>=3&&(m.mapId!==this.mapId||m.epoch!==this.epoch))return;
        if(!this.id||m.mapId!==this.mapId||!Number.isSafeInteger(m.tick)||!Number.isFinite(m.time)||!Array.isArray(m.players)||!Array.isArray(m.monsters)||m.players.length>32||m.monsters.length>96)throw Error('Estado inválido.');
        if(m.tick<=this.lastTick)return;
        for(const e of [...m.players,...m.monsters])if(typeof e.id!=='string'||![e.x,e.z,e.heading,e.hp,e.maxHP].every(Number.isFinite)||e.hp<0||e.hp>e.maxHP)throw Error('Entidade inválida.');
        this.lastTick=m.tick;this.snapshot=m;const live=new Set();
        for(const p of m.players)if(p.id!==this.id){live.add(p.id);const state={...p,moving:p.hp>0&&p.moving};if(!this.remotes.has(p.id))this.remotes.set(p.id,new RemoteState({id:p.id,name:p.name,state},this.now()));else this.remotes.get(p.id).push(state,this.now());}
        for(const id of this.remotes.keys())if(!live.has(id))this.remotes.delete(id);
        if(this.mapReady!==false)this.onSnapshot(m);
      }else if(m.type==='online:chat'&&this.protocol===4)this.onChat(m);else if(m.type==='world:notice'&&typeof m.message==='string')this.onNotice(m.message);else throw Error('Mensagem inesperada.');
    }catch(error){this.disconnect();this.changed(error.message);}finally{this.onMessageTiming?.(performance.now()-measuredAt);this.onPerformanceTiming?.(performance.now()-measuredAt);}});
    ws.addEventListener('error',()=>{});
    ws.addEventListener('close',event=>{if(!current())return;this.stopSocket();if(event.code===4009||event.code===4002){this.desired=false;this.changed(event.reason||'Conexão recusada.');return;}this.changed('Reconectando…');if(this.desired)this.retry=setTimeout(()=>this.open(),2000);});
    this.watchdog=setInterval(()=>{if(this.now()-this.received>(this.status==='Online'?16000:90000)){this.stopSocket();this.changed('Servidor sem resposta. Reconectando…');if(this.desired)this.retry=setTimeout(()=>this.open(),2000);}},1000);
  }
  command(action){if(this.status!=='Online'||this.socket?.readyState!==1)return false;if(this.socket.bufferedAmount>65536)return false;if(['travel','arena:request','arena:ready'].includes(action.kind))this.transitionRequestedAt=this.now();this.socket.send(JSON.stringify({...worldMessage('world:input',{seq:++this.seq,action}),v:this.protocol,...(this.protocol>=3?{mapId:this.mapId,epoch:this.epoch}:{})}));return true;}
  stopSocket(){clearInterval(this.watchdog);clearTimeout(this.retry);const ws=this.socket;this.socket=null;if(ws&&ws.readyState<2)ws.close();this.remotes.clear();}
  disconnect(){this.desired=false;this.stopSocket();this.snapshot=null;this.changed('Offline');}
}
