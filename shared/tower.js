import {decodeWorld} from './world.js';
export const TOWER_PROTOCOL=3;
export const TOWER_FLOOR_COUNT=12;
export const FLOOR_IDS=Object.freeze(Array.from({length:TOWER_FLOOR_COUNT},(_,i)=>'shared-floor-'+(i+1)));
export const towerMessage=(type,fields={})=>({v:TOWER_PROTOCOL,type,...fields});
export function decodeTowerMessage(raw){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>8192)throw Error('Mensagem grande demais.');
 const m=JSON.parse(raw);if(m?.v!==3)throw Error('Protocolo da Torre incompatível.');
 if(m.type==='world:hello'){decodeWorld(JSON.stringify({...m,v:2}));return m;}
 if(m.type!=='world:input'||Object.keys(m).sort().join(',')!=='action,epoch,mapId,seq,type,v'||!FLOOR_IDS.includes(m.mapId)||typeof m.epoch!=='string'||m.epoch.length!==36||!Number.isSafeInteger(m.seq)||m.seq<1)throw Error('Comando da Torre inválido.');
 const a=m.action,keys=a&&Object.keys(a).sort().join(',');
 if((keys==='kind,x,z'||keys==='kind,surface,x,z'&&typeof a.surface==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(a.surface))&&a.kind==='destination'&&[a.x,a.z].every(n=>Number.isFinite(n)&&Math.abs(n)<10000))return m;
 if(keys==='kind,portal'&&a.kind==='travel'&&typeof a.portal==='string'&&a.portal.length<80)return m;
 if(keys==='generation,kind,target'&&a.kind==='attack'&&typeof a.target==='string'&&a.target.length<128&&Number.isSafeInteger(a.generation)&&a.generation>=0)return m;
 decodeWorld(JSON.stringify({v:2,type:m.type,seq:m.seq,action:m.action}));return m;
}
