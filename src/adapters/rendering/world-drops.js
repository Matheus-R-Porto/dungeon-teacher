import {artSprite} from './art.js';
import {ITEMS} from '../../domain/items/inventory.js';
import {itemArt} from '../../ui/inventory-presentation.js';
import {regionLayer,belowGround} from './cave-visibility.js';

export class WorldDropView {
 constructor(view,onPickup){this.view=view;this.onPickup=onPickup;this.items=new Map();}
 update(drops,player){const ids=new Set(drops.map(d=>d.id));for(const [id,item]of this.items)if(!ids.has(id)){this.remove(item);this.items.delete(id);}
  for(const d of drops){let item=this.items.get(d.id);if(!item){const sprite=artSprite(itemArt(d.item).inventoryIcon,1,1,0,0,.7,.7);sprite.center.set(.5,.1);this.view.scene.add(sprite);const button=document.createElement('button');button.className='online-drop physical-drop-label';button.textContent='Recolher '+(ITEMS[d.item]?.name??d.item)+' ×'+d.quantity;button.onclick=()=>this.onPickup(d.id);document.querySelector('#app').append(button);item={sprite,button};this.items.set(d.id,item);}item.sprite.position.set(d.x,(d.y??0)+.04,d.z);if(this.view.world.awakening?.cave)regionLayer(item.sprite,belowGround(d));const point=this.view.screenPoint(d.x,(d.y??0)+.65,d.z);item.button.hidden=!point.visible||Math.hypot(player.x-d.x,player.z-d.z)>2.6||Math.abs((player.y??0)-(d.y??0))>.75;item.button.style.left=(point.x+35)+'px';item.button.style.top=(point.y+15)+'px';}
 }
 remove(i){i.sprite.removeFromParent();i.sprite.material.map.dispose();i.sprite.material.dispose();i.button.remove();}
 dispose(){for(const i of this.items.values())this.remove(i);this.items.clear();}
}
