export const GRAPHICS_KEY='dungeon.graphics.v1';
export const PROFILES=Object.freeze({performance:{label:'Desempenho',scale:.8,dpr:1.25,shadow:1024},balanced:{label:'Equilibrado',scale:1,dpr:1.5,shadow:2048},high:{label:'Alta Qualidade',scale:1,dpr:1.7,shadow:2048}});
export const ADAPTIVE=Object.freeze({windowMs:5000,cooldownMs:20000,minScale:.65,step:.05,badWindows:3,goodWindows:8});
export function readPreferences(storage){
 try{const p=JSON.parse(storage.getItem(GRAPHICS_KEY));if(p?.version!==1||!['auto',...Object.keys(PROFILES)].includes(p.profile)||!Object.hasOwn(PROFILES,p.recommendation))return null;
 return {version:1,profile:p.profile,recommendation:p.recommendation,automatic:typeof p.automatic==='boolean'?p.automatic:true,panel:p.panel===true,target:60,evaluated:p.evaluated===true,fingerprint:typeof p.fingerprint==='string'?p.fingerprint:'',assessment:p.assessment??null};}catch{return null;}
}
export const defaults=()=>({version:1,profile:'auto',recommendation:'balanced',automatic:true,panel:false,target:60,evaluated:false,fingerprint:'',assessment:null});
export function recommend(m){return m.n<120||!Number.isFinite(m.p95)?'performance':m.p95<=12&&m.p99<=20?'high':m.p95<=22&&m.p99<=40?'balanced':'performance';}
export class GraphicsQuality{
 constructor(storage){this.storage=storage;this.preference=readPreferences(storage)??defaults();this.scale=this.parameters.scale;this.bad=0;this.good=0;this.lastChange=-Infinity;this.lastObservation=-Infinity;this.limited=false;}
 get active(){return this.preference.profile==='auto'?this.preference.recommendation:this.preference.profile;}
 get parameters(){return PROFILES[this.active];}
 save(){try{this.storage.setItem(GRAPHICS_KEY,JSON.stringify(this.preference));this.persisted=true;}catch{this.persisted=false;}}
 select(profile){if(profile!=='auto'&&!Object.hasOwn(PROFILES,profile))return false;this.preference.profile=profile;this.reset();this.save();return true;}
 reset(){this.scale=this.parameters.scale;this.bad=this.good=0;this.lastChange=-Infinity;this.lastObservation=-Infinity;this.limited=false;}
 assess(metrics,fingerprint){this.preference.recommendation=recommend(metrics);this.preference.evaluated=true;this.preference.fingerprint=fingerprint;this.preference.assessment=metrics;this.reset();this.save();}
 restore(){this.preference.profile='auto';this.preference.automatic=true;this.reset();this.save();}
 observe(m,now,{hidden=false,loading=false}={}){
  if(!this.preference.automatic||hidden||loading||m.n<100||now-this.lastObservation<ADAPTIVE.windowMs)return false;
  this.lastObservation=now;const budget=1000/this.preference.target;
  const bad=m.p95>budget*1.45&&m.mean>budget*1.08,good=m.p95<budget*1.12&&m.mean<budget*.95;
  this.bad=bad?this.bad+1:0;this.good=good?this.good+1:0;this.limited=bad&&this.scale<=ADAPTIVE.minScale;
  if(now-this.lastChange<ADAPTIVE.cooldownMs)return false;
  const direction=this.bad>=ADAPTIVE.badWindows?-1:this.good>=ADAPTIVE.goodWindows?1:0;
  const next=Math.max(ADAPTIVE.minScale,Math.min(this.parameters.scale,Math.round((this.scale+direction*ADAPTIVE.step)*100)/100));
  if(next===this.scale)return false;this.scale=next;this.lastChange=now;this.bad=this.good=0;return true;
 }
}
