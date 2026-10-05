import {validId,validName} from '../../shared/multiplayer.js';
export function loadIdentity(storage,uuid,key='dungeon-multiplayer.identity.v1'){
  let identity;try{identity=JSON.parse(storage.getItem(key));}catch{identity=null;}
  if(!identity||!validId(identity.id))identity={id:uuid(),name:'Viajante'};
  if(!validName(identity.name))identity.name='Viajante';
  storage.setItem(key,JSON.stringify(identity));
  return {identity,saveName(name){name=name.trim();if(!validName(name))throw Error('Use de 2 a 24 letras, números, espaços, pontos ou traços.');const next={id:identity.id,name};storage.setItem(key,JSON.stringify(next));identity.name=name;}};
}
