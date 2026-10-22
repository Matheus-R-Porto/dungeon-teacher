import {FrameWindow} from '../core/frame-metrics.js';
import {GraphicsQuality,PROFILES} from '../core/graphics-quality.js';
import {assessGraphics} from '../adapters/rendering/graphics-assessment.js';
export class GraphicsSettings{
 constructor(storage){this.quality=new GraphicsQuality(storage);this.frames=new FrameWindow();this.recent=new FrameWindow(600);this.instant=new FrameWindow(120);this.stages={};this.events=[];this.ready=false;this.loading=false;this.assessing=false;}
 async initialize(){
  this.mount();if(!this.quality.preference.evaluated)await this.evaluate();this.ready=true;
  const tick=now=>{if(!document.hidden&&!this.assessing){if(this.last){this.frames.push(now-this.last);this.recent.push(now-this.last);this.instant.push(now-this.last);}}this.last=now;this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);
  this.timer=setInterval(()=>this.refresh(),1000);this.visibility=()=>{this.last=null;this.recent.clear();};document.addEventListener('visibilitychange',this.visibility);
 }
 async evaluate(){if(this.assessing)return;this.assessing=true;this.sync();try{const {metrics,fingerprint}=await assessGraphics();this.quality.assess(metrics,fingerprint);this.hardwareChanged=false;this.event('assessment',metrics.mean??0);this.apply();}finally{this.assessing=false;this.last=null;this.recent.clear();this.sync();}}
 event(kind,ms){this.events.push({kind,ms,at:performance.now()});if(this.events.length>64)this.events.shift();}
 record(kind,ms){(this.stages[kind]??=new FrameWindow(600)).push(ms);}
 bind(view){this.view=view;this.apply();const update=view.update,render=view.renderer.render;view.update=(...args)=>{if(this.assessing)return;const at=performance.now();try{return update.apply(view,args);}finally{this.record('scene',performance.now()-at);}};view.renderer.render=(...args)=>{const at=performance.now();try{return render.apply(view.renderer,args);}finally{this.record('renderSubmit',performance.now()-at);}};
  const gpu=view.renderer.getContext(),ext=gpu.getExtension('WEBGL_debug_renderer_info');const fingerprint=JSON.stringify({gpu:ext?gpu.getParameter(ext.UNMASKED_RENDERER_WEBGL):gpu.getParameter(gpu.RENDERER),width:screen.width,height:screen.height,dpr:devicePixelRatio});this.hardwareChanged=!!this.quality.preference.fingerprint&&fingerprint!==this.quality.preference.fingerprint;this.sync();
 }
 apply(){const v=this.view;if(!v)return;const q=this.quality,p=q.parameters,ratio=Math.min(devicePixelRatio,p.dpr)*q.scale;
  if(v.renderer.getPixelRatio()!==ratio){v.renderer.setPixelRatio(ratio);v.resize();this.event('resolution',ratio);}
  if(v.sun.shadow.mapSize.x!==p.shadow){v.sun.shadow.map?.dispose();v.sun.shadow.map=null;v.sun.shadow.mapSize.set(p.shadow,p.shadow);v.sun.shadow.needsUpdate=true;}
 }
 mount(){
  const root=document.createElement('section');root.className='graphics-settings';root.innerHTML='<h3>Gráficos e fluidez</h3><label>Perfil <select data-quality><option value="auto">Automático (recomendado)</option><option value="performance">Desempenho</option><option value="balanced">Equilibrado</option><option value="high">Alta Qualidade</option></select></label><p>Automático usa a avaliação local. Desempenho reduz resolução e sombras; Equilibrado combina fluidez e qualidade; Alta Qualidade preserva os detalhes. Nenhum perfil reduz monstros ou indicadores de ataques.</p><p>Meta de fluidez: 60 FPS. A taxa efetiva depende deste computador e do monitor.</p><label><input type="checkbox" data-adaptive> Permitir ajustes automáticos para manter a fluidez.</label><label><input type="checkbox" data-panel> Exibir painel de desempenho (F10)</label><div><button data-assess>Refazer avaliação</button><button data-restore>Restaurar recomendação</button><button data-export>Salvar diagnóstico local</button></div><p data-result role="status"></p>';
  document.getElementById('pause-dialog').append(root);this.root=root;
  const panel=document.createElement('aside');panel.className='frame-diagnostic';panel.hidden=true;panel.innerHTML='<output></output><details><summary>Detalhes técnicos</summary><pre></pre></details>';document.getElementById('app').append(panel);this.panel=panel;
  root.querySelector('[data-quality]').onchange=e=>{this.quality.select(e.target.value);this.apply();this.sync();};root.querySelector('[data-adaptive]').onchange=e=>{this.quality.preference.automatic=e.target.checked;this.quality.reset();this.quality.save();this.apply();this.sync();};root.querySelector('[data-panel]').onchange=e=>this.toggle(e.target.checked);root.querySelector('[data-assess]').onclick=()=>this.evaluate();root.querySelector('[data-restore]').onclick=()=>{this.quality.restore();this.apply();this.sync();};root.querySelector('[data-export]').onclick=()=>this.export();
  this.key=e=>{if(e.code==='F10'&&!e.repeat){e.preventDefault();this.toggle(!this.quality.preference.panel);}};window.addEventListener('keydown',this.key);this.sync();
 }
 toggle(show){this.quality.preference.panel=show;this.quality.save();this.sync();}
 sync(){if(!this.root)return;const p=this.quality.preference;this.root.querySelector('[data-quality]').value=p.profile;this.root.querySelector('[data-adaptive]').checked=p.automatic;this.root.querySelector('[data-panel]').checked=p.panel;this.panel.hidden=!p.panel;this.root.querySelector('[data-assess]').disabled=this.assessing;this.root.querySelector('[data-result]').textContent=this.assessing?'Avaliação local em andamento…':`Recomendação: ${PROFILES[p.recommendation].label}. ${this.hardwareChanged?'Ambiente gráfico mudou. Você pode refazer a avaliação. ':''}${this.quality.persisted===false?'Não foi possível salvar a preferência neste dispositivo.':''}`;}
 refresh(){const now=performance.now();if(now-(this.observed??0)>=5000){this.observed=now;const m=this.recent.snapshot();if(this.quality.observe(m,now,{hidden:document.hidden,loading:this.loading||this.assessing})){this.apply();this.event('adaptive',this.quality.scale);}this.recent.clear();}
  if(!this.quality.preference.panel)return;const m=this.frames.snapshot(),current=this.instant.snapshot(),v=this.view;if(!m.n)return;const fmt=n=>n==null?'amostra insuficiente':n.toFixed(1);this.panel.querySelector('output').textContent=`${fmt(current.fps)} FPS · ${fmt(current.mean)} ms\n1% low ${fmt(m.low1)} · 0,1% low ${fmt(m.low01)}\nPico ${fmt(m.max)} ms · ${m.thresholds[100].count} pausas >100 ms\n${PROFILES[this.quality.active].label} · escala ${Math.round(this.quality.scale*100)}% · ${v?.canvas.width??0}×${v?.canvas.height??0}\nAjuste automático ${this.quality.preference.automatic?'ligado':'desligado'}${this.quality.limited?' · Hardware abaixo da meta nesta cena':''}\nJanela: últimos ${m.n} quadros`;
  if(this.panel.querySelector('details').open)this.panel.querySelector('pre').textContent=JSON.stringify(this.diagnostic(),null,2);
 }
 diagnostic(){const v=this.view;return {version:'0.6.4',environment:{agent:navigator.userAgent,dpr:devicePixelRatio,viewport:[innerWidth,innerHeight],localGraphics:this.quality.preference.fingerprint},frames:this.frames.snapshot(),stages:Object.fromEntries(Object.entries(this.stages).map(([k,w])=>[k,w.snapshot()])),events:this.events,transition:v?.transitionReport??null,profile:this.quality.active,scale:this.quality.scale,automatic:this.quality.preference.automatic,internalResolution:v?[v.canvas.width,v.canvas.height]:null,render:v?{...v.renderer.info.render}:null,memory:v?{...v.renderer.info.memory,jsHeap:performance.memory?.usedJSHeapSize}:null};}
 export(){const url=URL.createObjectURL(new Blob([JSON.stringify(this.diagnostic(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='dungeon-teacher-diagnostico.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 dispose(){clearInterval(this.timer);cancelAnimationFrame(this.frame);window.removeEventListener('keydown',this.key);document.removeEventListener('visibilitychange',this.visibility);this.root?.remove();this.panel?.remove();}
}
let active;
export const getGraphics=()=>active;
export async function initializeGraphics(){active?.dispose();let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('storage unavailable');}};}active=new GraphicsSettings(storage);await active.initialize();return active;}

if(import.meta.hot)import.meta.hot.dispose(()=>active?.dispose());

