// Small local synthesis; no assets, networking or timers tied to combat.
export class FeedbackSound {
  constructor(){this.unlock=()=>{try{this.context??=new AudioContext();if(this.context.state==='suspended')this.context.resume().catch(()=>{});}catch{}};window.addEventListener('pointerdown',this.unlock);window.addEventListener('keydown',this.unlock);}
  play(){const c=this.context;if(!c||c.state!=='running')return;const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(440,c.currentTime);o.frequency.exponentialRampToValueAtTime(660,c.currentTime+.12);g.gain.setValueAtTime(.025,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.25);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.26);o.onended=()=>{o.disconnect();g.disconnect();};}
  dispose(){window.removeEventListener('pointerdown',this.unlock);window.removeEventListener('keydown',this.unlock);this.context?.close();}
}
