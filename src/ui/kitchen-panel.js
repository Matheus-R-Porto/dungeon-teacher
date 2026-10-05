import {RECIPES,INGREDIENTS,FOOD_BUFFS,FOOD_CONFIG,effectText} from '../domain/food.js';
import {Inventory,ITEMS} from '../domain/items/inventory.js';
import {lifeXPRequired} from '../domain/life-skills.js';

export class KitchenPanel {
  constructor(service,session,{open,notify}){
    Object.assign(this,{service,session,open,notify});this.mode='recipes';this.message='';this.abort=new AbortController();
    this.dialog=document.createElement('dialog');this.dialog.id='kitchen-dialog';this.dialog.className='rpg-dialog kitchen-dialog';this.dialog.setAttribute('aria-label','Cozinha de Mira');
    this.dialog.innerHTML='<button class="close-button" data-close aria-label="Sair da cozinha">×</button><span class="eyebrow">REFÚGIO · MIRA, COZINHEIRA</span><h2>À mesa, viajante.</h2><p data-kitchen-progress></p><nav class="kitchen-tabs"><button data-mode="recipes">Cozinhar</button><button data-mode="buy">Comprar ingredientes</button><button data-mode="sell">Vender</button></nav><div data-kitchen-content></div><section data-cooking-game hidden><strong>Retire do fogo na zona verde</strong><p>F / Espaço ou botão · centro dourado: Perfeito</p><div class="cooking-meter" role="meter" aria-label="Ponto do preparo" aria-valuemin="0" aria-valuemax="100"><span class="cooking-good"></span><span class="cooking-perfect"></span><i data-cooking-cursor></i></div><p data-cooking-phase></p><button data-finish>Retirar do fogo · F / Espaço</button><button data-cancel-cooking>Cancelar preparo</button></section><p role="status" data-kitchen-message></p>';
    document.querySelector('#app').append(this.dialog);
    this.label=document.createElement('div');this.label.id='cook-label';this.label.textContent='Mira · Cozinheira · F';document.querySelector('#app').append(this.label);
    this.dialog.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||service.busy)return;if(b.dataset.mode){if(service.cooking)return;this.mode=b.dataset.mode;this.message='';this.render();}if(b.dataset.buy)this.action(()=>service.buy(b.dataset.buy,this.quantity()));if(b.dataset.sell)this.action(()=>service.sell(b.dataset.sell,this.quantity()));if(b.dataset.recipe){try{service.start(b.dataset.recipe);this.message='Preparo iniciado. Ingredientes ainda estão na mochila.';this.render();}catch(e){this.message=e.message;this.render();}}if(b.hasAttribute('data-finish'))this.finish();if(b.hasAttribute('data-cancel-cooking')){service.cancel();this.message='Preparo cancelado. Ingredientes preservados.';this.render();}});
    this.dialog.addEventListener('cancel',event=>{if(service.busy)event.preventDefault();else service.cancel();});this.dialog.addEventListener('close',()=>service.cancel());
    window.addEventListener('keydown',e=>{if(!this.dialog.open||!service.cooking||e.repeat||e.target.matches('input,select,textarea'))return;if(e.key.toLowerCase()==='f'||e.key===' '){e.preventDefault();e.stopImmediatePropagation();this.finish();}}, {capture:true,signal:this.abort.signal});
    window.addEventListener('blur',()=>{if(service.cooking&&!service.busy){service.cancel();this.message='Preparo interrompido. Ingredientes preservados.';this.render();}}, {signal:this.abort.signal});
  }
  quantity(){return Number(this.dialog.querySelector('[data-quantity]')?.value??1);}
  show(station=false){this.mode=station?'recipes':this.mode;this.message='Comer recupera recursos; cozinhar melhora o alimento; vender rende ouro.';this.render();this.open('kitchen-dialog');}
  async action(fn){if(this.service.busy)return;try{const operation=fn();this.render();this.message=await operation;this.notify(this.message);}catch(e){this.message=e.message;}this.render();}
  finish(){if(!this.service.cooking||this.service.busy)return;this.action(()=>this.service.resolve());}
  render(){
    const s=this.service,d=s.character.data,inv=new Inventory(s.character),locked=s.busy||!!s.cooking,disabled=locked?'disabled':'';
    this.dialog.querySelector('[data-close]').disabled=s.busy;
    this.dialog.querySelector('[data-kitchen-progress]').textContent=`Culinária nível ${d.lifeSkills.cooking.level} · XP ${d.lifeSkills.cooking.xp} / ${lifeXPRequired(d.lifeSkills.cooking.level)} · Ouro ${d.gold}`;
    for(const b of this.dialog.querySelectorAll('[data-mode]')){b.disabled=locked;b.setAttribute('aria-pressed',String(b.dataset.mode===this.mode));}
    const content=this.dialog.querySelector('[data-kitchen-content]');content.hidden=!!s.cooking;
    const quantity='<label class="quantity-control">Quantidade <input data-quantity type="number" min="1" max="99" value="1" '+disabled+'></label>';
    if(this.mode==='recipes')content.innerHTML='<p>Erro, Bom ou Perfeito: o prato é preservado. A precisão muda apenas o XP. Esc cancela sem gastar ingredientes.</p><div class="recipe-grid">'+RECIPES.map(r=>{const reason=s.recipeReason(r.id);return `<article class="recipe-card"><h3>${r.name}</h3><small>Culinária ${r.minLevel} · ${r.xp} XP no acerto bom</small><ul>${Object.entries(r.ingredients).map(([id,q])=>`<li class="${inv.count(id)<q?'missing':''}">${ITEMS[id].name}: ${inv.count(id)} / ${q}</li>`).join('')}</ul><p>Produz ${r.quantity} × ${ITEMS[r.result].name}</p><p>${effectText(ITEMS[r.result].consume)}</p><small>Venda: ${ITEMS[r.result].baseSellValue} ouro</small><p>${reason||'Ingredientes prontos.'}</p><button data-recipe="${r.id}" ${disabled||reason?'disabled':''}>Preparar ${r.name}</button></article>`;}).join('')+'</div>';
    if(this.mode==='buy')content.innerHTML=quantity+'<div class="recipe-grid">'+INGREDIENTS.map(i=>`<article class="recipe-card"><h3>${i.name}</h3><p>${i.npcBuyValue} ouro por unidade · Mochila: ${inv.count(i.id)}</p><button data-buy="${i.id}" ${disabled}>Comprar ${i.name}</button></article>`).join('')+'</div>';
    if(this.mode==='sell'){const items=d.inventory.slots.filter(i=>ITEMS[i?.definitionId]?.baseSellValue&&ITEMS[i.definitionId].tradeable);content.innerHTML=quantity+'<p>Preço por unidade. A quantidade é retirada da pilha selecionada.</p><div class="recipe-grid">'+(items.map(i=>`<article class="recipe-card"><h3>${ITEMS[i.definitionId].name}</h3><p>Pilha: ${i.quantity} · ${ITEMS[i.definitionId].baseSellValue} ouro por unidade</p><button data-sell="${i.instanceId}" ${disabled}>Vender ${ITEMS[i.definitionId].name}</button></article>`).join('')||'<p>Você ainda não possui produtos para vender.</p>')+'</div>';}
    this.dialog.querySelector('[data-cooking-game]').hidden=!s.cooking;this.dialog.querySelector('[data-kitchen-message]').textContent=this.message;
  }
  update(view){
    const npc=this.session.area.npcs?.find(n=>n.id==='cook');this.label.hidden=!npc||this.session.game.paused;if(npc){const p=view.screenPoint(npc.x,2.5,npc.z);this.label.hidden=!p.visible||this.session.game.paused;this.label.style.left=p.x+'px';this.label.style.top=p.y+'px';}
    if(this.service.cooking){const p=this.service.progress(),meter=this.dialog.querySelector('.cooking-meter');meter.setAttribute('aria-valuenow',String(Math.round(p*100)));meter.dataset.zone=p>=FOOD_CONFIG.perfect[0]&&p<=FOOD_CONFIG.perfect[1]?'perfect':p>=FOOD_CONFIG.good[0]&&p<=FOOD_CONFIG.good[1]?'good':'early';this.dialog.querySelector('[data-cooking-cursor]').style.left=p*100+'%';this.dialog.querySelector('[data-cooking-phase]').textContent=meter.dataset.zone==='perfect'?'PERFEITO · retire agora!':meter.dataset.zone==='good'?'BOM · pode retirar':'Observe o ponto do preparo…';if(p>=1)this.finish();}
  }
  dispose(){this.abort.abort();this.dialog.remove();this.label.remove();}
}
