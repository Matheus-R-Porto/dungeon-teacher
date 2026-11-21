// Engagement is accumulated for this encounter, never recalculated from online headcount.
// New participants add a fixed health budget while preserving all damage already dealt.
export class EncounterParticipation {
 constructor(world,enemy,{hpPerExtra=.65,attackPerExtra=.06,max=6}={}){this.w=world;this.e=enemy;this.baseHP=enemy.stats.maxHP;this.baseAttack=enemy.stats.physicalAttack;this.hpPerExtra=hpPerExtra;this.attackPerExtra=attackPerExtra;this.max=max;this.ids=new Set();this.links=new Map();}
 valid(id){const p=this.w.players.get(id);return p&&p.ws!==null&&p.character.isAlive;}
 engage(id){if(!this.e.alive||!this.valid(id)||this.ids.has(id)||this.ids.size>=this.max)return false;this.ids.add(id);const extra=Math.max(0,this.ids.size-1),hp=Math.round(this.baseHP*(1+extra*this.hpPerExtra));this.e.hp+=hp-this.e.stats.maxHP;this.e.stats.maxHP=hp;this.e.stats.physicalAttack=this.baseAttack*(1+extra*this.attackPerExtra);for(const [source,targets]of this.links)if((targets.get(id)??-Infinity)>this.w.time)this.engage(source);return true;}
 support(source,target,duration=0){if(source===target||!this.valid(source)||!this.valid(target)||!this.e.alive)return;if(duration>0){let targets=this.links.get(source);if(!targets)this.links.set(source,targets=new Map());targets.set(target,this.w.time+duration);}if(this.ids.has(target))this.engage(source);}
 damage(source,target,amount){if(!(amount>0))return;if(target===this.e.id)this.engage(source);else if(source===this.e.id)this.engage(target);}
 snapshot(){return {count:this.ids.size,ids:[...this.ids],maxHP:this.e.stats.maxHP,attack:this.e.stats.physicalAttack};}
}
