// Technical atlas packing, not an art generator. Connected alpha silhouettes
// are copied intact into integer cells. Originals are retained for provenance.
const {app,nativeImage}=require('electron');
const fs=require('node:fs');
app.whenReady().then(()=>{
 const [input,output,colsArg,rowsArg]=process.argv.slice(2),columns=+colsArg,rows=+rowsArg;
 const image=nativeImage.createFromPath(input),{width,height}=image.getSize(),pixels=image.toBitmap(),seen=new Uint8Array(width*height),components=[];
 for(let i=0;i<seen.length;i++){
  if(seen[i]||pixels[i*4+3]<200)continue;
  const queue=[i];seen[i]=1;let minX=width,minY=height,maxX=0,maxY=0;
  for(let q=0;q<queue.length;q++){const p=queue[q],x=p%width,y=Math.floor(p/width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=x+dx,ny=y+dy,n=ny*width+nx;if(nx<0||ny<0||nx>=width||ny>=height||seen[n]||pixels[n*4+3]<200)continue;seen[n]=1;queue.push(n);}
  }
  components.push({minX,minY,maxX,maxY,count:queue.length,pixels:queue});
 }
 const major=components.filter(c=>c.count>600).sort((a,b)=>b.count-a.count).slice(0,columns*rows);
 if(major.length!==columns*rows||major.some(c=>c.maxX-c.minX>width/columns*1.4))throw new Error('Invalid silhouettes / nontransparent background: '+major.length);
 // Sort by row centre first, then x within each row; no assumptions about PNG cell boundaries.
 major.sort((a,b)=>(a.minY+a.maxY)-(b.minY+b.maxY));
 const ordered=[];for(let r=0;r<rows;r++)ordered.push(...major.slice(r*columns,(r+1)*columns).sort((a,b)=>a.minX-b.minX));
 for(const c of components){if(major.includes(c))continue;let best,dist=Infinity;const x=(c.minX+c.maxX)/2,y=(c.minY+c.maxY)/2;
  for(const m of major){const d=Math.hypot(Math.max(m.minX-x,0,x-m.maxX),Math.max(m.minY-y,0,y-m.maxY));if(d<dist){dist=d;best=m;}}
  if(dist<=40){best.pixels.push(...c.pixels);best.minX=Math.min(best.minX,c.minX);best.maxX=Math.max(best.maxX,c.maxX);best.minY=Math.min(best.minY,c.minY);best.maxY=Math.max(best.maxY,c.maxY);}
 }
 const cell=process.argv.includes("--wide")?512:320,padding=cell/10,scale=1;
 const out=Buffer.alloc(cell*columns*cell*rows*4),manifest={source:input,width,height,columns,rows,cell,padding,scale,frames:[]};
 ordered.forEach((c,i)=>{
  const w=c.maxX-c.minX+1,h=c.maxY-c.minY+1,mask=new Set(c.pixels);
  const hair=c.pixels.filter(p=>Math.floor(p/width)<c.minY+h*.48&&pixels[p*4+2]>pixels[p*4+1]*1.25&&pixels[p*4+1]>pixels[p*4]*1.1&&pixels[p*4+2]>45).map(p=>p%width).sort((a,b)=>a-b);
  const anchor=hair.length?hair[Math.floor(hair.length/2)]:(c.minX+c.maxX)/2;
  const hairYs=c.pixels.filter(p=>Math.floor(p/width)<c.minY+h*.5&&pixels[p*4+2]>pixels[p*4+1]*1.25&&pixels[p*4+1]>pixels[p*4]*1.1&&pixels[p*4+2]>45).map(p=>Math.floor(p/width));
  const top=hairYs.length?Math.min(...hairYs):c.minY;
  const scale=Math.min(200/(c.maxY-top+1),(cell-2*padding)/w,(cell-2*padding)/h);
  const sw=Math.round(w*scale),sh=Math.round(h*scale),x0=Math.round(cell/2-(anchor-c.minX)*scale),y0=Math.round(cell-padding-sh);
  if(x0<8||x0+sw>cell-8||y0<8)throw Error('Frame outside safe cell: '+i);
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const sx=c.minX+Math.min(w-1,Math.floor(x/scale)),sy=c.minY+Math.min(h-1,Math.floor(y/scale)),src=sy*width+sx;if(!mask.has(src))continue;const dst=((Math.floor(i/columns)*cell+y0+y)*cell*columns+(i%columns)*cell+x0+x)*4;pixels.copy(out,dst,src*4,src*4+4);}
  manifest.frames.push({column:i%columns,row:Math.floor(i/columns),scale,sourceBounds:[c.minX,c.minY,c.maxX,c.maxY],bounds:[x0,y0,x0+sw-1,y0+sh-1]});
 });
 const packed=nativeImage.createFromBitmap(out,{width:cell*columns,height:cell*rows});
 fs.writeFileSync(output,packed.toPNG());fs.writeFileSync(output+'.json',JSON.stringify(manifest,null,2));fs.writeFileSync(output.replace('.png','-reference.png'),packed.crop({x:0,y:0,width:cell,height:cell}).toPNG());
 for(let row=0;row<rows;row++)fs.writeFileSync(output.replace('.png','-row'+row+'.png'),packed.crop({x:0,y:row*cell,width:cell*columns,height:cell}).toPNG());
 console.log(JSON.stringify(manifest));app.quit();
}).catch(e=>{console.error(e);app.exit(1);});
