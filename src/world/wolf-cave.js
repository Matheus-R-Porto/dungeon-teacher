// Runtime geography only. Persisted tower layouts and encounter rules are unchanged.
export function shapeWolfCave(w,cave,ramp){
 const x=cave.x,z=cave.z;
 const nodes=[{x:ramp.x,z:z-26},{x:x-5,z:z-18},{x:x+2,z:z-7},{x:x-2,z:z+4},{x,z:z+15}];
 const widths=[3.8,4.8,6.2,9];
 cave.walkable=nodes.slice(1).map((b,i)=>({a:nodes[i],b,radius:widths[i]}));
 cave.walkable.push({x,z:z+15,radius:10.5},{x:x+7,z:z+4,radius:6});
 cave.obstacles=[{id:'den-rock',shape:'circle',x:x+7,z:z+17,radius:1.3},{id:'passage-rock',shape:'circle',x:x-6,z:z+2,radius:1}];
 cave.route=nodes;cave.summonPoints=[{x:x-4,z:z-17},{x:x-3,z:z-14},{x:x-1,z:z-11}].map(p=>({...p,y:cave.y,surface:cave.id}));
 ramp.frontOnly=true;
 const rocks=[{x:ramp.x-4.9,z:ramp.z,radius:2.3},{x:ramp.x+4.9,z:ramp.z,radius:2.3},{x:ramp.x,z:ramp.z+ramp.halfZ+3.5,radius:3.5}];
 w.awakening.cave.rocks=rocks;
 for(const [i,p]of rocks.entries())w.obstacles.push({id:'cave-mouth-rock-'+i,shape:'circle',...p});
 // No hidden trees/colliders inside the new rock formation or its approach.
 const inside=p=>Math.abs(p.x-ramp.x)<8&&p.z>ramp.z-ramp.halfZ-1&&p.z<ramp.z+ramp.halfZ+7;
 const removed=new Set(w.livingTower.props.filter(inside).map(p=>p.id));
 w.livingTower.props=w.livingTower.props.filter(p=>!removed.has(p.id));w.obstacles=w.obstacles.filter(o=>!removed.has(o.id));
 w.navRevision++;
}
