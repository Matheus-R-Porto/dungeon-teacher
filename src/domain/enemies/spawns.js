import {Enemy} from '../combat/enemy.js';
import {ENEMY_TYPES} from './config.js';
import {canStand} from '../../world/collision.js';
export function createEnemies(spawns,world){
  const ids=new Set();return spawns.map(spawn=>{
    const base=ENEMY_TYPES[spawn.enemyType];if(!base||!spawn.id||ids.has(spawn.id))throw Error('Spawn de inimigo inválido ou duplicado.');ids.add(spawn.id);
    const definition={...structuredClone(base),...spawn.overrides,id:spawn.id,x:spawn.position.x,z:spawn.position.z,heading:spawn.heading??base.heading,stats:{...base.stats,...spawn.overrides?.stats}};
    for(const key of ['detectionRange','chaseSpeed','returnSpeed','leashRange','returnRegen','radius'])if(!Number.isFinite(definition[key])||definition[key]<=0)throw Error(`Parâmetro inválido de inimigo: ${key}`);
    if(definition.noRespawn)delete definition.respawnTime;else if(!Number.isFinite(definition.respawnTime)||definition.respawnTime<=0)throw Error('Respawn inválido.');
    if(!canStand(world,definition.x,definition.z,definition.radius))throw Error(`Spawn bloqueado: ${spawn.id}`);
    const enemy=new Enemy(definition);enemy.spawnPosition={x:enemy.x,z:enemy.z};enemy.spawnHeading=enemy.heading;enemy.targetId=null;enemy.aggroReason=null;enemy.path=[];enemy.generation=0;if(enemy.dormant){enemy.hp=0;enemy.state='removed';}return enemy;
  });
}
