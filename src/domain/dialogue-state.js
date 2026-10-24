// Effects and durable idempotency belong to the supplied gameplay authority.
export const QUEST_RESPONSES=Object.freeze([{id:'accept',label:'Sim'},{id:'decline',label:'Não'},{id:'defer',label:'Não sei'}]);
export function conversation(npc,lines=npc.lines){return {id:`conversation:${npc.id}`,npcId:npc.id,name:npc.name,portrait:npc.portrait,start:'page-0',nodes:lines.map((text,i)=>({id:`page-${i}`,text,next:i+1<lines.length?`page-${i+1}`:null}))};}
export function validateDialogue(c){
 if(!c?.id||!c.npcId||!c.name||!c.nodes?.length)throw Error('Diálogo inválido.');
 const ids=new Set(c.nodes.map(n=>n.id));if(ids.size!==c.nodes.length||!ids.has(c.start))throw Error('Etapas inválidas.');
 for(const n of c.nodes){if(!n.id||typeof n.text!=='string'||n.next&&!ids.has(n.next))throw Error('Fala inválida.');const choices=n.choices??[];if(new Set(choices.map(v=>v.id)).size!==choices.length)throw Error('Respostas duplicadas.');for(const v of choices)if(!v.id||!v.label||v.next&&!ids.has(v.next))throw Error('Resposta inválida.');}return c;
}
export class DialogueState{
 constructor({effect,onChange=()=>{},onError=()=>{}}={}){Object.assign(this,{effect,onChange,onError});this.operations=new Map();this.revision=0;this.content=null;this.pending=false;}
 get node(){return this.content?.nodes.find(n=>n.id===this.nodeId)??null;}
 open(c){validateDialogue(c);this.revision++;this.content=c;this.nodeId=c.start;this.pending=false;this.onChange();}
 close(){this.revision++;this.content=null;this.pending=false;this.onChange();}
 go(next){if(next){this.nodeId=next;this.onChange();}else this.close();}
 advance(){if(!this.node||this.pending||this.node.choices?.length)return false;this.go(this.node.next);return true;}
 async choose(id){
  const node=this.node,choice=node?.choices?.find(v=>v.id===id);if(!choice||this.pending)return false;
  const revision=this.revision,c=this.content;this.pending=true;this.onChange();
  try{if(choice.action){if(!this.effect)throw Error('Esta ação ainda não está disponível.');const key=JSON.stringify([c.id,c.npcId,node.id,id,choice.action]);
   // Retain across close/reopen; a late response cannot advance another dialogue.
   if(!this.operations.has(key))this.operations.set(key,Promise.resolve().then(()=>this.effect(choice.action,{dialogueId:c.id,npcId:c.npcId,nodeId:node.id,choiceId:id,idempotencyKey:key})));
   await this.operations.get(key);
  }if(revision!==this.revision)return true;this.pending=false;this.go(choice.next);return true;
  }catch(error){if(revision===this.revision){this.pending=false;this.onError(error);this.onChange();}return false;}
 }
}
