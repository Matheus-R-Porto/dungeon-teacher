import {WhiteWolfEncounter} from './white-wolf.js';
import {AWAKENING as A} from '../src/domain/tower-awakening.js';
import {Character} from '../src/domain/character/character.js';
import {randomUUID,randomInt} from 'node:crypto';
export function installWhiteWolf(tower,w){
 if(!w.map.awakening?.cave||w.bossEncounter?.persistent)return;
 const key=w.map.id+':white-wolf',db=tower.db.db;db.exec('CREATE TABLE IF NOT EXISTS encounters(id TEXT PRIMARY KEY,data TEXT NOT NULL)');
 const persist=data=>db.prepare('INSERT INTO encounters VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(key,JSON.stringify(data));
 const saved=db.prepare('SELECT data FROM encounters WHERE id=?').get(key),enc=new WhiteWolfEncounter(w,{now:tower.now,saved:saved?JSON.parse(saved.data):null,persist});w.bossEncounter=enc;enc.persistent=true;enc.participants=new Map();enc.onReset=()=>enc.participants.clear();
 enc.contribution=(id,damage)=>{const p=tower.people.get(id);if(!p||damage<=0)return;const old=enc.participants.get(id)??{damage:0};enc.participants.set(id,{damage:old.damage+damage,at:tower.now()});if(enc.e.alive)return;
  const death=key+':'+enc.e.generation;if(db.prepare('SELECT id FROM deaths WHERE id=?').get(death))return;
  const plans=[];for(const [who,hit]of enc.participants){const q=tower.people.get(who);if(!q?.ws||!q.character.isAlive||q.mapId!==w.map.id||q.game.player.surface!==enc.e.surface||hit.damage<enc.e.stats.maxHP*A.boss.contribution||tower.now()-hit.at>A.boss.recentMs||Math.hypot(q.game.player.x-enc.e.x,q.game.player.z-enc.e.z)>A.boss.rewardRadius)continue;
   const c=new Character(q.character.snapshot());c.gainXP(A.boss.xp);const win=w.random()<A.boss.chestChance;plans.push({q,c,drop:win?{id:randomUUID(),owner:q.id,mapId:w.map.id,x:enc.e.x,z:enc.e.z,y:enc.e.y,surface:enc.e.surface,item:'expeditionChest',quantity:1,rewardSeed:randomInt(4294967296),expires:tower.now()+7*86400000}:null});
  }
  enc.defeat(p.name);tower.db.transaction(()=>{db.prepare('INSERT INTO deaths VALUES(?)').run(death);persist(enc.data);for(const {q,c,drop}of plans){tower.db.save(q.id,tower.state(q,c));if(drop)tower.db.putDrop(drop);}});
  for(const {q,c,drop}of plans){q.character=c;q.saved=JSON.stringify(tower.state(q));q.notice='Lobo Branco derrotado! +'+A.boss.xp+' XP'+(drop?' · Seu baú aguarda no covil.':'');}enc.participants.clear();
 };
}
