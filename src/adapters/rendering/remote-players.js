import {SpriteActor} from './sprite-actor.js';
import {NET} from '../../../shared/multiplayer.js';

export class RemotePlayers {
  constructor(view,client){this.view=view;this.client=client;this.actors=new Map();}
  remove(id){const item=this.actors.get(id);if(!item)return;item.actor.dispose();item.actor.sprite.material.dispose();item.actor.shadow.geometry.dispose();item.actor.shadow.material.dispose();this.view.scene.remove(item.actor.sprite,item.actor.shadow);item.label.remove();this.actors.delete(id);}
  update(reducedMotion=false){
    for(const id of this.actors.keys())if(!this.client.remotes.has(id))this.remove(id);
    const now=performance.now();
    for(const [id,remote] of this.client.remotes){
      let item=this.actors.get(id);
      if(!item){const label=document.createElement('span');label.className='remote-name';label.textContent=remote.name;document.querySelector('#app').append(label);item={actor:new SpriteActor(this.view.scene),label};item.actor.sprite.material.color.setHex(0xb7e9ff);this.actors.set(id,item);}
      const state=remote.sample(now,NET.interpolationMs);
      item.actor.update(state,this.view.azimuth,now/1000,reducedMotion);
      const point=this.view.screenPoint(state.x,2.5,state.z);item.label.hidden=!point.visible;item.label.style.left=point.x+'px';item.label.style.top=point.y+'px';
    }
  }
  dispose(){for(const id of this.actors.keys())this.remove(id);}
}
