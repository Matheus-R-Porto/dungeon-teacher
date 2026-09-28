export function seedOf(value){let n=2166136261;for(const c of String(value)){n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;}return n;}
export function seeded(seed){let state=seed>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
