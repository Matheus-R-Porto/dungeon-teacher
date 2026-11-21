import {RANKED_SKILLS} from '../domain/abilities/ranked-skills.js';
import {CLASS_PATHS} from '../domain/abilities/class-skills.js';
import {lineage} from '../domain/character/professions.js';
// Foreground positions are independent of background art and progression rules.
// Future crowns are optional presentation layers, with no reserved skill slots.
export const TREE_STAGES=Object.freeze({roots:{kind:"novice"},trunk:{kind:"first-class"},crown:null});
export const TREE_WIDTH=720,ROOT_OFFSET=960;
const novicePositions=[[175,225],[270,160],[360,80],[450,160],[545,225],[80,445],[210,470],[360,480],[510,470],[640,445]];
const roots=Object.values(RANKED_SKILLS).filter(s=>s.classId==='novice');
const offsets={warrior:[0,0,0],archer:[-10,0,10],rogue:[25,15,25],priest:[0,0,0],mage:[15,0,-15]};
export function treeClass(jobs){return [...lineage(jobs.active)].reverse().find(id=>CLASS_PATHS[id])??'novice';}
export function treeLayout(jobs){
 const classId=treeClass(jobs),grown=classId!=='novice',shift=grown?ROOT_OFFSET:0,nodes=roots.map((s,i)=>({id:s.id,x:novicePositions[i][0],y:novicePositions[i][1]+shift,root:true}));
 if(grown)for(const s of Object.values(RANKED_SKILLS).filter(s=>s.classId===classId)){
  let x,y;if(typeof s.path==='number'){x=[155,360,565][s.path]+offsets[classId][s.path];y=[800,620,440,270][s.tier];}
  else {x=s.ranks.length===1?360:[170,360,550][s.tier];y=s.ranks.length===1?55:150;}
  nodes.push({id:s.id,x,y,root:false});
 }
 return {classId,width:TREE_WIDTH,height:grown?1480:540,rootOffset:shift,nodes,links:nodes.flatMap(n=>RANKED_SKILLS[n.id].requires.map(r=>({from:r.id,to:n.id,rank:r.level}))),stages:TREE_STAGES,art:'/assets/skill-tree-v38/'+(grown?'origin':'novice')+'.png'};
}
