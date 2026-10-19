// Versioned test geography, independent of simulation lifetime and future storage.
export const WORLD_ID='shared-training-01';
export function testMap(){return {id:WORLD_ID,name:'Clareira Compartilhada',environment:'dungeon',safe:false,
  bounds:{minX:-12,maxX:12,minZ:-12,maxZ:12},spawn:{x:0,z:7},portal:{x:0,z:10,interactRadius:2},
  obstacles:[{id:'cover',shape:'rect',x:4,z:0,halfX:1,halfZ:2}],interactables:[],npcs:[],
  enemySpawns:[{id:'slime-1',enemyType:'trainingSlime',position:{x:0,z:0},overrides:{aggressive:false,stats:{maxHP:100},respawnTime:6}},
    {id:'slime-2',enemyType:'trainingSlime',position:{x:-6,z:-4},overrides:{aggressive:false,stats:{maxHP:100},respawnTime:6}}]};}
export const WORLD_NET=Object.freeze({version:2,tick:1/20,snapshotEvery:2,inputExpiry:.4,respawn:6,playerRespawn:4,maxPayload:8192});
export const worldMessage=(type,fields={})=>({v:2,type,...fields});
const exact=(m,fields)=>m&&typeof m==='object'&&!Array.isArray(m)&&Object.keys(m).length===fields.length+2&&['v','type',...fields].every(k=>Object.hasOwn(m,k));
export function decodeWorld(raw){
  if(typeof raw!=='string'||new TextEncoder().encode(raw).length>WORLD_NET.maxPayload)throw Error('Mensagem grande demais.');
  const m=JSON.parse(raw);if(m?.v!==2)throw Error('Versão incompatível.');
  if(m.type==='world:hello'&&exact(m,['name','token'])&&typeof m.name==='string'&&/^[\p{L}\p{N} _.\-]{2,24}$/u.test(m.name)&&
    (m.token===null||typeof m.token==='string'&&/^[a-f0-9]{64}$/.test(m.token)))return m;
  if(m.type==='world:input'&&exact(m,['seq','action'])&&Number.isSafeInteger(m.seq)&&m.seq>0){
    const a=m.action,keys=a&&Object.keys(a).sort().join(',');
    if(keys==='kind,x,z'&&['move','destination'].includes(a.kind)&&[a.x,a.z].every(Number.isFinite)&&Math.abs(a.x)<=(a.kind==='move'?1:12)&&Math.abs(a.z)<=(a.kind==='move'?1:12))return m;
    if(keys==='generation,kind,target'&&a.kind==='attack'&&typeof a.target==='string'&&a.target.length<=40&&Number.isSafeInteger(a.generation)&&a.generation>=0)return m;
    if(keys==='kind'&&a.kind==='stop')return m;
  }
  throw Error('Comando compartilhado inválido.');
}
