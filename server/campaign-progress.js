import {FirstSteps} from '../src/domain/first-steps.js';
import {canTalk} from '../src/domain/dialogue.js';
import {passageStatus} from '../src/domain/passage-progress.js';
export function campaignProgress(player,world){
 const quest=new FirstSteps(player.character),data=player.character.data;
 if(player.game.distance>=1)quest.mark('movement');
 const smith=world.npcs?.find(n=>n.id==='blacksmith');if(smith&&canTalk(world,player.game.player,smith))quest.mark('smith');
 quest.sync({area:world,normalsCleared:!world.safe&&data.tower.highestClearedFloor>=world.floorId,complete:!world.safe&&passageStatus(data,world.floorId).open});
}
