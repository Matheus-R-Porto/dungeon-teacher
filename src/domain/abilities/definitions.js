export const ABILITY_CONFIG=Object.freeze({inputBuffer:0.3,intentTimeout:12,projectileLifetime:3});
export const WEAPONS=Object.freeze({sword:{name:'Espada',basicAttackOverrides:{}},dagger:{name:'Adaga',basicAttackOverrides:{}},bow:{name:'Arco',basicAttackOverrides:{}},staff:{name:'Cajado',basicAttackOverrides:{}}});
const common={targetingType:'enemy',requiresTarget:true,requiresLineOfSight:true,interruptible:true};
export const ABILITIES=Object.freeze({
  powerStrike:{...common,id:'powerStrike',name:'Golpe Poderoso',description:'Um ataque físico poderoso contra o alvo.',icon:'✦',weaponRequirements:['sword'],range:1.45,manaCost:8,cooldown:4,castTime:.25,recovery:.45,effects:[{type:'damage',at:0,power:2.2,damageType:'physical'}]},
  doubleAttack:{...common,id:'doubleAttack',name:'Ataque Duplo',description:'Dois golpes rápidos, com acerto e crítico independentes.',icon:'Ⅱ',weaponRequirements:['dagger'],range:1.4,manaCost:10,cooldown:4,castTime:.12,recovery:.35,effects:[{type:'damage',at:0,power:.9,damageType:'physical'},{type:'damage',at:.18,power:.9,damageType:'physical'}]},
  doubleShot:{...common,id:'doubleShot',name:'Tiro Duplo',description:'Dispara duas flechas contra o alvo.',icon:'⇉',weaponRequirements:['bow'],range:7,manaCost:12,cooldown:5,castTime:.2,recovery:.35,effects:[{type:'projectile',at:0,speed:11,power:1,damageType:'physical'},{type:'projectile',at:.22,speed:11,power:1,damageType:'physical'}]},
  energyBall:{...common,id:'energyBall',name:'Bola de Energia',description:'Conjura um projétil mágico contra o inimigo.',icon:'◉',weaponRequirements:['staff'],range:7,manaCost:14,cooldown:5,castTime:.8,recovery:.4,effects:[{type:'projectile',at:0,speed:8,power:1.9,damageType:'magic'}]},
  regeneration:{id:'regeneration',name:'Regeneração',description:'Recupera HP a cada segundo durante seis segundos.',icon:'✚',targetingType:'self',requiresTarget:false,requiresLineOfSight:false,interruptible:true,weaponRequirements:[],range:0,manaCost:14,cooldown:10,castTime:.25,recovery:.3,effects:[{type:'periodic',at:0,duration:6,interval:1,power:6,scaling:.15,stat:'magicAttack',effectType:'heal'}]},
});
export const INITIAL_HOTBAR=Object.freeze(['powerStrike','doubleAttack','doubleShot','energyBall','regeneration',null,null,null]);
export function validateAbility(a){
  if(!a?.id||!a.name||!['enemy','self'].includes(a.targetingType))throw Error('Definição de habilidade inválida.');
  for(const key of ['range','manaCost','cooldown','castTime','recovery'])if(!Number.isFinite(a[key])||a[key]<0)throw Error('Parâmetro inválido: '+key);
  if(!Array.isArray(a.weaponRequirements)||a.weaponRequirements.some(w=>!Object.hasOwn(WEAPONS,w)))throw Error('Requisito de arma inválido.');
  if(!a.effects?.length)throw Error('Habilidade sem efeitos.');
  let previous=-1;for(const e of a.effects){if(e.at<previous)throw Error('Impactos fora de ordem temporal.');previous=e.at;if(!['damage','projectile','periodic'].includes(e.type)||!Number.isFinite(e.at)||e.at<0||!Number.isFinite(e.power)||e.power<0)throw Error('Efeito inválido.');if(e.type==='projectile'&&!(e.speed>0))throw Error('Velocidade de projétil inválida.');if(e.type==='periodic'&&(!(e.duration>0)||!(e.interval>0)||e.duration<e.interval))throw Error('Efeito periódico inválido.');if(e.type!=='periodic'&&!['physical','magic'].includes(e.damageType))throw Error('Tipo de dano inválido.');}
  return a;
}
Object.values(ABILITIES).forEach(validateAbility);
