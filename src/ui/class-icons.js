import {CLASS_SKILLS} from '../domain/abilities/class-skills.js';
// Code-native pixel silhouettes, extending the game's existing SVG icon system.
const shapes={
 sword:'M18 2h4v5h-3v3h-3v3h-3v3h-3l-3 3-3-3 3-3v-3h3V9h3V6h3z M3 18h4v4H3z',
 shield:'M3 3h18v13h-3v4h-4v3h-4v-3H6v-4H3z M8 6v10h3v-3h5V6z',
 heart:'M2 5h3V2h5v3h4V2h5v3h3v9h-3v3h-3v3h-3v3h-3v-3H7v-3H4v-3H2z',
 arrow:'M2 10h13V4h3v3h3v3h3v4h-3v3h-3v3h-3v-6H2z',
 bow:'M7 1h6v3h4v4h3v8h-3v4h-4v3H7v-3h4v-3h3V7h-3V4H7z M4 3h2v18H4z',
 eye:'M1 9h3V6h4V3h9v3h4v3h3v6h-3v3h-4v3H8v-3H4v-3H1z M9 8v8h7V8z',
 boot:'M5 2h8v12h8v4h3v5H3v-7h2z M7 5h4v6H7z',
 dagger:'M8 1h6v12h4v4h-5v7H8v-7H3v-4h5z',
 cloak:'M8 1h8v3h3v6h-3V7H8v3H5V4h3z M5 12h14l4 12H1z',
 skull:'M5 2h14v3h3v11h-4v7h-4v-4h-3v4H7v-7H3V5h2z M6 6v5h5V6z M15 6v5h5V6z',
 drop:'M10 1h4v5h3v4h3v4h2v5h-3v3H5v-3H2v-5h2v-4h3V6h3z',
 cross:'M9 1h7v7h7v7h-7v9H9v-9H1V8h8z',
 sun:'M9 0h6v4H9z M9 20h6v4H9z M0 9h4v6H0z M20 9h4v6h-4z M6 6h12v12H6z M2 2h4v4H2z M18 18h4v4h-4z',
 book:'M1 3h9l2 3 2-3h9v18h-9l-2 3-2-3H1z M5 6v11h3V6z M16 6v11h3V6z',
 wings:'M1 3h5v4h4v6h4V7h4V3h5v13h-4v4h-5v4h-4v-4H5v-4H1z',
 portal:'M7 1h10v3h4v17h-4V7H7v14H3V4h4z M9 12h6v3h-3v6H9z',
 flame:'M11 0h4v7h4v4h3v9h-4v4H6v-4H2v-7h4V8h4v8h4v-5h-3z',
 ice:'M10 0h4v6l4-4 3 3-5 5h8v4h-8l5 5-3 3-4-4v6h-4v-6l-4 4-3-3 5-5H0v-4h8L3 5l3-3 4 4z',
 bolt:'M12 0h9l-6 9h8L8 24l3-11H2z',
 orb:'M7 2h10v3h4v4h2v8h-4v4h-4v2H7v-3H3v-4H1V9h3V5h3z M7 7v5h4V7z',
 rune:'M11 0l11 11-11 13L0 11z M10 5v12h3V5z M5 10v3h12v-3z',
 hourglass:'M3 1h18v4h-3v4l-5 4 5 3v4h3v4H3v-4h3v-4l5-3-5-4V5H3z',
 fist:'M4 8h4V3h4v5h2V2h4v6h3v13H7v-4H3v-6H0V8z',
 target:'M5 0h14v4h5v15h-5v5H5v-5H0V4h5z M5 5v14h14V5z M9 9h6v6H9z',
 ring:'M7 1h10v3h4v4h3v10h-4v4H5v-4H1V7h3V4h3z M8 7v10h9V7z',
 crown:'M1 3l6 6 5-8 5 8 6-6v18H1z M5 14v3h14v-3z',
 spiral:'M1 1h21v21H5V6h12v11H9v-4h4V10H9v8h9V5H5v19H1z',
 quiver:'M4 4h14v19H4z M6 0h3v9H6z M12 0h3v9h-3z M19 7h4v13h-4z',
 hands:'M1 11h4v6h4V5h4v12h4v-6h4v9h-4v4H5v-4H1z',
 leaf:'M3 2h17v12h-4v4h-7v5H5V13H2z M9 6v6h3V6z',
 moon:'M9 1h6V5h-5v5H7v6h4v4h9v3H8v-3H3v-5H1V8h3V4h5z',
 tower:'M2 1h5v4h3V1h5v4h3V1h5v9h-4v14H6V10H2z M10 14v10h5V14z'
};
const pairs={warrior:[['sword','bolt'],['sword','crown'],['fist','flame'],['eye','target'],['shield','rune'],['heart','shield'],['tower','shield'],['fist','target'],['sword','hourglass'],['drop','spiral'],['heart','cross'],['shield','leaf'],['shield','sword'],['heart','crown'],['sword','spiral'],['tower','crown']],archer:[['arrow','sword'],['eye','wings'],['bow','hourglass'],['target','skull'],['boot','wings'],['boot','arrow'],['eye','bolt'],['bow','bolt'],['arrow','ice'],['bow','target'],['quiver','drop'],['quiver','leaf'],['arrow','boot'],['arrow','rune'],['boot','target'],['eye','crown']],rogue:[['cloak','moon'],['dagger','eye'],['cloak','leaf'],['dagger','hourglass'],['boot','dagger'],['eye','dagger'],['dagger','spiral'],['boot','bolt'],['dagger','drop'],['skull','book'],['dagger','skull'],['drop','hourglass'],['moon','boot'],['cloak','drop'],['dagger','ring'],['cloak','crown']],priest:[['cross','heart'],['hands','drop'],['ring','cross'],['heart','hourglass'],['wings','fist'],['shield','cross'],['portal','wings'],['ring','wings'],['sun','bolt'],['book','sun'],['rune','sun'],['cross','drop'],['tower','cross'],['sun','heart'],['sword','cross'],['wings','crown']],mage:[['orb','arrow'],['book','flame'],['flame','orb'],['bolt','spiral'],['ice','arrow'],['ice','ring'],['shield','orb'],['portal','bolt'],['hourglass','bolt'],['drop','rune'],['moon','book'],['orb','flame'],['ice','sun'],['spiral','drop'],['shield','hourglass'],['rune','crown']]};
const colors={warrior:'#d9a26b',archer:'#9bce7b',rogue:'#c4a0e0',priest:'#eed68c',mage:'#8dc8ef'};
const indices={};for(const s of Object.values(CLASS_SKILLS)){indices[s.id]=(indices[s.classId]??0);indices[s.classId]=(indices[s.classId]??0)+1;}
export function paintClassIcon(ctx,id){const s=CLASS_SKILLS[id];if(!s)return;const [main,accent]=pairs[s.classId][indices[id]];ctx.save();ctx.translate(2,2);ctx.fillStyle=colors[s.classId];ctx.fill(new Path2D(shapes[main]),'evenodd');ctx.restore();ctx.save();ctx.translate(19,19);ctx.scale(.5,.5);ctx.fillStyle='#fff2cf';ctx.fill(new Path2D(shapes[accent]),'evenodd');ctx.restore();}
export function classIcon(id){const s=CLASS_SKILLS[id];if(!s)return '';const [main,accent]=pairs[s.classId][indices[id]];return `<svg viewBox="0 0 32 32" aria-hidden="true" class="destiny-icon" shape-rendering="crispEdges"><path d="M2 0h28v2h2v28h-2v2H2v-2H0V2h2z" fill="#111e22"/><g transform="translate(2 2)"><path d="${shapes[main]}" fill="${colors[s.classId]}" fill-rule="evenodd"/></g><path d="M18 18h14v14H18z" fill="#172529"/><g transform="translate(19 19) scale(.5)"><path d="${shapes[accent]}" fill="#fff2cf" fill-rule="evenodd"/></g></svg>`;}
