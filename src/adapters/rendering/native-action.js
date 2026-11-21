import {NATIVE_ACTIONS} from './native-action-manifest.js';
import {acquireSheet,releaseSheet} from './sheet-resources.js';
import {sharedTextureView} from './shared-texture-view.js';

// Complete drawings use the same UV, shared source, palette and foot-pivot
// contract as native professions. Only the current family/direction is held.
export function expandedPose(frame,family,input={}){
 if(input.professionPose)return null;
 const core=index=>({group:'core',index});
 if([13,15,32].includes(frame))return core([13,15,32].indexOf(frame)+4);
 if(frame===29)return core(7);
 if(input.cart){
  if(frame===11)return core(8);
  if([3,5,7,9].includes(frame))return core([9,10,11,8][(frame-3)/2]);
 }
 if(family==='none'){
  if([1,18,34,35].includes(frame)||frame===33&&!input.action)return core(0);
  if([19,20,21].includes(frame))return core(frame-18);
 }
 if(['sword','bow','staff','dagger'].includes(family)){
  if([1,21,34,35].includes(frame)||frame===33&&!input.action)return {group:family,index:0};
  if([10,12,14,16].includes(frame))return {group:family,index:[1,2,3,0][(frame-10)/2]};
 }
 return null;
}
export class NativeAction {
 constructor(palette,resources={acquire:acquireSheet,release:releaseSheet}){this.palette=palette;this.resources=resources;this.generation=0;}
 prepare(input,direction,frame,family){
  const pose=expandedPose(frame,family,input),id=(input.classId??'novice')+'-'+(input.appearance?.bodyType==='feminine'?'feminine':'masculine'),key=pose?id+'-'+pose.group+'-'+direction:null;
  this.pose=pose;if(key===this.key)return;
  this.clear();this.key=key;const meta=key&&NATIVE_ACTIONS[key];if(!meta)return;
  this.meta=meta;const entry=this.resources.acquire('action:'+key);this.entry=entry;const generation=this.generation;
  const install=()=>{if(this.disposed||generation!==this.generation)return;this.texture=sharedTextureView(entry.texture);};
  if(entry.loaded)install();
  this.pending=entry.ready.then(()=>{if(!this.texture)install();}).catch(error=>{if(generation===this.generation)this.error=error.message;});
 }
 apply(body,width,height){
  this.active=false;if(!this.pose||!this.texture||!this.meta)return false;
  const m=this.meta,f=m.frames[this.pose.index],r=f.textureRect,t=this.texture;
  t.repeat.set(r[2]/m.width,r[3]/m.height);t.offset.set(r[0]/m.width,1-(r[1]+r[3])/m.height);
  t.userData.nativeAction=m.key;t.userData.sourceFrame=f.sourceIndex;
  body.material.map=t;this.palette.mask.value=this.entry.mask;body.center.set(...f.pivot);
  body.scale.set(width*1.18*r[2]*m.scale/96,height*1.18*r[3]*m.scale/96,1);body.userData.nativeCartContact=f.cartHand??null;this.active=true;return true;
 }
 clear(){this.generation++;this.texture?.dispose();this.resources.release(this.entry);this.texture=null;this.entry=null;this.meta=null;this.error=null;this.pending=null;this.active=false;}
 ready(){return this.pending??Promise.resolve();}
 dispose(){this.disposed=true;this.clear();}
}
