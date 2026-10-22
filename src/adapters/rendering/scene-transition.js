import {runSceneWork,nextFrame,bounded} from '../../core/scene-work.js';
import {getGraphics} from '../../ui/graphics-settings.js';
import {SceneView} from './scene.js';
import {warmScene} from './scene-warmup.js';
import {compileScene} from './scene-compilation.js';
import {prepareActorAtlases} from './actor-preparation.js';

// One pending destination, no world cache. Private map data arrives only in onMap.
export class SceneTransition {
 constructor(canvas){this.canvas=canvas;this.generation=0;this.history=[];this.overlay=document.createElement('div');this.overlay.className='scene-transition';this.overlay.setAttribute('role','status');this.overlay.hidden=true;document.body.append(this.overlay);}
 cancel(){this.generation++;this.controller?.abort();this.fade?.cancel();this.controller=null;this.busy=false;this.overlay.hidden=true;if(getGraphics())getGraphics().loading=false;}
 async prepare(world,old,entities,{beforePresent=()=>{},beforeCompile=()=>{},signal:external}={}){
  this.cancel();const generation=this.generation,controller=this.controller=new AbortController(),signal=controller.signal;
  let timedOut=false;const timeout=setTimeout(()=>{timedOut=true;controller.abort();},15000);
  const abort=()=>controller.abort();external?.addEventListener('abort',abort,{once:true});if(external?.aborted)abort();this.busy=true;this.overlay.hidden=false;this.overlay.textContent='Preparando passagem…';if(getGraphics())getGraphics().loading=true;
  const report={map:world.id,started:performance.now(),stages:[],heapBefore:performance.memory?.usedJSHeapSize};let view;
  const record=(name,ms)=>{report.stages.push({name,ms});getGraphics()?.event('transition:'+name,ms);};
  const stage=async(name,fn)=>{const at=performance.now();const result=await fn();record(name,performance.now()-at);return result;};
  try{
   await nextFrame(signal);
   view=await stage('structure',()=>new SceneView(this.canvas,world,old?.renderer,{deferred:true}));view.transitionReport=report;
   await runSceneWork(view.buildSteps(),{signal,record});
   await stage('entities-ready',()=>entities(view,signal));
   await stage('textures',()=>bounded(view.texturesReady(),signal));
   await stage('actor-atlases',()=>prepareActorAtlases(view,signal,record));
   await stage('prepared-pose',()=>beforeCompile(view));
   await nextFrame(signal);
   await stage('shaders',()=>compileScene(view,signal,record));
   await stage('gpu-preparation',()=>warmScene(view,signal,record));
   if(view.renderer.getContext().isContextLost())throw Error('Contexto gráfico perdido. Reconecte para tentar novamente.');
   await nextFrame(signal);if(signal.aborted)throw new DOMException('Cancelado','AbortError');
   await stage('camera',()=>beforePresent(view));
   report.ready=performance.now();report.total=report.ready-report.started;report.maxUnit=Math.max(...report.stages.filter(s=>!['shaders','gpu-shaders','textures','gpu-preparation','entities-ready','actor-atlases'].includes(s.name)).map(s=>s.ms));
   return view;
  }catch(error){view?.dispose({releaseRenderer:!old});if(timedOut)error=Error('Tempo limite na preparação do mapa. Tente novamente.');report.error=error.message;if(generation===this.generation)this.cancel();throw error;}
  finally{clearTimeout(timeout);external?.removeEventListener('abort',abort);report.heapAfter=performance.memory?.usedJSHeapSize;this.history.push(report);if(this.history.length>32)this.history.shift();if(generation===this.generation){this.controller=null;}}
 }
 async presented(view){const generation=this.generation;const at=performance.now();await nextFrame();await nextFrame();view.transitionReport.presentationProxy=performance.now()-at;if(generation!==this.generation)return;const fade=this.fade=this.overlay.animate([{opacity:1},{opacity:0}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:120,easing:'ease-out'});await fade.finished.catch(()=>{});if(generation!==this.generation)return;view.transitionReport.controlAt=performance.now();view.transitionReport.controlLatency=performance.now()-view.transitionReport.started;this.busy=false;if(getGraphics())getGraphics().loading=false;this.overlay.hidden=true;}
 fail(error){this.cancel();document.getElementById('toast').textContent='Não foi possível preparar o mapa: '+error.message;document.getElementById('toast').hidden=false;}
 dispose(){this.cancel();this.overlay.remove();}
}
