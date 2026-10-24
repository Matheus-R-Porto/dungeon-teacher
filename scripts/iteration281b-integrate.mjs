import fs from 'node:fs';
import assert from 'node:assert/strict';
import {ITEMS} from '../src/domain/items/inventory.js';
import {portraitPixels} from '../tests/helpers/portrait-png.js';
const previous=JSON.parse(fs.readFileSync('docs/iteration281b-previous-art.json','utf8'));
assert.equal(Object.keys(ITEMS).length,44);assert.deepEqual(Object.keys(previous).sort(),Object.keys(ITEMS).sort());
const art={};
for(const id of Object.keys(ITEMS)){
 const inventoryIcon=`/assets/items/inventory-v281/${id}.png`,p=portraitPixels('public'+inventoryIcon);
 assert.equal(p.width,128);assert.equal(p.height,128);assert.equal(p.edge,0);assert.ok(p.transparent>100);assert.ok(p.bounds.x0>=8&&p.bounds.y0>=8&&p.bounds.x1<120&&p.bounds.y1<120);
 art[id]={...previous[id],inventoryIcon,note:'Sprite PNG 128 × 128; direção da Fase A aprovada, catálogo completo aguardando revisão artística humana.'};
}
fs.writeFileSync('src/ui/item-art.json',JSON.stringify(art,null,2)+'\n');
console.log('44 transparent sprites validated and mapped.');
