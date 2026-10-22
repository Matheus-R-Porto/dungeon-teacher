// Intervals are milliseconds. Lows are inverse mean of the slowest ceil(N*p).
export function frameMetrics(values){
 const a=Array.from(values).filter(x=>Number.isFinite(x)&&x>0).sort((a,b)=>a-b),n=a.length;
 if(!n)return {n:0};
 const mean=a.reduce((s,x)=>s+x,0)/n,percentile=p=>a[Math.min(n-1,Math.ceil(n*p)-1)];
 const low=p=>1000/(a.slice(-Math.ceil(n*p)).reduce((s,x)=>s+x,0)/Math.ceil(n*p));
 return {n,seconds:n*mean/1000,mean,fps:1000/mean,medianFPS:1000/percentile(.5),p50:percentile(.5),p95:percentile(.95),p99:percentile(.99),p999:n>=10000?percentile(.999):null,low1:n>=100?low(.01):null,low01:n>=10000?low(.001):null,max:a[n-1],thresholds:Object.fromEntries([16.67,33.33,50,100].map(t=>{const count=a.filter(x=>x>t).length;return [t,{count,ratio:count/n}];}))};
}
export class FrameWindow{
 constructor(capacity=12000){this.values=new Float64Array(capacity);this.count=0;this.cursor=0;}
 push(ms){if(!Number.isFinite(ms)||ms<=0)return;this.values[this.cursor]=ms;this.cursor=(this.cursor+1)%this.values.length;this.count=Math.min(this.count+1,this.values.length);}
 clear(){this.count=0;this.cursor=0;}
 snapshot(){return frameMetrics(this.values.subarray(0,this.count));}
}
