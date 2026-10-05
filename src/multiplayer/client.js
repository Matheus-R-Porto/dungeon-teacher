import {NET,TYPE,message,encode,decode,presenceState} from '../../shared/multiplayer.js';
import {RemoteState} from './remote-state.js';

export class HubClient {
  constructor({url,identity,getPlayer,isPaused=()=>false,Socket=globalThis.WebSocket,now=()=>performance.now(),onChange=()=>{},timing={}}){
    Object.assign(this,{url,identity,getPlayer,isPaused,Socket,now,onChange});
    this.timing={...NET,...timing};this.remotes=new Map();this.status='Offline';this.detail='';this.desired=false;this.inHub=true;this.attempt=0;this.ping=null;
  }
  changed(status=this.status,detail=this.detail){this.status=status;this.detail=detail;this.onChange(this);}
  connect(){this.desired=true;this.attempt=0;this.open();}
  disconnect(){this.desired=false;this.stop();this.changed('Offline','');}
  setHub(value){if(value===this.inHub)return;this.inHub=value;this.stop();if(value&&this.desired)this.open();else this.changed('Offline',this.desired?'Na Torre · aventura individual':'');}
  stop(){
    clearTimeout(this.retry);clearInterval(this.timer);this.retry=null;this.timer=null;
    const socket=this.socket;this.socket=null;if(socket&&(socket.readyState===0||socket.readyState===1))socket.close(1000,'Saindo do Refúgio');
    this.remotes.clear();this.ping=null;
  }
  open(){
    this.stop();if(!this.desired||!this.inHub)return;
    if(!this.url){this.desired=false;this.changed('Erro','Servidor de playtest ainda não configurado nesta build. O modo individual continua disponível.');return;}
    this.changed(this.attempt?'Reconectando…':'Conectando…','');
    let ws;try{ws=new this.Socket(this.url);}catch{this.failed('Não foi possível abrir a conexão.');return;}
    this.socket=ws;this.lastReceived=this.now();this.lastPing=this.now();this.pingSent=null;this.nextSend=0;this.nextNonce=0;
    const active=()=>this.socket===ws;
    ws.addEventListener('open',()=>{if(active())this.send(message(TYPE.hello,{id:this.identity.id,name:this.identity.name,state:presenceState(this.getPlayer(),this.isPaused())}));});
    ws.addEventListener('message',event=>{
      if(!active())return;
      try {
        const m=decode(event.data,'server');this.lastReceived=this.now();
        if(m.type===TYPE.error){this.detail=m.message;return;}
        if(m.type===TYPE.welcome){if(m.id!==this.identity.id)throw Error('Identidade de sessão inválida.');this.attempt=0;this.changed('Online','');}
        if(m.type===TYPE.snapshot){this.remotes.clear();for(const player of m.players)if(player.id!==this.identity.id)this.remotes.set(player.id,new RemoteState(player,this.now()));this.changed();}
        if(m.type===TYPE.join&&m.player.id!==this.identity.id){this.remotes.set(m.player.id,new RemoteState(m.player,this.now()));this.changed();}
        if(m.type===TYPE.state)this.remotes.get(m.id)?.push(m.state,this.now());
        if(m.type===TYPE.leave){this.remotes.delete(m.id);this.changed();}
        if(m.type===TYPE.pong&&this.pingSent?.nonce===m.nonce){this.ping=Math.round(this.now()-this.pingSent.at);this.pingSent=null;this.changed();}
      } catch {this.desired=false;this.stop();this.changed('Erro','Resposta incompatível do servidor. Atualize o jogo.');}
    });
    ws.addEventListener('error',()=>{if(active())this.detail='Servidor inacessível. O modo individual continua disponível.';});
    ws.addEventListener('close',event=>{
      if(!active())return;
      if([4002,4009,1008,1009].includes(event.code)){const reason=this.detail||'Conexão recusada. Confira a versão do jogo.';this.desired=false;this.stop();this.changed('Erro',reason);}
      else this.failed(this.detail||'Conexão perdida. Tentando novamente…');
    });
    this.timer=setInterval(()=>this.tick(),Math.ceil(1000/this.timing.updateHz));
  }
  send(m){if(this.socket?.readyState!==1)return;try{if(this.socket.bufferedAmount>65536){this.failed('Conexão lenta. Reconectando…');return;}this.socket.send(encode(m));}catch{this.failed('Falha na conexão. Tentando novamente…');}}
  tick(){
    const now=this.now();
    if(now-this.lastReceived>this.timing.timeoutMs){this.failed('Servidor sem resposta. Tentando novamente…');return;}
    if(this.status!=='Online')return;
    // Timer independent of rendered FPS, with no catch-up burst after backgrounding.
    if(now>=this.nextSend){this.nextSend=now+1000/this.timing.updateHz;this.send(message(TYPE.state,{state:presenceState(this.getPlayer(),this.isPaused())}));}
    if(now-this.lastPing>=this.timing.pingMs){this.lastPing=now;const nonce=++this.nextNonce;this.pingSent={nonce,at:now};this.send(message(TYPE.ping,{nonce}));}
  }
  failed(detail){
    this.stop();if(!this.desired||!this.inHub)return;
    this.changed('Reconectando…',detail);
    const wait=Math.min(this.timing.maxRetryMs,this.timing.retryMs*2**Math.min(this.attempt++,4));
    this.retry=setTimeout(()=>this.open(),wait);
  }
  dispose(){this.disconnect();}
}
