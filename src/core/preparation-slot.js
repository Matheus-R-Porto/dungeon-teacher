// A single speculative resource group. Never stores world state or private maps.
export class PreparationSlot {
 constructor({limit=8*1024*1024}={}){this.limit=limit;this.current=null;this.events=[];}
 note(state,key){this.events.push({state,key,at:performance.now()});if(this.events.length>32)this.events.shift();}
 request(key,bytes,load){
  if(this.current?.key===key)return this.current.promise;
  this.cancel();if(!Number.isFinite(bytes)||bytes>this.limit||bytes<0){this.note('budget',key);return Promise.resolve(null);}
  const controller=new AbortController(),entry={key,bytes,controller,resource:null};this.current=entry;this.note('started',key);
  entry.promise=Promise.resolve().then(()=>load(controller.signal)).then(resource=>{if(controller.signal.aborted||this.current!==entry){resource?.dispose();return null;}entry.resource=resource;this.note('ready',key);return resource;}).catch(error=>{if(this.current===entry)this.current=null;this.note(controller.signal.aborted?'cancelled':'failed',key);return null;});return entry.promise;
 }
 cancel(){const entry=this.current;if(!entry)return;this.current=null;entry.controller.abort();entry.resource?.dispose();this.note('cancelled',entry.key);}
 dispose(){this.cancel();}
}
