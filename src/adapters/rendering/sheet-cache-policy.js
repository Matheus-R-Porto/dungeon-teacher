export function sheetEntryBytes(entry){
 return [entry.texture,entry.mask].reduce((n,t)=>n+(t?.image?.width??0)*(t?.image?.height??0)*4,0);
}
// Active and unfinished entries are never candidates. Oldest idle entries go
// first; count and byte caps must both be satisfied after trimming.
export function idleSheetEvictions(entries,countLimit=8,byteLimit=64*1024*1024){
 const idle=[...entries].filter(e=>e.refs===0&&e.loaded).sort((a,b)=>a.used-b.used);
 let bytes=idle.reduce((n,e)=>n+sheetEntryBytes(e),0),remaining=idle.length;const evicted=[];
 for(const entry of idle){if(remaining<=countLimit&&bytes<=byteLimit)break;evicted.push(entry);bytes-=sheetEntryBytes(entry);remaining--;}
 return evicted;
}
