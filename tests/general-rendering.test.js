import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {freezeStaticSubtree} from '../src/adapters/rendering/static-transforms.js';
import {batchStatic} from '../src/adapters/rendering/static-batch.js';

test('fixed city transforms preserve world positions and animated exclusions',()=>{
 const scene=new THREE.Scene(),root=new THREE.Group(),fixed=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial()),flag=fixed.clone();
 root.position.set(12,3,-8);root.rotation.y=.8;fixed.position.set(2,0,4);flag.position.set(-3,2,0);root.add(fixed,flag);scene.add(root);scene.updateMatrixWorld(true);
 const before=fixed.matrixWorld.clone(),flagBefore=flag.matrixWorld.clone();
 freezeStaticSubtree(root,{exclude:new Set([flag])});flag.rotation.y=.4;fixed.material.opacity=.3;scene.updateMatrixWorld(true);
 assert.deepEqual(fixed.matrixWorld.elements,before.elements);assert.notDeepEqual(flag.matrixWorld.elements,flagBefore.elements);
 assert.equal(flag.matrixAutoUpdate,true);assert.equal(fixed.matrixAutoUpdate,false);assert.equal(fixed.material.opacity,.3);
});

test('already spatially grouped exterior retains separate bounds during city grouping',()=>{
 const scene=new THREE.Scene(),exterior=new THREE.Group(),material=new THREE.MeshBasicMaterial();scene.add(exterior);
 for(const x of [-30,-29,30,31]){const m=new THREE.Mesh(new THREE.BoxGeometry(),material);m.position.x=x;exterior.add(m);}
 batchStatic(exterior,{spatial:true});assert.equal(exterior.children.length,2);
 const bounds=new THREE.Box3().setFromObject(exterior);
 batchStatic(scene,{spatial:true,exclude:new Set([exterior])});
 assert.equal(exterior.children.length,2);assert.deepEqual(new THREE.Box3().setFromObject(exterior),bounds);
 for(const mesh of exterior.children){mesh.geometry.computeBoundingBox();assert.ok(mesh.geometry.boundingBox.max.x-mesh.geometry.boundingBox.min.x<4);}
});
