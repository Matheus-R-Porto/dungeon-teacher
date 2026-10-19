import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Bake static pieces by material and spatial cell. Preserve shadows and building fade materials.
export function batchStatic(group,{spatial=false,exclude=new Set()}={}){
 group.updateWorldMatrix(true,true);const inverse=group.matrixWorld.clone().invert(),batches=new Map();
 group.traverse(n=>{if(!n.isMesh||n.isInstancedMesh||Array.isArray(n.material)||exclude.has(n))return;let parent=n.parent;while(parent&&parent!==group){if(exclude.has(parent))return;parent=parent.parent;}
 const cell=spatial?Math.floor(n.matrixWorld.elements[12]/12)+','+Math.floor(n.matrixWorld.elements[14]/12):'';
 const key=n.material.uuid+':'+n.castShadow+':'+n.receiveShadow+':'+cell;const list=batches.get(key)??[];list.push(n);batches.set(key,list);});
 for(const nodes of batches.values()){if(nodes.length<2)continue;const pieces=nodes.map(n=>{const g=n.geometry.index?n.geometry.toNonIndexed():n.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,n.matrixWorld));return g;});const merged=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());if(!merged)continue;const mesh=new THREE.Mesh(merged,nodes[0].material);mesh.castShadow=nodes[0].castShadow;mesh.receiveShadow=nodes[0].receiveShadow;group.add(mesh);for(const n of nodes){n.removeFromParent();n.geometry.dispose();}}
}
