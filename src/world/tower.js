import {generateEncounter} from '../domain/enemies/encounters.js';
import {seedOf,seeded,EXPEDITION as E} from '../domain/expedition.js';
import {validateHub} from '../core/config.js';
import {canStand} from './collision.js';
import {findPath} from './navigation.js';
import {generateFloorGraph,FOREST_NAMES} from './floor-graph.js';
function materializeFloor(runSeed,floor,hubId){
 const start=performance.now(),graph=generateFloorGraph(runSeed,floor),topologyMs=performance.now()-start,seed=seedOf(runSeed+':'+floor),random=seeded(seedOf(seed+':geometry'));
 const byId=Object.fromEntries(graph.regions.map(r=>[r.id,r])),entry=byId[graph.entry],exit=byId[graph.exit];
 const world={id:'tower-floor-'+floor,name:FOREST_NAMES[floor-1]+' · Andar '+floor,safe:false,floorId:floor,seed,runSeed,environment:'forest',graph,bounds:{minX:Math.min(...graph.regions.map(r=>r.x-r.radius))-4,maxX:Math.max(...graph.regions.map(r=>r.x+r.radius))+4,minZ:exit.z-exit.radius-5,maxZ:entry.radius+5},spawn:{x:entry.x,z:entry.z},portal:{x:exit.x,z:exit.z-4,interactRadius:2.6},npcs:[],zones:[],obstacles:[],enemySpawns:[],interactables:[],walkable:[],trails:[],encounters:[],gates:[],pois:[],navRevision:0};
 for(const r of graph.regions){world.walkable.push({x:r.x,z:r.z,radius:r.radius});world.pois.push({id:'poi-'+r.id,regionId:r.id,type:r.optional?'optionalEncounter':'landmark',name:r.name,kind:r.landmark,x:r.x-4,z:r.z+3});if(r.optional)world.pois.push({id:'future-'+r.id,regionId:r.id,type:'futureResource',x:r.x+3,z:r.z+3});}
 for(const e of graph.connections){const a=byId[e.from],b=byId[e.to],mid={x:(a.x+b.x)/2+(e.main?(random()-.5)*5:0),z:(a.z+b.z)/2};const radius=e.main?(floor===1?4:3.4):2.8;const points=[{x:a.x,z:a.z},mid,{x:b.x,z:b.z}];world.trails.push({...e,points,radius});for(let i=1;i<points.length;i++)world.walkable.push({a:points[i-1],b:points[i],radius});if(e.gateId){const dx=mid.x-a.x,dz=mid.z-a.z,d=Math.hypot(dx,dz),t=(a.radius+3)/d;const gate={id:e.gateId,encounterId:'enc-'+a.id,shape:'circle',kind:'roots',x:a.x+dx*t,z:a.z+dz*t,radius:radius+1,open:false};world.gates.push(gate);}}
 const required=graph.regions.filter(r=>r.type==='encounter'),composition=generateEncounter(runSeed,floor,E.counts[floor-1]);world.encounter=composition;
 let index=0;for(const [j,r]of required.entries()){const amount=j===0?Math.floor(composition.length/2):composition.length-index,ids=[];for(let k=0;k<amount;k++){const profile=composition[index],id='floor-'+floor+'-slime-'+(++index),position={x:r.x+(k-1)*2.7,z:r.z-1};ids.push(id);world.enemySpawns.push({id,enemyType:profile.enemyType,position,overrides:{encounterId:'enc-'+r.id,aggressive:false,ambient:true,noRespawn:true,ambientSeed:seedOf(seed+':ambient:'+id),rewardXP:E.xp[floor-1],rewardGold:0,stats:{maxHP:Math.round(E.hp[floor-1]*profile.hpScale),physicalAttack:E.attack[floor-1]}}});}world.encounters.push({id:'enc-'+r.id,regionId:r.id,required:true,enemyIds:ids,gateId:'gate-'+r.id});}
 for(const [i,r]of graph.regions.filter(r=>r.optional&&!r.id.endsWith('tip')).entries()){const ids=[];for(let k=0;k<2;k++){const id='optional-'+floor+'-'+i+'-'+k,profile=generateEncounter(seedOf(runSeed+':optional:'+i),floor,3)[k];ids.push(id);world.enemySpawns.push({id,enemyType:profile.enemyType,position:{x:r.x+k*2.5,z:r.z},overrides:{encounterId:'enc-'+r.id,optional:true,aggressive:false,ambient:true,noRespawn:true,ambientSeed:seedOf(seed+':ambient:'+id),rewardXP:E.xp[floor-1],rewardGold:0,stats:{maxHP:Math.round(E.hp[floor-1]*profile.hpScale),physicalAttack:E.attack[floor-1]}}});}world.encounters.push({id:'enc-'+r.id,regionId:r.id,required:false,enemyIds:ids});}
 // Cover stays off region centers and trail axes, preserving local approach routes.
 for(const r of graph.regions.filter(r=>r.type==='encounter'||r.type==='ruins'))for(const side of [-1,1])world.obstacles.push({id:'cover-'+r.id+'-'+side,shape:'rect',kind:floor===3?'ruin':'rock',x:r.x+side*5,z:r.z+2,halfX:.9,halfZ:.8});
 if(floor===3)world.enemySpawns.push({id:'tower-boss',enemyType:'trainingSlime',position:{x:exit.x,z:exit.z},overrides:{name:'Slime Guardião',boss:true,dormant:true,noRespawn:true,aggressive:true,radius:.85,scale:2,detectionRange:100,leashRange:100,rewardXP:E.bossXP,rewardGold:0,stats:{maxHP:E.bossHP,physicalAttack:E.bossAttack,attackSpeed:.65,attackRange:1.8}}});
 world.interactables=[{id:'return-portal',...world.portal,radius:2.6,priority:1,label:'Siga a trilha e libere as passagens',action:'travel',content:{areaId:floor===3?hubId:'tower-floor-'+(floor+1),requiresCompletion:true},highlightRadius:2.4},{id:'abandon-run',...world.spawn,radius:2,priority:0,label:'Abandonar expedição · voltar ao Refúgio',action:'travel',content:{areaId:hubId,abandon:true},highlightRadius:.7}];world.exits=world.interactables.map(i=>({interactionId:i.id,...i.content}));
 validateHub(world);const materializationMs=performance.now()-start-topologyMs,validationStart=performance.now();
 // Validate every physical graph edge locally. Their union proves global connectivity.
 for(const t of world.trails)for(let i=1;i<t.points.length;i++)if(!findPath(world,t.points[i-1],t.points[i],.85))throw Error('Trilha inacessível.');
 for(const s of world.enemySpawns){const r=graph.regions.find(r=>Math.hypot(r.x-s.position.x,r.z-s.position.z)<r.radius);if(!r||!canStand(world,s.position.x,s.position.z,.85)||!findPath(world,r,s.position,.85))throw Error('Encontro inacessível.');}
 if(!findPath(world,exit,world.portal,.85))throw Error('Saída inacessível.');
 Object.defineProperty(world,'generationMetrics',{value:{topologyMs,materializationMs,validationMs:performance.now()-validationStart,totalMs:performance.now()-start},enumerable:false});
 return world;
}

export function generateFloor(runSeed,floor,hubId){
 if(!Number.isInteger(floor)||floor<1||floor>3)throw Error('Andar inválido.');
 let failure;for(let attempt=0;attempt<3;attempt++){try{const result=materializeFloor(attempt?seedOf(runSeed+':fallback:'+attempt):runSeed,floor,hubId);result.runSeed=runSeed;result.generationAttempt=attempt;return result;}catch(error){failure=error;}}throw new Error('Não foi possível gerar um andar válido após 3 tentativas: '+failure.message);
}
