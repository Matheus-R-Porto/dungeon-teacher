export function atlasRect(width,height,columns,rows,column,row){
  if(![width,height,columns,rows,column,row].every(Number.isInteger)||width<=0||height<=0||columns<=0||rows<=0||width%columns||height%rows||column<0||column>=columns||row<0||row>=rows)throw new RangeError('Invalid integer atlas cell');
  const w=width/columns,h=height/rows;
  // Sample texel centres; never sample the neighbour at an exact cell edge.
  return {x:(column*w+.5)/width,y:1-((row+1)*h-.5)/height,w:(w-1)/width,h:(h-1)/height};
}
export function selectAtlasFrame(texture,column,row){
  const {columns,rows}=texture.userData.atlas;
  const width=texture.image?.width??columns*256,height=texture.image?.height??rows*256;
  const r=atlasRect(width,height,columns,rows,column,row);
  texture.repeat.set(r.w,r.h);texture.offset.set(r.x,r.y);
  texture.userData.frame={column,row};
}
