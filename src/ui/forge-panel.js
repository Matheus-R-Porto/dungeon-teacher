import {SMITHING_RECIPES,QUALITIES,QUALITY_ORDER,SMITHING,HAMMERS,practiceOf} from '../domain/smithing.js';
import {ITEMS} from '../domain/items/inventory.js';
import {lifeXPRequired} from '../domain/life-skills.js';
const STAT={physicalAttack:'Ataque físico',magicAttack:'Ataque mágico'};
const GRADE_TEXT={PRECISE:'preciso',OK:'aceitável',MISS:'errado'};

// Forge dialog: pick a recipe, run the three-hammer minigame, read the result. Presentation only; every rule lives in SmithingService.
export class ForgePanel {
  constructor(service,session,{open,notify}){
    Object.assign(this,{service,session,open,notify});this.selected=SMITHING_RECIPES[0].id;this.shownResult=0;this.showResult=false;this.abort=new AbortController();
    this.dialog=document.createElement('dialog');this.dialog.id='forge-dialog';this.dialog.className='rpg-dialog kitchen-dialog forge-dialog';this.dialog.setAttribute('aria-label','Forja do Refúgio');
    this.dialog.innerHTML='<button class="close-button" data-close aria-label="Sair da forja">×</button><span class="eyebrow">REFÚGIO · FORJA</span><h2>Forja do Refúgio</h2><p data-forge-progress></p><div data-forge-select></div><div data-forge-game hidden></div><div data-forge-result hidden></div><p data-forge-message role="status"></p>';
    document.querySelector('#app').append(this.dialog);
    this.label=document.createElement('div');this.label.id='forge-label';this.label.textContent='Forja · F';document.querySelector('#app').append(this.label);
    this.dialog.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||service.busy)return;
      if(b.dataset.recipe&&!service.active){this.selected=b.dataset.recipe;this.render();}
      // Valueless attributes read as '', so presence is tested with `in`.
      if('start' in b.dataset){try{service.start(this.selected);this.showResult=false;}catch(error){this.say(error.message);}this.render();}
      if('strike' in b.dataset)service.strike();
      if('cancel' in b.dataset){service.cancel();this.render();}
      if('again' in b.dataset){this.showResult=false;this.render();}
    });
    // Before the first hammer, closing is free; afterwards the attempt has to reach its result.
    this.dialog.addEventListener('cancel',event=>{if(service.busy||service.committed)event.preventDefault();else if(service.active)service.cancel();});
    this.dialog.addEventListener('close',()=>{service.cancel();});
    window.addEventListener('keydown',e=>{if(!this.dialog.open||!service.active||e.repeat||e.target.matches('input,select,textarea'))return;if(e.key.toLowerCase()==='f'||e.key===' '){e.preventDefault();e.stopImmediatePropagation();service.strike();}},{capture:true,signal:this.abort.signal});
  }
  say(text){this.dialog.querySelector('[data-forge-message]').textContent=text;}
  show(){this.showResult=false;this.say('Escolha uma receita. Fechar a janela antes do primeiro golpe não gasta nada.');this.render();this.open('forge-dialog');}
  damageLine(recipe){
    const stat=ITEMS[recipe.baseItemId].basicAttack.damageType==='magic'?'magicAttack':'physicalAttack',ref=ITEMS[recipe.baseItemId].stats[stat];
    return QUALITY_ORDER.map(q=>`<span class="forge-q forge-q-${q.toLowerCase()}">${QUALITIES[q].label} ${ITEMS[recipe.outputs[q]].stats[stat]}</span>`).join(' · ').replace('</span> · <span class="forge-q forge-q-good">',`</span> · <span class="forge-q">Armeiro ${ref}</span> · <span class="forge-q forge-q-good">`)+` <small>(${STAT[stat]})</small>`;
  }
  modeOf(){return this.service.active?'game':this.showResult&&this.service.result?.ok?'result':'select';}
  render(){
    const s=this.service,c=s.character,d=c.data,level=d.lifeSkills.smithing,active=s.active,root=this.dialog;this.mode=this.modeOf();
    root.querySelector('[data-close]').disabled=s.busy||s.committed;
    const ore=s.material(SMITHING_RECIPES[0]).find(m=>m.itemId==='rawOre')?.have??0;
    root.querySelector('[data-forge-progress]').textContent=`Ferraria nível ${level.level} · XP ${level.xp} / ${lifeXPRequired(level.level)} · Minério Bruto: ${ore}`;
    const select=root.querySelector('[data-forge-select]'),game=root.querySelector('[data-forge-game]'),result=root.querySelector('[data-forge-result]');
    select.hidden=active||this.showResult;game.hidden=!active;result.hidden=active||!this.showResult;
    if(active){
      const recipe=s.recipe(s.recipeId);
      game.innerHTML=`<h3>${recipe.name}</h3><p data-forge-phase></p><div class="forge-heat"><i data-forge-heat></i></div><div class="forge-pips">${Array.from({length:HAMMERS},(_,i)=>`<span data-pip="${i}">${i+1}</span>`).join('')}</div><div class="forge-meter" role="meter" aria-label="Indicador do martelo" aria-valuemin="0" aria-valuemax="100"><span class="forge-zone-good"></span><span class="forge-zone-perfect"></span><i data-forge-marker></i></div><p class="forge-hint">F ou Espaço quando o indicador estiver na zona brilhante · Esc cancela só antes do primeiro golpe</p><button data-strike>Martelar · F / Espaço</button> <button data-cancel>Cancelar</button>`;
      return;
    }
    if(this.showResult&&s.result?.ok){
      const r=s.result;result.dataset.quality=r.quality;
      result.innerHTML=`<div class="forge-result forge-result-${r.quality.toLowerCase()}"><strong>${r.label}!</strong><h3>${r.itemName}</h3><p>Qualidade ${r.tier} · ${STAT[r.damageStat]} ${r.damage} <small>(Armeiro: ${r.referenceDamage})</small></p><p>Minério consumido: ${r.oreSpent} · +${r.xp} Smithing XP${r.levels?' · <b>FERRARIA NÍVEL '+r.level+'!</b>':''}</p><p>Ferraria ${r.level} · XP ${r.xpNow} / ${r.xpNeeded} · Prática desta receita: ${r.practice} ${r.practice===1?'fabricação':'fabricações'}</p></div><button data-again>Fabricar outra</button>`;
      return;
    }
    const recipe=s.recipe(this.selected),reason=s.reason(recipe.id);
    select.innerHTML=`<div class="recipe-grid">${SMITHING_RECIPES.map(r=>`<article class="recipe-card"><h3>${r.name}</h3><p>${s.material(r).map(m=>`${m.name}: ${m.quantity} <small>(você tem ${m.have})</small>`).join(' · ')}</p><p>Prática: ${practiceOf(d,r.id)}</p><button data-recipe="${r.id}" aria-pressed="${r.id===this.selected}">${r.id===this.selected?'Selecionada':'Selecionar'}</button></article>`).join('')}</div><section class="forge-detail"><h3>${recipe.name}</h3><p>Dano esperado: ${this.damageLine(recipe)}</p><p>O resultado depende só do seu martelo: três golpes, cada um com sua zona. Todas as tentativas gastam o minério, entregam uma arma e rendem Smithing XP.</p>${reason?`<p class="forge-reason">${reason}</p>`:''}<button class="primary-button" data-start ${reason?'disabled':''}>Iniciar fabricação</button></section>`;
  }
  update(dt,view){
    const s=this.service,session=this.session;
    const station=session.area.obstacles?.find(o=>o.id==='forge');this.label.hidden=!station||session.game.paused;
    if(station&&!this.label.hidden){const p=view.screenPoint(station.x,2.1,station.z);this.label.hidden=!p.visible;this.label.style.left=p.x+'px';this.label.style.top=p.y+'px';}
    if(s.active&&!s.busy)s.update(Math.min(dt,.1));
    if(s.result&&s.result.id!==this.shownResult){this.shownResult=s.result.id;if(s.result.ok){this.showResult=true;this.notify(s.message);}this.say(s.message);}
    if(!this.dialog.open)return;
    const mode=this.modeOf();if(mode!==this.mode)this.render();
    if(mode!=='game')return;
    const game=this.dialog.querySelector('[data-forge-game]'),phase=game.querySelector('[data-forge-phase]'),heat=game.querySelector('[data-forge-heat]'),meter=game.querySelector('.forge-meter'),marker=game.querySelector('[data-forge-marker]'),hammer=s.state==='hammer';
    phase.textContent=s.state==='heating'?'Aquecendo a peça…':hammer?`Martelo ${s.index+1} de ${HAMMERS}`:s.state==='gap'?`Golpe ${GRADE_TEXT[s.grades.at(-1)]}`:'Concluindo…';
    heat.style.width=(s.state==='heating'?Math.min(1,s.time/SMITHING.heatSeconds):1)*100+'%';
    meter.dataset.live=String(hammer);
    const c=s.center;if(c!==null){const good=meter.querySelector('.forge-zone-good'),perfect=meter.querySelector('.forge-zone-perfect');good.style.left=(c-SMITHING.goodHalf)*100+'%';good.style.width=SMITHING.goodHalf*200+'%';perfect.style.left=(c-SMITHING.perfectHalf)*100+'%';perfect.style.width=SMITHING.perfectHalf*200+'%';}
    marker.style.left=(hammer?s.marker:0)*100+'%';meter.setAttribute('aria-valuenow',String(Math.round((hammer?s.marker:0)*100)));
    game.querySelectorAll('[data-pip]').forEach((pip,i)=>{pip.dataset.grade=s.grades[i]??(i===s.index&&hammer?'live':'');});
    this.dialog.querySelector('[data-forge-message]').textContent=s.message;
    game.querySelectorAll('button').forEach(b=>{if(b.dataset.cancel)b.disabled=s.committed;if(b.dataset.strike)b.disabled=!hammer;});
  }
  dispose(){this.abort.abort();this.dialog.remove();this.label.remove();}
}
