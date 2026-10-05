import {FishingRuntime} from './fishing.js';
import {BALANCE} from '../domain/character/balance.js';
import {canStand} from '../world/collision.js';
import {generateFloor} from '../world/tower.js';
import {EXPEDITION as E,seedOf,earnResources} from '../domain/expedition.js';
import {Inventory} from '../domain/items/inventory.js';
import {FirstSteps} from '../domain/first-steps.js';
import {equippedDefinition} from '../domain/items/inventory.js';
import {validateHub} from '../core/config.js';
import {Game} from './game.js';
import {InteractionSystem} from './interaction.js';
import {Combat} from './combat.js';
import {AttackCycle} from '../domain/combat/attack.js';
import {createEnemies} from '../domain/enemies/spawns.js';
import {EnemyAI} from './enemy-ai.js';
import {AbilityRuntime} from './abilities.js';

export function createAreas(hubData){
  const hub=structuredClone(hubData);
  hub.name='Refúgio do Limiar';hub.safe=true;hub.floorId=null;hub.environment='refuge';hub.enemySpawns=[];hub.returnSpawn={x:0,z:-2};
  const portal=hub.interactables.find(i=>i.id==='tower-portal');portal.action='travel';portal.label='Entrar na Torre · Andar 1';portal.content={areaId:'tower-floor-1'};
  hub.npcs=[{id:'weaponsmith',name:'Armeiro',x:2.4,z:3.5},{id:'cook',name:'Mira · Cozinheira',x:-3,z:6.7}];
 hub.obstacles.push({id:'cook',x:-3,z:6.7,shape:'circle',radius:.4,kind:'npc'},{id:'cooking-station',x:-4,z:4.8,shape:'circle',radius:.65,kind:'cooking'});
 hub.interactables.push({id:'cook',x:-3,z:6.7,radius:2,priority:1,label:'Falar com Mira · Cozinheira',action:'cook',content:{},ignoreObstacles:['cook','cooking-station'],highlightRadius:.7},{id:'cooking-station',x:-4,z:4.8,radius:2,priority:0,label:'Cozinhar no fogão',action:'cook',content:{station:true},ignoreObstacles:['cook','cooking-station'],highlightRadius:.7});
  hub.obstacles.push({id:'weaponsmith',x:2.4,z:3.5,shape:'circle',radius:.4,kind:'npc'});
  hub.interactables.push({id:'weaponsmith',x:2.4,z:3.5,radius:2,priority:1,label:'Conversar com o Armeiro',action:'shop',content:{shopId:'training-weapons'},ignoreObstacles:['weaponsmith'],highlightRadius:.7});
  hub.exits=hub.interactables.filter(i=>i.action==='travel').map(i=>({interactionId:i.id,...i.content}));validateHub(hub);
  return Object.fromEntries([hub,...[1,2,3].map(n=>generateFloor(1,n,hub.id))].map(a=>[a.id,a]));
}

