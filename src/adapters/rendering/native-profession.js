import {NATIVE_PROFESSIONS} from './native-profession-manifest.js';
import {acquireSheet,releaseSheet} from './sheet-resources.js';
import {sharedTextureView} from './shared-texture-view.js';

// Hold only the visible direction. Shared sources and the bounded idle cache
// serve camera turns; a cold turn uses the same identity’s native rest pose.
export class NativeProfession {
 constructor(palette,resources={acquire:acquireSheet,release:releaseSheet}){this.palette=palette;this.resources=resources;this.entries=[];this.views=[];this.generation=0;}
 prepare(input,direction=0){
  const id=(input.classId??'novice')+'-'+(input.appearance?.bodyType==='feminine'?'feminine':'masculine');
  const action=input.professionPose?.type,key=action?id+'-'+action+'-'+direction:null;
  if(key===this.key)return;this.clear();this.key=key;this.active=false;
  const meta=key&&NATIVE_PROFESSIONS[key];
  if(!meta)return;
  this.metas=[];this.metas[direction]=meta;
  const entry=this.resources.acquire('native:'+meta.key);this.entries[direction]=entry;
  const generation=this.generation;
  const install=()=>{if(this.disposed||generation!==this.generation)return;this.views[direction]=sharedTextureView(entry.texture);this.allowed=true;};
  if(entry.loaded)install();
  this.pending=entry.ready.then(()=>{if(!this.allowed)install();}).catch(error=>{if(generation===this.generation){this.allowed=false;this.error=error.message;}});
 }
 apply(input,direction,body,width,height){
  this.active=false;this.tip=null;
  if(!this.allowed||!this.views[direction]||!input.professionPose)return false;
  const m=this.metas[direction],f=m.frames[input.professionPose.poseFrame%8],t=this.views[direction],r=f.textureRect;
  t.repeat.set(r[2]/m.width,r[3]/m.height);t.offset.set(r[0]/m.width,1-(r[1]+r[3])/m.height);t.userData.nativeProfession=m.key;t.userData.sourceFrame=f.index;
  body.material.map=t;this.palette.mask.value=this.entries[direction].mask;body.center.set(...f.pivot);
  body.scale.set(width*1.18*r[2]*m.scale/96,height*1.18*r[3]*m.scale/96,1);
  this.active=true;this.tip=f.tip??null;return true;
 }
 clear(){this.generation++;for(const t of this.views)t?.dispose();for(const e of this.entries)if(e)this.resources.release(e);this.views=[];this.entries=[];this.allowed=false;this.error=null;this.pending=null;this.active=false;this.tip=null;}
 ready(){return this.pending??Promise.resolve();}
 dispose(){this.disposed=true;this.clear();}
}
