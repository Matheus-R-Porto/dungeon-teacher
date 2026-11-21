import {grantEducation} from './education.js';
// Account traffic shares the game's restricted WebSocket endpoint.
export function schoolProtocol({access,online,send,reject,connections,activities={}}){
 const ended=(ws,reason)=>{send(ws,{v:4,type:'school:ended',message:reason});reject(ws,reason,4003);};
 const enforce=ws=>{try{return access.session(ws.schoolToken,{touch:false});}catch(e){ended(ws,e.message);return null;}};
 return {
  async request(ws,m){
   if(ws.schoolBusy){send(ws,{school:1,id:m.id,ok:false,message:'Aguarde a operação atual.'});return;}
   ws.schoolBusy=true;
   try{
    if(m.school!==1||typeof m.id!=='string'||!/^[a-zA-Z0-9-]{1,40}$/.test(m.id)||typeof m.action!=='string'||Object.keys(m).some(k=>!['school','id','action','token','data'].includes(k)))throw Error('Pedido inválido.');
    if(access.singleWorld&&['overview','education','admin','account'].includes(m.action))throw Error('Operação disponível somente no Dungeon Teacher ADM.');const d=m.data??{};if(typeof d!=='object'||Array.isArray(d)||d===null)throw Error('Dados inválidos.');let result;
    if(m.action==='status')result={online:true,school:true,singleWorld:access.singleWorld,capacity:online().capacity,players:[...online().people.values()].filter(p=>p.ws).length,season:access.seasons?.current()?.state??null};
    else if(m.action==='login'){result=await access.login(d.username,d.password,ws.ip);if(access.singleWorld){access.loginConnections.set(result.account.id,ws);ws.schoolLoginAccount=result.account.id;}}
    else if(m.action==='register'&&access.singleWorld){access.rate('register:'+ws.ip,12);result=await access.createAccount({username:d.username,password:d.password,role:'student'},'self-service');}
    else if(m.action==='character')result=access.createCharacter(m.token,d.name,d.appearance);
    else if(m.action==='overview')result={...access.overview(m.token,online()),activities:Object.entries(activities).map(([id,a])=>({id,name:a.name??id}))};
    else if(m.action==='education')result=grantEducation(access,online(),m.token,d,activities);
    else if(m.action==='admin')result=access.admin(m.token,d.action,d.target,d.value);
    else if(m.action==='account'){
     const actor=access.session(m.token,{teacher:true});
     // Teachers provision students. Creating other teachers is a local operator action.
     result=await access.createAccount({username:d.username,password:d.password,role:'student',cohort:d.cohort},actor.id,()=>access.session(m.token,{teacher:true}));
    }else if(m.action==='logout'){access.revoke(m.token);result={ok:true};}
    else throw Error('Operação desconhecida.');
    send(ws,{school:1,id:m.id,ok:true,result});
   }catch(error){send(ws,{school:1,id:typeof m.id==='string'?m.id.slice(0,40):'',ok:false,message:error.message});}
   finally{ws.schoolBusy=false;}
  },
  enter(ws,token){const a=access.enter(token);ws.schoolToken=token;return a;},
  command(ws,action){const a=access.session(ws.schoolToken);if(access.singleWorld&&access.gameConnections?.get(a.id)!==ws)throw Error('Sessão de jogo invalidada. Entre novamente.');if(access.countdown(a).closesAt!==null&&['arena:request','arena:ready'].includes(action.kind))throw Error('A aula está encerrando. Conclua suas ações atuais.');return a;},
  poll(){
   // Check deadlines before clearing expired records so the client receives the cause.
   for(const ws of connections)if(ws.schoolToken&&ws.readyState===1){const a=enforce(ws);if(a)send(ws,{v:4,type:'school:countdown',...access.countdown(a)});}
   access.expire();
  }
 };
}
