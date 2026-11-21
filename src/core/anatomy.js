// Pixel references measured on the normalized 256px class art (idle upper body).
// Rows: front, left, back, right. Hands are screen-left then screen-right.
const HANDS={
 novice:[[[88,175],[166,175]],[[96,174],[155,175]],[[86,176],[170,176]],[[100,173],[157,174]]],
 warrior:[[[82,174],[174,174]],[[94,172],[167,173]],[[78,171],[177,171]],[[82,169],[164,169]]],
 archer:[[[86,175],[170,175]],[[95,171],[156,173]],[[85,173],[174,173]],[[96,170],[159,170]]],
 rogue:[[[85,172],[170,172]],[[99,170],[156,173]],[[85,170],[173,170]],[[96,167],[160,169]]],
 priest:[[[86,168],[170,168]],[[98,165],[152,171]],[[82,167],[174,167]],[[100,169],[161,163]]],
 mage:[[[85,166],[168,165]],[[94,169],[158,172]],[[82,163],[178,163]],[[104,164],[168,159]]],
};
const cache=new Map();
export function anatomyFor(classId='novice',direction=0,bodyType='masculine'){
 classId=HANDS[classId]?classId:'novice';const key=classId+':'+direction+':'+bodyType;if(cache.has(key))return cache.get(key);
 const hands=HANDS[classId][direction],narrow=x=>bodyType==='feminine'?9+x*238/256:x;
 const point=([x,y])=>({x:narrow(x),y});
 const shoulders=direction===0||direction===2?[[102,122],[154,122]]:direction===1?[[113,128],[classId==='warrior'?148:140,122]]:[[classId==='mage'?117:110,122],[145,128]];
 const left={shoulder:point(shoulders[0]),hand:point(hands[0])},right={shoulder:point(shoulders[1]),hand:point(hands[1])};
 for(const arm of [left,right])arm.elbow={x:arm.shoulder.x*.45+arm.hand.x*.55,y:arm.shoulder.y*.45+arm.hand.y*.55};
 const rig={left,right,primary:direction===0?'right':'left',near:direction===1?'right':direction===3?'left':null,neck:{x:128,y:110},torso:{x:128,y:147},hip:{x:128,y:184},backpack:{x:direction===1?159:direction===3?91:128,y:151}};cache.set(key,rig);return rig;
}
export const ANATOMY_CLASSES=Object.keys(HANDS);
