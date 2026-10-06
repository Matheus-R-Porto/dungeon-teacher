import {environmentFor,caveAmount} from './biomes.js';
import {seedOf,seeded} from '../domain/random.js';
export const FOREST_NAMES=['Borda da Floresta','Floresta Densa','Coração da Floresta'];
const landmarks=['Árvore ancestral','Pedra rúnica','Lago das raízes','Ruína dos viajantes','Tronco antigo'];
export function validateFloorGraph(g){
 const ids=new Set(g.regions.map(r=>r.id));if(ids.size!==g.regions.length||g.regions.filter(r=>r.type==='entrance').length!==1||!ids.has(g.entry)||!ids.has(g.exit)||g.mainPath[0]!==g.entry||g.mainPath.at(-1)!==g.exit)throw Error('Entrada/saída inválida no grafo.');
 const seen=new Set([g.entry]);for(let i=0;i<g.regions.length;i++)for(const e of g.connections){if(!ids.has(e.from)||!ids.has(e.to))throw Error('Conexão inválida.');if(seen.has(e.from))seen.add(e.to);if(seen.has(e.to))seen.add(e.from);}
 if(seen.size!==ids.size)throw Error('Região desconectada.');
 for(let i=1;i<g.mainPath.length;i++)if(!g.connections.some(e=>e.from===g.mainPath[i-1]&&e.to===g.mainPath[i]))throw Error('Caminho principal interrompido.');
 if(g.regions.filter(r=>r.type==='boss').length!==((g.floorRole??(g.floor===3?'boss':'normal'))==='boss'?1:0))throw Error('Região de boss inválida.');
 for(const r of g.regions.filter(r=>r.optional))if(!g.connections.some(e=>e.to===r.id&&!e.gateId))throw Error('Desvio sem retorno.');
 return g;
}
export function generateFloorGraph(runSeed,floor,options={}){
 if(!Number.isInteger(floor)||floor<1||floor>10000)throw Error('Andar inválido.');
 const environment=options.environment??environmentFor(runSeed,floor),role=options.floorRole??(floor===3?'boss':'normal'),difficulty=Math.min(floor,3);
 const extended=environment.type!=='FOREST'||floor>3||role!==(floor===3?'boss':'normal');
 const random=seeded(seedOf(runSeed+':'+floor+':topology')),decor=seeded(seedOf(runSeed+':'+floor+':decoration'));
 const regions=[],connections=[],count=8+difficulty+(environment.transitionDirection?2:0),mirror=random()<.5?-1:1;
 let previousLandmark=-1;
 for(let i=0;i<count;i++){const chosen=(previousLandmark+1+Math.floor(decor()*4))%5;previousLandmark=chosen;
  const type=i===0?'entrance':i===count-1?(role==='boss'?'boss':'exit'):[2,count-3].includes(i)?'encounter':i%3===0?'fork':i%2?'grove':'ruins';
  regions.push({id:'main-'+i,type,optional:false,x:i===0?0:mirror*(i%2?1:-1)*(12+Math.floor(random()*7)),z:i===0?0:-i*(23+difficulty),radius:type==='boss'?12:type==='encounter'?10:8+random()*2,name:i===0?'Limiar da trilha':type==='boss'?'Clareira do Guardião':type==='exit'?'Arco da Travessia':landmarks[chosen],template:type==='ruins'?'forest_ruins':type,landmark:chosen});
  if(i)connections.push({id:'trail-'+i,from:'main-'+(i-1),to:'main-'+i,main:true});
 }
 const branches=floor===1?[3]:[3,6];
 for(const [n,index]of branches.entries()){
  const from=regions[index],direction=from.x>=0?1:-1,optional={id:'optional-'+n,type:n?'ruins':'pocket',optional:true,x:from.x+direction*(23+Math.floor(random()*6)),z:from.z+(random()<.5?-5:5),radius:9,name:n?'Memorial esquecido':'Lago dos vaga-lumes',template:'optional_pocket',landmark:n?3:2};
  regions.push(optional);connections.push({id:'detour-'+n,from:from.id,to:optional.id,main:false});
  // A few seeds make the detour a two-region excursion, without bypassing a gate.
  if(floor>1&&random()>.5){const tip={...optional,id:optional.id+'-tip',x:optional.x+direction*19,z:optional.z-9,radius:7,name:'Pedra do eco',landmark:1};regions.push(tip);connections.push({id:'detour-tip-'+n,from:optional.id,to:tip.id,main:false});}
 }
 if(extended){for(const r of regions){const c=caveAmount(environment,r.z/regions[count-1].z);r.caveAmount=c;if(c>.5){r.name=r.type==='entrance'?'Boca da Caverna':r.type==='boss'?'Câmara do Guardião':r.type==='exit'?'Passagem subterrânea':['Pilares de basalto','Veios luminosos','Lago subterrâneo','Câmara dos ecos','Jardim de fungos'][r.landmark];r.template='cave_'+r.type;}if(!r.optional&&r.type!=='boss'&&r.type!=='encounter')r.radius=r.radius*(1-c*.12)+(r.landmark===3?c*2:0);}}
 const graph={version:1,seed:runSeed,floor,entry:'main-0',exit:'main-'+(count-1),mainPath:regions.filter(r=>!r.optional).map(r=>r.id),regions,connections};
 for(const r of regions.filter(r=>r.type==='encounter'))connections.find(e=>e.from===r.id&&e.main).gateId='gate-'+r.id;
 if(extended){graph.floorRole=role;graph.floorEnvironment=environment;}
 return validateFloorGraph(graph);
}
