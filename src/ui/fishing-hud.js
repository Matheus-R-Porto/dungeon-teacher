import {FOOD_BUFFS} from '../domain/food.js';
import {lifeXPRequired} from '../domain/life-skills.js';
export class FishingHud {
  constructor(session){this.session=session;this.root=document.createElement('section');this.root.id='fishing-hud';this.root.setAttribute('aria-label','Pesca');this.root.innerHTML='<strong>Life Skills · Pesca</strong><span data-progress></span><span data-cooking-progress></span><span data-mining-progress></span><span data-smithing-progress></span><small data-food-status></small><p role="status" data-state></p><button data-pull>Puxar · F / Espaço</button><button data-cancel>Cancelar · Esc</button>';document.querySelector('#app').append(this.root);this.root.querySelector('[data-pull]').onclick=()=>session.fishing.pull();this.root.querySelector('[data-cancel]').onclick=()=>session.fishing.cancel();this.labels=document.createElement('div');this.labels.id='fishing-labels';document.querySelector('#app').append(this.labels);}
  update(view){
    const s=this.session,f=s.fishing,p=s.combat.character.data.lifeSkills.fishing;
    this.root.hidden=s.game.paused;
    this.root.dataset.phase=f.state;this.root.querySelector('[data-progress]').textContent='Nível '+p.level+' · XP '+p.xp+' / '+lifeXPRequired(p.level);
    const c=s.combat.character.data,cp=c.lifeSkills.cooking;this.root.querySelector('[data-cooking-progress]').textContent='Culinária '+cp.level+' · XP '+cp.xp+' / '+lifeXPRequired(cp.level);const sp=c.lifeSkills.smithing;this.root.querySelector('[data-smithing-progress]').textContent='Ferraria '+sp.level+' · XP '+sp.xp+' / '+lifeXPRequired(sp.level);const mp=c.lifeSkills.mining;this.root.querySelector('[data-mining-progress]').textContent='Mineração '+mp.level+' · XP '+mp.xp+' / '+lifeXPRequired(mp.level);const now=Date.now(),buff=c.foodBuff,cooldown=Math.max(0,Math.ceil(((c.consumableCooldowns?.food??0)-now)/1000));this.root.querySelector('[data-food-status]').textContent=[buff&&buff.expiresAt>now?FOOD_BUFFS[buff.id].name+' · '+Math.ceil((buff.expiresAt-now)/1000)+'s':'',cooldown?'Comida em recarga · '+cooldown+'s':''].filter(Boolean).join(' · ');
    const text=f.busy?f.message:(f.message||'Vara gratuita no Armeiro · pesque nos lagos opcionais.');this.root.querySelector('[data-state]').textContent=text;
    for(const b of this.root.querySelectorAll('button'))b.hidden=!f.active;
    const visible=(s.area.fishingSpots??[]).filter(spot=>Math.hypot(spot.x-s.game.player.x,spot.z-s.game.player.z)<18).map(spot=>({...spot,screen:view.screenPoint(spot.x,.3,spot.z)})).filter(p=>p.screen.visible);
    const signature=visible.map(p=>p.id).join(',');if(signature!==this.signature){this.signature=signature;this.labels.replaceChildren(...visible.map(p=>{const n=document.createElement('span');n.dataset.fishingSpot=p.id;return n;}));}
    this.labels.hidden=s.game.paused||f.busy;
    visible.forEach((p,i)=>{const n=this.labels.children[i];n.style.left=p.screen.x+'px';n.style.top=p.screen.y+'px';const remaining=f.remaining(p);n.textContent=remaining>0?'Água se acalmando · '+Math.ceil(remaining)+'s':'≈ Margem de pesca · F';});
  }
  dispose(){this.root.remove();this.labels.remove();}
}
