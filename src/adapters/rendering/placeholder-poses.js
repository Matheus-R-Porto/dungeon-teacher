// Original diagnostic art, baked to a flat atlas once. No Three.js objects or
// body-part transforms exist in the live actor. Every cell is a complete pose.
export const PLACEHOLDER_APPEARANCE = Object.freeze({
  tunic: '#447caf', dark: '#25445e', skin: '#f0bd86', boots: '#293749',
  pack: '#b37c44', strap: '#edc16f', staff: '#835d3c', crystal: '#54d5d8',
});

export function placeholderPose(direction, frame, appearance = PLACEHOLDER_APPEARANCE) {
  const angle = -direction * Math.PI / 4, sine = Math.sin(angle), cosine = Math.cos(angle);
  const stride = frame >= 2 ? [0, 0.15, 0, -0.15][frame - 2] : 0;
  const bob = frame < 2 ? frame * 0.015 : Math.abs(stride) * 0.12;
  const faces = [];
  const project = ([x,y,z]) => ({ x:32 + (x*cosine + z*sine)*43, y:87-y*43 + (z*cosine-x*sine)*20, depth:z*cosine-x*sine+y*.47 });
  const face = (part, points, normal, color) => {
    if (-normal[0]*sine+normal[1]*.47+normal[2]*cosine <= 1e-7) return;
    const projected = points.map(project);
    faces.push({part,color,points:projected.map(p=>[p.x,p.y]),depth:projected.reduce((sum,p)=>sum+p.depth,0)/points.length + (['face','eye'].includes(part) ? 0.06 : 0)});
  };
  const box = (part,x,y,z,w,h,d,color) => {
    const l=x-w/2,r=x+w/2,b=y-h/2,t=y+h/2,k=z-d/2,f=z+d/2;
    face(part,[[l,b,f],[r,b,f],[r,t,f],[l,t,f]],[0,0,1],color);
    face(part,[[r,b,k],[l,b,k],[l,t,k],[r,t,k]],[0,0,-1],color);
    face(part,[[r,b,f],[r,b,k],[r,t,k],[r,t,f]],[1,0,0],color);
    face(part,[[l,b,k],[l,b,f],[l,t,f],[l,t,k]],[-1,0,0],color);
    face(part,[[l,t,f],[r,t,f],[r,t,k],[l,t,k]],[0,1,0],color);
  };
  // Feet, knees and arms stride along the same local forward axis as the face.
  for (const side of [-1,1]) {
    const step = stride*side;
    box(`leg-${side}`,side*.15,.34+Math.abs(step)*.15,step,.17,.5,.19,appearance.dark);
    box(`foot-${side}`,side*.15,.09+Math.abs(step)*.15,.1+step,.21,.15,.36,appearance.boots);
    box(`arm-${side}`,side*.33,.96+bob,-step*.65,.15,.47,.2,appearance.tunic);
    box(`hand-${side}`,side*.33,.68+bob,-step*.65,.16,.14,.18,appearance.skin);
  }
  box('torso',0,1.01+bob,0,.5,.63,.36,appearance.tunic);
  box('belt',0,.76+bob,.01,.51,.08,.38,appearance.dark);
  box('buckle',0,.76+bob,.21,.12,.07,.02,appearance.strap);
  box('scarf',0,1.29+bob,.025,.51,.11,.4,appearance.strap);
  box('hood',0,1.57+bob,0,.46,.45,.44,appearance.dark);
  box('hood-top',0,1.79+bob,-.015,.4,.05,.37,appearance.tunic);
  // Front-only face decals are culled from rear/profile views, rather than moved.
  face('face',[[-.15,1.42+bob,.225],[.15,1.42+bob,.225],[.15,1.66+bob,.225],[-.15,1.66+bob,.225]],[0,0,1],appearance.skin);
  for(const eye of [-.085,.085]) face('eye',[[eye-.022,1.55+bob,.23],[eye+.022,1.55+bob,.23],[eye+.022,1.60+bob,.23],[eye-.022,1.60+bob,.23]],[0,0,1],appearance.dark);
  // The backpack remains physically behind the torso in all eight baked views.
  box('backpack',0,1.0+bob,-.34,.38,.5,.26,appearance.pack);
  box('backpack-flap',0,1.17+bob,-.48,.36,.12,.025,appearance.strap);
  box('backpack-clasp',0,1.0+bob,-.48,.09,.08,.025,appearance.strap);
  box('staff',.48,.78+bob,.12-stride*.3,.055,1.48,.055,appearance.staff);
  box('staff-grip',.48,.74+bob,.12-stride*.3,.09,.15,.09,appearance.strap);
  box('crystal',.48,1.59+bob,.12-stride*.3,.13,.17,.13,appearance.crystal);
  faces.sort((a,b)=>a.depth-b.depth);
  return faces;
}

export function drawPlaceholderPose(context, direction, frame, appearance) {
  context.lineJoin='round'; context.lineWidth=.65;
  for(const face of placeholderPose(direction,frame,appearance)) {
    context.beginPath(); face.points.forEach(([x,y],i)=>i?context.lineTo(x,y):context.moveTo(x,y));context.closePath();
    context.fillStyle=face.color;context.fill();context.strokeStyle='#24394755';context.stroke();
  }
}

export function createPlaceholderAtlas() {
  const canvas=document.createElement('canvas');canvas.width=64*6;canvas.height=96*8;
  const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;
  for(let direction=0;direction<8;direction++)for(let frame=0;frame<6;frame++) {
    context.save();context.translate(frame*64,direction*96);drawPlaceholderPose(context,direction,frame);context.restore();
  }
  return canvas;
}