export class AreaSession {
  constructor(areas,character,{seed=null,stress=false,onResourceChange=()=>{},notify=()=>{},onTransition=()=>{}}={}){
    this.run=null;this.seedOverride=seed;this.notify=notify;this.onResourceChange=onResourceChange;this.areas=areas;this.hubId=Object.values(areas).find(a=>a.safe).id;this.stress=stress;this.onTransition=onTransition;this.transitioning=false;
    this.game=new Game(areas[this.hubId]);this.combat=new Combat(this.game,character,{enemies:[],onResourceChange});this.combat.abilities=new AbilityRuntime(this.combat,{notify});
    this.fishing=new FishingRuntime(this,{notify});this.game.activity=this.fishing;this.combat.onHostileImpact=()=>this.fishing.cancel('Pesca interrompida por um ataque!');
    this.quest=new FirstSteps(character,onResourceChange);
    this.combat.onPlayerReturn=()=>this.endRun('failure');this.enter(this.hubId,{initial:true});
  }
  get area(){return this.game.world;}
  get normalsCleared(){return !this.area.safe&&this.objectiveIds.size>0&&[...this.objectiveIds].every(id=>this.defeated.has(id));}
  get complete(){return this.normalsCleared&&(this.area.floorId<3||!!this.run?.bossDefeated);}
  get boss(){return this.combat.enemies.find(e=>e.boss);}
  startRun(){const seed=this.seedOverride??Math.floor(Math.random()*4294967296);const floors=[1,2,3].map(n=>generateFloor(seed,n,this.hubId));for(const floor of floors)this.areas[floor.id]=floor;this.run={seed,floor:1,floors:floors.map(f=>f.seed),encounters:[],completedEncounters:[],graph:null,exploration:[],bossStarted:false,bossDefeated:false,rewardCollected:false,bossTimer:0};this.fishing.reset(seed);this.enter('tower-floor-1');this.notify('Expedição iniciada · Andar 1');}
  endRun(result='abandoned'){this.recordExploration();this.lastRun=this.run?{...this.run,result}:null;this.run=null;this.enter(this.hubId,{returning:true});this.notify(result==='success'?'Expedição concluída! Abra o baú em I e evolua em C.':result==='failure'?'Você voltou ao Refúgio. Recursos e itens preservados.':'Expedição encerrada. Prepare uma nova tentativa.');}
  async collectChest(save){if(this.collecting)return;const drop=this.area.interactables.find(i=>i.id==='boss-chest');if(!this.run?.bossDefeated||this.run.rewardCollected||!drop?.enabled)throw Error('Baú indisponível.');const p=this.game.player;if(Math.hypot(p.x-drop.x,p.z-drop.z)>drop.radius)throw Error('Aproxime-se do baú.');const before=this.combat.character.snapshot();this.collecting=true;this.game.paused=true;try{new Inventory(this.combat.character).acquire('expeditionChest',{rewardSeed:seedOf(this.run.seed+':chest')});await save();this.run.rewardCollected=true;drop.enabled=false;this.notify('BAÚ OBTIDO · Volte ao Refúgio para abrir em I.');}catch(error){this.combat.character.data=before;this.combat.character.recalculate();throw error;}finally{this.collecting=false;this.game.paused=false;}}
  get currentRegion(){return this.area.graph?.regions.find(r=>Math.hypot(this.game.player.x-r.x,this.game.player.z-r.z)<r.radius);}
  get objectiveText(){if(this.area.safe)return '';const r=this.currentRegion,enc=this.run?.encounters.find(e=>e.regionId===r?.id&&e.state!=='completed');if(this.run?.bossStarted&&!this.run.bossDefeated)return 'Clareira do Guardião · derrote o Guardião';if(this.run?.bossDefeated)return this.run.rewardCollected?'Baú obtido · volte pelo portal':'Vitória! Pegue o baú com F';if(enc?.required)return r.name+' · ENCONTRO · '+enc.enemyIds.filter(id=>!this.defeated.has(id)).length+' restantes · a passagem adiante está selada';if(enc)return r.name+' · Encontro opcional · lute por XP ou retorne à trilha';return (r?.name??'Trilha da floresta')+' · '+(this.complete?'Encontre o arco de saída':this.normalsCleared&&this.area.floorId===3?'Siga até a clareira do Guardião':'Atravesse a floresta · siga as pedras douradas');}
  enter(id,{initial=false,returning=false}={}){
    if(this.transitioning)throw Error('Transição em andamento.');this.fishing?.cancel('Pesca encerrada pela troca de área.');const definition=this.areas[id];if(!definition)throw Error('Área desconhecida.');
    // Construct and validate the destination before releasing the current context.
    const world=structuredClone(definition);let spawns=world.enemySpawns;if(this.stress&&!world.safe){spawns=[];for(let z=world.bounds.minZ+2;z<world.bounds.maxZ-1;z+=3)for(let x=world.bounds.minX+2;x<world.bounds.maxX-1;x+=3)if(spawns.length<20&&canStand(world,x,z,.8))spawns.push({id:'stress-'+spawns.length,enemyType:'trainingSlime',position:{x,z},overrides:{noRespawn:true}});spawns.push(...world.enemySpawns.filter(e=>e.overrides?.boss));}
    for(const gate of world.gates??[])world.obstacles.push(gate);
    const enemies=createEnemies(spawns,world),interactions=new InteractionSystem(world,world.interactables),spawn=returning?world.returnSpawn??world.spawn:world.spawn;
    new Game({...world,spawn});
    this.transitioning=true;try{
      const g=this.game,c=this.combat;g.paused=true;c.cancel(true);c.abilities.interrupt('death');c.playerCycle=new AttackCycle();c.enemyCycles.clear();c.events=[];c.lastResult='—';c.deathTime=0;c.pursuitPoint=null;c.pursuitRepath=0;c.state='idle';
      c.enemies=enemies;g.world=world;c.ai=world.safe?null:new EnemyAI(c);g.areaId=world.id;g.floorId=world.floorId;g.inCombat=false;g.interactionTarget=null;Object.assign(g.player,spawn,{heading:Math.PI,moving:false});g.previous={...g.player};
      this.interactions=interactions;this.defeated=new Set();this.objectiveIds=new Set(enemies.filter(e=>!e.boss&&!e.optional).map(e=>e.id));this.rewarded=new Set();this.floorAnnounced=false;if(this.run){this.run.floor=world.floorId;this.run.graph=world.graph;this.run.encounters=(world.encounters??[]).map(e=>({...e,state:'pending'}));this.run.completedEncounters=[];this.run.visitedRegions=[];this.run.floorDistanceStart=g.distance;this.run.floorTimeStart=g.elapsed;}this.returnInteraction=world.interactables.find(i=>i.content.requiresCompletion);
      this.quest.sync(this);if(!initial)this.onTransition(world);g.paused=false;
    }finally{this.transitioning=false;}
  }
  travel(command){const exit=this.area.exits.find(e=>e.interactionId===command.targetId);if(!exit)throw Error('Saída inválida.');
    if(this.area.safe){if(!equippedDefinition(this.combat.character.data))throw Error('Equipe uma arma em I para entrar na Torre.');this.startRun();return;}
    if(exit.abandon){this.endRun();return;}
    if(exit.requiresCompletion&&!this.complete)throw Error('Resolva os encontros obrigatórios para liberar a passagem.');
    if(this.area.floorId===3){if(!this.run?.rewardCollected)throw Error('Pegue o baú antes de voltar.');this.endRun('success');return;}
    this.recordExploration();this.enter(exit.areaId);this.notify('Você chegou ao Andar '+this.area.floorId);
  }
  recordExploration(){if(this.run&&!this.area.safe)this.run.exploration.push({floor:this.area.floorId,seconds:this.game.elapsed-this.run.floorTimeStart,distance:this.game.distance-this.run.floorDistanceStart,regions:[...this.run.visitedRegions],completed:[...this.run.completedEncounters],optionalAlive:this.combat.enemies.filter(e=>e.optional&&e.alive).length});}
  update(dt,axis,azimuth){if(this.game.paused||this.transitioning)return;this.combat.update(dt,axis,azimuth);this.fishing.update(dt);
    for(const enemy of this.combat.enemies){if(enemy.dormant||enemy.alive||this.rewarded.has(enemy.id))continue;this.rewarded.add(enemy.id);
      if(!enemy.boss)this.defeated.add(enemy.id);
      const levels=earnResources(this.combat.character,enemy.rewardXP??0,enemy.rewardGold??0);this.onResourceChange();
      if(enemy.boss&&this.run){this.run.bossDefeated=true;this.area.interactables.push({id:'boss-chest',x:enemy.x,z:enemy.z,radius:2.5,priority:3,action:'chest',label:'Pegar baú',content:{},highlightRadius:.8,enabled:true});this.notify('Guardião derrotado! +'+E.bossXP+' XP · Pegue o baú com F.');}
      else this.notify('+'+(enemy.rewardXP??0)+' XP');
      if(levels)this.notify('NÍVEL '+this.combat.character.data.level+'! +'+levels*BALANCE.pointsPerLevel+' Pontos de Atributo · +'+levels*BALANCE.skillSpacesPerLevel+' Espaço de Habilidade. Pressione TAB para aprender.');
    }
    if(this.run){const region=this.currentRegion;if(region&&!this.run.visitedRegions.includes(region.id)){this.run.visitedRegions.push(region.id);this.notify(region.name+(region.optional?' · desvio opcional':''));}
      for(const encounter of this.run.encounters){if(encounter.state==='completed')continue;if(encounter.regionId===region?.id)encounter.state='active';if(encounter.enemyIds.every(id=>this.defeated.has(id))){encounter.state='completed';this.run.completedEncounters.push(encounter.id);const gate=this.area.gates?.find(g=>g.id===encounter.gateId);if(gate){gate.open=true;this.area.navRevision++;this.notify('CAMINHO LIBERADO · siga a trilha');}}}
      if(this.normalsCleared&&this.area.floorId===3&&!this.run.bossStarted&&this.currentRegion?.type==='boss'){this.run.bossTimer+=dt;if(this.run.bossTimer>=E.bossDelay){const boss=this.boss;boss.dormant=false;boss.hp=boss.stats.maxHP;boss.state='idle';this.run.bossStarted=true;this.combat.ai.acquire(boss,this.combat.character.data.id,'boss-encounter');this.notify('O Slime Guardião apareceu!');}}
    }
    if(this.complete&&!this.floorAnnounced){this.floorAnnounced=true;this.notify(this.area.floorId===3?'Vitória! Pegue o baú e volte ao Refúgio.':'Passagens liberadas · explore ou siga até a saída');}
    if(this.returnInteraction)this.returnInteraction.label=this.complete?(this.area.floorId<3?'Subir para o Andar '+(this.area.floorId+1):'Voltar ao Refúgio'):'Passagem selada · resolva os encontros da trilha';
    const entrance=this.area.interactables.find(i=>i.id==='tower-portal');if(entrance)entrance.label=equippedDefinition(this.combat.character.data)?'Entrar na Torre · nova expedição':'Portal bloqueado · equipe uma arma (I)';this.quest.sync(this);
  }
}
