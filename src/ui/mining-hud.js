import {MINING,PICKAXE} from '../domain/mining.js';
import {Inventory} from '../domain/items/inventory.js';
// Timing bar for the pickaxe swing plus floating labels over nearby veins. Presentation only: all rules live in MiningRuntime.
export class MiningHud {
  constructor(session){
    this.session=session;
    this.root=document.createElement('section');this.root.id='mining-hud';this.root.setAttribute('aria-label','Mineração');this.root.hidden=true;
    this.root.innerHTML='<strong>MINERAÇÃO</strong><div class="mining-meter" role="meter" aria-label="Indicador do golpe" aria-valuemin="0" aria-valuemax="100"><span class="mining-good"></span><span class="mining-perfect"></span><i></i></div><p role="status" data-state></p><button data-strike>Golpear · F / Espaço</button><button data-cancel>Cancelar · Esc</button>';
    document.querySelector('#app').append(this.root);
    this.meter=this.root.querySelector('.mining-meter');this.good=this.root.querySelector('.mining-good');this.perfect=this.root.querySelector('.mining-perfect');this.cursor=this.root.querySelector('i');
    this.root.querySelector('[data-strike]').onclick=()=>session.mining.strike();this.root.querySelector('[data-cancel]').onclick=()=>session.mining.cancel();
    this.labels=document.createElement('div');this.labels.id='mining-labels';document.querySelector('#app').append(this.labels);
  }
  update(view){
    const s=this.session,m=s.mining,c=MINING;
    this.root.hidden=s.game.paused||!m.active;
    if(m.active){
      this.root.dataset.phase=m.state;
      this.good.style.left=(m.center-c.goodHalf)*100+'%';this.good.style.width=c.goodHalf*200+'%';
      this.perfect.style.left=(m.center-c.perfectHalf)*100+'%';this.perfect.style.width=c.perfectHalf*200+'%';
      const position=m.indicator;this.cursor.style.left=position*100+'%';this.meter.setAttribute('aria-valuenow',String(Math.round(position*100)));
      this.root.querySelector('[data-state]').textContent=m.state==='prepare'?'Prepare o golpe…':'Pressione F ou Espaço quando o indicador estiver na zona dourada.';
    }
    const player=s.game.player,veins=(s.area.mineralVeins??[]).filter(v=>Math.hypot(v.x-player.x,v.z-player.z)<18).map(v=>({...v,screen:view.screenPoint(v.x,2.9,v.z)})).filter(v=>v.screen.visible);
    const signature=veins.map(v=>v.id).join(',');
    if(signature!==this.signature){this.signature=signature;this.labels.replaceChildren(...veins.map(v=>{const n=document.createElement('span');n.dataset.vein=v.id;return n;}));}
    this.labels.hidden=s.game.paused||m.busy;
    if(this.labels.hidden)return;
    const owns=new Inventory(s.combat.character).owns(PICKAXE);
    veins.forEach((v,i)=>{const n=this.labels.children[i],near=Math.hypot(v.x-player.x,v.z-player.z)<=c.interactionRadius,remaining=m.remaining(v);n.style.left=v.screen.x+'px';n.style.top=v.screen.y+'px';n.dataset.state=v.state;
      n.textContent=v.state==='exhausted'?'◇ Veio esgotado':!owns?'◆ Veio mineral · precisa de picareta':remaining>0?'◆ Veio mineral · recuperando o fôlego':near?'◆ Veio mineral · F para minerar':'◆ Veio mineral';});
  }
  dispose(){this.root.remove();this.labels.remove();}
}
