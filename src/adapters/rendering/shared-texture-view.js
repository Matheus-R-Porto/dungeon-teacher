import * as THREE from 'three';
// Same source-sharing technique used by NPC art: UV state is per sprite,
// decoded pixels and GPU storage remain shared. Do not dirty the source.
export function sharedTextureView(source){
 const t=new THREE.Texture();t.needsUpdate=true;t.source=source.source;
 for(const key of ['colorSpace','magFilter','minFilter','generateMipmaps','wrapS','wrapT','flipY','premultiplyAlpha','unpackAlignment'])t[key]=source[key];
 return t;
}
