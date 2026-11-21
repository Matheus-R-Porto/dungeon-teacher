import {RELEASE,COMPATIBILITY_MESSAGE,compatibleBuild} from '../../shared/release.js';
export class SchoolClient {
 constructor(url,{Socket=globalThis.WebSocket,onStatus=()=>{}}={}){Object.assign(this,{url,Socket,onStatus});this.pending=new Map();this.serial=0;this.token=null;}
 async connect(){
  if(this.socket?.readyState===1)return;if(this.connecting)return this.connecting;
  this.connecting=new Promise((resolve,reject)=>{
   const ws=this.socket=new this.Socket(this.url);const timer=setTimeout(()=>{ws.close();reject(Error('Servidor indisponível'));},7000);
   ws.addEventListener('open',()=>{clearTimeout(timer);this.onStatus(true);resolve();});
   ws.addEventListener('message',e=>{let m;try{m=JSON.parse(e.data);}catch{return;}if(m.school!==1)return;const p=this.pending.get(m.id);if(!p)return;clearTimeout(p.timer);this.pending.delete(m.id);if(m.ok&&p.action==='status'&&!compatibleBuild(m.result?.build)){p.reject(Error(COMPATIBILITY_MESSAGE));return;}m.ok?p.resolve(m.result):p.reject(Error(m.message));});
   ws.addEventListener('error',()=>{});ws.addEventListener('close',()=>{clearTimeout(timer);if(this.socket===ws)this.socket=null;this.onStatus(false);reject(Error('Servidor indisponível'));for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('Conexão interrompida. Confira o estado antes de tentar novamente.'));}this.pending.clear();});
  });try{await this.connecting;}finally{this.connecting=null;}
 }
 async request(action,data={}){await this.connect();return new Promise((resolve,reject)=>{const id=String(++this.serial),timer=setTimeout(()=>{this.pending.delete(id);reject(Error('Servidor sem resposta. Confira o estado antes de tentar novamente.'));},15000);this.pending.set(id,{resolve,reject,timer,action});this.socket.send(JSON.stringify({school:1,id,action,token:this.token,data,build:RELEASE.compatibility}));});}
 close(){this.socket?.close();}
}
