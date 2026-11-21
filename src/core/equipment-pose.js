// References in the existing normalized 256px equipment cells, not their bounds.
export const WEAPON_GRIPS=Object.freeze({
 sword:[[128,201],[128,200],[128,201],[128,203]],dagger:[[128,185],[128,191],[128,192],[128,195]],
 bow:[[114,137],[133,137],[142,137],[118,137]],staff:[[128,153],[128,153],[128,153],[128,153]],
});
const STOWED_BOW_GRIPS=[[127,137],[126,137],[126,137],[128,137]];
export function gripFor(family,direction,held=true){const p=held?WEAPON_GRIPS[family]?.[direction]:family==='sword'||family==='dagger'?[128,64]:family==='bow'?STOWED_BOW_GRIPS[direction]:WEAPON_GRIPS[family]?.[direction];return {x:p?.[0]??128,y:p?.[1]??128};}
export function billboardPoint(origin,pixel,width,height,basis,depth=0){const dx=width*(pixel.x-128)/256,dy=height*(230.4-pixel.y)/256;
 return {x:origin.x+basis[0]*dx+basis[4]*dy+basis[8]*depth,y:(origin.y??0)+.055+basis[1]*dx+basis[5]*dy+basis[9]*depth,z:origin.z+basis[2]*dx+basis[6]*dy+basis[10]*depth};
}
export function equipmentDepth(direction,secondary=false,held=true){if(!held)return -1;if(direction===0)return secondary?2:1;if(direction===2)return -1;return (direction===1?secondary:!secondary)?2:-1;}
