import * as THREE from 'three';
import {selectAtlasFrame} from '../../core/atlas.js';
// One decoded source per atlas; UV clones share the source and GPU texture storage.
const sources=new Map();
export function artTexture(url,columns=1,rows=1,column=0,row=0){
 // Headless geometry/raycast tests have no browser image decoder or GPU.
 if(typeof document==='undefined'){const texture=new THREE.Texture();texture.userData.atlas={columns,rows};selectAtlasFrame(texture,column,row);return texture;}
 let record=sources.get(url);if(!record){record={waiting:new Set()};record.texture=new THREE.TextureLoader().load(url,()=>{for(const clone of record.waiting){const f=clone.userData.frame;selectAtlasFrame(clone,f.column,f.row);clone.needsUpdate=true;}record.waiting.clear();},undefined,()=>{record.waiting.clear();console.error('Não foi possível carregar a arte: '+url);});const source=record.texture;source.colorSpace=THREE.SRGBColorSpace;source.magFilter=THREE.NearestFilter;source.minFilter=THREE.NearestFilter;source.generateMipmaps=false;sources.set(url,record);}
 const texture=record.texture.clone();texture.userData.atlas={columns,rows};texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.flipY=true;selectAtlasFrame(texture,column,row);
 if(!record.texture.image){record.waiting.add(texture);texture.addEventListener('dispose',()=>record.waiting.delete(texture));}
 return texture;
}
export function artSprite(url,columns,rows,column,row,width,height){const texture=artTexture(url,columns,rows,column,row),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.12,depthWrite:true,toneMapped:false}));sprite.center.set(.5,.02);sprite.scale.set(width,height,1);return sprite;}
