export const FISHING = Object.freeze({castSeconds:.35,waitMin:1,waitMax:3,reactionSeconds:1.2,cooldownSeconds:2.5,maxStack:99,spotsPerLake:1,interactionRadius:1.4});
export const FISH = Object.freeze([
  {id:'limiarMinnow',name:'Lambari do Limiar',description:'Pequeno peixe prateado das águas da Torre.',minLevel:1,weight:55,xp:6},
  {id:'fireflyCarp',name:'Carpa dos Vaga-lumes',description:'Suas escamas refletem os brilhos da margem.',minLevel:1,weight:30,xp:8},
  {id:'mossCatfish',name:'Bagre Musgoso',description:'Vive junto às raízes submersas.',minLevel:1,weight:15,xp:10},
  {id:'moonFish',name:'Peixe-Lua',description:'Um brilho pálido acompanha suas nadadeiras.',minLevel:2,weight:12,xp:12},
  {id:'runeFish',name:'Peixe Rúnico',description:'Marcas luminosas percorrem suas escamas.',minLevel:3,weight:5,xp:16},
].map(f=>Object.freeze({...f,itemDefinition:f.id,tags:['fish','ingredient']})));
export const eligibleFish = level => FISH.filter(f=>f.minLevel<=level);
export function selectFish(level,random){const pool=eligibleFish(level),total=pool.reduce((n,f)=>n+f.weight,0),roll=random();if(!pool.length||!Number.isFinite(roll)||roll<0||roll>=1)throw Error('Seleção de peixe inválida.');let cursor=roll*total;for(const fish of pool){cursor-=fish.weight;if(cursor<0)return fish;}return pool.at(-1);}
