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
 const int=(n,max)=>Number.isSafeInteger(n)&&n>=0&&n<max,itemId=s=>typeof s==='string'&&/^item-[1-9]\d*$/.test(s);
 const transport=a?.kind==='transport'&&typeof a.request==='string'&&/^[a-zA-Z0-9-]{1,64}$/.test(a.request)&&(
 k==='item,kind,operation,request'&&a.operation==='buy'&&['travelerBackpack','woodenCart'].includes(a.item)||
 k==='index,kind,operation,request,slot'&&a.operation==='equip'&&int(a.index,32)&&['backpack','cart'].includes(a.slot)||
 k==='kind,operation,request,slot'&&a.operation==='unequip'&&['backpack','cart'].includes(a.slot)||
 k==='from,kind,operation,request,to'&&a.operation==='reorder'&&int(a.from,32)&&int(a.to,32)||
 k==='instanceId,kind,operation,quantity,request,toCart'&&a.operation==='transfer'&&itemId(a.instanceId)&&int(a.quantity,100)&&a.quantity>0&&typeof a.toCart==='boolean'||
 k==='kind,operation,request,requests'&&a.operation==='discard'&&Array.isArray(a.requests)&&a.requests.length>0&&a.requests.length<=32&&a.requests.every(r=>r&&Object.keys(r).sort().join(',')==='instanceId,quantity'&&itemId(r.instanceId)&&int(r.quantity,100)&&r.quantity>0));
 const progression=a?.kind==='progression'&&k==='data,kind,operation,request'&&typeof a.request==='string'&&/^[a-zA-Z0-9-]{1,64}$/.test(a.request)&&['build','service','hotbar','consume','equipment','supplies','shop','fish','cook','mine','forge'].includes(a.operation)&&a.data&&typeof a.data==='object'&&!Array.isArray(a.data);
 const validAim=v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>['x','z','ally','enemy','floor'].includes(k))&&['x','z'].every(k=>v[k]===undefined||Number.isFinite(v[k])&&Math.abs(v[k])<10000)&&['ally','enemy'].every(k=>v[k]===undefined||typeof v[k]==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(v[k]))&&(v.floor===undefined||Number.isInteger(v.floor)&&v.floor>=1&&v.floor<=12);
 const teleport=a?.kind?.startsWith('teleport:')&&['teleport:accept','teleport:decline','teleport:confirm'].includes(a.kind)&&k==='kind,offer'&&typeof a.offer==='string'&&/^[a-f0-9-]{36}$/.test(a.offer);
 const ability=a?.kind==='ability'&&(k==='kind,slot'||k==='aim,kind,slot'&&validAim(a.aim))&&Number.isInteger(a.slot)&&a.slot>=1&&a.slot<=8;
 const social=teleport||ability||progression||transport||restore||destiny||arena||(k==='kind'&&['party:create','party:leave'].includes(a.kind))||(k==='kind,target'&&['party:invite','party:kick','party:lead','party:accept','party:decline','party:cancel','pickup','open-chest'].includes(a.kind)&&typeof a.target==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(a.target))||(k==='channel,kind,text'&&a.kind==='chat'&&['global','party'].includes(a.channel)&&typeof a.text==='string'&&a.text.trim().length>0&&a.text.length<=ONLINE_RULES.chatLength&&!/[\x00-\x1f\x7f]/.test(a.text))||(k==='attribute,kind'&&a.kind==='allocate'&&['str','agi','vit','int','dex','luk'].includes(a.attribute));
 decodeTowerMessage(JSON.stringify({...m,mapId:m.mapId==='shared-city'||m.mapId===CASTLE_ID||isArenaId(m.mapId)?'shared-floor-1':m.mapId,v:3,action:social?{kind:'stop'}:a}));return m;
}
