export function fishingArc(out,a,b,t,height){t=Math.max(0,Math.min(1,t));out.x=a.x+(b.x-a.x)*t;out.z=a.z+(b.z-a.z)*t;out.y=a.y+(b.y-a.y)*t+4*height*t*(1-t);return out;}
export const castProgress=(elapsed,seconds)=>Math.max(0,Math.min(1,(elapsed-seconds*.2)/(seconds*.8)));
