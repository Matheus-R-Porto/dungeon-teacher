import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createHash,randomUUID} from 'node:crypto';
import {Character} from '../src/domain/character/character.js';
import {Inventory,decodeInventory} from '../src/domain/items/inventory.js';
const hash=s=>createHash('sha256').update(s).digest('hex');
export class OnlineStore {
 constructor(directory){fs.mkdirSync(directory,{recursive:true});this.db=new DatabaseSync(path.join(directory,'characters.sqlite'));this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;');
 const version=this.db.prepare('PRAGMA user_version').get().user_version;if(version!==0&&version!==1)throw Error('Banco online incompatível; preservado.');
 this.db.exec('CREATE TABLE IF NOT EXISTS characters(id TEXT PRIMARY KEY, credential TEXT UNIQUE NOT NULL, name TEXT NOT NULL, data TEXT NOT NULL, checksum TEXT NOT NULL); CREATE TABLE IF NOT EXISTS deaths(id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS drops(id TEXT PRIMARY KEY, owner TEXT NOT NULL, data TEXT NOT NULL); PRAGMA user_version=1;');
 if(this.db.prepare('PRAGMA quick_check').get().quick_check!=='ok')throw Error('Banco online inválido; preservado.');
 }
 transaction(fn){this.db.exec('BEGIN IMMEDIATE');try{const r=fn();this.db.exec('COMMIT');return r;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 authenticate(credential,name){const digest=hash(credential),r=this.db.prepare('SELECT * FROM characters WHERE credential=?').get(digest);if(r)return this.decode(r);
 const c=new Character(),bag=new Inventory(c);bag.acquire('trainingSword');bag.equip(0);const id=randomUUID(),state={character:c.snapshot(),floor:1,reached:1,area:'shared-city'};state.character.id=id;state.character.name=name;const data=JSON.stringify(state);this.db.prepare('INSERT INTO characters VALUES(?,?,?,?,?)').run(id,digest,name,data,hash(data));return {id,name,...state};
 }
 decode(r){if(hash(r.data)!==r.checksum)throw Error('Personagem inconsistente; dados preservados.');const s=JSON.parse(r.data);if(s.area!==undefined&&s.area!=='shared-city')throw Error('Área online inválida; preservada.');decodeInventory(s.character);if(!Number.isInteger(s.floor)||s.floor<1||s.floor>12||!Number.isInteger(s.reached)||s.reached<s.floor||s.reached>12||!Number.isInteger(s.character.level)||s.character.level<1||s.character.level>100||!Number.isFinite(s.character.hp)||!Number.isSafeInteger(s.character.xp))throw Error('Personagem inválido; dados preservados.');return {id:r.id,name:r.name,...s};}
 read(id){const r=this.db.prepare('SELECT * FROM characters WHERE id=?').get(id);return r&&this.decode(r);}
 save(id,state){const data=JSON.stringify(state);this.db.prepare('UPDATE characters SET data=?,checksum=? WHERE id=?').run(data,hash(data),id);}
 drops(owner,now){return this.db.prepare('SELECT data FROM drops WHERE owner=?').all(owner).map(r=>JSON.parse(r.data)).filter(d=>d.expires>now);}
 putDrop(d){this.db.prepare('INSERT INTO drops VALUES(?,?,?)').run(d.id,d.owner,JSON.stringify(d));}
 close(){this.db.close();}
}
