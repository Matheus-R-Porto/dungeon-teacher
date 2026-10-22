import * as THREE from 'three';
import {nextFrame} from '../../core/scene-work.js';
import {compileScene} from './scene-compilation.js';
// Upload/prepare distinct geometry + material combinations offscreen, in small
// batches. Objects, lights, shadow settings and final scene content are preserved.
export async function warmScene(view,signal,record){
 const renderer=view.renderer,objects=[],seenGeometry=new Set(),seenMaterials=new Set();
 view.scene.traverse(o=>{if(o.isMesh||o.isSprite||o.isLine||o.isPoints)objects.push({o,visible:o.visible,culled:o.frustumCulled});});
 view.scene.updateMatrixWorld(true);view.camera.updateMatrixWorld(true);view.sun.shadow.updateMatrices(view.sun,view.camera);
 const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(view.camera.projectionMatrix,view.camera.matrixWorldInverse));
 const shadowFrustum=view.sun.shadow.getFrustum();
 const selected=objects.filter(({o})=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;const intersects=f=>o.isSprite?f.intersectsSprite(o):f.intersectsObject(o);if(o.frustumCulled&&!intersects(frustum)&&!(o.castShadow&&intersects(shadowFrustum)))return false;
  const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>m?.map?.source??m?.type);const needed=o.geometry&&!seenGeometry.has(o.geometry)||materials.some(m=>!seenMaterials.has(m));if(o.geometry)seenGeometry.add(o.geometry);for(const m of materials)seenMaterials.add(m);return needed;});
 const target=new THREE.WebGLRenderTarget(32,32),previous=renderer.getRenderTarget();
 const shadowSize=view.sun.shadow.mapSize.clone();view.sun.shadow.mapSize.set(32,32);
 try{
  const at=performance.now();try{renderer.setRenderTarget(target);await compileScene(view,signal,record,'gpu-shader');}finally{renderer.setRenderTarget(previous);}record('gpu-shaders',performance.now()-at);
  for(const {o}of objects)o.visible=false;
  let slice=performance.now();await nextFrame(signal);
  for(let i=0;i<selected.length;i+=1){
   if(performance.now()-slice>=3){await nextFrame(signal);slice=performance.now();}if(signal.aborted)throw new DOMException('Cancelado','AbortError');const group=selected.slice(i,i+1);for(const {o}of group){o.visible=true;o.frustumCulled=false;}
   const at=performance.now();try{renderer.setRenderTarget(target);renderer.render(view.scene,view.camera);}finally{renderer.setRenderTarget(previous);}record('gpu-batch:'+i+':'+group[0].o.type,performance.now()-at);
   for(const {o}of group)o.visible=false;
  }
 }finally{renderer.setRenderTarget(previous);for(const {o,visible,culled}of objects){o.visible=visible;o.frustumCulled=culled;}view.sun.shadow.dispose();view.sun.shadow.map=null;view.sun.shadow.mapSize.copy(shadowSize);target.dispose();}
}

