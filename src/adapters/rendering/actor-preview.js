import * as THREE from 'three';
import {SheetActor} from './sheet-actor.js';
import {defaultAppearance} from '../../domain/appearance.js';
let renderer;
// Development-only evidence harness uses the production actor and shader.
export async function drawActorPreview(target,{classId='novice',appearance=defaultAppearance(),equipment={},direction=0,blend=0,state='idle',dead=false,frame=0,previewFrame,impact,action}={}){
 renderer??=new THREE.WebGLRenderer({alpha:true,antialias:false,preserveDrawingBuffer:true});renderer.setSize(288,288);renderer.setClearColor(0,0);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1.8,1.8,3.1,-.5,.1,100);camera.position.z=10;
 const body=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.Texture(),transparent:true,alphaTest:.12,depthWrite:false,toneMapped:false}));scene.add(body);
 const actor=new SheetActor(scene,body),input={x:0,y:0,z:0,hp:dead?0:100,classId,appearance,equipmentVisual:equipment,moving:frame>0,previewFrame,impact,action};
 actor.prepare(input);await actor.ready();if(actor.error)throw Error(actor.error);actor.update(input,direction,{blend,state,walkDistance:Math.max(0,frame-1)*.45},0,.1,2.7,2.7,camera);renderer.render(scene,camera);
 target.width=target.height=288;target.getContext('2d').drawImage(renderer.domElement,0,0);const result={frame:actor.frame,family:actor.family,body:!!body.material.map,backpack:!!actor.backpack.sprite?.visible,programs:renderer.info.programs.map(p=>({runnable:p.diagnostics?.runnable??true}))};actor.dispose();body.material.dispose();return result;
}
