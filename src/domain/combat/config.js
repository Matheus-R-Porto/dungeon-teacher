export const COMBAT = Object.freeze({
  playerRange:1.45, windupFraction:0.25, minHit:0.05, maxHit:0.95,
  variation:0.08, criticalMultiplier:1.5, minimumDamage:1,
  enemyRemovalDelay:1.5, playerReturnDelay:3,
  approachSamples:24, approachMargin:0.12,
});
export const TRAINING_ENEMY = Object.freeze({
  id:'training-slime',name:'Slime de Treino',level:1,x:3,z:1,heading:Math.PI,
  stats:{maxHP:120,physicalAttack:18,physicalDefense:4,magicDefense:3,accuracy:80,evasion:5,
    criticalChance:3,attackSpeed:0.8,attackRange:1.65},
});
export const PLAYER_STATE=Object.freeze({IDLE:'idle',MOVING:'moving',CHASING:'chasing',ATTACKING:'attacking',INTERACTING:'interacting',DEAD:'dead'});
