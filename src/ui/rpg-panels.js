import {Character} from '../domain/character/character.js';
import {TransportUI} from './transport-ui.js';
import {transfer} from '../domain/items/transport.js';
import {discard,pickup,recoverDrop} from '../domain/items/world-drops.js';
import {InventoryView} from './inventory-view.js';
import {effectText,FOOD_CONFIG} from '../domain/food.js';
import {BALANCE} from '../domain/character/balance.js';
import {Inventory,ITEMS,EQUIPMENT_SLOTS,equipmentBlocked} from '../domain/items/inventory.js';
import {purchaseItem} from '../domain/shop.js';
import {ABILITIES,WEAPONS} from '../domain/abilities/definitions.js';
import {NOVICE_TREE,nodeState,learnAbility} from '../domain/abilities/skill-tree.js';
const slotNames={weapon:'Arma',head:'Cabeça',chest:'Peitoral',legs:'Calças',boots:'Botas',ring:'Anel',necklace:'Colar',talisman:'Talismã'};
const statNames={physicalAttack:'Ataque físico',magicAttack:'Ataque mágico',attackSpeed:'Velocidade de ataque',physicalDefense:'Defesa física',magicDefense:'Defesa mágica',maxHP:'HP máximo',maxMP:'MP máximo',evasion:'Esquiva'};
const itemInfo = item => Object.entries(item.stats).map(([key,value])=>`${statNames[key]??key} +${value}`).join(' · ');
export class RpgPanels {
  constructor(character,combat,{open,isBlocked,save,onEquipment,onChest,food,transportContext,transportSave}){
    this.food=food;this.onChest=onChest;this.character=character;this.combat=combat;this.inventory=new Inventory(character);this.openDialog=open;this.save=save;this.onEquipment=onEquipment;this.abort=new AbortController();this.selectedItem=null;this.selectedSkill=NOVICE_TREE[0].id;
    this.dialogs={};for(const [id,title] of [['inventory','Inventário e equipamentos'],['skills','Caminhos do Novato'],['shop','Armeiro do Refúgio']]){
      const dialog=document.createElement('dialog');dialog.id=id+'-dialog';dialog.className='rpg-dialog';dialog.setAttribute('aria-label',title);dialog.innerHTML=`<button class="close-button" aria-label="Fechar ${title}" data-close>×</button><span class="eyebrow">${id==='shop'?'ARMAS DE TREINO · FERRAMENTAS':'NOVATO · BETA 0.1.0'}</span><h2>${title}</h2><div class="rpg-content"></div><p class="rpg-feedback" role="status"></p>`;document.querySelector('#app').append(dialog);this.dialogs[id]=dialog;dialog.addEventListener('click',event=>this.click(id,event));
    }
    // Keep acquisition/consumption feedback visible above the scroll-heavy inventory.
    this.dialogs.inventory.querySelector('.rpg-content').before(this.dialogs.inventory.querySelector('.rpg-feedback'));
    this.inventoryView=new InventoryView(this.dialogs.inventory.querySelector('.rpg-content'));
    this.transport=new TransportUI(this.dialogs.inventory,{data:()=>character.data,context:()=>JSON.stringify([transportContext?.().mapId,transportContext?.().world.seed]),recoverable:()=>transportContext?.().world.safe?character.data.worldDrops:[],blocked:()=>!!this.busy,refresh:()=>this.render('inventory'),run:async a=>{if(this.busy)throw Error('Aguarde a gravação.');if(equipmentBlocked(combat))throw Error('Encerre o combate ou atividade antes de gerenciar a carga.');this.busy=true;try{const draft=new Character(character.snapshot()),bag=new Inventory(draft);if(a.operation==='discard')discard(draft,a.requests,transportContext());else if(a.operation==='recover')recoverDrop(draft,a.id,transportContext());else if(a.operation==='pickup')pickup(draft,a.id,transportContext());else if(a.operation==='transfer')transfer(draft,a.instanceId,a.quantity,a.toCart);else if(a.operation==='equip')bag.equip(a.index,a.slot);else if(a.operation==='reorder'){const slots=draft.data.inventory.slots;[slots[a.from],slots[a.to]]=[slots[a.to],slots[a.from]];}await transportSave(draft.snapshot());for(const key of ['inventory','equipment','cartStorage','worldDrops','equippedWeaponType'])character.data[key]=draft.data[key];character.recalculate();onEquipment();}finally{this.busy=false;}}});
    this.dialogs.inventory.querySelector('.eyebrow').textContent='PERTENCES DO VIAJANTE';
    this.dialogs.inventory.addEventListener('close',()=>this.inventoryView.hideTooltip());
    this.launcher=document.createElement('nav');this.launcher.id='rpg-menu';this.launcher.setAttribute('aria-label','Painéis do jogador');this.launcher.innerHTML='<button data-panel="inventory">Inventário <kbd>I</kbd></button><button data-panel="skills">Habilidades <kbd>TAB</kbd></button>';document.querySelector('.rpg-hud').append(this.launcher);
    this.launcher.onclick=event=>{const id=event.target.closest('[data-panel]')?.dataset.panel;if(id&&!isBlocked())this.show(id);};
    window.addEventListener('keydown',event=>{if(event.repeat||event.ctrlKey||event.altKey||event.metaKey)return;const key=event.key.toLowerCase(),id=key==='i'?'inventory':null;if(!id||event.target.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(this.dialogs[id].open){event.preventDefault();if(!this.busy)this.dialogs[id].close();}else if(!isBlocked()){event.preventDefault();this.show(id);}}, {signal:this.abort.signal});
    // Manual cancellation waits for saving; danger may dismiss only the view.
    for(const dialog of Object.values(this.dialogs))dialog.addEventListener('cancel',event=>{if(this.busy)event.preventDefault();});
  }
  show(id){if(id==='skills'&&this.onSkills){this.onSkills();return;}this.dialogs[id].querySelector('.rpg-feedback').textContent='';this.render(id);if(id==='inventory')this.transport.render();this.openDialog(id+'-dialog');}
  async mutate(id,action){if(this.busy)return;const snapshot=this.character.snapshot();let applied;this.busy=true;this.render(id);try{const message=action();applied=this.character.snapshot();this.render(id);await this.save();this.dialogs[id].querySelector('.rpg-feedback').textContent=message;return true;}catch(error){
    // Combat keeps running in Tower panels. Undo only this UI transaction,
    // preserving HP/MP, XP/levels and resources earned while its save awaited.
    applied??=this.character.snapshot();const data=this.character.data;
    for(const key of ['inventory','cartStorage','worldDrops','equipment','equippedWeaponType','knownAbilities','hotbar'])if(JSON.stringify(snapshot[key])!==JSON.stringify(applied[key]))data[key]=snapshot[key];
    for(const key of ['gold','skillSpaces'])if(Number.isFinite(snapshot[key])&&Number.isFinite(applied[key]))data[key]+=snapshot[key]-applied[key];
    this.character.recalculate();this.onEquipment();this.dialogs[id].querySelector('.rpg-feedback').textContent=error.message;return false;
  }finally{this.busy=false;this.render(id);if(id==='inventory'&&this.transport&&!this.transport.choice)this.transport.render();}}
  click(id,event){const b=event.target.closest('button');if(!b||this.busy)return;if(id==='inventory'&&this.transport.pending.length&&(b.dataset.equip!==undefined||b.dataset.unequip||b.dataset.eat||b.dataset.openChest)){this.transport.status('Conclua ou cancele os descartes antes de alterar os itens.');return;}
    if(b.dataset.item!==undefined){this.selectedItem=Number(b.dataset.item);this.render(id);}
    if(b.dataset.node){this.selectedSkill=b.dataset.node;this.render(id);}
    if(b.dataset.eat){this.eat(b.dataset.eat);return;}
    if(b.dataset.acquire)this.mutate(id,()=>{if(ITEMS[b.dataset.acquire]?.forged)throw Error('Item não vendido aqui.');this.inventory.acquire(b.dataset.acquire);return b.dataset.acquire==='fishingRod'?'Vara guardada na mochila. Procure a margem dos lagos opcionais.':'Arma adicionada ao inventário. Abra I para equipar.';});
    if(b.dataset.buy)this.mutate(id,()=>{const item=purchaseItem(this.character,b.dataset.buy);return item.name+' comprada por '+item.price+' ouro. Guardada na mochila.';});
    if(b.dataset.assign){this.dialogs.skills.close();window.dispatchEvent(new CustomEvent('hotbar-assign',{detail:b.dataset.assign}));return;}
    if(b.dataset.learn)this.mutate(id,()=>{learnAbility(this.character,b.dataset.learn);return 'Habilidade aprendida e disponível na hotbar.';});
    if(b.dataset.openChest){try{this.onChest(b.dataset.openChest);}catch(error){this.dialogs[id].querySelector('.rpg-feedback').textContent=error.message;return false;}return;}
    if(b.dataset.equip!==undefined)this.mutate(id,()=>{this.inventory.equip(Number(b.dataset.equip),ITEMS[this.character.data.inventory.slots[Number(b.dataset.equip)]?.definitionId]?.equipSlot,equipmentBlocked(this.combat));this.onEquipment();return 'Equipamento aplicado. Estatísticas recalculadas.';});
    if(b.dataset.unequip)this.mutate(id,()=>{this.inventory.unequip(b.dataset.unequip,equipmentBlocked(this.combat));this.onEquipment();return 'Equipamento devolvido ao inventário.';});
  }
  async eat(id){if(this.busy)return;this.busy=true;try{const operation=this.food.consume(id);this.render('inventory');const message=await operation;this.dialogs.inventory.querySelector('.rpg-feedback').textContent=message;this.onEquipment();}catch(e){this.dialogs.inventory.querySelector('.rpg-feedback').textContent=e.message;}finally{this.busy=false;this.render('inventory');}}
  updateFoodUI(){if(!this.dialogs.inventory.open)return;const b=this.dialogs.inventory.querySelector('[data-eat]');if(!b)return;const wait=this.food.remaining();b.disabled=!!this.busy||wait>0;b.textContent=wait>0?'Comida em recarga · '+Math.ceil(wait)+'s':'Comer';}
  render(id){const root=this.dialogs[id].querySelector('.rpg-content'),d=this.character.data,busy=this.busy?'disabled':'',blocked=equipmentBlocked(this.combat);this.dialogs[id].querySelector('[data-close]').disabled=!!this.busy;
    if(id==='shop')root.innerHTML=`<p>Experimente os quatro estilos. Uma cópia de cada arma por personagem. Adquirir não equipa a arma. Ferramentas ficam na mochila e não ocupam o slot de arma.</p><p><strong>Ouro: ${d.gold}</strong></p><div class="shop-grid">`+Object.values(ITEMS).filter(i=>(i.type==='weapon'&&!i.forged)||i.type==='tool'||['backpack','cart'].includes(i.equipSlot)).map(item=>{const owned=this.inventory.owns(item.id),paid=item.price>0,poor=paid&&d.gold<item.price;return `<article class="item-card"><span class="item-symbol">${item.icon}</span><h3>${item.name}</h3><p>${item.description}</p><p>${itemInfo(item)}</p><small>${paid?item.price+' ouro':'Gratuito'} · ${item.type==='tool'?'Ferramenta de exploração':['backpack','cart'].includes(item.equipSlot)?'Equipamento de transporte':'Arma de treino'}</small><button ${paid?'data-buy':'data-acquire'}="${item.id}" ${busy||owned||poor?'disabled':''}>${owned?'Já possuído':poor?'Ouro insuficiente ('+item.price+')':paid?'Comprar por '+item.price+' ouro':'Adquirir gratuitamente'}</button></article>`;}).join('')+'</div>';
    if(id==='inventory')this.inventoryView.update(d,{busy:!!this.busy,blocked:!!blocked,cooldown:this.food?.remaining()??0});
    if(id==='skills'){
      const selected=NOVICE_TREE.find(n=>n.id===this.selectedSkill),a=ABILITIES[selected.abilityId],state=nodeState(this.character,selected);
      root.innerHTML='<p>Cinco estilos para experimentar. Aprender um caminho não bloqueia os outros. Cada nível concede um Espaço de Habilidade.</p><p><strong>Espaços de Habilidade: '+d.skillSpaces+'</strong></p><div class="novice-root">NOVATO <small>Experimente seus caminhos</small></div><div class="skill-tree">'+NOVICE_TREE.map(node=>{const a=ABILITIES[node.abilityId],state=nodeState(this.character,node);return `<button class="skill-node ${state} ${node.id===this.selectedSkill?'selected':''}" data-node="${node.id}" ${busy}><span class="item-symbol">${a.icon}</span><small>${node.branch}</small><strong>${a.name}</strong><span>${{learned:'Aprendida',available:'Disponível',locked:'Indisponível',unlearned:'Não aprendida'}[state]}</span></button>`;}).join('')+`</div><section class="skill-detail"><h3>${a.name}</h3><p>${a.description}</p><p>${a.weaponRequirements.length?'Requer '+a.weaponRequirements.map(w=>WEAPONS[w].name).join(', '):'Sem requisito de arma'} · MP ${a.manaCost} · Recarga ${a.cooldown}s${a.requiresTarget?' · Alcance '+a.range:' · Alcance: pessoal'}</p><p>Custo: ${BALANCE.skillCost} Espaço de Habilidade</p>${state==='learned'?'<button data-assign="'+a.id+'">Colocar na hotbar</button>':''}${state==='unlearned'?'<p>Você precisa de 1 Espaço de Habilidade.</p>':''}<button class="primary-button" data-learn="${a.id}" ${busy||state!=='available'?'disabled':''}>${state==='learned'?'Aprendida':'Aprender'}</button></section>`;
    }
  }
  dispose(){this.transport.dispose();this.inventoryView.dispose();this.abort.abort();this.launcher.remove();Object.values(this.dialogs).forEach(d=>d.remove());}
}
