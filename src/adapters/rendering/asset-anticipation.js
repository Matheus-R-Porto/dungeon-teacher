import {PreparationSlot} from '../../core/preparation-slot.js';
import {bounded} from '../../core/scene-work.js';
import {artTexture,dropUnusedArt} from './art.js';
// Only a public shipped atlas. No arena map, membership, position or state is read.
export class AssetAnticipation {
 constructor(){this.slot=new PreparationSlot();this.next=0;}
 update(world,player,now){if(now<this.next)return;this.next=now+250;const door=world.guardianHall?.door;
  if(!world.arena&&door&&Math.hypot(player.x-door.x,player.z-door.z)<12&&player.surface===door.surface){
   this.slot.request('knight-atlas',1280*640*4,async signal=>{const url='/assets/monsters/oath-knight-v060.svg',texture=artTexture(url,8,4),resource={dispose(){texture.dispose();dropUnusedArt(url);}};try{await bounded(texture.userData.ready(),signal,8500);return resource;}catch(error){resource.dispose();throw error;}});
  }else this.slot.cancel();
 }
 dispose(){this.slot.dispose();}
}
