// Test fixtures place actors; travel and guardian entry still use production flow.
export function enterKnight(s){
 const gate=s.area.interactables.find(i=>i.id==='castle-entry');Object.assign(s.game.player,gate);s.travel({targetId:gate.id});
 Object.assign(s.game.player,s.area.guardianHall.door);s.enterGuardian();
}
export function leaveKnight(s){
 if(s.area.arena)s.travel({targetId:'arena-exit'});
 if(s.area.castleInterior)s.travel({targetId:'castle-exit'});
}
export function climb(s){leaveKnight(s);s.travel({targetId:'return-portal'});}
export function returnRefuge(s){leaveKnight(s);s.travel({targetId:'refuge-portal'});}
