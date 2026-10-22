export async function graphicsUI({a,report,until,capture}){
 const check=async(expression,label)=>{if(!await a.evaluate(expression))throw Error(label);report.checks.push(label);};
 await check("JSON.parse(localStorage.getItem('dungeon.graphics.v1')).evaluated===true",'first-run local evaluation saved');
 await check("document.querySelector('.frame-diagnostic').hidden",'panel hidden by default');
 await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'F10',code:'F10',windowsVirtualKeyCode:121});await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'F10',code:'F10',windowsVirtualKeyCode:121});
 await check("!document.querySelector('.frame-diagnostic').hidden",'F10 opens panel');await capture(a,'F10-panel');
 await a.evaluate("document.querySelector('[data-quality]').value='performance';document.querySelector('[data-quality]').dispatchEvent(new Event('change'));document.querySelector('[data-adaptive]').checked=false;document.querySelector('[data-adaptive]').dispatchEvent(new Event('change'));");
 await check("window.__dm.view.renderer.getPixelRatio()===Math.min(devicePixelRatio,1.25)*.8&&window.__dm.view.sun.shadow.mapSize.x===1024",'performance profile applies only visual parameters');
 await a.send('Page.reload');await until(()=>a.evaluate("window.__dm?.client.status==='Online'&&!!window.__dm.graphics?.ready"));
 await check("window.__dm.graphics.quality.active==='performance'&&!window.__dm.graphics.quality.preference.automatic&&window.__dm.graphics.quality.preference.panel&&!window.__dm.graphics.events.some(e=>e.kind==='assessment')",'manual preferences persist; no repeated startup evaluation');
 await a.evaluate("document.querySelector('[data-assess]').click()");await until(()=>a.evaluate('!window.__dm.graphics.assessing'));
 await check("window.__dm.graphics.quality.active==='performance'&&window.__dm.graphics.events.some(e=>e.kind==='assessment')",'manual reassessment preserves manual selection');
 await a.evaluate("document.querySelector('[data-restore]').click()");await check("window.__dm.graphics.quality.preference.profile==='auto'&&window.__dm.graphics.quality.preference.automatic",'restore recommendation is explicit');
 // Controlled controller inputs; real renderer application, not a claim of natural load adaptation.
 await a.evaluate("(()=>{const g=window.__dm.graphics,q=g.quality;q.reset();q.lastObservation=-Infinity;for(const n of [0,5000,10000])q.observe({n:300,mean:35,p95:50},n);g.apply();})()");
 await check("window.__dm.graphics.quality.scale<window.__dm.graphics.quality.parameters.scale",'injected sustained load gradually adjusts actual renderer');await a.evaluate("document.querySelector('#pause-dialog').showModal()");await capture(a,'graphics-settings');
 await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'F10',code:'F10',windowsVirtualKeyCode:121});await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'F10',code:'F10',windowsVirtualKeyCode:121});await check("document.querySelector('.frame-diagnostic').hidden",'F10 closes panel');
}
