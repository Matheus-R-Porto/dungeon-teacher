import {defaultAppearance} from '../../domain/appearance.js';
const sources=new Map(),frames=new Map(),composed=new Map();
export const SPRITE_CELL=256;
const canvas=(w=256,h=256)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
async function load(name){if(!sources.has(name))sources.set(name,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Arte indisponível: '+name));image.src='/assets/characters-v31/'+name+'.png';}));return sources.get(name);}
function bounds(c,predicate=(_r,_g,_b,a)=>a>48){const ctx=c.getContext('2d',{willReadFrequently:true}),data=ctx.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(predicate(data[i],data[i+1],data[i+2],data[i+3],x,y)){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}return x1<0?{x:0,y:0,w:c.width,h:c.height}:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
function crop(image,col,row,cols,rows){const c=canvas(),x=c.getContext('2d');x.drawImage(image,col*image.width/cols,row*image.height/rows,image.width/cols,image.height/rows,0,0,256,256);return cleanParts(c);}
// Discard fragments from adjacent atlas cells before normalizing the frame.
function cleanParts(c){const ctx=c.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,256,256),d=pixels.data,seen=new Uint8Array(65536),groups=[];for(let i=0;i<65536;i++){if(seen[i]||d[i*4+3]<32)continue;const group=[],queue=[i];seen[i]=1;for(let n=0;n<queue.length;n++){const q=queue[n];group.push(q);for(const next of [q%256?q-1:-1,q%256<255?q+1:-1,q>=256?q-256:-1,q<65280?q+256:-1])if(next>=0&&!seen[next]&&d[next*4+3]>=32){seen[next]=1;queue.push(next);}}groups.push(group);}const largest=Math.max(0,...groups.map(g=>g.length)),keep=new Uint8Array(65536);for(const group of groups)if(group.length>=largest*.12)for(const i of group)keep[i]=1;for(let i=0;i<65536;i++)if(!keep[i])d[i*4+3]=0;ctx.putImageData(pixels,0,0);return c;}
function fit(ctx,source,rect){const b=bounds(source);ctx.drawImage(source,b.x,b.y,b.w,b.h,rect.x,rect.y,rect.w,rect.h);}
function hue(r,g,b){const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;if(!d)return 0;return ((max===r?(g-b)/d:max===g?2+(b-r)/d:4+(r-g)/d)*60+360)%360;}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function tint(c,appearance,head=false){const ctx=c.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,256,256),d=pixels.data,primary=rgb(appearance.primary),secondary=rgb(appearance.secondary),hair=rgb(appearance.hairColor);for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,r=d[i],g=d[i+1],b=d[i+2];if(d[i+3]<24){d[i+3]=0;continue;}const h=hue(r,g,b);let color=null;if(head&&r<225&&g<185&&b<150&&r>g*1.12&&h<45)color=hair;else if(!head&&h>195&&h<250&&b>r*1.15)color=primary;else if(!head&&x>80&&x<176&&y>100&&y<205&&h>37&&h<58&&r>b*1.5)color=secondary;if(color){const light=(r*.3+g*.59+b*.11)/110;for(let k=0;k<3;k++)d[i+k]=Math.min(255,Math.round(color[k]*light));}}ctx.putImageData(pixels,0,0);}
function removeShoes(c){const ctx=c.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,256,256),d=pixels.data;for(let y=190;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,h=hue(d[i],d[i+1],d[i+2]);if(h>10&&h<37&&d[i]<190&&d[i]>d[i+2]*1.25)d[i+3]=0;}ctx.putImageData(pixels,0,0);}
async function bodyFrame(classId,col,row){const key=classId+':'+col+':'+row;if(frames.has(key))return frames.get(key);const raw=crop(await load(classId),col,row,6,4),b=bounds(raw),out=canvas(),scale=224/b.h;out.getContext('2d').drawImage(raw,b.x,b.y,b.w,b.h,128-b.w*scale/2,16,b.w*scale,224);frames.set(key,out);return out;}
export const equipmentVisualKey=equipment=>Object.entries(equipment??{}).filter(([slot])=>slot!=='weapon'&&slot!=='cart').map(([slot,item])=>[slot,item?.definitionId??null]);
export async function composeAppearance(classId='novice',appearance=defaultAppearance(),equipment={}){
 const key=JSON.stringify([classId,appearance,equipmentVisualKey(equipment)]);if(composed.has(key))return composed.get(key);
 const promise=(async()=>{const atlas=canvas(1536,1024),ctx=atlas.getContext('2d'),heads=await load('heads'),gear=await load('gear'),bootsId=equipment.boots?.definitionId,boots=['travelerBoots','agileBoots'].includes(bootsId)?await load(bootsId):null;
  for(let row=0;row<4;row++)for(let col=0;col<6;col++){
   const original=await bodyFrame(classId,col,row),body=canvas(),b=body.getContext('2d');b.drawImage(original,0,0);b.clearRect(0,0,256,108);if(boots){if(classId==='mage'||classId==='priest')b.clearRect(0,234,256,22);else b.clearRect(0,210,256,46);}tint(body,appearance);
   const result=canvas(),r=result.getContext('2d');
   const drawGear=(index,rect)=>fit(r,crop(gear,index,row,8,4),rect);
   if(equipment.backpack?.definitionId==='travelerBackpack'&&row!==2)drawGear(6,{x:row===1?137:row===3?66:91,y:106,w:67,h:89});
   if(boots){const reference=['mage','priest'].includes(classId)?await bodyFrame('novice',col,row):original,foot=bounds(reference,(red,green,blue,a,x,y)=>a>48&&y>195),rect={x:foot.x-3,y:Math.max(207,foot.y-10),w:foot.w+6,h:240-Math.max(207,foot.y-10)};const pair=crop(boots,col,row,6,4);if(['mage','priest'].includes(classId))fit(r,pair,rect);else for(let half=0;half<2;half++){const source=bounds(pair,(_r,_g,_b,a,x)=>a>48&&(half?x>=128:x<128)),target=bounds(original,(_r,_g,_b,a,x,y)=>a>48&&y>205&&(half?x>=128:x<128));r.drawImage(pair,source.x,source.y,source.w,source.h,target.x-1,204,target.w+2,36);}}
   r.drawImage(body,0,0);
   const vest=equipment.chest?.definitionId;if(['travelerVest','lightVest'].includes(vest))drawGear(vest==='travelerVest'?2:3,{x:row%2?99:84,y:111,w:row%2?62:88,h:86});
   if(equipment.backpack?.definitionId==='travelerBackpack'&&row===2)drawGear(6,{x:87,y:107,w:82,h:104});
   const style=['short','wavy','tied'].indexOf(appearance.hairStyle),expression=['calm','happy','serious'].indexOf(appearance.expression),head=crop(heads,Math.max(0,style)*3+Math.max(0,expression),row,9,4);tint(head,appearance,true);
   const hood=equipment.head?.definitionId;const headRect={x:row===1?63:row===3?77:72,y:11,w:112,h:100};if(['travelerCap','apprenticeHood'].includes(hood)){const face=canvas(),fc=face.getContext('2d');fit(fc,head,headRect);fc.globalCompositeOperation='destination-in';fc.beginPath();fc.ellipse(row===1?100:row===3?154:128,78,row===0?44:34,41,0,0,Math.PI*2);fc.fill();if(row!==2)r.drawImage(face,0,0);}else fit(r,head,headRect);
   if(['travelerCap','apprenticeHood'].includes(hood)){
    const layer=canvas(),l=layer.getContext('2d');fit(l,crop(gear,hood==='travelerCap'?0:1,hood==='apprenticeHood'&&row%2?4-row:row,8,4),{x:58,y:7,w:140,h:131});
    // The face window is a regional occlusion mask, not a second head sprite.
    if(row!==2){l.globalCompositeOperation='destination-out';l.beginPath();l.ellipse(row===1?100:row===3?154:128,82,row===0?37:27,31,0,0,Math.PI*2);l.fill();}
    r.drawImage(layer,0,0);
   }
   const ring=equipment.ring?.definitionId;if(['focusRing','strengthRing'].includes(ring))drawGear(ring==='focusRing'?4:5,{x:row===1?86:166,y:157,w:8,h:8});
   ctx.drawImage(result,col*256,row*256);
  }return atlas;
 })();composed.set(key,promise);if(composed.size>24)composed.delete(composed.keys().next().value);try{return await promise;}catch(e){composed.delete(key);throw e;}
}
export async function normalizedParts(name,columns){const image=await load(name),out=canvas(columns*256,1024),ctx=out.getContext('2d');for(let row=0;row<4;row++)for(let col=0;col<columns;col++){const source=crop(image,col,row,columns,4),b=bounds(source),scale=220/b.h;ctx.drawImage(source,b.x,b.y,b.w,b.h,col*256+128-b.w*scale/2,row*256+18,b.w*scale,220);}return out;}
export async function drawAppearancePreview(target,{classId='novice',appearance=defaultAppearance(),equipment={},direction=0,frame=0}={}){const generation=target._appearanceGeneration=(target._appearanceGeneration??0)+1,atlas=await composeAppearance(classId,appearance,equipment);if(target._appearanceGeneration!==generation)return;target.width=256;target.height=256;const ctx=target.getContext('2d');ctx.clearRect(0,0,256,256);ctx.drawImage(atlas,frame*256,direction*256,256,256,0,0,256,256);}
