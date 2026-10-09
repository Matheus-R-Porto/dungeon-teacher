import {Character} from './character/character.js';
import {Inventory,ITEMS} from './items/inventory.js';
import {gainLifeXP,lifeXPRequired} from './life-skills.js';
import {SMITHING,HAMMERS,QUALITIES,recipeById,gradeHammer,scoreOf,qualityFor,practiceOf} from './smithing.js';
import {seeded,seedOf} from './random.js';

// One forging attempt at a time. The attempt moves through:
//   idle -> heating (cancel is free) -> hammer 1..3 (committed) -> resolving -> idle (with a result)
// Nothing is spent until resolve(): ore, the weapon, XP and practice change in one transaction, so an app close or a
// technical failure at any earlier point leaves the character exactly as it was.
export class SmithingService {
  constructor(character,{save=async()=>{},context=()=>({safe:true,blocked:false}),onChange=()=>{},config=SMITHING}={}){
    Object.assign(this,{character,save,context,onChange,config});
    this.state='idle';this.recipeId=null;this.time=0;this.index=0;this.grades=[];this.centers=[];this.committed=false;this.busy=false;
    this.result=null;this.resultId=0;this.message='';
  }
  get active(){return this.state!=='idle';}
  // Marker position in [0,1] during a hammer window, otherwise 0.
  get marker(){return this.state==='hammer'?Math.min(1,this.time/this.config.sweepSeconds[this.index]):0;}
  get center(){return this.centers[this.index]??null;}
  recipe(id){const r=recipeById(id);if(!r)throw Error('Receita desconhecida.');return r;}
  material(recipe){return recipe.materials.map(m=>({...m,name:ITEMS[m.itemId].name,have:new Inventory(this.character).count(m.itemId)}));}
  // The whole effect of an attempt on a copy of the character; throws before anything real changes.
  prepare(c,recipe,quality,grades=[]){
    const inv=new Inventory(c);
    for(const m of recipe.materials)if(inv.count(m.itemId)<m.quantity)throw Error('Faltam materiais: '+ITEMS[m.itemId].name+' ('+inv.count(m.itemId)+' de '+m.quantity+').');
    for(const m of recipe.materials)inv.remove(m.itemId,m.quantity);
    if(!inv.canAcquire(recipe.outputs[quality]))throw Error('Mochila cheia: libere um espaço para receber a arma.');
    const item=inv.acquire(recipe.outputs[quality]);
    const xp=recipe.xp[quality],levels=gainLifeXP(c.data,'smithing',xp);
    const previous=practiceOf(c.data,recipe.id);if(previous+1>this.config.maxPractice)throw Error('Limite de prática da receita atingido.');
    c.data.smithingMastery[recipe.id]={attempts:previous+1};
    return {item,xp,levels,practice:previous+1,grades:[...grades]};
  }
  // Why an attempt cannot start now, or '' when it can. Never changes anything.
  reason(recipeId){
    try{
      const recipe=this.recipe(recipeId);
      if(!this.character.isAlive)return 'Você não pode forjar enquanto está morto.';
      const ctx=this.context();if(!ctx.safe)return 'A Forja só pode ser usada no Refúgio.';if(ctx.blocked)return 'Aguarde o fim do combate ou da atividade.';
      this.prepare(new Character(this.character.snapshot()),recipe,'GOOD');return '';
    }catch(error){return error.message;}
  }
  start(recipeId){
    if(this.busy||this.active)throw Error('Já existe uma fabricação em andamento.');
    const reason=this.reason(recipeId);if(reason)throw Error(reason);
    const recipe=this.recipe(recipeId),attempts=practiceOf(this.character.data,recipe.id),random=seeded(seedOf('forge:'+recipe.id+':'+attempts+':'+(this.character.data.id??'')));
    // Target positions are fixed here, so the same character and recipe at the same practice always see the same bar.
    this.centers=Array.from({length:HAMMERS},()=>this.config.zoneMin+random()*(this.config.zoneMax-this.config.zoneMin));
    Object.assign(this,{state:'heating',recipeId:recipe.id,time:0,index:0,grades:[],committed:false,result:null});
    this.message='Aquecendo a peça… · Esc cancela sem custo';this.onChange();return {recipeId:recipe.id};
  }
  // Allowed only before the first hammer window opens. After that the attempt must reach a result.
  cancel(){
    if(this.state!=='heating'||this.committed||this.busy)return false;
    Object.assign(this,{state:'idle',recipeId:null,time:0,grades:[],centers:[]});this.message='Fabricação cancelada. Nenhum material foi gasto.';this.onChange();return true;
  }
  update(dt){
    if(!Number.isFinite(dt)||dt<0)throw Error('Tempo de forja inválido.');
    if(!this.active||this.busy)return null;
    this.time+=dt;
    for(let guard=0;guard<16;guard++){
      if(this.state==='heating'&&this.time+1e-9>=this.config.heatSeconds){this.time-=this.config.heatSeconds;Object.assign(this,{state:'hammer',index:0,committed:true});this.message='Martele! · F ou Espaço quando o indicador estiver na zona brilhante';this.onChange();continue;}
      if(this.state==='hammer'&&this.time+1e-9>=this.config.sweepSeconds[this.index]){const left=this.time-this.config.sweepSeconds[this.index];this.land('MISS');this.time=left;continue;}
      if(this.state==='gap'&&this.time+1e-9>=this.config.gapSeconds){this.time-=this.config.gapSeconds;if(this.index+1>=HAMMERS)return this.resolve();this.index++;this.state='hammer';continue;}
      break;
    }
    return null;
  }
  land(grade){this.grades.push(grade);this.state='gap';this.time=0;this.message=({PRECISE:'Golpe preciso!',OK:'Golpe aceitável.',MISS:'Golpe errado.'})[grade];this.onChange();}
  // One hammer. Anything outside a hammer window (heating, between hammers, saving) is ignored, so repeated input cannot count twice.
  strike(){
    if(this.state!=='hammer'||this.busy)return null;
    const grade=gradeHammer(this.marker,this.center,this.config);this.land(grade);return grade;
  }
  async resolve(){
    if(this.busy||this.state==='idle'||this.grades.length!==HAMMERS)return null;
    const recipe=this.recipe(this.recipeId),grades=[...this.grades],score=scoreOf(grades,this.config),quality=qualityFor(score,this.config);
    this.busy=true;this.state='resolving';
    try{
      const draft=new Character(this.character.snapshot()),outcome=this.prepare(draft,recipe,quality,grades);
      await this.save(draft.snapshot());
      this.character.data=draft.snapshot();this.character.recalculate();
      const def=ITEMS[recipe.outputs[quality]],stat=def.forged.damageStat,level=this.character.data.lifeSkills.smithing;
      this.result={id:++this.resultId,ok:true,recipeId:recipe.id,quality,label:QUALITIES[quality].label,tier:QUALITIES[quality].tier,grades,score,itemId:def.id,itemName:def.name,damageStat:stat,damage:def.stats[stat],
        referenceDamage:ITEMS[recipe.baseItemId].stats[stat],oreSpent:recipe.materials.reduce((n,m)=>n+m.quantity,0),xp:outcome.xp,levels:outcome.levels,level:level.level,xpNow:level.xp,xpNeeded:lifeXPRequired(level.level),practice:outcome.practice};
      this.message=this.result.label+'! '+def.name+' · +'+outcome.xp+' Smithing XP'+(outcome.levels?' · FERRARIA NÍVEL '+level.level+'!':'');
      this.onChange();return this.result;
    }catch(error){
      this.result={id:++this.resultId,ok:false,error:error.message};this.message='Fabricação não concluída: '+error.message+' Nada foi consumido.';return this.result;
    }finally{Object.assign(this,{busy:false,state:'idle',recipeId:null,time:0,grades:[],centers:[],committed:false});}
  }
}
