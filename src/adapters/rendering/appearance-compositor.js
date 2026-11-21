import {anatomyFor} from '../../core/anatomy.js';
import {MODULAR_CELL,MODULAR_COLUMNS} from '../../core/modular-pose.js';
import {poseFrame,splitBody} from './pose-compositor.js';
import {defaultAppearance} from '../../domain/appearance.js';
const sources=new Map(),frames=new Map(),composed=new Map(),models=new Map(),poseImages=new Map(),parts=new Map(),crops=new WeakMap();
export const SPRITE_CELL=256;
const canvas=(w=256,h=256)=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d',{willReadFrequently:true}).imageSmoothingEnabled=false;return c;};
async function load(name){if(!sources.has(name))sources.set(name,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Arte indisponível: '+name));image.src=(name==='heads-extra'?'/assets/characters-v36/':'/assets/characters-v31/')+name+'.png';}));return sources.get(name);}
function bounds(c,predicate=(_r,_g,_b,a)=>a>48){const ctx=c.getContext('2d',{willReadFrequently:true}),data=ctx.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(predicate(data[i],data[i+1],data[i+2],data[i+3],x,y)){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}return x1<0?{x:0,y:0,w:c.width,h:c.height}:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
function crop(image,col,row,cols,rows){let cells=crops.get(image);if(!cells)crops.set(image,cells=new Map());const key=[col,row,cols,rows].join(':');if(cells.has(key))return cells.get(key);const c=canvas(),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(image,col*image.width/cols,row*image.height/rows,image.width/cols,image.height/rows,0,0,256,256);cleanParts(c);cells.set(key,c);return c;}
// Discard fragments from adjacent atlas cells before normalizing the frame.
// Reusable flood-fill storage avoids allocating an array per pixel and per island.
const islandLabels=new Uint32Array(65536),islandQueue=new Uint32Array(65536);
function cleanParts(c){
 const ctx=c.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,256,256),d=pixels.data,counts=[0];islandLabels.fill(0);let largest=0;
 for(let i=0;i<65536;i++){
  if(islandLabels[i]||d[i*4+3]<32)continue;
  const label=counts.length;let read=0,write=1;islandQueue[0]=i;islandLabels[i]=label;
  const visit=n=>{if(!islandLabels[n]&&d[n*4+3]>=32){islandLabels[n]=label;islandQueue[write++]=n;}};
  while(read<write){const q=islandQueue[read++];if(q%256)visit(q-1);if(q%256<255)visit(q+1);if(q>=256)visit(q-256);if(q<65280)visit(q+256);}
  counts.push(write);largest=Math.max(largest,write);
 }
 for(let i=0;i<65536;i++)if(!islandLabels[i]||counts[islandLabels[i]]<largest*.12)d[i*4+3]=0;
 ctx.putImageData(pixels,0,0);return c;
}
function fit(ctx,source,rect){const b=bounds(source);ctx.drawImage(source,b.x,b.y,b.w,b.h,rect.x,rect.y,rect.w,rect.h);}
function hue(r,g,b){const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;if(!d)return 0;return ((max===r?(g-b)/d:max===g?2+(b-r)/d:4+(r-g)/d)*60+360)%360;}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function tint(c,appearance,head=false){const ctx=c.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,256,256),d=pixels.data,primary=rgb(appearance.primary),secondary=rgb(appearance.secondary),hair=rgb(appearance.hairColor);for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,r=d[i],g=d[i+1],b=d[i+2];if(d[i+3]<24){d[i+3]=0;continue;}const h=hue(r,g,b);let color=null;if(head&&r<225&&g<185&&b<150&&r>g*1.12&&h<45)color=hair;else if(!head&&h>195&&h<250&&b>r*1.15)color=primary;else if(!head&&x>80&&x<176&&y>100&&y<205&&h>37&&h<58&&r>b*1.5)color=secondary;if(color){const light=(r*.3+g*.59+b*.11)/110;for(let k=0;k<3;k++)d[i+k]=Math.min(255,Math.round(color[k]*light));}}ctx.putImageData(pixels,0,0);}
function removeShoes(c){const ctx=c.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,256,256),d=pixels.data;for(let y=190;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,h=hue(d[i],d[i+1],d[i+2]);if(h>10&&h<37&&d[i]<190&&d[i]>d[i+2]*1.25)d[i+3]=0;}ctx.putImageData(pixels,0,0);}
async function bodyFrame(classId,col,row){const key=classId+':'+col+':'+row;if(frames.has(key))return frames.get(key);const raw=crop(await load(classId),col,row,6,4),b=bounds(raw),out=canvas(),scale=224/b.h;out.getContext('2d').drawImage(raw,b.x,b.y,b.w,b.h,128-b.w*scale/2,16,b.w*scale,224);frames.set(key,out);return out;}
export const equipmentVisualKey=equipment=>Object.entries(equipment??{}).filter(([slot])=>slot!=='weapon'&&slot!=='offhand'&&slot!=='cart').map(([slot,item])=>[slot,item?.definitionId??null]);
export async function prepareAppearance(classId='novice',appearance=defaultAppearance(),equipment={}){
 const key=JSON.stringify([classId,appearance,equipmentVisualKey(equipment)]);if(models.has(key))return models.get(key);
 const promise=(async()=>{const model={key,rows:[],classId,bodyType:appearance.bodyType},heads=await load('heads'),extra=await load('heads-extra'),gear=await load('gear'),bootsId=equipment.boots?.definitionId,boots=['travelerBoots','agileBoots'].includes(bootsId)?await load(bootsId):null;
  for(let row=0;row<4;row++){
   const rig=anatomyFor(classId,row,appearance.bodyType),original=await bodyFrame(classId,0,row),body=canvas(),b=body.getContext('2d'),upper=canvas(),u=upper.getContext('2d');u.drawImage(original,0,0);u.clearRect(0,0,256,108);u.clearRect(0,184,256,72);tint(upper,appearance);
   if(appearance.bodyType==='feminine')b.drawImage(upper,0,108,256,76,9,108,238,76);else b.drawImage(upper,0,0);
   const layers={rig,body,parts:splitBody(body,rig),head:canvas(),vest:canvas(),backpack:canvas(),ring:canvas(),legs:canvas()};
   const drawGear=(target,index,rect,dir=row)=>fit(target.getContext('2d'),crop(gear,index,dir,8,4),rect);
   if(equipment.backpack?.definitionId==='travelerBackpack')drawGear(layers.backpack,6,row===1?{x:140,y:114,w:52,h:84}:row===3?{x:64,y:114,w:52,h:84}:row===2?{x:91,y:112,w:74,h:94}:{x:94,y:116,w:68,h:86});
   const vest=equipment.chest?.definitionId;if(['travelerVest','lightVest'].includes(vest))drawGear(layers.vest,vest==='travelerVest'?2:3,{x:row%2?103:87,y:112,w:row%2?52:82,h:83});
   const style=['short','wavy','tied'].indexOf(appearance.hairStyle),expression=['calm','happy','serious'].indexOf(appearance.expression),head=canvas();head.getContext('2d').drawImage(style<0?crop(extra,['bob','long','braided','curly','bun','mohawk'].indexOf(appearance.hairStyle),row,6,4):crop(heads,style*3+Math.max(0,expression),row,9,4),0,0);tint(head,appearance,true);
   const r=layers.head.getContext('2d'),hood=equipment.head?.definitionId,headRect={x:row===1?78:row===3?88:83,y:31,w:90,h:80};
   if(['travelerCap','apprenticeHood'].includes(hood)){const face=canvas(),fc=face.getContext('2d');fit(fc,head,headRect);fc.globalCompositeOperation='destination-in';fc.beginPath();fc.ellipse(row===1?100:row===3?154:128,78,row===0?34:27,31,0,0,Math.PI*2);fc.fill();if(row!==2)r.drawImage(face,0,0);}else fit(r,head,headRect);
   if(['travelerCap','apprenticeHood'].includes(hood)){const cover=canvas(),g=cover.getContext('2d');fit(g,crop(gear,hood==='travelerCap'?0:1,hood==='apprenticeHood'&&row%2?4-row:row,8,4),{x:72,y:26,w:112,h:105});if(row!==2){g.globalCompositeOperation='destination-out';g.beginPath();g.ellipse(row===1?100:row===3?154:128,82,row===0?29:22,25,0,0,Math.PI*2);g.fill();}r.drawImage(cover,0,0);}
   const ring=equipment.ring?.definitionId;if(['focusRing','strengthRing'].includes(ring)){const hand=rig[rig.primary].hand;drawGear(layers.ring,ring==='focusRing'?4:5,{x:hand.x-3,y:hand.y-3,w:6,h:6});}
   const legFrames=[];
   for(let col=0;col<6;col++){const walking=await bodyFrame(classId,col,row),legs=canvas(),g=legs.getContext('2d');g.drawImage(walking,0,184,256,72,0,184,256,72);tint(legs,appearance);
    if(boots){if(['mage','priest'].includes(classId))g.clearRect(0,234,256,22);else g.clearRect(0,210,256,46);const reference=['mage','priest'].includes(classId)?await bodyFrame('novice',col,row):walking,foot=bounds(reference,(_r,_g,_b,a,x,y)=>a>48&&y>195),rect={x:foot.x-3,y:Math.max(207,foot.y-10),w:foot.w+6,h:240-Math.max(207,foot.y-10)},pair=crop(boots,col,row,6,4);if(['mage','priest'].includes(classId))fit(g,pair,rect);else for(let half=0;half<2;half++){const source=bounds(pair,(_r,_g,_b,a,x)=>a>48&&(half?x>=128:x<128)),target=bounds(walking,(_r,_g,_b,a,x,y)=>a>48&&y>205&&(half?x>=128:x<128));g.drawImage(pair,source.x,source.y,source.w,source.h,target.x-1,204,target.w+2,36);}}
    legFrames.push(legs);
   }
   // Retain shared modular layers at the displayed resolution, not a full atlas per actor.
   const shrink=c=>{const out=canvas(128,128);out.getContext('2d').drawImage(c,0,0,128,128);return out;};
   layers.parts=Object.fromEntries(Object.entries(layers.parts).map(([k,v])=>[k,shrink(v)]));
   for(const name of ['head','vest','backpack','ring'])layers[name]=shrink(layers[name]);
   delete layers.body;delete layers.legs;layers.legFrames=legFrames.map(shrink);model.rows.push(layers);
  }return model;
 })();models.set(key,promise);if(models.size>8)models.delete(models.keys().next().value);try{return await promise;}catch(e){models.delete(key);throw e;}
}
export function appearancePose(model,frame,direction,pose){
 const key=model.key+':'+frame+':'+direction+':'+Object.keys(pose).sort().map(k=>k+'='+Math.round((pose[k]??0)*1000)).join(',');
 if(poseImages.has(key)){const found=poseImages.get(key);poseImages.delete(key);poseImages.set(key,found);return found;}
 const layers=model.rows[direction],result=poseFrame({...layers,legs:layers.legFrames[frame<6?frame:0]},frame,direction,model.classId,model.bodyType,pose,128);
 poseImages.set(key,result);if(poseImages.size>96)poseImages.delete(poseImages.keys().next().value);return result;
}
export async function composeAppearance(classId='novice',appearance=defaultAppearance(),equipment={}){
 const key=JSON.stringify([classId,appearance,equipmentVisualKey(equipment)]);if(composed.has(key))return composed.get(key);
 const promise=(async()=>{const model=await prepareAppearance(classId,appearance,equipment),atlas=canvas(MODULAR_CELL*MODULAR_COLUMNS,MODULAR_CELL*4),ctx=atlas.getContext('2d');
 for(let row=0;row<4;row++)for(let frame=0;frame<MODULAR_COLUMNS;frame++){const layers=model.rows[row];ctx.drawImage(poseFrame({...layers,legs:layers.legFrames[frame<6?frame:0]},frame,row,classId,appearance.bodyType,null,128),frame*MODULAR_CELL,row*MODULAR_CELL);}return atlas;})();
 composed.set(key,promise);if(composed.size>8)composed.delete(composed.keys().next().value);try{return await promise;}catch(e){composed.delete(key);throw e;}
}

