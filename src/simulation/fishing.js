import {FISHING,eligibleFish,selectFish} from '../domain/fishing.js';
import {gainLifeXP} from '../domain/life-skills.js';
import {Inventory,equipmentBlocked} from '../domain/items/inventory.js';
import {seeded,seedOf} from '../domain/random.js';
import {canStand,clearSegment} from '../world/collision.js';
import {inWater} from '../world/water-features.js';

export class FishingRuntime {
  constructor(session,{notify=()=>{},save=async()=>{},config=FISHING}={}){
    this.session=session;this.character=session.combat.character;this.notify=notify;this.save=save;this.config=config;
    this.state='idle';this.time=0;this.cooldowns=new Map();this.message='';this.pending=null;this.spot=null;
    this.reset(0);
  }
  get active(){return ['cast','waiting','bite'].includes(this.state);}
  get busy(){return this.active||!!this.pending;}
  reset(seed){this.cancel('Pesca encerrada.');this.random=seeded(seedOf(seed+':fishing-attempts'));this.attempts=0;this.cooldowns.clear();}
  remaining(spot){return Math.max(0,(this.cooldowns.get(spot.id)??0)-this.time);}
  say(message){this.message=message;this.notify(message);}
  start(id){
    const s=this.session,c=s.combat,g=s.game;
    if(this.busy)return false;
    if(s.mining?.busy)throw Error('Termine a mineração antes de pescar.');
    const spot=s.area.fishingSpots?.find(p=>p.id===id),water=s.area.waterFeatures?.find(w=>w.id===spot?.waterFeatureId);
    if(!spot||!water?.fishingCompatible||!s.run||!this.character.isAlive)throw Error('Margem de pesca indisponível.');
    if(equipmentBlocked(c))throw Error('Você não pode pescar durante o combate.');
    const inv=new Inventory(this.character);
    if(!inv.owns('fishingRod'))throw Error('Você precisa de uma Vara de Pesca.');
    if(!eligibleFish(this.character.data.lifeSkills.fishing.level).some(f=>inv.canAcquire(f.itemDefinition)))throw Error('Sua mochila está cheia.');
    if(this.remaining(spot)>1e-8)throw Error('Aguarde a água se acalmar.');
    if(Math.hypot(g.player.x-spot.x,g.player.z-spot.z)>this.config.interactionRadius||inWater(water,g.player,.32)||!canStand(s.area,g.player.x,g.player.z,.32)||!clearSegment(s.area,g.player,spot,.32))throw Error('Aproxime-se da margem sinalizada, fora da água.');
    c.cancel(true);this.spot=spot;this.area=s.area;this.damageRevision=this.character.damageRevision;
    this.result=selectFish(this.character.data.lifeSkills.fishing.level,this.random);
    const wait=this.config.waitMin+this.random()*(this.config.waitMax-this.config.waitMin);
    this.attempts++;this.started=this.time;this.biteAt=this.time+this.config.castSeconds+wait;this.endsAt=this.biteAt+this.config.reactionSeconds;
    this.state='cast';g.player.heading=spot.heading;g.player.moving=false;this.say('Lançando… · Esc cancela');return true;
  }
  finish(message){if(this.spot)this.cooldowns.set(this.spot.id,this.time+this.config.cooldownSeconds);this.state='idle';this.result=null;this.say(message);}
  cancel(message='Pesca cancelada.'){if(this.active)this.finish(message);}
  update(dt){
    if(!Number.isFinite(dt)||dt<0)throw Error('Tempo de pesca inválido.');this.time+=dt;
    if(!this.active)return;
    if(this.area!==this.session.area||!this.character.isAlive||this.character.damageRevision!==this.damageRevision){this.cancel('Pesca interrompida.');return;}
    if(this.time+1e-9>=this.endsAt){this.finish('O peixe escapou.');return;}
    if(this.time+1e-9>=this.biteAt&&this.state!=='bite'){this.state='bite';this.say('AGORA! · F ou Espaço para puxar');}
    else if(this.state==='cast'&&this.time-this.started+1e-9>=this.config.castSeconds){this.state='waiting';this.say('Observe a boia… · Esc cancela');}
  }
  pull(){
    if(!this.active)return this.pending??Promise.resolve(false);
    if(this.time<this.biteAt-1e-9){this.finish('Muito cedo!');return Promise.resolve(false);}
    if(this.time>=this.endsAt-1e-9){this.finish('O peixe escapou.');return Promise.resolve(false);}
    const fish=this.result,s=this.session;
    // Stage both fields off the live character. Failure cannot leave half a grant.
    const draft={data:this.character.snapshot()},inv=new Inventory(draft);
    if(!inv.canAcquire(fish.itemDefinition)){this.finish('Sua mochila está cheia para este peixe. Nenhuma recompensa concedida.');return Promise.resolve(false);}
    inv.acquire(fish.itemDefinition);const levels=gainLifeXP(draft.data,'fishing',fish.xp);
    this.finish('Captura confirmada · salvando…');this.state='saving';
    const operation=Promise.resolve().then(()=>this.save(draft.data)).then(()=>{
      this.character.data.inventory=draft.data.inventory;this.character.data.lifeSkills=draft.data.lifeSkills;
      s.onResourceChange();this.say('PESCADO! '+fish.name+' · Pesca XP +'+fish.xp+(levels?' · PESCA NÍVEL '+draft.data.lifeSkills.fishing.level+'!':''));return true;
    }).catch(error=>{this.say('Captura não salva: '+error.message+' Nenhum peixe ou XP concedido.');return false;}).finally(()=>{this.pending=null;this.state='idle';});
    this.pending=operation;return operation;
  }
}
