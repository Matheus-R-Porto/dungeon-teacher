(async()=>{
 const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
 const root=window.taskRoot,out=path.join(root,'prepared');fs.mkdirSync(out,{recursive:true});
 const C=96,columns=9,rows=16,frames=36;
 const canvas=(w=C,h=C)=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').imageSmoothingEnabled=false;return c;};
 const save=(name,c)=>fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(c.toDataURL('image/png').split(',')[1],'base64'));
 async function source(id){const file=path.join(root,'masters',id+'.png'),meta=JSON.parse(fs.readFileSync(file+'.json','utf8'));const image=new Image();image.src=pathToFileURL(file).href;await image.decode();return {image,meta};}
 const equipment=await source('equipment');
 const hue=(r,g,b)=>{const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;if(!d)return 0;return ((max===r?(g-b)/d:max===g?2+(b-r)/d:4+(r-g)/d)*60+360)%360;};
 function mask(c){const m=canvas(c.width,c.height),g=m.getContext('2d'),pixels=c.getContext('2d').getImageData(0,0,c.width,c.height),data=g.createImageData(c.width,c.height);let primary=0,secondary=0;for(let i=0;i<pixels.data.length;i+=4){const [r,bg,b,a]=pixels.data.subarray(i,i+4),max=Math.max(r,bg,b),min=Math.min(r,bg,b),h=hue(r,bg,b);data.data[i+3]=255;if(a<128||max<26||(max-min)/max<.27)continue;if(h>=203&&h<255&&b>r*1.2){data.data[i]=255;primary++;}else if(h>=255&&h<303&&b>bg*1.2){data.data[i+1]=255;secondary++;}}g.putImageData(data,0,0);return {image:m,primary,secondary};}
 function pose(src,col,dir,scale=1){const c=canvas(),g=c.getContext('2d'),x=col*C,y=dir*C;g.drawImage(src.image,x,y,C,C,Math.round(48-48*scale),Math.round(88-88*scale),Math.round(C*scale),Math.round(C*scale));return c;}
 function gear(g,family,dir,held,frame){if(family==='none')return;const i={sword:0,dagger:2,bow:4,staff:6}[family]+(held?1:0),b=equipment.meta.frames[dir*8+i].bounds,w=b[2]-b[0]+1,h=b[3]-b[1]+1;
  const walk=frame>=2&&frame<18,step=walk?Math.floor((frame-(frame<10?2:10))/2):0;
  const length=held?{sword:32,dagger:19,bow:36,staff:45}[family]:{sword:25,dagger:18,bow:34,staff:43}[family];
  const draw=(x,y,angle,grip)=>{g.save();g.translate(Math.round(x),Math.round(y));g.rotate(angle);const dw=Math.round(w/h*length);g.drawImage(equipment.image,i*C+b[0],dir*C+b[1],w,h,-Math.round(dw/2),-Math.round(length*grip),dw,length);g.restore();};
  if(held){const points=[[33,63],[41,65],[63,63],[55,65]],point=points[dir],swing=walk?[-2,0,2,0][step]:0,angle=(dir===1?-1:dir===3?1:dir===2?.4:-.4)*({sword:.9,dagger:.65,bow:.15,staff:.28}[family]);draw(point[0]+(dir%2?swing:0),point[1]+(dir%2?0:swing),angle,family==='bow'?.5:family==='staff'?.65:.84);if(family==='dagger')draw(96-point[0],point[1]-swing,-angle,.84);}
  else if(family==='sword'||family==='dagger')draw([35,57,61,39][dir],66,dir===2?-.16:.16,.18);
  else draw([48,56,48,40][dir],60,dir===3?-.4:.4,.55);
 }
 const report=[];
 for(const classId of ['novice','warrior','archer','rogue','priest','mage'])for(const body of ['masculine','feminine']){
  const id=classId+'-'+body,main=await source(id+'-main'),actions=await source(id+'-actions');
  const walkFile=path.join(root,'masters',id+'-walk.png'),walk=fs.existsSync(walkFile)?await source(id+'-walk'):null;
  const ratio=src=>main.meta.scale/src.meta.scale*(main.meta.width/main.meta.columns)/(src.meta.width/src.meta.columns);
  const actionScale=ratio(actions),walkScale=walk?ratio(walk):1;
  for(const family of ['none','sword','bow','staff','dagger']){
   const atlas=canvas(C*columns,C*rows),regions=canvas(C*columns,C*rows),g=atlas.getContext('2d'),mg=regions.getContext('2d');let primary=0,secondary=0;
   for(let dir=0;dir<4;dir++)for(let frame=0;frame<frames;frame++){
    let src=main,col=0,scale=1,attach=false,held=false;
    if(frame<18){attach=true;held=frame===1||frame>=10;if(frame>=2){const phase=Math.floor((frame-(held?10:2))/2);src=walk??main;col=walk?phase:[1,2,3,0][phase];scale=walkScale;}}
    else if(frame===18||frame===19||frame===20){const impact=frame!==18;if(family==='sword'){col=impact?5:4;}else{src=actions;scale=actionScale;col=({bow:0,staff:2,dagger:4,none:6}[family])+(impact?1:0);}}
    else if(frame===21||frame===31){attach=true;held=true;}
    else if(frame>=22&&frame<=28){src=actions;scale=actionScale;col=[22,24,25].includes(frame)?6:7;}
    else if(frame===29){src=walk??main;scale=walkScale;col=walk?0:1;attach=true;held=true;}
    else if(frame===30){col=6;}
    else if(frame===32){col=7;}
    else {attach=true;held=frame>=34;}
    const base=pose(src,col,dir,scale),region=mask(base),complete=canvas(),cg=complete.getContext('2d');
    // Only complete body poses are copied. Standard equipment is baked once.
    const behind=attach&&!held&&(family==='bow'||family==='staff')&&dir!==2;
    if(behind)gear(cg,family,dir,held,frame);cg.drawImage(base,0,0);if(attach&&!behind){const overlay=canvas(),og=overlay.getContext('2d');gear(og,family,dir,held,frame);cg.drawImage(overlay,0,0);const maskContext=region.image.getContext('2d');maskContext.globalCompositeOperation='destination-out';maskContext.drawImage(overlay,0,0);maskContext.globalCompositeOperation='source-over';}
    // Palette masks cover authored fabric; neutral equipment is never recolored.
    const index=dir*frames+frame,x=index%columns*C,y=Math.floor(index/columns)*C;g.drawImage(complete,x,y);mg.drawImage(region.image,x,y);primary+=region.primary;secondary+=region.secondary;
   }
   save(id+'-'+family,atlas);save(id+'-'+family+'-mask',regions);report.push({id:id+'-'+family,frames:frames*4,width:atlas.width,height:atlas.height,primaryPixels:primary,secondaryPixels:secondary,walk:!!walk,actionScale,walkScale});
  }
 }
 return report;
})()
