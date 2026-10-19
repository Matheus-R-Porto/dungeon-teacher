// Reuse one validated gait under each equipment pose. Hand/weapon pixels are
// kept together. This is deterministic layer composition, never runtime RNG.
const {app,nativeImage}=require('electron');const fs=require('node:fs');
app.whenReady().then(()=>{
 const dir='public/assets/characters/',load=name=>{const image=nativeImage.createFromPath(dir+name+'.png');return {image,...image.getSize(),bytes:image.toBitmap()};},walk=load('walk-v042');
 const gaitManifest=JSON.parse(fs.readFileSync(dir+'walk-v042.png.json'));
 for(const [name,row]of [['west',1],['east',3]]){const strip=load('walk-'+name+'-v042');strip.bytes.copy(walk.bytes,row*256*walk.width*4);const m=JSON.parse(fs.readFileSync(dir+'walk-'+name+'-v042.png.json'));for(let col=0;col<4;col++)gaitManifest.frames[row*4+col]={...m.frames[col],row};}
 walk.image=nativeImage.createFromBitmap(walk.bytes,{width:walk.width,height:walk.height});fs.writeFileSync(dir+'walk-v042.png',walk.image.toPNG());fs.writeFileSync(dir+'walk-v042.png.json',JSON.stringify(gaitManifest,null,2));
 for(let row=0;row<4;row++)fs.writeFileSync(dir+'walk-v042-row'+row+'.png',walk.image.crop({x:0,y:row*256,width:1024,height:256}).toPNG());
 for(const type of ['adventurer','sword','bow','dagger','staff']){
  const name=type+'-v042',sourceName=name+'-poses';if(!fs.existsSync(dir+sourceName+'.png')){fs.copyFileSync(dir+name+'.png',dir+sourceName+'.png');fs.copyFileSync(dir+name+'.png.json',dir+sourceName+'.png.json');}
  const source=load(sourceName),base=type==='adventurer',cell=base?256:384,columns=base?6:8,oldColumns=type==='staff'?4:columns,width=cell*columns,height=cell*4,out=Buffer.alloc(width*height*4);
  const copy=(src,sx,sy,sw,sh,dx,dy)=>{for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const from=((sy+y)*src.width+sx+x)*4,to=((dy+y)*width+dx+x)*4;src.bytes.copy(out,to,from,from+4);}};
  for(let row=0;row<4;row++)for(let col=0;col<columns;col++){
   const walking=base?col>=1&&col<=4:col>=2&&col<=5,srcCol=walking?(base?0:1):type==='staff'?(col>=6?col-4:col):col;
   copy(source,srcCol*cell,row*cell,cell,cell,col*cell,row*cell);
   if(row===1&&col>=6&&['sword','dagger'].includes(type)){const attacks=load('west-attacks-v042');copy(attacks,(col-6)*384,type==='sword'?0:384,384,384,col*cell,row*cell);}
   if(!walking)continue;const gait=col-(base?1:2);
   if(base)copy(walk,gait*256,row*256,256,256,col*cell,row*cell);
   else{
    // Replace the central lower-body layer, retaining long weapons outside it.
    const top=280,left=122,right=262;
    for(let y=top;y<cell;y++)for(let x=left;x<right;x++)out.fill(0,((row*cell+y)*width+col*cell+x)*4,((row*cell+y)*width+col*cell+x)*4+4);
    const offsetY=117;
    for(let y=163;y<234;y++)for(let x=0;x<256;x++){
     const from=((row*256+y)*walk.width+gait*256+x)*4;if(!walk.bytes[from+3])continue;
     const to=((row*cell+y+offsetY)*width+col*cell+x+64)*4;walk.bytes.copy(out,to,from,from+4);
    }
   }
  }
  const frames=[];for(let row=0;row<4;row++)for(let col=0;col<columns;col++){
   const offset=(x,y)=>((row*cell+y)*width+col*cell+x)*4,seen=new Uint8Array(cell*cell),parts=[];
   for(let i=0;i<seen.length;i++){if(seen[i]||!out[offset(i%cell,Math.floor(i/cell))+3])continue;const queue=[i];seen[i]=1;for(let n=0;n<queue.length;n++){const p=queue[n],x=p%cell,y=Math.floor(p/cell);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,id=ny*cell+nx;if(nx<0||ny<0||nx>=cell||ny>=cell||seen[id]||!out[offset(nx,ny)+3])continue;seen[id]=1;queue.push(id);}}parts.push(queue);}
   const max=Math.max(...parts.map(p=>p.length));let removed=0;for(const p of parts)if(p.length<max*.01){removed+=p.length;for(const i of p){const o=offset(i%cell,Math.floor(i/cell));out.fill(0,o,o+4);}}
   let x0=cell,y0=cell,x1=0,y1=0;for(let y=0;y<cell;y++)for(let x=0;x<cell;x++)if(out[offset(x,y)+3]){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}frames.push({column:col,row,bounds:[x0,y0,x1,y1],removedDetachedPixels:removed});
  }
  const image=nativeImage.createFromBitmap(out,{width,height});fs.writeFileSync(dir+name+'.png',image.toPNG());fs.writeFileSync(dir+name+'.png.json',JSON.stringify({source:sourceName,walk:'walk-v042',cell,columns,rows:4,frames},null,2));
  for(let row=0;row<4;row++)fs.writeFileSync(dir+name+'-row'+row+'.png',image.crop({x:0,y:row*cell,width,height:cell}).toPNG());
 }
 app.quit();
}).catch(e=>{console.error(e);app.exit(1);});
