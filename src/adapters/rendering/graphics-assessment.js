import * as THREE from 'three';
import {artSprite} from './art.js';
import {frameMetrics} from '../../core/frame-metrics.js';
import {sampleAssessment} from '../../core/assessment-sampler.js';
// Local, disposable visual workload. No Game, Character, save or network imports.
export async function assessGraphics({duration=4000,timeout=8000}={}){
 const canvas=document.createElement('canvas'),notice=document.createElement('div');canvas.className='graphics-assessment';notice.className='graphics-assessment-notice';notice.textContent='Ajustando os gráficos para este computador…';document.body.append(canvas,notice);
 let renderer,scene;
 try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x283c39);const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100);camera.position.set(0,14,22);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x405040,2));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-8,18,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
  const geo=new THREE.BoxGeometry(1,2,1),mat=new THREE.MeshStandardMaterial({color:0x829c72}),ground=new THREE.Mesh(new THREE.PlaneGeometry(50,50),mat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  for(let i=0;i<90;i++){const m=new THREE.Mesh(geo,mat);m.position.set((i%15-7)*2,1,(Math.floor(i/15)-3)*3);m.castShadow=true;scene.add(m);}
  const sprites=[];for(let i=0;i<32;i++){const s=artSprite('/assets/monsters/oath-knight-v060.svg',8,4,i%8,i%4,2,3);s.position.set((i%8-3.5)*2,0,(Math.floor(i/8)-2)*2);scene.add(s);sprites.push(s);}
  const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info'),gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),fingerprint=JSON.stringify({gpu,width:screen.width,height:screen.height,dpr:devicePixelRatio});
  const result=await sampleAssessment(now=>{if(renderer.getContext().isContextLost())throw Error('Context lost');sprites.forEach((s,i)=>s.position.y=Math.sin(now*.003+i)*.15);camera.position.x=Math.sin(now*.0004)*3;camera.lookAt(0,0,0);renderer.render(scene,camera);},{duration,timeout});
  return {metrics:result.status==='complete'?frameMetrics(result.values):{n:0,reason:result.status},fingerprint};
 }catch(error){return {metrics:{n:0,reason:'WebGL assessment failed'},fingerprint:''};}
 finally{const geometries=new Set(),materials=new Set(),textures=new Set();scene?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of o.material?[o.material].flat():[]){materials.add(m);if(m.map)textures.add(m.map);}});textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());renderer?.dispose();renderer?.forceContextLoss();canvas.remove();notice.remove();}
}
