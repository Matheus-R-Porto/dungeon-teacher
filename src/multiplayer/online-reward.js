import {RewardPanel} from '../ui/reward-panel.js';
import {LOOT_POOL} from '../domain/items/loot.js';

// Read only the authoritative response. No seed evaluation or client grants.
// Older v4 servers already supply this notice and inventory; no protocol change.
export function confirmedChestReward(before,after,target){
  if(!before?.inventory.slots.some(i=>i?.instanceId===target&&i.definitionId==='expeditionChest'))return null;
  if(after.inventory.slots.some(i=>i?.instanceId===target))return null;
  const match=/^Baú aberto: ([a-zA-Z0-9]+) e (\d+) Ouro\.$/.exec(after.notice??'');
  if(!match||!LOOT_POOL.includes(match[1]))return null;
  const ids=new Set(before.inventory.slots.filter(Boolean).map(i=>i.instanceId));
  const added=after.inventory.slots.filter(i=>i&&!ids.has(i.instanceId));
  const gold=Number(match[2]);
  if(added.length!==1||added[0].definitionId!==match[1]||added[0].quantity!==1||after.gold-before.gold!==gold)return null;
  return Object.freeze({itemId:match[1],gold});
}

export class OnlineReward {
  constructor(client,stop){
    this.client=client;this.stop=stop;
    this.view=new RewardPanel(null,{id:'online-reward-dialog',open:id=>{stop();document.getElementById(id).showModal();}});
    this.view.dialog.addEventListener('close',()=>{
      if(this.pending){const message='Abertura interrompida. Reconecte e confira o inventário: o servidor pode já ter salvo a recompensa.';this.view.fail(message);this.previousNotice?.(message);}
      this.clear();document.querySelector('#world')?.focus({preventScroll:true});
    });
    this.previousNotice=client.onNotice;
    this.notice=message=>{this.previousNotice?.(message);if(this.pending)this.fail(message+' Consulte o inventário antes de tentar novamente.');};
    client.onNotice=this.notice;
  }
  show(target,profile){
    if(!profile||this.pending||this.view.busy||this.view.dialog.open)return false;
    if(!this.view.waitForServer())return false;
    this.pending={target,before:structuredClone(profile),started:performance.now()};
    if(!this.client.command({kind:'open-chest',target})){this.fail('Aguarde a conexão com o servidor. Nenhum pedido foi enviado.');return true;}
    this.watch=setInterval(()=>{
      if(!this.pending)return;
      if(this.client.status!=='Online'||performance.now()-this.pending.started>10000)this.fail('Confirmação interrompida. Reconecte e consulte o inventário: o servidor pode já ter salvo a recompensa.');
    },250);return true;
  }
  update(profile){
    if(!this.pending)return;
    const {before,target}=this.pending,reward=confirmedChestReward(before,profile,target);
    if(reward){this.clear();this.view.showConfirmed(reward);}
    else if(!profile.inventory.slots.some(i=>i?.instanceId===target))this.fail('O inventário foi atualizado pelo servidor. Consulte seus itens para conferir a recompensa.');
  }
  clear(){clearInterval(this.watch);this.pending=null;}
  fail(message){this.clear();this.view.fail(message);}
  dispose(){this.clear();if(this.client.onNotice===this.notice)this.client.onNotice=this.previousNotice;this.view.dispose();}
}
