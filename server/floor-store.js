import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {generateFloor} from '../src/world/tower.js';
import {validateHub} from '../src/core/config.js';
import {canStand} from '../src/world/collision.js';
import {createEnemies} from '../src/domain/enemies/spawns.js';
import {validateInteractables} from '../src/simulation/interaction.js';
import {FLOOR_IDS,TOWER_FLOOR_COUNT} from '../shared/tower.js';
export const LEGACY_GENERATOR_VERSION='local-tower/0.1.5+shared-policy/1';
export const GENERATOR_VERSION='local-tower/0.1.5+shared-policy/2';
export function applyTowerAccess(definition){
 const map=structuredClone(definition),floor=map.floorId;
 map.interactables=map.interactables.filter(i=>i.id==='return-portal'||floor>1&&i.id==='abandon-run');
 for(const i of map.interactables){const up=i.id==='return-portal',destination=up?floor+1:floor-1;
 i.content=destination>TOWER_FLOOR_COUNT?{unavailable:true}:{areaId:FLOOR_IDS[destination-1]};
 i.label=destination>TOWER_FLOOR_COUNT?'Continuação indisponível nesta versão · Andar 13':(up?'Subir ao Andar ':'Descer ao Andar ')+destination+' · acesso de teste';}
 map.exits=map.interactables.map(i=>({interactionId:i.id,...i.content}));return map;
}
export const geographyHash=definition=>createHash('sha256').update(JSON.stringify(definition)).digest('hex');
export function sharedFloor(seed,floor){
 if(!Number.isInteger(floor)||floor<1||floor>TOWER_FLOOR_COUNT)throw Error('Andar compartilhado indisponível.');
 const map=generateFloor(seed,floor,'shared-refuge',{floorRole:'normal'});map.id=FLOOR_IDS[floor-1];map.name='Torre Compartilhada · Andar '+floor;
 // Access policy is a test adapter, never a change to the local generator/progression.
 map.sharedPolicy='open-portals-no-rewards-v1';for(const gate of map.gates)gate.open=true;
 for(const spawn of map.enemySpawns){spawn.id=map.id+':'+spawn.id;Object.assign(spawn.overrides,{noRespawn:false,respawnTime:6,rewardXP:0,rewardGold:0});}
 return applyTowerAccess(JSON.parse(JSON.stringify(map)));
}
export class FloorStore {
 constructor(directory,{seed=217021,generate=sharedFloor}={}){this.directory=path.resolve(directory);this.seed=seed;this.generate=generate;this.cache=new Map();}
 read(file,floor){
  let record;try{record=JSON.parse(fs.readFileSync(file,'utf8'));}catch(error){throw Error('Geografia preservada; arquivo ilegível: '+file+' ('+error.message+')');}
  const m=record?.definition;
  if(record?.schema!==1||![GENERATOR_VERSION,LEGACY_GENERATOR_VERSION].includes(record.generatorVersion)||record.floor!==floor||!Number.isSafeInteger(record.seed)||m?.id!==FLOOR_IDS[floor-1]||m.floorId!==floor||m.runSeed!==record.seed||record.hash!==geographyHash(m))throw Error('Geografia inválida ou incompatível; arquivo preservado: '+file);
  validateHub(m);validateInteractables(m.interactables);if(!canStand(m,m.spawn.x,m.spawn.z,.32)||!Array.isArray(m.walkable)||!Array.isArray(m.trails)||!Array.isArray(m.gates)||m.sharedPolicy!=='open-portals-no-rewards-v1')throw Error('Geografia inválida; arquivo preservado: '+file);
  createEnemies(m.enemySpawns,m);for(const i of m.interactables)if(!(FLOOR_IDS.includes(i.content.areaId)||floor===TOWER_FLOOR_COUNT&&i.content.unavailable===true)||!canStand(m,i.x,i.z,.32))throw Error('Portal inválido; arquivo preservado: '+file);
  return record;
 }
 load(floor){
  if(!Number.isInteger(floor)||floor<1||floor>TOWER_FLOOR_COUNT)throw Error('Andar compartilhado indisponível.');if(this.cache.has(floor))return structuredClone(this.cache.get(floor));
  fs.mkdirSync(this.directory,{recursive:true});const file=path.join(this.directory,`floor-${floor}.json`);
  if(!fs.existsSync(file)){
   const definition=this.generate(this.seed,floor),record={schema:1,generatorVersion:GENERATOR_VERSION,floor,seed:this.seed,definition,hash:geographyHash(definition)};
   const temp=path.join(this.directory,`.floor-${floor}.${randomUUID()}.tmp`);let fd;
   try{fd=fs.openSync(temp,'wx');fs.writeFileSync(fd,JSON.stringify(record));fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
    // Atomic no-clobber publication on the same filesystem. A concurrent writer wins intact.
    try{fs.linkSync(temp,file);}catch(error){if(error.code!=='EEXIST')throw error;}
   }finally{if(fd!==undefined)fs.closeSync(fd);if(fs.existsSync(temp))fs.unlinkSync(temp);}
  }
  const record=this.read(file,floor);this.cache.set(floor,record);return structuredClone(record);
 }
}
