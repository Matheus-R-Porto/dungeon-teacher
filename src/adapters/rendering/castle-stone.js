import * as THREE from 'three';
// Small original pixel masonry, generated once per scene and shared by all walls.
export function castleStone(material){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#394044';c.fillRect(0,0,128,128);
 const colors=['#a4a59a','#969e98','#8c9692','#b0b0a1','#9a9e92'];
 for(let row=0;row<8;row++)for(let col=-1;col<5;col++){
  const x=col*32+(row%2)*16,y=row*16;c.fillStyle=colors[((col+5)*7+row*3)%colors.length];c.fillRect(x+1,y+1,30,14);
  c.fillStyle='#c0c1ae';c.fillRect(x+2,y+1,27,1);c.fillStyle='#666f6d';c.fillRect(x+2,y+13,27,2);
  c.fillStyle='#7d8882';c.fillRect(x+7+(row%3)*4,y+4,3,1);c.fillRect(x+20,y+9,2,2);
 }
 const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.magFilter=THREE.NearestFilter;map.colorSpace=THREE.SRGBColorSpace;material.map=map;
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 castlePosition; varying vec3 castleNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n castlePosition=(modelMatrix*vec4(transformed,1.0)).xyz;castleNormal=normalize(mat3(modelMatrix)*objectNormal);');
  shader.fragmentShader='varying vec3 castlePosition; varying vec3 castleNormal;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','vec3 cn=abs(castleNormal); vec2 stoneUV=cn.y>0.7?castlePosition.xz:cn.x>cn.z?castlePosition.zy:castlePosition.xy; diffuseColor*=texture2D(map,stoneUV*0.3);');
 };
 material.customProgramCacheKey=()=> 'castle-pixel-stone-v1';return material;
}
