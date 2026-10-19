import {playerHudMarkup,updatePlayerHud} from './player-hud.js';
import { ATTRIBUTES, BALANCE } from '../domain/character/balance.js';
import { calculateStats } from '../domain/character/stats.js';

const labels = {maxHP:'HP máximo',maxMP:'MP máximo',physicalAttack:'Ataque físico',magicAttack:'Ataque mágico',physicalDefense:'Defesa física',magicDefense:'Defesa mágica',attackSpeed:'Velocidade de ataque / s',accuracy:'Precisão %',evasion:'Esquiva %',criticalChance:'Crítico %',carryCapacity:'Capacidade de carga',hpRegen:'Regeneração HP / s',mpRegen:'Regeneração MP / s'};
const number = n => Number(n.toFixed(3)).toLocaleString('pt-BR');
export class CharacterPanel {
  constructor(character, {onChange, context, open, debug, testProfile,onReset,notify=()=>{}}) {
    this.character=character; this.onChange=onChange; this.context=context; this.draft={};
    this.hud=document.querySelector('.character');
    this.hud.innerHTML=playerHudMarkup();
    this.dialog=document.createElement('dialog'); this.dialog.id='character-dialog';
    this.dialog.innerHTML=`<button class="close-button" aria-label="Fechar personagem" data-close>×</button><span class="eyebrow">REFÚGIO · PERSONAGEM</span><h2 id="character-identity"></h2><p id="character-resources"></p><div class="character-columns"><section><h3>Atributos <small id="attribute-points"></small></h3><p class="attribute-hint">Cada nível concede pontos. Distribua no Refúgio, sem gastar XP ou ouro.</p><div class="attribute-list">${Object.entries(ATTRIBUTES).map(([key,a])=>`<div class="attribute-row"><span tabindex="0" title="${a.description}"><b>${a.label}</b> ${a.name}<small>${a.description}</small></span><output id="attribute-${key}"></output><button data-minus="${key}" aria-label="Remover ponto de ${a.label}">−</button><button data-plus="${key}" aria-label="Adicionar ponto a ${a.label}">+</button></div>`).join('')}</div><div class="attribute-actions"><button id="confirm-attributes" class="primary-button">Confirmar</button><button id="cancel-attributes">Cancelar distribuição</button></div><p id="character-feedback" role="status"></p></section><section><h3>Estatísticas</h3><dl class="character-stats">${Object.entries(labels).map(([key,label])=>`<dt>${label}</dt><dd id="stat-${key}"></dd>`).join('')}</dl></section></div><details id="character-debug" ${debug?'':'hidden'}><summary>Ferramentas de teste</summary><p>Alteram o personagem deste perfil e são salvas.</p><div>${[['xp50','+50 XP'],['xp500','+500 XP'],['damage','Causar 10 de dano'],['hp','Restaurar HP'],['spend','Gastar 10 MP'],['mp','Restaurar MP'],['points','Conceder 5 pontos'],['reset','Reiniciar personagem deste perfil']].map(([key,label])=>`<button data-debug="${key}">${label}</button>`).join('')}</div></details>`;
    document.querySelector('#app').append(this.dialog);
    document.querySelector('#character-button').onclick=()=>open();
    this.dialog.addEventListener('cancel',e=>{if(this.busy)e.preventDefault();});
    this.dialog.addEventListener('close',()=>{this.draft={};});
    this.dialog.addEventListener('click',event=>{
      const b=event.target.closest('button'); if(!b||this.busy)return;
      if(b.dataset.debug==='reset'){this.busy=true;this.render();onReset().catch(error=>{this.busy=false;this.render();this.status(error.message);});return;}
      if(b.dataset.plus){const key=b.dataset.plus;if(this.remaining>0&&character.data.attributes[key]+(this.draft[key]??0)<BALANCE.maxAttribute)this.draft[key]=(this.draft[key]??0)+1;this.render();}
      if(b.dataset.minus){const key=b.dataset.minus;this.draft[key]=Math.max(0,(this.draft[key]??0)-1);this.render();}
      if(b.id==='cancel-attributes'){this.draft={};this.render();}
      if(b.id==='confirm-attributes')this.mutate(()=>{character.allocate(this.draft,context());this.draft={};return 'Atributos confirmados.';});
      if(b.dataset.debug)this.mutate(()=>{switch(b.dataset.debug){case 'xp50':case 'xp500': {const count=character.gainXP(b.dataset.debug==='xp50'?50:500);return count?`Você alcançou o nível ${character.data.level}! +${count*BALANCE.pointsPerLevel} pontos.`:'Experiência recebida.';}case 'damage':character.damage(10);break;case 'hp':character.restoreHP();break;case 'spend':if(!character.spendMP(10))return 'MP insuficiente.';break;case 'mp':character.restoreMP();break;case 'points':character.data.attributePoints=Math.min(BALANCE.maxPoints,character.data.attributePoints+BALANCE.pointsPerLevel);break;}return 'Teste aplicado.';});
    });
    this.updateHUD(); this.render();
  }
  get remaining(){return this.character.data.attributePoints-Object.values(this.draft).reduce((a,b)=>a+b,0);}
  async mutate(action){
    const before=this.character.snapshot();this.busy=true;
    try{const message=action();this.render();await this.onChange();this.dialog.querySelector('#character-feedback').textContent=message;}
    catch(error){this.character.data=before;this.character.recalculate();this.draft={};this.dialog.querySelector('#character-feedback').textContent=error.message;}
    finally{this.busy=false;this.render();this.updateHUD();}
  }
  status(text){document.querySelector('#save-status').textContent=text;}
  updateHUD(){const c=this.character,d=c.data;updatePlayerHud({...d,className:c.className,maxHP:c.stats.maxHP,maxMP:c.stats.maxMP,nextXP:c.nextLevelXP});}
  render(){this.dialog.querySelector('[data-close]').disabled=!!this.busy;const c=this.character,d=c.data,$=id=>this.dialog.querySelector(`#${id}`);$('character-identity').textContent=`${d.name} · ${c.className} · Nível ${d.level}`;$('character-resources').textContent=`HP ${Math.floor(d.hp)} / ${c.stats.maxHP} · MP ${Math.floor(d.mp)} / ${c.stats.maxMP} · XP ${d.xp} · Ouro ${d.gold} · Espaços de Habilidade ${d.skillSpaces} · Maior andar concluído ${d.tower.highestClearedFloor}`;$('attribute-points').textContent=`${this.remaining} pontos disponíveis`;const allowed=this.context().safeHub&&!this.context().inCombat;
    for(const key of Object.keys(ATTRIBUTES)){const pending=this.draft[key]??0;$(`attribute-${key}`).textContent=`${d.attributes[key]}${pending?` +${pending}`:''}`;this.dialog.querySelector(`[data-plus="${key}"]`).disabled=this.busy||!allowed||this.remaining<=0||d.attributes[key]+pending>=BALANCE.maxAttribute;this.dialog.querySelector(`[data-minus="${key}"]`).disabled=this.busy||!pending;}
    const preview=c.snapshot();for(const [key,value] of Object.entries(this.draft))preview.attributes[key]+=value;const stats=calculateStats(preview,c.modifiers);for(const key of Object.keys(labels))$(`stat-${key}`).textContent=number(c.stats[key])+(stats[key]!==c.stats[key]?` → ${number(stats[key])}`:'');
    $('confirm-attributes').disabled=this.busy||!allowed||this.remaining===d.attributePoints;this.dialog.querySelectorAll('[data-debug]').forEach(b=>b.disabled=!!this.busy);
  }
}
