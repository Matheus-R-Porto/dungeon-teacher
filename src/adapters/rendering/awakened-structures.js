import {buildWolfCave} from './wolf-cave.js';
import * as THREE from 'three';
export function buildAwakened(v){
 const a=v.world.awakening;if(!a)return;
 if(a.fortress&&!v.world.castle){const layer=v.world.surfaces.find(s=>s.id===a.fortress.deck),d={...layer,...layer.visualBase};for(const dx of [-6,6])for(const dz of [-5,5]){v.mesh(new THREE.CylinderGeometry(1.4,1.8,9,8),v.mats.darkStone,v.scene,d.x+dx,4.5,d.z+dz);for(let k=0;k<6;k++){const angle=k*Math.PI/3;v.box(v.scene,.45,.8,.45,d.x+dx+Math.cos(angle)*1.2,9,d.z+dz+Math.sin(angle)*1.2,v.mats.stoneLight);}}}
 if(a.cave)buildWolfCave(v);
}
