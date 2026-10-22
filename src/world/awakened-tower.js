import {expandOpenTower} from './open-tower.js';
import {AWAKENING as A} from '../domain/tower-awakening.js';
import {seeded,seedOf} from '../domain/random.js';
import {canStand} from './collision.js';
import {layerWorld} from './surfaces.js';
export function awakenTower(source,{population='high',enabled=true}={}){
 const expanded=expandOpenTower(source),w=expanded===source&&!source.awakening?structuredClone(expanded):expanded;if(!enabled||w.floorId<1||w.floorId>3)return w;
 if(w.awakening){if(w.awakening.version!==3||w.awakening.population!==population)throw Error('Composição incompatível');return w;}
 if(!A.populations[population])throw Error('População desconhecida');
 const f=w.floorId,old=w.surfaces[1],r=w.surfaces[0];
 w.awakening={version:3,population,identity:['A Pradaria','Pradaria e Caverna do Lobo Branco','Pradaria e Fortaleza'][f-1]};w.name=w.awakening.identity+' · Andar '+f;
 if(f<3){w.obstacles=w.obstacles.filter(o=>!o.id?.startsWith('ruin-column-'));w.interactables=w.interactables.filter(i=>!i.id.startsWith('lookout-'));w.openTower.structures=[];w.surfaces=[];}
 if(f===2){
  const cave={id:'white-wolf-cave',kind:'deck',x:old.x,z:r.z+r.halfZ+26,halfX:18,halfZ:26,y:-5,obstacles:[]};
  r.top=-5;r.to=cave.id;r.halfX=2.6;w.surfaces=[r,cave];
  cave.obstacles=[{id:'cave-divider-a',shape:'rect',x:cave.x-5,z:cave.z-14,halfX:13,halfZ:1},{id:'cave-divider-b',shape:'rect',x:cave.x+7,z:cave.z-3,halfX:11,halfZ:1},{id:'cave-rock',shape:'circle',x:cave.x+8,z:cave.z+12,radius:1.5}];
  w.awakening.cave={surface:cave.id,ramp:r.id,den:{x:cave.x,z:cave.z+15,y:-5,surface:cave.id},entry:{x:r.x,z:r.z-r.halfZ-2,y:0,surface:'ground'}};
  w.interactables.push({id:'cave-warning',...w.awakening.cave.entry,radius:3,priority:1,label:'Examinar marcas de garras · F',action:'examine',content:{title:'O covil do Lobo Branco',text:'Garras profundas e um uivo distante. Desafio opcional para aventureiros experientes ou em grupo. O portal para o terceiro andar permanece na pradaria.'}});
 }
 if(f===3){old.y=6.4;r.top=6.4;w.awakening.fortress={deck:old.id,ramp:r.id};old.obstacles=[];for(const dx of [-6,6])for(const dz of [-5,5]){const o={id:'fortress-tower-'+dx+'-'+dz,shape:'circle',x:old.x+dx,z:old.z+dz,radius:1.4};w.obstacles.push(o);old.obstacles.push(o);}const lookout=w.interactables.find(i=>i.id==='lookout-3');lookout.y=6.4;lookout.highlightHeight=6.46;}
 w.navRevision++;
 // Campaign keeps its established objectives/rewards. Shared populations are server-owned slots.
 if(w.sharedPolicy){
  w.livingTower.respawn={...A.respawn,clearance:A.respawn.safeDistance};
  const target=A.populations[population][f-1],random=seeded(seedOf(w.runSeed+':awakening:'+f)),existing=w.enemySpawns;
  const valid=(p,radius=.85)=>canStand(layerWorld(w,p.surface??'ground'),p.x,p.z,radius)&&w.interactables.every(i=>Math.hypot(i.x-p.x,i.z-p.z)>6)&&existing.every(e=>(e.position.surface??'ground')!==(p.surface??'ground')||Math.hypot(e.position.x-p.x,e.position.z-p.z)>2.4)&&w.surfaces.filter(s=>s.kind==='ramp').every(s=>Math.abs(p.x-s.x)>s.halfX+2||Math.abs(p.z-s.z)>s.halfZ+2);
  for(const [species,count]of [['slime',target[0]],['wolf',target[1]]]){
   let n=existing.filter(e=>species==='wolf'?e.enemyType==='wolf':e.enemyType!=='wolf').length,tries=0;
   while(n<count&&tries++<20000){const cave=w.surfaces.find(s=>s.id==='white-wolf-cave'),inCave=species==='wolf'&&cave&&n<Math.min(count-2,11),p=inCave?{x:cave.x+(random()-.5)*32,z:cave.z-18+random()*40,y:-5,surface:cave.id}:{x:w.bounds.minX+random()*(w.bounds.maxX-w.bounds.minX),z:w.bounds.minZ+random()*(w.bounds.maxZ-w.bounds.minZ),y:0,surface:'ground'};if(!valid(p))continue;
    const template=existing.find(e=>species==='wolf'?e.enemyType==='wolf':e.enemyType!=='wolf');existing.push({...structuredClone(template),id:w.id+':population-'+species+'-'+n,position:p,overrides:{...template.overrides,optional:true,aggressive:species==='wolf'&&f>1,noRespawn:false}});n++;
   }if(n!==count)throw Error('Não foi possível distribuir população: '+f+' '+species);
  }
  if(f===2){const p=w.awakening.cave.den;existing.push({id:w.id+':white-wolf',enemyType:'whiteWolf',position:p,overrides:{isMiniBoss:true,noRespawn:true,optional:true}});for(let i=0;i<A.boss.reinforcements;i++)existing.push({id:w.id+':reinforcement-'+i,enemyType:'wolf',position:{...p,x:p.x-12+i*12,z:p.z-9},overrides:{reinforcement:true,noRespawn:true,dormant:true,optional:true,rewardXP:0}});}
 }
 return w;
}
