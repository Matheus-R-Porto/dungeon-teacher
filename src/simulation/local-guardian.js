import {OathKnight} from './oath-knight.js';
import {GUARDIAN} from '../../shared/guardian.js';

// Adapter only: the same encounter controller and timings run in both modes.
export function localGuardian(combat){
 const player={id:combat.character.data.id,character:combat.character,game:combat.game};
 const world={map:combat.game.world,enemies:combat.enemies,players:new Map([[player.id,player]]),time:0,
 impact(source,target,stats){combat.basicImpact({damageType:'physical'},stats,combat.game.player,'enemy');}};
 const boss=new OathKnight(world);combat.guardian=boss;combat.retaliation=false;
 return {debug:false,onDamaged(){},playerDied(){boss.projectiles=[];},update(dt){world.time+=dt;if(world.time>=GUARDIAN.introSeconds&&boss.state==='intro'){boss.state='active';boss.e.special=null;}boss.step(dt);}};
}
