// NPC prices are reference values, never constraints on future player listings.
export const FOOD_CONFIG=Object.freeze({cooldownSeconds:8,buffSeconds:300,maxQuantity:99,cookingSeconds:4,good:[.45,.8],perfect:[.6,.68]});
export const FOOD_BUFFS=Object.freeze({hearty:{name:'Bem alimentado',stats:{maxHP:30}},strength:{name:'Vigor culinário',stats:{physicalAttack:4}},focus:{name:'Foco culinário',stats:{magicAttack:4}},clarity:{name:'Clareza',stats:{maxMP:20}}});
export const RAW_FOOD=Object.freeze({limiarMinnow:{hp:15,baseSellValue:4},fireflyCarp:{hp:25,baseSellValue:7},mossCatfish:{hp:35,baseSellValue:10},moonFish:{mp:20,baseSellValue:12},runeFish:{hp:25,mp:20,baseSellValue:18}});
const ingredient=(id,name,price)=>({id,name,description:'Ingrediente básico vendido pela Cozinheira.',type:'resource',icon:'♧',stats:{},tags:['ingredient'],stackable:true,maxStack:99,unique:false,tradeable:true,npcBuyValue:price,baseSellValue:Math.floor(price/2)});
export const INGREDIENTS=Object.freeze([ingredient('salt','Sal',2),ingredient('flour','Farinha',3),ingredient('herbs','Ervas',4),ingredient('oil','Óleo',4),ingredient('water','Água',1)]);
const dish=(id,name,hp,mp,buff,price)=>({id,name,description:'Prato preparado no Refúgio. Coma para se recuperar ou venda à Cozinheira.',type:'consumable',icon:'♨',stats:{},tags:['consumable','food','cooked'],stackable:true,maxStack:99,unique:false,tradeable:true,baseSellValue:price,consume:{hp,mp,buff,category:'food'}});
export const DISHES=Object.freeze([
  dish('roastMinnow','Lambari Assado',45,0,null,6),
  dish('limiarStew','Ensopado do Limiar',100,0,'hearty',19),
  dish('goldenCarp','Carpa Dourada',65,0,'strength',14),
  dish('lunarSoup','Sopa Lunar',0,60,'clarity',17),
  dish('runicDish','Prato Rúnico',75,50,'focus',25),
  dish('herbCatfish','Bagre com Ervas',80,0,null,14),
]);
const recipe=(id,name,level,ingredients,result,xp)=>({id,name,description:'Prepare no fogão e retire do fogo na zona verde.',minLevel:level,ingredients,result,quantity:1,xp,seconds:FOOD_CONFIG.cookingSeconds});
export const RECIPES=Object.freeze([
  recipe('roast','Lambari Assado',1,{limiarMinnow:1,salt:1},'roastMinnow',12),
  recipe('stew','Ensopado do Limiar',1,{limiarMinnow:1,mossCatfish:1,water:1,herbs:1},'limiarStew',20),
  recipe('carp','Carpa Dourada',1,{fireflyCarp:1,flour:1,oil:1},'goldenCarp',16),
  recipe('lunar','Sopa Lunar',2,{moonFish:1,water:1,herbs:1},'lunarSoup',22),
  recipe('runic','Prato Rúnico',3,{runeFish:1,salt:1,oil:1,water:1},'runicDish',30),
  recipe('catfish','Bagre com Ervas',1,{mossCatfish:1,herbs:1},'herbCatfish',14),
]);
export function foodStats(data,now=Date.now()){const b=data.foodBuff;return b&&b.expiresAt>now?{stats:FOOD_BUFFS[b.id]?.stats??{}}:{};}
export function decodeFood(source,now=Date.now()){
  const result={foodBuff:null,consumableCooldowns:{}};
  const deadline=value=>Number.isSafeInteger(value)&&value>=0;
  if(source.foodBuff!=null){const b=source.foodBuff;if(!b||!Object.hasOwn(FOOD_BUFFS,b.id)||!deadline(b.expiresAt))throw Error('Buff alimentar inválido.');if(b.expiresAt>now)result.foodBuff={id:b.id,expiresAt:Math.min(b.expiresAt,now+FOOD_CONFIG.buffSeconds*1000)};}
  if(source.consumableCooldowns!==undefined){const c=source.consumableCooldowns;if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).some(k=>k!=='food')||Object.values(c).some(v=>!deadline(v)))throw Error('Cooldown de consumível inválido.');if(c.food>now)result.consumableCooldowns.food=Math.min(c.food,now+FOOD_CONFIG.cooldownSeconds*1000);}
  return result;
}
export function effectText(effect){if(!effect)return '';return [effect.hp&&`HP +${effect.hp}`,effect.mp&&`MP +${effect.mp}`,effect.buff&&`${FOOD_BUFFS[effect.buff].name}: ${Object.entries(FOOD_BUFFS[effect.buff].stats).map(([k,v])=>`${({maxHP:'HP máximo',maxMP:'MP máximo',physicalAttack:'Ataque físico',magicAttack:'Ataque mágico'})[k]} +${v}`).join(', ')} · ${FOOD_CONFIG.buffSeconds/60} min`].filter(Boolean).join(' · ');}