async function buildNormalizedParts(name,columns){const image=await load(name),out=canvas(columns*256,1024),ctx=out.getContext('2d');for(let row=0;row<4;row++)for(let col=0;col<columns;col++){const source=crop(image,col,row,columns,4),b=bounds(source),scale=220/b.h;ctx.drawImage(source,b.x,b.y,b.w,b.h,col*256+128-b.w*scale/2,row*256+18,b.w*scale,220);}return out;}
// Read-only source canvases shared by actors; texture offsets remain per actor.
export function normalizedParts(name,columns){const key=name+':'+columns;if(parts.has(key))return parts.get(key);const promise=buildNormalizedParts(name,columns).catch(error=>{parts.delete(key);throw error;});parts.set(key,promise);if(parts.size>8)parts.delete(parts.keys().next().value);return promise;}
export async function drawAppearancePreview(target,{classId='novice',appearance=defaultAppearance(),equipment={},direction=0,frame=0}={}){const generation=target._appearanceGeneration=(target._appearanceGeneration??0)+1,atlas=await composeAppearance(classId,appearance,equipment);if(target._appearanceGeneration!==generation)return;target.width=256;target.height=256;const ctx=target.getContext('2d');ctx.clearRect(0,0,256,256);ctx.drawImage(atlas,frame*MODULAR_CELL,direction*MODULAR_CELL,MODULAR_CELL,MODULAR_CELL,0,0,256,256);}
