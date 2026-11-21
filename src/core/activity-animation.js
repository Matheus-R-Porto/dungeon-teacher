import {professionPose} from './profession-presentation.js';
// Reads activity outcomes; never advances a minigame or grants a reward.
export class ActivityAnimation {
  update(activity,time){
    const old=this.legacy(activity,time);if(!old)return null;const m=activity?.mining,f=activity?.fishing;const p=old.type==='fishing'?{type:'fishing',phase:time-this.reelAt<1.35&&!f?.active?'reel':f?.state,elapsed:time-this.reelAt<1.35&&!f?.active?time-this.reelAt:(f?.time??0)-(f?.started??0),target:f?.spot?.bobber,caught:!!f?.visualCatch&&f.visualReelRevision===this.reelRevision}:{type:'mining',phase:time-this.impactAt<.95?'strike':m?.state==='prepare'?'prepare':'ready',elapsed:time-this.impactAt<.95?time-this.impactAt:(m?.time??0)-(m?.started??0),target:m?.vein?{x:m.vein.x,y:(m.vein.y??0)+1,z:m.vein.z}:null};return {...old,...professionPose(p)};
  }
  legacy(activity,time){
    const m=activity?.mining,f=activity?.fishing;
    if(m&&this.mining===m){
      if((m.visualStrikeRevision??0)!==this.strikeRevision)this.impactAt=time;
    }else this.impactAt=-Infinity;
    if(f&&this.fishing===f&&(f.visualReelRevision??0)!==this.reelRevision)this.reelAt=time;
    if(this.fishing!==f||this.cancelRevision!==f?.visualCancelRevision)this.reelAt=-Infinity;
    this.cancelRevision=f?.visualCancelRevision;
    this.mining=m;this.miningState=m?.state;this.resultId=m?.resultId;this.strikeRevision=m?.visualStrikeRevision??0;
    this.fishing=f;this.fishingState=f?.state;this.reelRevision=f?.visualReelRevision??0;
    if(time-this.impactAt<.95){const t=time-this.impactAt;return {type:'mining',frame:t<.14?3:t<.58?2:4,impact:t>=.14&&t<.58};}
    if(m?.active)return {type:'mining',frame:m.state==='prepare'&&m.time-m.started<.22?0:1};
    if(time-this.reelAt<1.35&&!f?.active)return {type:'fishing',frame:time-this.reelAt>=.12&&time-this.reelAt<.65?5:4};
    if(f?.active)return {type:'fishing',frame:f.state==='bite'?3:f.state==='cast'?(f.time-f.started<(f.config?.castSeconds??.35)*.2?0:1):2};
    return null;
  }
}
