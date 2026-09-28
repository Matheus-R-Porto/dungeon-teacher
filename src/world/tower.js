import {generateEncounter} from '../domain/enemies/encounters.js';
import {seedOf,seeded,EXPEDITION as E} from '../domain/expedition.js';
import {validateHub} from '../core/config.js';
import {canStand} from './collision.js';
import {findPath} from './navigation.js';

export function generateFloor(runSeed,floor,hubId){
  if(!Number.isInteger(floor)||floor<1||floor>3)throw Error('Andar inválido.');
  const seed=seedOf(`${runSeed}:${floor}`),random=seeded(seed),extent=10+floor*2;
  const world={id:'tower-floor-'+floor,name:'Torre · Andar '+floor,safe:false,floorId:floor,seed,runSeed,environment:'dungeon',bounds:{minX:-extent,maxX:extent,minZ:-extent,maxZ:extent},spawn:{x:0,z:extent-4},portal:{x:0,z:-extent+3,interactRadius:2.6},npcs:[],zones:[],obstacles:[],enemySpawns:[],interactables:[]};
  // Disjoint modules keep a wide central avenue and transverse routes open.
  for(const x of [-extent+4,extent-4])for(const z of [-extent+5,0,extent-5])if(random()>.25)world.obstacles.push({id:`module-${x}-${z}`,shape:'rect',x,z,halfX:.6+random()*.65,halfZ:.5+random()*.6,kind:'wall'});
  const candidates=[];
  for(let z=extent-7;z>=-extent+6;z-=4)for(const x of [-5,0,5])if(canStand(world,x,z,.8)&&findPath(world,world.spawn,{x,z},.85))candidates.push({x,z});
  // Fisher-Yates keeps sampling bounded and reproducible.
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  world.encounter=generateEncounter(runSeed,floor,E.counts[floor-1]);
  world.enemySpawns=candidates.slice(0,E.counts[floor-1]).map((position,i)=>({id:`floor-${floor}-slime-${i+1}`,enemyType:world.encounter[i].enemyType,position,overrides:{aggressive:false,ambient:true,noRespawn:true,ambientSeed:seedOf(`${seed}:${i}`),rewardXP:E.xp[floor-1],rewardGold:E.enemyGold,stats:{maxHP:Math.round(E.hp[floor-1]*world.encounter[i].hpScale),physicalAttack:E.attack[floor-1]}}}));
  if(world.enemySpawns.length!==E.counts[floor-1])throw Error('Sem posições suficientes para inimigos.');
  if(floor===3)world.enemySpawns.push({id:'tower-boss',enemyType:'trainingSlime',position:{x:0,z:-extent+3},overrides:{name:'Slime Guardião',boss:true,dormant:true,noRespawn:true,aggressive:true,radius:.85,scale:2,detectionRange:100,leashRange:100,rewardXP:E.bossXP,rewardGold:0,stats:{maxHP:E.bossHP,physicalAttack:E.bossAttack,attackSpeed:.65,attackRange:1.8}}});
  world.interactables=[{id:'return-portal',...world.portal,radius:2.6,priority:1,label:'Saída bloqueada · derrote os inimigos',action:'travel',content:{areaId:floor===3?hubId:'tower-floor-'+(floor+1),requiresCompletion:true},highlightRadius:2.4},{id:'abandon-run',...world.spawn,radius:2,priority:0,label:'Abandonar expedição · voltar ao Refúgio',action:'travel',content:{areaId:hubId,abandon:true},highlightRadius:.7}];
  world.exits=world.interactables.map(i=>({interactionId:i.id,...i.content}));
  validateHub(world);
  for(const point of [world.spawn,world.portal,...world.enemySpawns.map(s=>s.position)])if(!canStand(world,point.x,point.z,.85)||!findPath(world,world.spawn,point,.85))throw Error('Layout inacessível.');
  return world;
}
