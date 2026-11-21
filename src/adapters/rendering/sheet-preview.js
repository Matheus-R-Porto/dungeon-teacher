import {defaultAppearance} from '../../domain/appearance.js';
import {ITEMS} from '../../domain/items/inventory.js';
import {acquireSheet,releaseSheet} from './sheet-resources.js';
import {sheetCell,SHEET} from '../../core/sheet-animation.js';
const linear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
const srgb=v=>Math.round(255*(v<=.0031308?12.92*v:1.055*Math.max(0,v)**(1/2.4)-.055));
const color=hex=>[1,3,5].map(i=>linear(parseInt(hex.slice(i,i+2),16)/255));
// A small UI portrait uses the same authored frame and exact fabric mask as WebGL.
export async function drawAppearancePreview(target,{classId='novice',appearance=defaultAppearance(),equipment={},direction=0,frame=0}={}){
 const generation=target._appearanceGeneration=(target._appearanceGeneration??0)+1;
 const family=ITEMS[equipment.weapon?.definitionId]?.weaponType??'none',entry=acquireSheet([classId,appearance.bodyType??'masculine',family].join('-'));
 try{const r=await entry.ready;if(target._appearanceGeneration!==generation)return;const cell=sheetCell(frame,direction),c=document.createElement('canvas'),m=document.createElement('canvas');c.width=c.height=m.width=m.height=SHEET.cell;const g=c.getContext('2d'),mg=m.getContext('2d');g.drawImage(r.texture.image,cell.column*96,cell.row*96,96,96,0,0,96,96);mg.drawImage(r.mask.image,cell.column*96,cell.row*96,96,96,0,0,96,96);const pixels=g.getImageData(0,0,96,96),mask=mg.getImageData(0,0,96,96).data,primary=color(appearance.primary),secondary=color(appearance.secondary);for(let i=0;i<pixels.data.length;i+=4){if(!pixels.data[i+3]||Math.max(mask[i],mask[i+1])<128)continue;const shade=(linear(pixels.data[i]/255)*.3+linear(pixels.data[i+1]/255)*.59+linear(pixels.data[i+2]/255)*.11)/.085,tint=mask[i+1]>=128?secondary:primary;for(let k=0;k<3;k++)pixels.data[i+k]=Math.min(255,srgb(tint[k]*shade));}g.putImageData(pixels,0,0);target.width=target.height=288;const ctx=target.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,288,288);ctx.drawImage(c,0,0,288,288);
 }finally{releaseSheet(entry);}
}
