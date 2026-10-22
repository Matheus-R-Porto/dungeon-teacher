import * as THREE from 'three';
import {selectAtlasFrame} from '../../core/atlas.js';
// One decoded source per atlas; UV clones share the source and GPU texture storage.
const sources=new Map();
export function artTexture(url,columns=1,rows=1,column=0,row=0){
 // Headless geometry/raycast tests have no browser image decoder or GPU.
 if(typeof document==='undefined'){const texture=new THREE.Texture();texture.userData.atlas={columns,rows};selectAtlasFrame(texture,column,row);return texture;}
 let record=sources.get(url);if(!record){record={waiting:new Set()};record.texture=new THREE.TextureLoader().load(url,()=>{for(const clone of record.waiting){const f=clone.userData.frame;selectAtlasFrame(clone,f.column,f.row);clone.needsUpdate=true;}record.waiting.clear();},undefined,()=>{record.waiting.clear();console.error('Não foi possível carregar a arte: '+url);});const source=record.texture;source.colorSpace=THREE.SRGBColorSpace;source.magFilter=THREE.NearestFilter;source.minFilter=THREE.NearestFilter;source.generateMipmaps=false;sources.set(url,record);}
 // Texture.clone() dirties the shared Source even though only UVs differ. Keep
 // the new texture dirty for initialization without reuploading unchanged pixels.
 const texture=new THREE.Texture();texture.needsUpdate=true;texture.source=record.texture.source;
 texture.colorSpace=record.texture.colorSpace;texture.magFilter=record.texture.magFilter;texture.minFilter=record.texture.minFilter;texture.generateMipmaps=record.texture.generateMipmaps;
 texture.userData.atlas={columns,rows};texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.flipY=true;selectAtlasFrame(texture,column,row);
 record.refs=(record.refs??0)+1;let released=false;texture.addEventListener('dispose',()=>{if(!released){released=true;record.refs--;}});
 // A destination cannot be shown before its requested atlases have decoded.
 texture.userData.ready=()=>record.decoded??=new Promise((resolve,reject)=>{const started=performance.now();const check=()=>{const image=record.texture.image;if(image){(image.decode?.()??Promise.resolve()).then(resolve,reject);return;}if(performance.now()-started>8000){reject(Error('Arte indisponível: '+url));return;}setTimeout(check,25);};check();});
 if(!record.texture.image){record.waiting.add(texture);texture.addEventListener('dispose',()=>record.waiting.delete(texture));}
 return texture;
}
export function artSprite(url,columns,rows,column,row,width,height){const texture=artTexture(url,columns,rows,column,row),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.12,depthWrite:true,toneMapped:false}));sprite.center.set(.5,.02);sprite.scale.set(width,height,1);return sprite;}
export function dropUnusedArt(url){const record=sources.get(url);if(record&&record.refs===0){record.texture.dispose();sources.delete(url);}}
