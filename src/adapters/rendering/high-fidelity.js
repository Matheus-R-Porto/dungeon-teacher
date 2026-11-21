import {sharedTextureView} from './shared-texture-view.js';
import {ORIGINALS} from './original-manifest.js';
import {acquireSheet,releaseSheet} from './sheet-resources.js';
export const HIGH_FIDELITY_ENABLED=true;
// Only source poses with an appropriate purpose are mapped. Missing poses use
// the complete production frame; they are never enlarged into the native atlas.
export function originalPose(frame,family='none',input={}){
 if(input.professionPose||input.cart)return null;
 if([13,15,32].includes(frame))return null; // Keep the entire three-stage death in one style.
 if(family==='none'&&[18,19,20,21].includes(frame))return null;
 if(frame===0)return {source:'main',column:0};
 if([2,4,6,8].includes(frame))return {source:'main',column:[0,1,3,2][(frame-2)/2]};
 if(family==='none'&&[10,12,14,16].includes(frame))return {source:'main',column:[0,1,3,2][(frame-10)/2]};
 if(frame===33&&input.action)return {source:'actions',column:6};
 if([18,19,20].includes(frame)){
  if(family==='none')return null; // No original unarmed strike: preserve the production pose.
  if(family==='sword')return {source:'main',column:frame===18?4:5};
  const col={bow:0,staff:2,dagger:4,none:6}[family]??6;
  return {source:'actions',column:col+(frame===18?0:1)};
 }
 if([21,24,31].includes(frame))return {source:'main',column:0};
 if([22,25].includes(frame))return {source:'actions',column:6};
 if([23,26,27,28].includes(frame))return {source:'actions',column:7};
 if(frame===30)return {source:'main',column:6};
 return null;
}
export class OriginalSheet {
 constructor(palette){this.palette=palette;this.generation=0;}
 prepare(input){
  if(!HIGH_FIDELITY_ENABLED)return;
  const id=(input.classId??'novice')+'-'+(input.appearance?.bodyType==='feminine'?'feminine':'masculine');
  if(id===this.id)return;this.id=id;this.error=null;const generation=++this.generation,meta=ORIGINALS[id];
  if(!meta){this.texture?.dispose();this.texture=null;releaseSheet(this.resource);this.resource=null;return;}
  const entry=acquireSheet('original:'+id);
  this.pending=entry.ready.then(resource=>{
   if(this.disposed||generation!==this.generation){releaseSheet(entry);return;}
   this.texture?.dispose();releaseSheet(this.resource);this.resource=resource;this.meta=meta;
   const t=sharedTextureView(resource.texture);t.repeat.set(1/8,1/8);t.userData.originalIdentity=id;this.texture=t;
  }).catch(error=>{releaseSheet(entry);if(generation===this.generation)this.error=error.message;console.warn('Protótipo: recurso original indisponível',id);});
 }
 apply(frame,direction,family,input,body){
  this.active=false;const pose=originalPose(frame,family,input);
  if(!HIGH_FIDELITY_ENABLED||!pose||!this.texture?.image||this.resource?.key!=='original:'+this.id)return false;
  const meta=this.meta,index=(pose.source==='actions'?32:0)+direction*8+pose.column,ref=meta.frames[index],scale=meta.scalePerDirection[direction];
  const rect=ref.textureRect??[ref.atlasColumn*meta.cellWidth,ref.row*meta.cellHeight,meta.cellWidth,meta.cellHeight],atlasWidth=meta.atlasWidth??meta.cellWidth*8,atlasHeight=meta.atlasHeight??meta.cellHeight*8;this.texture.repeat.set(rect[2]/atlasWidth,rect[3]/atlasHeight);this.texture.offset.set(rect[0]/atlasWidth,1-(rect[1]+rect[3])/atlasHeight);this.texture.userData.sourceFrame=index;
  body.material.map=this.texture;this.palette.mask.value=this.resource.mask;
  body.center.set(ref.pivot[0],ref.pivot[1]);body.scale.x*=rect[2]*scale/96;body.scale.y*=rect[3]*scale/96;
  this.active=true;return true;
 }
 ready(){return this.pending??Promise.resolve();}
 dispose(){this.disposed=true;this.generation++;this.texture?.dispose();releaseSheet(this.resource);this.resource=null;}
}
