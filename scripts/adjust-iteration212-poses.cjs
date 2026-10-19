// Offline layout corrections only: mirror complete poses, never splice body parts.
const {app,nativeImage}=require('electron'),fs=require('fs');
app.whenReady().then(()=>{
 const jobs=[['fishing',[[1,0,3,0],[1,1,3,1],[1,2,3,2],[1,3,3,3],[1,4,3,4]]],['staff-transition',[[1,2,3,2],[5,2,7,2]]],['sword-action',[[1,2,1,2],[3,2,3,2]]],['bow-action',[[2,2,2,2]]]];
 for(const [name,changes]of jobs){const base='public/assets/characters/'+name+'-v043',backup=base+'-unadjusted.png';if(!fs.existsSync(backup))fs.copyFileSync(base+'.png',backup);const image=nativeImage.createFromPath(backup),m=JSON.parse(fs.readFileSync(base+'.png.json')),w=m.cell*m.columns,h=m.cell*m.rows,src=image.toBitmap(),out=Buffer.from(src);
  for(const [r,c,sr,sc]of changes){for(let y=0;y<m.cell;y++)for(let x=0;x<m.cell;x++){const a=((sr*m.cell+y)*w+sc*m.cell+m.cell-1-x)*4,b=((r*m.cell+y)*w+c*m.cell+x)*4;src.copy(out,b,a,a+4);}const from=m.frames[sr*m.columns+sc],to=m.frames[r*m.columns+c];to.bounds=[m.cell-1-from.bounds[2],from.bounds[1],m.cell-1-from.bounds[0],from.bounds[3]];to.completePoseMirrorFrom={row:sr,column:sc};}
  const packed=nativeImage.createFromBitmap(out,{width:w,height:h});fs.writeFileSync(base+'.png',packed.toPNG());fs.writeFileSync(base+'.png.json',JSON.stringify(m,null,2));for(let r=0;r<m.rows;r++)fs.writeFileSync(base+'-row'+r+'.png',packed.crop({x:0,y:r*m.cell,width:w,height:m.cell}).toPNG());
 }
 app.quit();
});
