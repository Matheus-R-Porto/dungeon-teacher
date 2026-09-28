import {decodeFirstSteps} from '../../domain/first-steps.js';
import {decodeInventory} from '../../domain/items/inventory.js';
import {ABILITIES,WEAPONS} from '../../domain/abilities/definitions.js';
import {createCharacter} from '../../domain/character/character.js';
import {ATTRIBUTES,BALANCE,CLASS_DEFINITIONS} from '../../domain/character/balance.js';
import {calculateStats,clamp,xpRequired} from '../../domain/character/stats.js';
export function decodeSave(raw){
  if(raw==null)return createCharacter();
  if(typeof raw!=='object'||Array.isArray(raw))throw Error('Save inválido; dados originais preservados.');
  if(raw.schemaVersion!==undefined&&(!Number.isInteger(raw.schemaVersion)||raw.schemaVersion<0||raw.schemaVersion>1))throw Error('Versão do save não suportada; dados preservados.');
  if(raw.saveVersion&&raw.saveVersion!=='0.1.0')throw Error('Versão futura ou desconhecida de save.');
  const source=raw.character??raw;if(typeof source!=='object'||Array.isArray(source))throw Error('Personagem inválido no save.');const defaults=createCharacter();
  const integer=(value,fallback,min,max)=>{if(value===undefined)return fallback;if(!Number.isSafeInteger(value)||value<min||value>max)throw Error('Save contém valor inválido.');return value;};
  if(source.classId!==undefined&&!Object.hasOwn(CLASS_DEFINITIONS,source.classId))throw Error('Classe ainda não suportada neste save.');
  const data={...defaults,classId:source.classId??defaults.classId,name:typeof source.name==='string'?source.name.slice(0,60):defaults.name,
    level:integer(source.level,1,1,BALANCE.maxLevel),xp:integer(source.xp,0,0,BALANCE.maxGainXP),attributePoints:integer(source.attributePoints,0,0,BALANCE.maxPoints),attributes:{}};
  for(const key of Object.keys(ATTRIBUTES))data.attributes[key]=integer(source.attributes?.[key],defaults.attributes[key],0,BALANCE.maxAttribute);
  // Legacy snapshots may contain XP not yet consolidated. Apply each level once.
  if(source.progressionVersion!==undefined&&![2,3,BALANCE.progressionVersion].includes(source.progressionVersion))throw Error('Progressão inválida.');
  data.skillSpaces=integer(source.skillSpaces,0,0,BALANCE.maxPoints);
  data.gold=integer(source.gold,0,0,BALANCE.maxGainXP);data.upgrades={};
  if(source.upgrades!==undefined&&(!source.upgrades||typeof source.upgrades!=='object'||Array.isArray(source.upgrades)||Object.keys(source.upgrades).some(k=>!Object.hasOwn(ATTRIBUTES,k))))throw Error('Melhorias inválidas.');
  for(const key of Object.keys(ATTRIBUTES))data.upgrades[key]=integer(source.upgrades?.[key],0,0,BALANCE.maxAttribute);
  while(data.level<BALANCE.maxLevel&&data.xp>=xpRequired(data.level)){data.xp-=xpRequired(data.level);data.level++;data.attributePoints=Math.min(BALANCE.maxPoints,data.attributePoints+BALANCE.pointsPerLevel);data.skillSpaces=Math.min(BALANCE.maxPoints,data.skillSpaces+BALANCE.skillSpacesPerLevel);}
  if(data.level===BALANCE.maxLevel)data.xp=Math.min(data.xp,xpRequired(data.level)-1);
  if(source.equippedWeaponType!=null&&!Object.hasOwn(WEAPONS,source.equippedWeaponType))throw Error('Arma desconhecida no save.');
  Object.assign(data,decodeInventory(source));
  if(source.knownAbilities!==undefined&&(!Array.isArray(source.knownAbilities)||source.knownAbilities.some(id=>!Object.hasOwn(ABILITIES,id))))throw Error('Habilidade desconhecida no save.');
  data.knownAbilities=source.knownAbilities?[...new Set(source.knownAbilities)]:[];
  data.firstSteps=decodeFirstSteps(source.firstSteps);
  const stats=calculateStats(data);
  for(const [key,max]of [['hp',stats.maxHP],['mp',stats.maxMP]]){const value=source[key]??max;if(!Number.isFinite(value))throw Error('Recurso inválido no save.');data[key]=clamp(value,0,max);}
  return source.progressionVersion===BALANCE.progressionVersion?data:createCharacter();
}
export const encodeSave=(character,revision)=>({saveVersion:'0.1.0',schemaVersion:1,revision,savedAt:new Date().toISOString(),character:structuredClone(character)});
export class CharacterSave {
  constructor(key="current"){this.key=key;this.revision=0;this.queue=Promise.resolve();}
  async open(){
    this.db=await new Promise((resolve,reject)=>{const request=indexedDB.open('dungeon-master',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('character'))request.result.createObjectStore('character');};request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Feche outras abas do jogo para abrir o save.'));request.onsuccess=()=>resolve(request.result);});
    this.db.onversionchange=()=>this.db.close();
    const raw=await new Promise((resolve,reject)=>{const tx=this.db.transaction('character','readonly'),r=tx.objectStore('character').get(this.key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    this.revision=raw?.revision??0;const data=decodeSave(raw);if(!raw||raw.character?.progressionVersion!==BALANCE.progressionVersion)await this.save(data);return data;
  }
  save(character){const snapshot=structuredClone(character);const operation=this.queue.then(()=>new Promise((resolve,reject)=>{
    const tx=this.db.transaction('character','readwrite'),store=tx.objectStore('character'),read=store.get(this.key);let conflict=false;
    read.onsuccess=()=>{const old=read.result;if((old?.revision??0)!==this.revision){conflict=true;tx.abort();return;}if(old)store.put(old,this.key+':previous');store.put(encodeSave(snapshot,this.revision+1),this.key);};
    tx.oncomplete=()=>{this.revision++;resolve();};tx.onerror=()=>reject(tx.error??Error('Falha ao salvar.'));tx.onabort=()=>reject(Error(conflict?'O save mudou em outra aba. Reabra o jogo para evitar sobrescrita.':'Não foi possível salvar.'));
  }));this.queue=operation.catch(()=>{});return operation;}
}
