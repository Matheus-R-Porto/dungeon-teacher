// Cosmetic timing only. The existing domain/authority supplies the reward.
export const REWARD_TIMING=Object.freeze({closed:.45,anticipation:.22,crack:.20,half:.22,open:.33,transition:.20,spin:.85,slow:2.4,speed:12});
export function openingPose(elapsed,timing=REWARD_TIMING){
  let end=0;
  for(const [phase,frame] of [['closed',0],['anticipation',0],['crack',1],['half',2],['open',3],['transition',3]]){
    end+=timing[phase];if(elapsed<end)return {phase,frame};
  }
  return {phase:'reel',frame:3};
}
