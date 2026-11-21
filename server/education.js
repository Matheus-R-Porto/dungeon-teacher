import {Character} from '../src/domain/character/character.js';
import {educationReward} from '../src/domain/character/job-progress.js';
import {PROFESSIONS} from '../src/domain/character/professions.js';
export function grantEducation(access,online,token,{accountId,activityId,request},activities){
 const teacher=access.session(token,{teacher:true});return grantEducationByTeacher(access,online,teacher,{accountId,activityId,request},activities);
}
export function grantEducationByTeacher(access,online,teacher,{accountId,activityId,request},activities){
 if(teacher?.role!=='teacher'||teacher.blocked)throw Error('Acesso reservado ao professor.');if(!/^[a-zA-Z0-9-]{1,64}$/.test(request??''))throw Error('Confirmação inválida.');
 if(!Object.hasOwn(activities,activityId))throw Error('Atividade educacional não configurada.');const definition=activities[activityId];
 const account=access.db.prepare("SELECT * FROM school_accounts WHERE id=? AND role='student'").get(accountId);if(!account?.character_id)throw Error('Aluno sem personagem.');
 access.db.exec('CREATE TABLE IF NOT EXISTS school_activity_receipts(account_id TEXT NOT NULL,request TEXT NOT NULL,PRIMARY KEY(account_id,request));');
 if(access.db.prepare('SELECT request FROM school_activity_receipts WHERE account_id=? AND request=?').get(accountId,request))return {ok:true,repeated:true};
 const p=online.people.get(account.character_id),record=online.db.read(account.character_id),c=new Character(p?.character.snapshot()??record.character),reward=educationReward(c.data,activityId,definition);
 c.gainXP(reward.baseXP,{jobAmount:reward.jobXP});
 if(definition.unlockClass){if(!Object.hasOwn(PROFESSIONS,definition.unlockClass)||definition.unlockClass==='novice')throw Error('Desbloqueio configurado inválido.');if(!c.data.jobs.promotionUnlocks.includes(definition.unlockClass))c.data.jobs.promotionUnlocks.push(definition.unlockClass);}
 if(online.failed)throw Error('Persistência indisponível.');
 online.db.transaction(()=>{access.db.prepare('INSERT INTO school_activity_receipts VALUES(?,?)').run(accountId,request);online.db.save(account.character_id,p?online.state(p,c):{...record,character:c.snapshot()});access.audit(teacher.id,'education:'+activityId,accountId);});
 if(p){p.character=c;p.saved=JSON.stringify(online.state(p));p.notice=`Atividade confirmada: +${reward.baseXP} Base XP · +${reward.jobXP} Job XP`;}
 return {ok:true,...reward};
}
