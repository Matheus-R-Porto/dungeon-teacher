import {TRAINING_ENEMY} from '../combat/config.js';
export const AI_CONFIG=Object.freeze({
  perceptionInterval:0.18,alertDuration:0.2,repathInterval:0.55,targetMoveThreshold:0.55,
  routeArrival:0.005,spawnArrival:0.18,leashMargin:0.6,leashGrace:0.9,hardLeashMargin:2,
  stuckTimeout:2.5,returnTimeout:15,respawnClearance:1.6,respawnRetry:0.5,reacquireDelay:2,
  separationSpeed:3,separationPasses:3,bodyPadding:0.03,approachSamples:8,
});
export const ENEMY_TYPES=Object.freeze({
  jumpingSlime:{...TRAINING_ENEMY,name:'Slime Saltador',behaviorType:'mobile',color:0xe7ad57,aggressive:false,requiresLOS:true,detectionRange:3.2,chaseSpeed:4,returnSpeed:4,leashRange:8,respawnTime:8,returnRegen:30,radius:.48,assistRange:0,stats:{...TRAINING_ENEMY.stats,physicalDefense:2,attackSpeed:.9}},
  magicSlime:{...TRAINING_ENEMY,name:'Slime Mágico',behaviorType:'ranged',color:0x74bbdf,aggressive:false,requiresLOS:true,detectionRange:6,chaseSpeed:2.4,returnSpeed:3.2,leashRange:9,respawnTime:8,returnRegen:30,radius:.48,assistRange:0,preferredDistance:4,retreatDistance:2.8,basicAttack:{delivery:'projectile',damageType:'magic',projectileSpeed:5,power:1},stats:{...TRAINING_ENEMY.stats,magicAttack:13,physicalDefense:2,magicDefense:5,attackRange:6,attackSpeed:.6}},
  trainingSlime:{...TRAINING_ENEMY,behaviorType:'meleeAggressive',aggressive:true,requiresLOS:true,
    detectionRange:3.2,chaseSpeed:2.6,returnSpeed:3.2,leashRange:6.5,respawnTime:8,
    returnRegen:30,radius:0.48,assistRange:0},
});
