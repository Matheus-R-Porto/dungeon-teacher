import {randomUUID} from 'node:crypto';
const DAY=86400000;
export class Seasons {
 constructor(access){this.a=access;this.db=access.db;this.migrate();}
 migrate(){const db=this.db;this.a.store.transaction(()=>{
  db.exec(`CREATE TABLE IF NOT EXISTS school_seasons(id TEXT PRIMARY KEY,name TEXT NOT NULL,started INTEGER NOT NULL,planned_end INTEGER NOT NULL,state TEXT NOT NULL CHECK(state IN ('active','closed','cleaning')),cleaned_at INTEGER);
   CREATE UNIQUE INDEX IF NOT EXISTS one_active_season ON school_seasons(state) WHERE state='active';
   CREATE TABLE IF NOT EXISTS character_seasons(character_id TEXT PRIMARY KEY REFERENCES characters(id),season_id TEXT NOT NULL REFERENCES school_seasons(id));
   CREATE TABLE IF NOT EXISTS school_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
  if(!db.prepare('PRAGMA table_info(school_accounts)').all().some(c=>c.name==='season_id'))db.exec('ALTER TABLE school_accounts ADD COLUMN season_id TEXT REFERENCES school_seasons(id)');
  if(!db.prepare("SELECT key FROM school_settings WHERE key='single-world-migration'").get()){
   const id=randomUUID(),now=this.a.now();db.prepare('INSERT INTO school_seasons VALUES(?,?,?,?,?,NULL)').run(id,'Temporada inicial',now,now+91*DAY,'active');
   db.prepare("UPDATE school_accounts SET season_id=? WHERE role='student'").run(id);
   db.prepare('INSERT OR IGNORE INTO character_seasons SELECT id,? FROM characters').run(id);
   db.prepare("INSERT INTO school_settings VALUES('single-world-migration','1')").run();
   // Legacy cohort columns remain for compatible migrations, but have no admission authority.
   db.prepare('UPDATE school_cohorts SET closes_at=NULL,open=0').run();
  }
 });}
 current(){return this.db.prepare('SELECT * FROM school_seasons ORDER BY started DESC,rowid DESC LIMIT 1').get();}
 active(){const s=this.db.prepare("SELECT * FROM school_seasons WHERE state='active'").get();if(!s)throw Error('A temporada está encerrada. Aguarde o administrador.');return s;}
 admit(account){const s=this.active();if(account.role==='student'&&account.season_id!==s.id)throw Error('Esta conta pertence a uma temporada encerrada.');return s;}
 attach(characterId){this.db.prepare('INSERT OR IGNORE INTO character_seasons VALUES(?,?)').run(characterId,this.active().id);}
 close(id){const s=this.current();if(!s||s.id!==id||s.state!=='active')throw Error('Temporada indisponível. Atualize o painel.');this.a.store.transaction(()=>{this.db.prepare("UPDATE school_seasons SET state='closed' WHERE id=?").run(id);this.db.prepare('DELETE FROM school_sessions').run();this.a.audit('operator','season:closed',id);});return this.current();}
 retention(){const r=this.db.prepare("SELECT value FROM school_settings WHERE key='retention'").get();return r?JSON.parse(r.value):null;}
 setRetention({days,acknowledged}){if(acknowledged!==true||![0,7,30,90,365].includes(days))throw Error('Confirme a política de retenção escolhida pela escola.');const value={days,acknowledgedAt:this.a.now(),automaticDeletion:false};this.db.prepare("INSERT INTO school_settings VALUES('retention',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(value));return value;}
 review(id){const s=this.current();if(s?.id!==id)throw Error('Temporada inválida.');return {...s,accounts:this.db.prepare("SELECT count(*) n FROM school_accounts WHERE season_id=? AND role='student'").get(id).n,characters:this.db.prepare('SELECT count(*) n FROM character_seasons WHERE season_id=?').get(id).n,phrase:'APAGAR '+id.slice(0,8),retention:this.retention()};}
 beginClean({id,phrase,externalCopiesReviewed,deleteManagedBackups}){const s=this.review(id);if(s.state==='active'||s.cleaned_at)throw Error('Encerre e confira a temporada antes da limpeza.');if(!s.retention||phrase!==s.phrase||externalCopiesReviewed!==true||deleteManagedBackups!==true)throw Error('Confirme a frase, a política de retenção e a revisão de todas as cópias.');this.db.prepare("UPDATE school_seasons SET state='cleaning' WHERE id=?").run(id);return s;}
 finishClean(id){const s=this.review(id);if(s.state!=='cleaning')throw Error('Limpeza não iniciada.');const tables=new Set(this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t=>t.name));
  this.db.exec('PRAGMA secure_delete=ON');this.a.store.transaction(()=>{
   const accountIds=this.db.prepare("SELECT id FROM school_accounts WHERE season_id=? AND role='student'").all(id).map(r=>r.id),characters=this.db.prepare('SELECT character_id FROM character_seasons WHERE season_id=?').all(id).map(r=>r.character_id);
   this.db.prepare('DELETE FROM school_sessions').run();
   for(const account of accountIds)if(tables.has('school_activity_receipts'))this.db.prepare('DELETE FROM school_activity_receipts WHERE account_id=?').run(account);
   for(const character of characters){this.db.prepare('UPDATE school_accounts SET character_id=NULL WHERE character_id=?').run(character);this.db.prepare('DELETE FROM drops WHERE owner=?').run(character);if(tables.has('guardian_unlocks'))this.db.prepare('DELETE FROM guardian_unlocks WHERE character=?').run(character);this.db.prepare('DELETE FROM character_seasons WHERE character_id=?').run(character);this.db.prepare('DELETE FROM characters WHERE id=?').run(character);}
   this.db.prepare("DELETE FROM school_accounts WHERE season_id=? AND role='student'").run(id);
   for(const table of ['deaths','arena_results','encounters','school_audit'])if(tables.has(table))this.db.exec('DELETE FROM '+table);
   this.db.prepare("UPDATE school_seasons SET state='closed',cleaned_at=? WHERE id=?").run(this.a.now(),id);this.a.audit('server','season:cleaned',id);
  });this.db.exec('PRAGMA wal_checkpoint(TRUNCATE); VACUUM;');return this.review(id);
 }
 create({name='',plannedEnd}={}){const previous=this.current();if(previous&&!previous.cleaned_at)throw Error('Conclua a limpeza autorizada da temporada anterior.');const now=this.a.now(),end=plannedEnd??now+91*DAY;if(typeof name!=='string'||name.length>80||!Number.isSafeInteger(end)||end<=now||end>now+366*DAY)throw Error('Nome ou data de temporada inválidos.');const id=randomUUID();this.a.store.transaction(()=>{this.db.prepare('INSERT INTO school_seasons VALUES(?,?,?,?,?,NULL)').run(id,name.trim()||'Nova temporada',now,end,'active');this.a.audit('operator','season:created',id);});return this.current();}
}
