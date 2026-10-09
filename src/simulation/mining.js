import {MINING,PICKAXE,RAW_ORE,indicatorAt,strikeResult} from '../domain/mining.js';
import {gainLifeXP} from '../domain/life-skills.js';
import {Inventory,ITEMS,equipmentBlocked} from '../domain/items/inventory.js';
import {seeded,seedOf} from '../domain/random.js';

// Same shape as FishingRuntime: simulation-time timing, staged grant, one save, no late callbacks.
export class MiningRuntime {
  constructor(session,{notify=()=>{},save=async()=>{},config=MINING}={}){
    this.session=session;this.character=session.combat.character;this.notify=notify;this.save=save;this.config=config;
    this.state='idle';this.time=0;this.cooldowns=new Map();this.message='';this.pending=null;this.vein=null;this.area=null;
    this.reset(0);
  }
  get active(){return this.state==='prepare'||this.state==='strike';}
  get busy(){return this.active||!!this.pending;}
  // Position of the sweeping indicator in [0,1]; 0 while the swing is still being prepared.
  get indicator(){return this.state==='strike'?indicatorAt(this.time-this.strikeAt,this.config):0;}
  reset(seed){this.cancel('Mineração encerrada.');this.random=seeded(seedOf(seed+':mining-attempts'));this.attempts=0;this.cooldowns.clear();}
  remaining(vein){return Math.max(0,(this.cooldowns.get(vein.id)??0)-this.time);}
  say(message){this.message=message;this.notify(message);}
  start(id){
    const s=this.session,g=s.game,c=s.combat;
    if(this.busy)return false;
    if(s.fishing.busy)throw Error('Termine a pesca antes de minerar.');
    const vein=s.area.mineralVeins?.find(v=>v.id===id);
    if(!vein||!s.run||!this.character.isAlive)throw Error('Veio mineral indisponível.');
    if(vein.state!=='available')throw Error('Este veio já foi minerado.');
    if(equipmentBlocked(c))throw Error('Você não pode minerar durante o combate.');
    const inv=new Inventory(this.character);
    if(!inv.owns(PICKAXE))throw Error('Você precisa de uma picareta para minerar.');
    if(!inv.canAcquire(RAW_ORE))throw Error('Sua mochila está cheia.');
    if(this.remaining(vein)>1e-8)throw Error('Recupere o fôlego antes de golpear de novo.');
    if(Math.hypot(g.player.x-vein.x,g.player.z-vein.z)>this.config.interactionRadius)throw Error('Aproxime-se do veio mineral.');
    c.cancel(true);this.vein=vein;this.area=s.area;this.damageRevision=this.character.damageRevision;
    this.center=this.config.zoneMin+this.random()*(this.config.zoneMax-this.config.zoneMin);
    this.attempts++;this.started=this.time;this.strikeAt=this.time+this.config.prepareSeconds;this.endsAt=this.strikeAt+this.config.timeoutSeconds;
    this.state='prepare';g.player.heading=Math.atan2(vein.x-g.player.x,vein.z-g.player.z);g.player.moving=false;g.cancel();
    this.say('Minerando… · prepare o golpe · Esc cancela');return true;
  }
  finish(message,cooldown=true){if(this.vein&&cooldown)this.cooldowns.set(this.vein.id,this.time+this.config.retrySeconds);this.state='idle';this.say(message);}
  cancel(message='Mineração cancelada.'){if(this.active)this.finish(message,false);}
  update(dt){
    if(!Number.isFinite(dt)||dt<0)throw Error('Tempo de mineração inválido.');this.time+=dt;
    if(!this.active)return;
    if(this.area!==this.session.area||!this.character.isAlive||this.character.damageRevision!==this.damageRevision||this.vein.state!=='available'){this.cancel('Mineração interrompida.');return;}
    if(this.state==='prepare'&&this.time+1e-9>=this.strikeAt){this.state='strike';this.say('AGORA! · F ou Espaço no momento certo');}
    if(this.time+1e-9>=this.endsAt)this.finish('O golpe demorou demais. Você errou o golpe.');
  }
  strike(){
    if(!this.active)return this.pending??Promise.resolve(false);
    if(this.state==='prepare'){this.say('Prepare o golpe… aguarde o indicador.');return Promise.resolve(false);}
    if(this.time>=this.endsAt-1e-9){this.finish('O golpe demorou demais. Você errou o golpe.');return Promise.resolve(false);}
    const result=strikeResult(this.indicator,this.center,this.config);
    if(result==='MISS'){this.finish('Você errou o golpe.');return Promise.resolve(false);}
    const vein=this.vein,area=this.area,s=this.session;
    // Re-validated at reward time, not only at start. Everything is staged off a copy of the live character.
    if(!this.character.isAlive||area!==s.area||vein.state!=='available'){this.finish('Mineração interrompida.',false);return Promise.resolve(false);}
    const draft={data:this.character.snapshot()},inv=new Inventory(draft);
    if(!inv.owns(PICKAXE)){this.finish('Você precisa de uma picareta para minerar.');return Promise.resolve(false);}
    if(!inv.canAcquire(RAW_ORE)){this.finish('Sua mochila está cheia. Nenhuma recompensa concedida.');return Promise.resolve(false);}
    const xp=this.config.xp[result];inv.acquire(RAW_ORE);const levels=gainLifeXP(draft.data,'mining',xp);
    // Reserved synchronously: a second input, or another start, can never claim the same vein.
    vein.state='reserved';this.finish('Golpe confirmado · salvando…',false);this.state='saving';
    const operation=Promise.resolve().then(()=>this.save(draft.data)).then(()=>{
      this.character.data.inventory=draft.data.inventory;this.character.data.lifeSkills=draft.data.lifeSkills;
      vein.state='exhausted';const interactable=area.interactables.find(i=>i.id===vein.id);if(interactable)interactable.label='Veio esgotado · já foi minerado';
      s.onResourceChange();
      this.say((result==='PERFECT'?'Golpe perfeito! ':'Mineração concluída! ')+'+1 '+ITEMS[RAW_ORE].name+' · Mining XP +'+xp+(result==='PERFECT'?' (bônus)':'')+(levels?' · MINERAÇÃO NÍVEL '+draft.data.lifeSkills.mining.level+'!':''));return true;
    }).catch(error=>{vein.state='available';this.say('Mineração não salva: '+error.message+' Nenhum minério ou XP concedido.');return false;}).finally(()=>{this.pending=null;this.state='idle';});
    this.pending=operation;return operation;
  }
}
