import {FOOD_BUFFS} from '../domain/food.js';
import {lifeXPRequired} from '../domain/life-skills.js';
export class FishingHud {
  constructor(session){this.session=session;this.root=document.createElement('section');this.root.id='fishing-hud';this.root.setAttribute('aria-label','Pesca');this.root.innerHTML='<strong>Life Skills · Pesca</strong><span data-progress></span><span data-cooking-progress></span><span data-mining-progress></span><span data-smithing-progress></span><small data-food-status></small><p role="status" data-state></p><button data-pull>Puxar · F / Espaço</button><button data-cancel>Cancelar · Esc</button>';document.querySelector('#app').append(this.root);this.root.querySelector('[data-pull]').onclick=()=>session.fishing.pull();this.root.querySelector('[data-cancel]').onclick=()=>session.fishing.cancel();this.labels=document.createElement('div');this.labels.id='fishing-labels';document.querySelector('#app').append(this.labels);}
  update(view){
    const s=this.session,f=s.fishing,p=s.combat.character.data.lifeSkills.fishing;
    this.root.hidden=s.game.paused||!f.busy;
    this.root.dataset.phase=f.state;this.root.querySelector('[data-progress]').textContent='Nível '+p.level+' · XP '+p.xp+' / '+lifeXPRequired(p.level);
    const c=s.combat.character.data,cp=c.lifeSkills.cooking;this.root.querySelector('[data-cooking-progress]').textContent='Culinária '+cp.level+' · XP '+cp.xp+' / '+lifeXPRequired(cp.level);const sp=c.lifeSkills.smithing;this.root.querySelector('[data-smithing-progress]').textContent='Ferraria '+sp.level+' · XP '+sp.xp+' / '+lifeXPRequired(sp.level);const mp=c.lifeSkills.mining;this.root.querySelector('[data-mining-progress]').textContent='Mineração '+mp.level+' · XP '+mp.xp+' / '+lifeXPRequired(mp.level);const now=Date.now(),buff=c.foodBuff,cooldown=Math.max(0,Math.ceil(((c.consumableCooldowns?.food??0)-now)/1000));this.root.querySelector('[data-food-status]').textContent=[buff&&buff.expiresAt>now?FOOD_BUFFS[buff.id].name+' · '+Math.ceil((buff.expiresAt-now)/1000)+'s':'',cooldown?'Comida em recarga · '+cooldown+'s':''].filter(Boolean).join(' · ');
    const text=f.busy?f.message:(f.message||'Vara gratuita no Armeiro · aproxime-se da água e pressione F.');this.root.querySelector('[data-state]').textContent=text;
    for(const b of this.root.querySelectorAll('button'))b.hidden=!f.active;
    this.labels.hidden=true;

  }
  dispose(){this.root.remove();this.labels.remove();}
}
