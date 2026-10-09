import {environmentFor,caveAmount,environmentRecord} from './biomes.js';
import {addWaterFeatures} from './water-features.js';
import {addMineralVeins} from './mineral-veins.js';
import {generateEncounter} from '../domain/enemies/encounters.js';
import {seedOf,seeded,EXPEDITION as E,TOWER_LIMIT,POST_THREE,floorScale} from '../domain/expedition.js';
import {validateHub} from '../core/config.js';
import {canStand} from './collision.js';
import {findPath} from './navigation.js';
import {generateFloorGraph,FOREST_NAMES} from './floor-graph.js';
function materializeFloor(runSeed,floor,hubId,options){
 const environment=options.environment,role=options.floorRole,difficulty=Math.min(floor,3),hpScale=floorScale(floor,POST_THREE.hp),attackScale=floorScale(floor,POST_THREE.attack),xpScale=floorScale(floor,POST_THREE.xp),cave=progress=>caveAmount(environment,progress);
 const start=performance.now(),graph=generateFloorGraph(runSeed,floor,options),topologyMs=performance.now()-start,seed=seedOf(runSeed+':'+floor),random=seeded(seedOf(seed+':geometry'));
 const byId=Object.fromEntries(graph.regions.map(r=>[r.id,r])),entry=byId[graph.entry],exit=byId[graph.exit];
 const world={id:'tower-floor-'+floor,name:(environment.type==='FOREST'?(FOREST_NAMES[floor-1]??'Floresta dos viajantes'):environment.name)+' · Andar '+floor,safe:false,floorId:floor,seed,runSeed,environment:environment.type==='FOREST'?'forest':'biome',floorEnvironment:environment,floorRole:role,graph,bounds:{minX:Math.min(...graph.regions.map(r=>r.x-r.radius))-4,maxX:Math.max(...graph.regions.map(r=>r.x+r.radius))+4,minZ:exit.z-exit.radius-5,maxZ:entry.radius+5},spawn:{x:entry.x,z:entry.z},portal:{x:exit.x,z:exit.z-4,interactRadius:2.6},npcs:[],zones:[],obstacles:[],enemySpawns:[],interactables:[],walkable:[],trails:[],encounters:[],gates:[],pois:[],navRevision:0};
 for(const r of graph.regions){world.walkable.push({x:r.x,z:r.z,radius:r.radius});world.pois.push({id:'poi-'+r.id,regionId:r.id,type:r.optional?'optionalEncounter':'landmark',name:r.name,kind:r.landmark,x:r.x-4,z:r.z+3});if(r.optional)world.pois.push({id:'future-'+r.id,regionId:r.id,type:'futureResource',x:r.x+3,z:r.z+3});}
 for(const e of graph.connections){const a=byId[e.from],b=byId[e.to],mid={x:(a.x+b.x)/2+(e.main?(random()-.5)*5:0),z:(a.z+b.z)/2};const radius=(e.main?(floor===1?4:3.4):2.8)-cave(mid.z/exit.z)*.25;const points=[{x:a.x,z:a.z},mid,{x:b.x,z:b.z}];world.trails.push({...e,points,radius});for(let i=1;i<points.length;i++)world.walkable.push({a:points[i-1],b:points[i],radius});if(e.gateId){const dx=mid.x-a.x,dz=mid.z-a.z,d=Math.hypot(dx,dz),t=(a.radius+3)/d;const gate={id:e.gateId,encounterId:'enc-'+a.id,shape:'circle',kind:cave(mid.z/exit.z)>.5?'crystal':'roots',x:a.x+dx*t,z:a.z+dz*t,radius:radius+1,open:false};world.gates.push(gate);}}
 const required=graph.regions.filter(r=>r.type==='encounter'),composition=generateEncounter(runSeed,difficulty,E.counts[difficulty-1]);world.encounter=composition;
 let index=0;for(const [j,r]of required.entries()){const amount=j===0?Math.floor(composition.length/2):composition.length-index,ids=[];for(let k=0;k<amount;k++){const profile=composition[index],id='floor-'+floor+'-slime-'+(++index),position={x:r.x+(k-1)*2.7,z:r.z-1};ids.push(id);world.enemySpawns.push({id,enemyType:profile.enemyType,position,overrides:{encounterId:'enc-'+r.id,aggressive:false,ambient:true,noRespawn:true,ambientSeed:seedOf(seed+':ambient:'+id),rewardXP:Math.round(E.xp[difficulty-1]*xpScale),rewardGold:0,stats:{maxHP:Math.round(E.hp[difficulty-1]*profile.hpScale*hpScale),physicalAttack:Math.round(E.attack[difficulty-1]*attackScale)}}});}world.encounters.push({id:'enc-'+r.id,regionId:r.id,required:true,enemyIds:ids,gateId:'gate-'+r.id});}
 for(const [i,r]of graph.regions.filter(r=>r.optional&&!r.id.endsWith('tip')).entries()){const ids=[];for(let k=0;k<2;k++){const id='optional-'+floor+'-'+i+'-'+k,profile=generateEncounter(seedOf(runSeed+':optional:'+i),difficulty,3)[k];ids.push(id);world.enemySpawns.push({id,enemyType:profile.enemyType,position:{x:r.x+k*2.5,z:r.z},overrides:{encounterId:'enc-'+r.id,optional:true,aggressive:false,ambient:true,noRespawn:true,ambientSeed:seedOf(seed+':ambient:'+id),rewardXP:Math.round(E.xp[difficulty-1]*xpScale),rewardGold:0,stats:{maxHP:Math.round(E.hp[difficulty-1]*profile.hpScale*hpScale),physicalAttack:Math.round(E.attack[difficulty-1]*attackScale)}}});}world.encounters.push({id:'enc-'+r.id,regionId:r.id,required:false,enemyIds:ids});}
 // Cover stays off region centers and trail axes, preserving local approach routes.
 for(const r of graph.regions.filter(r=>r.type==='encounter'||r.type==='ruins'))for(const side of [-1,1])world.obstacles.push({id:'cover-'+r.id+'-'+side,shape:'rect',kind:cave(r.z/exit.z)>.5?'pillar':floor===3?'ruin':'rock',x:r.x+side*5,z:r.z+2,halfX:.9,halfZ:.8});
 if(role==='boss')world.enemySpawns.push({id:'tower-boss',enemyType:'trainingSlime',position:{x:exit.x,z:exit.z},overrides:{name:'Slime Guardião',boss:true,dormant:true,noRespawn:true,aggressive:true,radius:.85,scale:2,detectionRange:100,leashRange:100,rewardXP:E.bossXP,rewardGold:0,stats:{maxHP:E.bossHP,physicalAttack:E.bossAttack,attackSpeed:.65,attackRange:1.8}}});
 // The main portal always continues upward; the boss floor adds a separate portal back to the Refuge.
 // The last floor of the tower has no floor above, so its main portal safely ends the run instead.
 const limit=floor>=TOWER_LIMIT;world.towerLimit=limit;
 world.interactables=[{id:'return-portal',...world.portal,radius:2.6,priority:1,label:'Siga a trilha e libere as passagens',action:'travel',content:{areaId:limit?hubId:'tower-floor-'+(floor+1),requiresCompletion:true},highlightRadius:2.4},{id:'abandon-run',...world.spawn,radius:2,priority:0,label:'Abandonar expedição · voltar ao Refúgio',action:'travel',content:{areaId:hubId,abandon:true},highlightRadius:.7}];
 if(role==='boss'&&!limit){world.refugePortal={x:exit.x+5,z:exit.z-1};world.interactables.push({id:'refuge-portal',...world.refugePortal,radius:2.2,priority:1,label:'Retornar ao Refúgio',action:'travel',content:{areaId:hubId,requiresCompletion:true},highlightRadius:1.6});}
 world.exits=world.interactables.map(i=>({interactionId:i.id,...i.content}));
 addWaterFeatures(world);addMineralVeins(world);
 validateHub(world);const materializationMs=performance.now()-start-topologyMs,validationStart=performance.now();
 // Validate every physical graph edge locally. Their union proves global connectivity.
 for(const t of world.trails)for(let i=1;i<t.points.length;i++)if(!findPath(world,t.points[i-1],t.points[i],.85))throw Error('Trilha inacessível.');
 for(const s of world.enemySpawns){const r=graph.regions.find(r=>Math.hypot(r.x-s.position.x,r.z-s.position.z)<r.radius);if(!r||!canStand(world,s.position.x,s.position.z,.85)||!findPath(world,r,s.position,.85))throw Error('Encontro inacessível.');}
 if(!findPath(world,exit,world.portal,.85))throw Error('Saída inacessível.');
 if(world.refugePortal&&(!canStand(world,world.refugePortal.x,world.refugePortal.z,.85)||!findPath(world,exit,world.refugePortal,.85)))throw Error('Portal de retorno inacessível.');
 Object.defineProperty(world,'generationMetrics',{value:{topologyMs,materializationMs,validationMs:performance.now()-validationStart,totalMs:performance.now()-start},enumerable:false});
 return world;
}

export function generateFloor(runSeed,floor,hubId,options={}){
 if(!Number.isInteger(floor)||floor<1||floor>10000)throw Error('Andar inválido.');
 const requested=options.environment??environmentFor(runSeed,floor);options={environment:environmentRecord(requested.type??requested),floorRole:options.floorRole??(floor===3?'boss':'normal')};if(!['normal','boss'].includes(options.floorRole))throw Error('Papel de andar inválido.');
 let failure;for(let attempt=0;attempt<3;attempt++){try{const result=materializeFloor(attempt?seedOf(runSeed+':fallback:'+attempt):runSeed,floor,hubId,options);result.runSeed=runSeed;result.generationAttempt=attempt;return result;}catch(error){failure=error;}}throw new Error('Não foi possível gerar um andar válido após 3 tentativas: '+failure.message);
}
