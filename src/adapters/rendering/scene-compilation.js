import * as THREE from 'three';
import {bounded,nextFrame} from '../../core/scene-work.js';

// compileAsync submits synchronously before waiting for the GPU. Bound that
// submission by object count; preserve the original scene for lights/fog/shadows.
export async function compileScene(view,signal,record,prefix='shader'){
 const objects=[];
 const camera=view.world?.awakening?.cave?view.camera.clone(false):view.camera;
 if(camera!==view.camera)camera.layers.enable(1);
 view.scene.traverse(o=>{if(o.isMesh||o.isSprite||o.isLine||o.isPoints)objects.push(o);});
 const batch=new THREE.Group(),pending=[];let slice=performance.now();
 try{
  for(let i=0;i<objects.length;i+=16){
   if(signal.aborted)throw new DOMException('Cancelado','AbortError');
   // A traversal-only collection: no reparenting, cloning or disposal of objects.
   batch.children=objects.slice(i,i+16);
   const at=performance.now(),compilation=view.renderer.compileAsync(batch,camera,view.scene);
   record(prefix+'-submit:'+i,performance.now()-at);
   // Submit cooperatively, but allow GPU compilation of different batches to
   // overlap. Serial waits inflated cold arena entry in the first experiment.
   const promise=Promise.resolve(compilation);promise.catch(()=>{});pending.push(promise);
   if(performance.now()-slice>=3){await nextFrame(signal);slice=performance.now();}
  }
  await bounded(Promise.all(pending),signal);
 }finally{batch.children=[];}
}
