import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {atlasRect} from '../src/core/atlas.js';
import {VisualCombat,VISUAL_COMBAT} from '../src/core/visual-combat.js';
import {SpriteActor} from '../src/adapters/rendering/sprite-actor.js';
import * as THREE from 'three';
import {buildCitySurroundings} from '../src/adapters/rendering/city-surroundings.js';
import {cityMap} from '../shared/city.js';
import {canStand} from '../src/world/collision.js';
function pixels(png){
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert.equal(png[24],8);assert.equal(png[25],6);const chunks=[];
 for(let at=8;at<png.length;){const n=png.readUInt32BE(at);if(png.toString('ascii',at+4,at+8)==='IDAT')chunks.push(png.subarray(at+8,at+8+n));at+=12+n;}
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,out=Buffer.alloc(stride*height);
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=4?out[i-4]:0,b=y?out[i-stride]:0,c=y&&x>=4?out[i-stride-4]:0,p=a+b-c;const pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);const predictor=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):pa<=pb&&pa<=pc?a:pb<=pc?b:c;out[i]=(raw[y*(stride+1)+1+x]+predictor)&255;}}
 return {width,height,out};
}
test('atlas cell bounds sample only their own texel centres and reject fractional grids',()=>{
 for(const [w,h,c,r]of [[1536,1024,6,4],[3072,1536,8,4],[1536,768,6,3],[768,512,3,2]])for(let y=0;y<r;y++)for(let x=0;x<c;x++){
  const p=atlasRect(w,h,c,r,x,y);assert.ok(p.x>x/c);assert.ok(p.x+p.w<(x+1)/c);assert.ok(p.y>1-(y+1)/r);assert.ok(p.y+p.h<1-y/r);
 }
 assert.throws(()=>atlasRect(1774,887,8,4,0,0));assert.throws(()=>atlasRect(256,256,1,1,1,0));
});
test('packed assets retain complete silhouettes inside integer transparent gutters',()=>{
 for(const file of ['characters/adventurer-v042','characters/sword-v042','characters/bow-v042','characters/dagger-v042','characters/staff-v042','monsters/slimes-v042','npcs/townsfolk-v042']){
  const base=new URL('../public/assets/'+file+'.png',import.meta.url),png=fs.readFileSync(base),m=JSON.parse(fs.readFileSync(new URL(base.href+'.json')));
  assert.equal(png.readUInt32BE(16),m.cell*m.columns);assert.equal(png.readUInt32BE(20),m.cell*m.rows);assert.equal(m.frames.length,m.rows*m.columns);
  for(const f of m.frames){assert.ok(f.bounds[0]>=20,file);assert.ok(f.bounds[1]>=20,file);assert.ok(f.bounds[2]<m.cell-20,file);assert.ok(f.bounds[3]<m.cell-20,file);}
  const {width,height,out}=pixels(png);for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(x%m.cell<20||x%m.cell>=m.cell-20||y%m.cell<20||y%m.cell>=m.cell-20)assert.equal(out[(y*width+x)*4+3],0,file+' nontransparent gutter');
  if(file.startsWith('characters/'))for(let row=0;row<4;row++){const first=file.includes('adventurer')?1:2,hashes=[];for(let frame=0;frame<4;frame++){const hash=createHash('sha256');for(let y=Math.floor(m.cell*.72);y<m.cell;y++){const start=((row*m.cell+y)*width+(first+frame)*m.cell)*4;hash.update(out.subarray(start,start+m.cell*4));}hashes.push(hash.digest('hex'));}assert.equal(new Set(hashes).size,4,file+' repeated lower-body frame');}
 }
});
test('visual drawing and sheathing have intermediate states, cannot alter attack data, and can reverse',()=>{
 const v=new VisualCombat(),state={x:0,z:0,hp:100,weaponType:'sword',phase:'idle',moving:false};v.update(state,0);assert.equal(v.state,'exploration');
 state.phase='windup';v.update(state,.016);assert.equal(v.state,'drawing');assert.ok(v.blend>0&&v.blend<1);
 for(let t=.032;t<.5;t+=.016)v.update(state,t);assert.equal(v.state,'attacking');assert.equal(state.phase,'windup');
 state.phase='idle';for(let t=.5;t<5.55;t+=.016)v.update(state,t);assert.equal(v.state,'sheathing');assert.ok(v.blend>0&&v.blend<1);
 state.phase='windup';v.update(state,5.56);assert.equal(v.state,'drawing');
 state.phase='idle';for(let t=5.6;t<11.5;t+=.016)v.update(state,t);assert.equal(v.state,'exploration');
 state.hp=90;v.update(state,11.6);assert.equal(v.state,'hurt');assert.equal(state.hp,90);
 state.hp=0;v.update(state,11.7);assert.equal(v.state,'dead');
});
test('five walk frames follow distance, retain phase across snapshots, and stop without sliding',()=>{
 const v=new VisualCombat(),state={x:0,z:0,hp:100,moving:true,weaponType:null};v.update(state,0);const frames=new Set();
 for(let i=1;i<=40;i++){state.x=i*VISUAL_COMBAT.strideLength/40;v.update({...state},i*.02);frames.add(v.walkFrame);}assert.equal(frames.size,5);
 const distance=v.walkDistance;v.update({...state,moving:false},2);assert.equal(v.walkDistance,distance);v.update({...state,x:100},3);assert.equal(v.walkDistance,distance);
});
test('reconnect preserves server-reported combat posture and ignores absent legacy fields',()=>{
 const v=new VisualCombat();v.update({x:0,z:0,hp:100,weaponType:'bow',phase:'idle',visualCombatRemaining:3},10);assert.equal(v.state,'drawing');
 const legacy=new VisualCombat();legacy.update({x:0,z:0,moving:false},0);assert.equal(legacy.state,'exploration');
});
test('all weapons select their own atlas without duplicate sheathed props, direction remains stable',()=>{
 for(const weaponType of ['sword','bow','dagger','staff']){const a=new SpriteActor(new THREE.Scene()),s={x:0,z:0,hp:100,weaponType,heading:Math.PI,moving:false,phase:'idle'};
  a.update(s,0,0);assert.equal(a.texture.userData.atlas.rows,8);assert.equal(a.weaponRoot,undefined);a.update({...s,phase:'windup'},0,.02);assert.equal(a.texture.userData.frame.row,2);assert.equal(a.texture.userData.frame.column,0);assert.equal(a.weaponRoot,undefined);
  for(let t=.04;t<.5;t+=.02)a.update({...s,phase:'windup'},0,t);assert.equal(a.visual.state,'attacking');assert.equal(a.texture.userData.frame.column,0);a.dispose();
 }
});
test('exterior uses spatially bounded instances and keeps the terrain continuous',()=>{
 const view={scene:new THREE.Scene(),occluders:[],mesh(g,m,parent,x,y,z){const n=new THREE.Mesh(g,m);n.position.set(x,y,z);n.castShadow=n.receiveShadow=true;parent.add(n);return n;},box(parent,w,h,d,x,y,z,m){return this.mesh(new THREE.BoxGeometry(w,h,d),m,parent,x,y,z);}};
 buildCitySurroundings(view);const instances=[];view.scene.traverse(n=>{if(n.isInstancedMesh)instances.push(n);});assert.ok(instances.length>8);assert.ok(instances.every(n=>n.boundingSphere.radius<25));assert.ok(instances.reduce((s,n)=>s+n.count,0)>600);assert.equal(view.occluders.length,17);assert.ok(view.occluders.every(o=>!o.box.isEmpty()));
 const a=cityMap();assert.ok(canStand(a,a.spawn.x,a.spawn.z,.32));assert.equal(canStand(a,3.8,27.4,.32),false,'southern watchtower has authoritative collision');
});
