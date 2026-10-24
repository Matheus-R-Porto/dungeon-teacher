import {ABILITIES} from '../src/domain/abilities/definitions.js';
import {CASTLE_ID} from '../src/world/castle.js';
import {isArenaId} from './guardian.js';
import {decodeTowerMessage} from './tower.js';
export const ONLINE_RULES=Object.freeze({partySize:6,levelGap:20,inviteMs:60000,inviteCooldownMs:3000,maxPendingInvites:6,maxDrops:64,contribution:.05,xpRadius:12,bonusPerMember:.1,dropMs:300000,pickupRadius:2.6,chatLength:240,chatIntervalMs:1000,dropItem:'rawOre'});
export function decodeOnline(raw){
 if(typeof raw!=='string'||Buffer.byteLength(raw)>8192)throw Error('Mensagem excessiva.');
 const m=JSON.parse(raw);if(m?.v!==4)throw Error('Protocolo online inválido.');
 if(m.type==='world:hello'){if(Object.keys(m).sort().join(',')!=='credential,name,type,v'||typeof m.credential!=='string'||! /^[a-f0-9]{64}$/.test(m.credential)||typeof m.name!=='string'||! /^[\p{L}\p{N} _.\-]{2,24}$/u.test(m.name))throw Error('Identificação inválida.');return m;}
 if(m.type!=='world:input')throw Error('Mensagem online inválida.');
 const a=m.action,k=a&&Object.keys(a).sort().join(',');
 const arena=k==='kind'&&a.kind==='arena:request'||k==='kind,target'&&['arena:ready','arena:cancel'].includes(a.kind)&&typeof a.target==='string'&&/^[0-9a-f-]{36}$/.test(a.target);
 const destiny=a?.kind==='destiny'&&k==='id,kind,operation,request,slot'&&typeof a.request==='string'&&/^[a-zA-Z0-9-]{1,64}$/.test(a.request)&&['learn','assign','replace','quick'].includes(a.operation)&&(a.id===null&&a.operation==='assign'||Object.hasOwn(ABILITIES,a.id))&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<8;
 const restore=a?.kind==='destiny:restore'&&k==='kind,request,slots'&&typeof a.request==='string'&&/^[a-zA-Z0-9-]{1,64}$/.test(a.request)&&Array.isArray(a.slots)&&a.slots.length===8&&a.slots.every(id=>id===null||Object.hasOwn(ABILITIES,id));
 const social=restore||destiny||arena||(k==='kind'&&['party:create','party:leave'].includes(a.kind))||(k==='kind,target'&&['party:invite','party:kick','party:lead','party:accept','party:decline','party:cancel','pickup','open-chest'].includes(a.kind)&&typeof a.target==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(a.target))||(k==='channel,kind,text'&&a.kind==='chat'&&['global','party'].includes(a.channel)&&typeof a.text==='string'&&a.text.trim().length>0&&a.text.length<=ONLINE_RULES.chatLength&&!/[\x00-\x1f\x7f]/.test(a.text))||(k==='attribute,kind'&&a.kind==='allocate'&&['str','agi','vit','int','dex','luk'].includes(a.attribute));
 decodeTowerMessage(JSON.stringify({...m,mapId:m.mapId==='shared-city'||m.mapId===CASTLE_ID||isArenaId(m.mapId)?'shared-floor-1':m.mapId,v:3,action:social?{kind:'stop'}:a}));return m;
}
