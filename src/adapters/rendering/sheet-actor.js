import {NativeProfession} from './native-profession.js';
import {NativeAction} from './native-action.js';
import {OriginalSheet} from './high-fidelity.js';
import {PROFESSION_SHEET,PROFESSION_TIPS} from '../../core/profession-presentation.js';
import {ITEMS} from '../../domain/items/inventory.js';
import {defaultAppearance} from '../../domain/appearance.js';
import {SHEET,sheetFrame,sheetCell} from '../../core/sheet-animation.js';
import {acquireSheet,releaseSheet,applySheetPalette,sheetCacheStats} from './sheet-resources.js';
import * as THREE from 'three';
import {SheetShield} from './sheet-shield.js';
import {SheetBackpack} from './sheet-backpack.js';
const classes=new Set(['novice','warrior','archer','rogue','priest','mage']);
const families=new Set(['sword','dagger','bow','staff']);
export class SheetActor {
 constructor(scene,body){this.scene=scene;this.body=body;this.generation=0;this.palette=applySheetPalette(body.material);this.original=new OriginalSheet(this.palette);this.nativeProfession=new NativeProfession(this.palette);this.nativeAction=new NativeAction(this.palette);this.backpack=new SheetBackpack(scene);this.shield=new SheetShield(scene);}
 prepare(input,direction=0){
  this.original.prepare(input);this.nativeProfession.prepare(input,direction);this.backpack.prepare(input);const a=input.appearance??defaultAppearance(),family=ITEMS[input.equipmentVisual?.weapon?.definitionId]?.weaponType??input.weaponType;
  this.family=families.has(family)?family:'none';
  const identity=[classes.has(input.classId)?input.classId:'novice',a.bodyType==='feminine'?'feminine':'masculine'].join('-'),profession=!!input.professionPose,key=profession?'profession:'+identity:identity+'-'+this.family,layout=profession?PROFESSION_SHEET:SHEET;
  if(a.primary!==this.primary){this.primary=a.primary;this.palette.primary.value.set(a.primary);}
  if(a.secondary!==this.secondary){this.secondary=a.secondary;this.palette.secondary.value.set(a.secondary);}
  this.key=key;this.layout=layout;
  const fallback=!!(this.original.error||this.nativeProfession.error||this.nativeAction.error||!this.original.id);
  if(!fallback){if(this.fallbackKey){this.fallbackKey=null;this.generation++;}if(this.resource){this.bodyTexture?.dispose();releaseSheet(this.resource);this.bodyTexture=null;this.resource=null;}return;}
  if(key===this.fallbackKey)return;this.fallbackKey=key;
  this.key=key;const generation=++this.generation,entry=acquireSheet(key);
  this.pending=entry.ready.then(resource=>{if(this.disposed||generation!==this.generation){releaseSheet(entry);return;}this.bodyTexture?.dispose();releaseSheet(this.resource);this.resource=resource;const t=new THREE.Texture();t.needsUpdate=true;t.source=resource.texture.source;t.colorSpace=resource.texture.colorSpace;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;this.bodyTexture=t;this.layout=layout;this.bodyTexture.repeat.set(1/layout.columns,1/layout.rows);this.bodyTexture.userData.atlas={columns:layout.columns,rows:layout.rows};this.palette.mask.value=resource.mask;this.error=null;}).catch(error=>{releaseSheet(entry);if(generation===this.generation){this.error=error.message;console.error(error);}});
 }
 update(input,direction,visual,azimuth,time,width,height,camera){
  this.prepare(input,direction);
  if(input.hp===0&&this.lastHP>0)this.deathAt=time;if(input.hp!==0)this.deathAt=null;this.lastHP=input.hp;
  const frame=input.professionPose?.poseFrame??input.previewFrame??sheetFrame({...input,deathElapsed:this.deathAt==null?Infinity:time-this.deathAt},visual,time),layout=this.layout??SHEET,index=direction*16+frame,cell=input.professionPose?{column:index%8,row:Math.floor(index/8)}:sheetCell(frame,direction),body=this.body;this.professionPose=input.professionPose??null;this.professionTip=this.professionPose?PROFESSION_TIPS[direction][frame]:null;
  this.frame=frame;this.direction=direction;this.palette.enabled.value=1;
  if(this.bodyTexture&&this.resource?.key===this.key){this.bodyTexture.offset.set(cell.column/layout.columns,1-(cell.row+1)/layout.rows);this.bodyTexture.userData.frame=cell;body.material.map=this.bodyTexture;this.palette.mask.value=this.resource.mask;}
  body.position.set(input.x,(input.y??0)+.055,input.z);body.center.set(.5,input.professionPose?24/128:8/SHEET.cell);const factor=input.professionPose?128/96:1;body.scale.set(width*1.18*factor,height*1.18*factor,1);body.material.rotation=0;
  body.userData.nativeCartContact=null;body.userData.sheetWorldScale=[width*1.18,height*1.18];
  body.material.opacity=input.classEffects?.concealment?.remaining>0?.4:1;
  body.material.color.setHex(visual.state==='hurt'?0xffb7a0:0xffffff);
  if(input.professionPose){const sx=body.scale.x,sy=body.scale.y;body.scale.x*=.75;body.scale.y*=.75;this.backpack.update(input,direction,input.professionPose.impact?19:0,body,camera);body.scale.x=sx;body.scale.y=sy;this.shield.hide();}else{this.backpack.update(input,direction,frame,body,camera);this.shield.update(input,direction,frame,body,camera);}
  if(input.professionPose){
   // While the requested action decodes, keep this identity's full native rest
   // drawing. Never change authority/timing or substitute another class's body.
   body.scale.set(width*1.18,height*1.18,1);
   this.original.apply(0,direction,'none',{...input,professionPose:null},body);
  }else if(!this.original.apply(frame,direction,this.family,input,body)){
   // A cold action retains this identity's native idle until its requested atlas
   // is ready. The authoritative animation clock continues without alteration.
   this.original.apply(0,direction,'none',{...input,cart:false},body);
  }
  this.nativeAction.prepare(input,direction,frame,this.family);this.nativeAction.apply(body,width,height);
  this.nativeProfession.apply(input,direction,body,width,height);if(!this.original.active&&!this.nativeAction.active&&!this.nativeProfession.active&&!this.bodyTexture)return false;const rest=this.original.meta?.frames[direction*8];this.labelHeight=rest?height*1.18*rest.size[1]*this.original.meta.scalePerDirection[direction]/96:height*1.18*88/96;return true;
 }
 get diagnostics(){return sheetCacheStats();}
 ready(){return Promise.all([this.pending??Promise.resolve(),this.backpack.ready(),this.original.ready(),this.nativeProfession.ready(),this.nativeAction.ready()]);}
 hide(){this.palette.enabled.value=0;this.backpack.hide();this.shield.hide();}
 dispose(){this.nativeAction.dispose();this.nativeProfession.dispose();this.original.dispose();this.disposed=true;this.generation++;this.bodyTexture?.dispose();this.backpack.dispose();this.shield.dispose();releaseSheet(this.resource);this.resource=null;}
}
