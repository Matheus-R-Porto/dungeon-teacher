import {GUARDIAN as G} from '../../../shared/guardian.js';
import {AWAKENING as A} from '../tower-awakening.js';
import {TRAINING_ENEMY} from '../combat/config.js';
export const AI_CONFIG=Object.freeze({
  perceptionInterval:0.18,alertDuration:0.2,repathInterval:0.55,targetMoveThreshold:0.55,
  routeArrival:0.005,spawnArrival:0.18,leashMargin:0.6,leashGrace:0.9,hardLeashMargin:2,
  stuckTimeout:2.5,returnTimeout:15,respawnClearance:1.6,respawnRetry:0.5,reacquireDelay:2,
  separationSpeed:3,separationPasses:3,bodyPadding:0.03,approachSamples:8,
});
export const ENEMY_TYPES=Object.freeze({
  oathKnight:{...TRAINING_ENEMY,name:G.name,behaviorType:'oathKnight',isBoss:true,aggressive:true,requiresLOS:true,detectionRange:30,chaseSpeed:2.5,returnSpeed:3,leashRange:50,respawnTime:900,returnRegen:1,radius:.8,assistRange:0,stats:{...TRAINING_ENEMY.stats,maxHP:G.hp,physicalAttack:G.attack,physicalDefense:G.defense,attackRange:3.2,attackSpeed:.7}},
  whiteWolf:{...TRAINING_ENEMY,name:'Lobo Branco',behaviorType:'whiteWolf',isMiniBoss:true,aggressive:true,requiresLOS:true,detectionRange:14,chaseSpeed:A.boss.speed,returnSpeed:5,leashRange:24,respawnTime:900,returnRegen:100,radius:1,assistRange:0,stats:{...TRAINING_ENEMY.stats,maxHP:A.boss.hp,physicalAttack:A.boss.attack,physicalDefense:A.boss.defense,attackRange:2.1,attackSpeed:.65}},
  wolf:{...TRAINING_ENEMY,name:'Lobo',behaviorType:'wolf',aggressive:true,requiresLOS:true,detectionRange:5.5,chaseSpeed:3.8,returnSpeed:4.2,leashRange:10,respawnTime:32,returnRegen:35,radius:.55,assistRange:0,stats:{...TRAINING_ENEMY.stats,maxHP:85,physicalAttack:9,physicalDefense:3,attackRange:1.25,attackSpeed:.85}},
  jumpingSlime:{...TRAINING_ENEMY,name:'Slime Saltador',behaviorType:'mobile',color:0xe7ad57,aggressive:false,requiresLOS:true,detectionRange:3.2,chaseSpeed:4,returnSpeed:4,leashRange:8,respawnTime:8,returnRegen:30,radius:.48,assistRange:0,stats:{...TRAINING_ENEMY.stats,physicalDefense:2,attackSpeed:.9}},
  magicSlime:{...TRAINING_ENEMY,name:'Slime Mágico',behaviorType:'ranged',color:0x74bbdf,aggressive:false,requiresLOS:true,detectionRange:6,chaseSpeed:2.4,returnSpeed:3.2,leashRange:9,respawnTime:8,returnRegen:30,radius:.48,assistRange:0,preferredDistance:4,retreatDistance:2.8,retreatDuration:.7,retreatCooldown:2.4,basicAttack:{delivery:'projectile',damageType:'magic',projectileSpeed:5,power:1},stats:{...TRAINING_ENEMY.stats,magicAttack:13,physicalDefense:2,magicDefense:5,attackRange:6,attackSpeed:.6}},
  trainingSlime:{...TRAINING_ENEMY,behaviorType:'meleeAggressive',aggressive:true,requiresLOS:true,
    detectionRange:3.2,chaseSpeed:2.6,returnSpeed:3.2,leashRange:6.5,respawnTime:8,
    returnRegen:30,radius:0.48,assistRange:0},
});
