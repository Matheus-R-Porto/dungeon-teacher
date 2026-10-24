import test from 'node:test';
import assert from 'node:assert/strict';
import {npcPortrait} from '../src/ui/npc-portraits.js';
test('orientation is individually selected and returned descriptors cannot mutate the catalog',()=>{
 const expected={'reset-angel':false,warehouse:true,blacksmith:true,cook:true,'potion-mage':false,'tower-guide':true};
 for(const [id,flipX] of Object.entries(expected)){const p=npcPortrait(id);assert.equal(p.flipX,flipX);p.flipX=!flipX;assert.equal(npcPortrait(id).flipX,flipX);assert.ok(p.src.endsWith('-full-v271.png'));}
 assert.deepEqual(npcPortrait('weaponsmith'),npcPortrait('blacksmith'));
});
