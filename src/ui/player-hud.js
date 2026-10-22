// State adapters own progression. This view only clamps presentation values.
const resources=[['hp','Vida'],['mp','Mana'],['xp','Experiência']];
export const playerHudMarkup=()=>'<div class="rpg-hud"><div class="hud-identity"><span class="hud-emblem" aria-hidden="true">◆</span><div><button id="character-button" title="Personagem">Personagem</button><strong id="rpg-level"></strong></div></div>'+resources.map(([k,title])=>'<label class="hud-resource hud-'+k+'"><span class="hud-resource-mark" aria-hidden="true">'+k.toUpperCase()+'</span><span class="hud-meter"><span id="rpg-'+k+'-label"></span><progress id="rpg-'+k+'" aria-label="'+title+'" max="1" value="0"></progress></span></label>').join('')+'<strong id="rpg-gold"></strong><small id="save-status" role="status"></small></div>';
const text=(id,value)=>{const node=document.getElementById(id);if(node&&node.textContent!==value)node.textContent=value;};
export function resourceDisplay(value,max){const known=Number.isFinite(value)&&Number.isFinite(max)&&max>=0;const limit=known?max:0;return {known,max:Math.max(1,limit),value:known?Math.min(limit,Math.max(0,value)):0,limit};}
export function updatePlayerHud({name,className='Novato',level,hp,maxHP,mp,maxMP,xp,nextXP,gold}){
 text('character-button',(name??'Viajante')+' · '+className);text('rpg-level',level===undefined?'Nível indisponível':'Nível '+level);text('rpg-gold',gold===undefined?'':'Ouro '+gold);
 const values=[hp,mp,xp],maxima=[maxHP,maxMP,nextXP];
 for(let i=0;i<resources.length;i++){
  const key=resources[i][0],bar=document.getElementById('rpg-'+key);if(!bar)continue;
  const state=resourceDisplay(values[i],maxima[i]);
  if(bar.max!==state.max)bar.max=state.max;if(bar.value!==state.value)bar.value=state.value;
  const label=state.known?Math.floor(state.value)+' / '+Math.round(state.limit):'Indisponível';text('rpg-'+key+'-label',label);
  if(bar.getAttribute('aria-valuetext')!==label)bar.setAttribute('aria-valuetext',label);
 }
}
