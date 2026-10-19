import path from 'node:path';
import fs from 'node:fs';
import {startVideo,finishVideo} from './iteration211-electron-scenario.mjs';
export async function runPoseMatrix212({a,wait,report,output}){
 await a.send('Page.bringToFront');
 await a.evaluate(`(()=>{const d=window.__dmInspection;d.session.game.paused=true;d.view.orbit.height=7;d.view.orbit.targetHeight=7;d.view.orbit.azimuth=0;d.view.actor.visual.hurtUntil=-Infinity;window.__original212=d.view.actor.update.bind(d.view.actor);window.__pose212={hp:100,phase:'idle',moving:true,heading:0};window.__distance212=0;window.__poseFrames212=0;d.view.actor.update=(input,azimuth,time,reduced,camera)=>{window.__poseFrames212++;window.__distance212+=window.__pose212.moving?.06:0;window.__original212({...input,...window.__pose212,x:window.__distance212},azimuth,performance.now()/1000,reduced,camera);d.view.actor.sprite.position.x=input.x;d.view.actor.shadow.position.x=input.x;};})()`);
 for(const family of (process.argv.includes('--sword-check')?['sword']:['sword','bow','dagger','staff'])){
  await a.evaluate(`new Promise((resolve,reject)=>{const actor=window.__dmInspection.view.actor,textures=[actor.atlas(${JSON.stringify(family)},6,8),actor.atlas(${JSON.stringify(family+'-transition')},8,4),actor.atlas(${JSON.stringify(family+'-action')},3,4)],started=performance.now();const check=()=>{if(textures.every(t=>t.image?.width))resolve();else if(performance.now()-started>8000)reject(Error('Atlas decode timeout'));else setTimeout(check,40);};check();})`);
  await startVideo(a);
  for(let direction=0;direction<4;direction++)for(const held of [false,true]){
   await a.evaluate(`(()=>{Object.assign(window.__pose212,{weaponType:${JSON.stringify(family)},heading:${-direction*Math.PI/2},phase:'idle',hp:100,moving:true,visualCombatRemaining:${held?5:0}});const v=window.__dmInspection.view.actor.visual;v.weapon=${JSON.stringify(family)};v.blend=${held?1:0};v.lastAction=-Infinity;v.hurtUntil=-Infinity;window.__poseStart212=window.__poseFrames212;})()`);
   await a.send('Page.bringToFront');
   for(let n=0;!await a.evaluate('window.__poseFrames212>=window.__poseStart212+5');n++){if(n>=100)throw Error('Renderer did not advance after pose change');await wait(100);}
   await wait(1600);
   const pose=await a.evaluate('(()=>{const a=window.__dmInspection.view.actor;return {frame:a.texture.userData.frame,state:a.visual.state,blend:a.visual.blend};})()');
   if(pose.frame.row!==direction+(held?4:0))throw Error('Pose matrix mismatch: '+JSON.stringify({family,direction,held,pose}));
   (report.poseSamples??=[]).push({family,direction,held,...pose});
   const shot=await a.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,`212-${family}-${direction}-${held?'held':'stored'}.png`),Buffer.from(shot.data,'base64'));
  }
  // State changes mid-transition use the same renderer and logical presentation state.
  await a.evaluate("Object.assign(window.__pose212,{moving:false,phase:'idle',visualCombatRemaining:0});window.__dmInspection.view.actor.visual.lastAction=-Infinity");await wait(100);
  await a.evaluate('window.__pose212.moving=true');await wait(80);
  await a.evaluate("window.__pose212.phase='windup'");await wait(60);
  await a.evaluate('window.__pose212.moving=false;window.__pose212.hp=90');await wait(300);
  await a.evaluate("window.__pose212.phase='idle';window.__pose212.moving=true");await wait(400);
  await finishVideo(a,path.join(output,'212-'+family+'-all-directions-stored-held.webm'));
 }
 await a.evaluate('window.__dmInspection.view.actor.update=window.__original212;window.__dmInspection.session.game.paused=false');
 report.checks.push('Presentation matrix: four families × four directions × stored/held walks; move/stop/hurt/reverse during equip transition. Fixture inputs, no gameplay claim.');
}
