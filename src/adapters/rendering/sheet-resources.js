import * as THREE from 'three';
const entries=new Map();
const loader=new THREE.TextureLoader();
const idleLimit=8;
export const sheetMetrics={loads:0,evictions:0,preparationMs:0};
function load(url,color=false){if(typeof document==='undefined')return Promise.resolve(new THREE.Texture());return new Promise((resolve,reject)=>loader.load(url,t=>{t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;resolve(t);},undefined,reject));}
function trim(){const idle=[...entries.values()].filter(e=>e.refs===0&&e.loaded).sort((a,b)=>a.used-b.used);while(idle.length>idleLimit){const e=idle.shift();entries.delete(e.key);e.texture.dispose();e.mask.dispose();sheetMetrics.evictions++;}}
export function acquireSheet(key){
 let e=entries.get(key);
 if(!e){e={key,refs:0,used:performance.now(),loaded:false};entries.set(key,e);const start=performance.now(),url=key.startsWith('profession:')?'/assets/professions-v38/'+key.slice(11):'/assets/characters-v38/'+key;e.ready=Promise.allSettled([load(url+'.png',true),load(url+'-mask.png')]).then(results=>{if(results.some(r=>r.status==='rejected')){for(const r of results)if(r.status==='fulfilled')r.value.dispose();entries.delete(key);throw Error('Não foi possível carregar a aparência '+key);}e.texture=results[0].value;e.mask=results[1].value;e.loaded=true;sheetMetrics.loads++;sheetMetrics.preparationMs+=performance.now()-start;trim();return e;});}
 e.refs++;e.used=performance.now();return e;
}
export function releaseSheet(e){if(!e)return;e.refs=Math.max(0,e.refs-1);e.used=performance.now();trim();}
export function sheetCacheStats(){return {entries:entries.size,active:[...entries.values()].filter(e=>e.refs>0).length,idle:[...entries.values()].filter(e=>!e.refs).length,...sheetMetrics};}
export function applySheetPalette(material){
 const uniforms={primary:{value:new THREE.Color()},secondary:{value:new THREE.Color()},mask:{value:null},enabled:{value:0}};
 material.onBeforeCompile=shader=>{shader.uniforms.sheetPrimary=uniforms.primary;shader.uniforms.sheetSecondary=uniforms.secondary;shader.uniforms.sheetMask=uniforms.mask;shader.uniforms.sheetEnabled=uniforms.enabled;shader.fragmentShader='uniform vec3 sheetPrimary;\nuniform vec3 sheetSecondary;\nuniform sampler2D sheetMask;\nuniform float sheetEnabled;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   vec2 paletteRegion=texture2D(sheetMask,vMapUv).rg;
   float clothShade=dot(diffuseColor.rgb,vec3(.3,.59,.11))/.085;
   vec3 clothColor=mix(sheetPrimary,sheetSecondary,step(.5,paletteRegion.g));
   diffuseColor.rgb=mix(diffuseColor.rgb,clothColor*clothShade,sheetEnabled*step(.5,max(paletteRegion.r,paletteRegion.g)));`);};
 material.customProgramCacheKey=()=> 'prepared-sheet-palette-37';return uniforms;
}
