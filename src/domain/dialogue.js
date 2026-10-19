import {clearSegment} from '../world/collision.js';
export function canTalk(world,player,npc){return !!npc&&Math.hypot(player.x-npc.x,player.z-npc.z)<=npc.radius&&clearSegment({...world,obstacles:world.obstacles.filter(o=>o.id!=='npc-'+npc.id)},player,npc,.025);}
