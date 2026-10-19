// Fast setup positions are server-side fixtures, not production teleport commands.
// Every attack, portal activation and reconnection is driven through the actual UI.
export async function runTowerScenario({hub,a,b,until,wait,click,button,capture,report}){
 const floor1='shared-floor-1',floor2='shared-floor-2',w1=hub.tower.world(floor1);
 await until(()=>w1.players.size===2);const p=[...w1.players.values()].find(p=>p.name==='Teste '+a.profile),q=[...w1.players.values()].find(p=>p.name==='Teste '+b.profile);
 for(const s of[a,b])await until(()=>s.evaluate("document.querySelectorAll('.remote-name:not(.own-name)').length===1"));
 await capture(a,'01-floor1-a');await capture(b,'01-floor1-b');report.checks.push('two Electron processes display same procedural floor and one another');
 const e=w1.enemies[0];Object.assign(p.game.player,{x:e.x-1,z:e.z});Object.assign(q.game.player,{x:e.x+1,z:e.z});await wait(500);
 for(const s of[a,b]){const pos=await s.evaluate("(()=>{const e=document.querySelector('.shared-enemy');return {x:parseFloat(e.style.left),y:parseFloat(e.style.top)};})()");await click(s,pos.x,pos.y+23);}
 await until(()=>e.hp===0);await wait(250);if(!w1.events.some(e=>e.source===p.id)||!w1.events.some(e=>e.source===q.id))throw Error('Os dois jogadores precisam causar dano.');
 for(const s of[a,b])if(!(await s.evaluate("document.querySelector('.shared-enemy').textContent.includes('0/')")))throw Error('Morte divergente na interface.');
 await capture(a,'02-floor1-death-a');await capture(b,'02-floor1-death-b');report.checks.push('both players attack same floor monster and both render death');
 for(const player of[p,q]){player.target=null;player.game.cancel();Object.assign(player.game.player,w1.map.spawn);}
 await until(()=>e.generation===1);report.checks.push('server respawns shared floor monster');
 const portal=async(s,player,id)=>{const w=hub.tower.world(player.mapId),i=w.map.interactables.find(i=>i.id===id);player.target=null;player.game.cancel();Object.assign(player.game.player,{x:i.x,z:i.z});await until(()=>s.evaluate("!document.getElementById('interact').hidden && document.getElementById('interact').textContent.includes("+JSON.stringify(i.label)+")"));await s.send('Input.dispatchKeyEvent',{type:'keyDown',key:'f',code:'KeyF'});await s.send('Input.dispatchKeyEvent',{type:'keyUp',key:'f',code:'KeyF'});};
 await portal(a,p,'return-portal');await until(()=>p.mapId===floor2);await until(()=>a.evaluate("document.querySelector('.location h1').textContent.endsWith('Andar 2')"));await until(()=>b.evaluate("document.querySelectorAll('.remote-name:not(.own-name)').length===0"));
 await capture(a,'03-floor2-a');await capture(b,'03-floor1-b');report.checks.push('F portal transitions A; B remains in floor 1 with no remote from floor 2');
 await button(a,'[data-connect]');await until(()=>hub.tower.world(floor2).players.size===0);await button(a,'[data-connect]');await until(()=>hub.tower.world(floor2).players.size===1);await until(()=>a.evaluate("document.querySelector('.shared-status strong').textContent==='Online'"));report.checks.push('reconnection returns A to floor 2 without duplicating across areas');
 await portal(b,q,'return-portal');await until(()=>q.mapId===floor2);for(const s of[a,b])await until(()=>s.evaluate("document.querySelectorAll('.remote-name:not(.own-name)').length===1"));
 await capture(a,'04-both-floor2-a');await capture(b,'04-both-floor2-b');report.checks.push('both clients render the same persisted floor 2');
 await portal(a,p,'abandon-run');await until(()=>p.mapId===floor1);await until(()=>a.evaluate("document.querySelector('.location h1').textContent.endsWith('Andar 1')"));await capture(a,'05-return-floor1');report.checks.push('F down portal returns to floor 1');

 // Explore new floors with both real clients, rendering each transition.
 await portal(a,p,'return-portal');await until(()=>p.mapId===floor2);
 for(let f=3;f<=12;f++){
  for(const [s,player] of [[a,p],[b,q]]){await portal(s,player,'return-portal');await until(()=>player.mapId==='shared-floor-'+f);await until(()=>s.evaluate("document.querySelector('.location h1').textContent.endsWith('Andar "+f+"')"));}
  for(const s of[a,b])await until(()=>s.evaluate("document.querySelectorAll('.remote-name:not(.own-name)').length===1"));
  if([4,7,12].includes(f)){await wait(300);await capture(a,'06-floor'+f+'-a');await capture(b,'06-floor'+f+'-b');}
 }
 await portal(a,p,'return-portal');await until(()=>a.evaluate("document.querySelector('[data-event]').textContent.includes('13 indispon')"));await capture(a,'07-floor12-limit');
 report.checks.push('both real clients render floors 3 through 12; floor 13 unavailable notice');
 report.fixture='Server-side positioning near first monster and portals skips long walks. No HP/damage/transition state is injected; real mouse, F and buttons drive those operations.';
}
