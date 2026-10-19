// The adapters supply real state; this component never mutates progression.
export const playerHudMarkup=()=>'<div class="rpg-hud"><button id="character-button" title="Personagem">Personagem</button><strong id="rpg-level"></strong>'+['hp','mp','xp'].map(k=>`<label><span id="rpg-${k}-label"></span><progress id="rpg-${k}" max="1" value="0"></progress></label>`).join('')+'<strong id="rpg-gold"></strong><small id="save-status" role="status"></small></div>';
export function updatePlayerHud({name,className='Novato',level,hp,maxHP,mp,maxMP,xp,nextXP,gold}){
 const set=(id,text)=>{const n=document.getElementById(id);if(n)n.textContent=text;};set('character-button',name+' · '+className);set('rpg-level',level===undefined?'Nível base indisponível':'Nível base '+level);set('rpg-gold',gold===undefined?'':'Ouro '+gold);
 for(const [key,value,max] of [['hp',hp,maxHP],['mp',mp,maxMP],['xp',xp,nextXP]]){const bar=document.getElementById('rpg-'+key);if(!bar)continue;bar.max=max??1;bar.value=value??0;set('rpg-'+key+'-label',value===undefined?key.toUpperCase()+' indisponível':key.toUpperCase()+' '+Math.floor(value)+' / '+Math.round(max));}
}
