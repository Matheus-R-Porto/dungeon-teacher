export const APPEARANCE=Object.freeze({version:1,bodyTypes:['masculine','feminine'],hairStyles:['short','wavy','tied','bob','long','braided','curly','bun','mohawk'],expressions:['calm','happy','serious'],hairColors:['#39261d','#966137','#d8bd72','#e1dfd6','#302c3c'],clothColors:['#356c9c','#44745d','#9a4544','#9773a8','#b39451','#d8d3c1']});
export const defaultAppearance=()=>({version:1,bodyType:'masculine',hairStyle:'short',hairColor:APPEARANCE.hairColors[0],expression:'calm',primary:APPEARANCE.clothColors[0],secondary:APPEARANCE.clothColors[4]});
export function validateAppearance(input){
 if(!input||Object.keys(input).filter(k=>k!=='bodyType').sort().join(',')!=='expression,hairColor,hairStyle,primary,secondary,version'||input.bodyType!==undefined&&!APPEARANCE.bodyTypes.includes(input.bodyType)||input.version!==1||!APPEARANCE.hairStyles.includes(input.hairStyle)||!APPEARANCE.expressions.includes(input.expression)||!APPEARANCE.hairColors.includes(input.hairColor)||![input.primary,input.secondary].every(c=>APPEARANCE.clothColors.includes(c)))throw Error('Aparência inválida.');
 return {...input};
}
export function characterName(value){if(typeof value!=='string')throw Error('Nome inválido.');const name=value.trim().normalize('NFC');if(!/^[\p{L}\p{N}][\p{L}\p{N} _-]{1,23}$/u.test(name))throw Error('Use de 2 a 24 letras, números, espaços, _ ou -.');return name;}
