// Shared immediate transform, no simulation state, velocity or independent navigation.
export function cartAnchor({x,z,y=0,heading=0},direction){return {x:x-Math.sin(heading)*.65,z:z-Math.cos(heading)*.65,y:y+.04,column:direction%2,row:Math.floor(direction/2)};}
