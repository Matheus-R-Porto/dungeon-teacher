import {INGREDIENTS,RECIPES} from '../domain/food.js';
import {ITEMS} from '../domain/items/inventory.js';
// Adapters that let the campaign's kitchen panel and fishing HUD drive the authoritative server.
// They hold no rules: timing, items, gold and XP are decided by the server ('cook' / 'fish' progression).
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
export class RemoteFood {
  constructor(client,notify){Object.assign(this,{client,notify});this.pending=0;this.profile=null;this.offset=0;this.local=null;this.data={lifeSkills:{cooking:{level:1,xp:0}},gold:0,inventory:{slots:[]}};}
  get character(){return {data:this.data};}
  get busy(){return this.pending>0;}
  sync(profile){if(!profile)return;this.profile=profile;this.offset=profile.serverNow-Date.now();Object.assign(this.data,{lifeSkills:profile.lifeSkills??this.data.lifeSkills,gold:profile.gold,inventory:profile.inventory});}
  get cooking(){return this.profile?.cook??this.local;}
  progress(){const c=this.cooking;return c?clamp((Date.now()+this.offset-c.started)/(RECIPES.find(r=>r.id===c.id).seconds*1000),0,1):0;}
  recipeReason(id){const r=RECIPES.find(r=>r.id===id),d=this.data,count=item=>d.inventory.slots.reduce((n,i)=>n+(i?.definitionId===item?i.quantity:0),0);if(!r)return 'Receita desconhecida.';if(d.lifeSkills.cooking.level<r.minLevel)return `Requer Cooking nível ${r.minLevel}.`;for(const [item,q]of Object.entries(r.ingredients))if(count(item)<q)return 'Falta ingrediente: '+ITEMS[item].name;return '';}
  async send(data){this.pending++;try{const m=await this.client.progression('cook',data);this.sync(m.profile);return m.message;}finally{this.pending--;}}
  buy(id,quantity=1){return this.send({action:'buy',id,quantity});}
  sell(instanceId,quantity=1){return this.send({action:'sell',instanceId,quantity});}
  start(id){const reason=this.recipeReason(id);if(reason)throw Error(reason);this.local={id,started:Date.now()+this.offset};this.send({action:'start',id}).then(()=>{this.local=null;},e=>{this.local=null;this.notify(e.message);});return this.local;}
  cancel(){if(this.busy||!this.cooking)return false;this.local=null;if(this.profile)this.profile={...this.profile,cook:null};this.client.progression('cook',{action:'cancel'}).catch(()=>{});return true;}
  async resolve(){try{return await this.send({action:'resolve'});}finally{this.local=null;}}
}
const MESSAGES={cast:'Lançando… · Esc cancela',waiting:'Observe a boia… · Esc cancela',bite:'AGORA! · F ou Espaço para puxar'};
export class RemoteFishing {
  constructor(client,notify){Object.assign(this,{client,notify});this.pending=null;this.last='';this.profile=null;}
  sync(profile){this.profile=profile;}
  get state(){return this.profile?.fishing?.state??'idle';}
  get active(){return this.state!=='idle';}
  get busy(){return this.active||!!this.pending;}
  say(message){this.last=message;this.notify(message);}
  get message(){return this.active?MESSAGES[this.state]:this.last;}
  send(action){if(this.pending)return this.pending;const run=this.client.progression('fish',{action}).then(m=>{this.profile=m.profile??this.profile;if(m.message)this.say(m.message);return true;},e=>{this.say(e.message);return false;}).finally(()=>{this.pending=null;});this.pending=run;return run;}
  start(){return this.send('start');}
  pull(){return this.active?this.send('pull'):Promise.resolve(false);}
  cancel(){return this.active?this.send('cancel'):Promise.resolve(false);}
}
export const INGREDIENT_IDS=INGREDIENTS.map(i=>i.id);
