import fs from 'node:fs';
import {CLASS_SKILLS} from '../src/domain/abilities/class-skills.js';
import {classIcon} from '../src/ui/class-icons.js';
fs.mkdirSync('public/assets/skills-v32',{recursive:true});
for(const id of Object.keys(CLASS_SKILLS))fs.writeFileSync('public/assets/skills-v32/'+id+'.svg',classIcon(id).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
const map={woodenShield:'counterAttack',pairedDaggers:'daggerSequence',arrows:'arrowRain',unwaveringCharm:'defensiveConcentration'};
fs.mkdirSync('public/assets/items/class-v32',{recursive:true});const art=JSON.parse(fs.readFileSync('src/ui/item-art.json','utf8'));
for(const [id,skill]of Object.entries(map)){const svg=classIcon(skill).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');fs.writeFileSync('public/assets/items/class-v32/'+id+'.svg',svg);art[id]={inventoryIcon:'/assets/items/class-v32/'+id+'.svg',worldSprite:null,classification:'B',note:'Pixel art vetorial da iteração 32; recurso próprio sobre o sistema SVG existente.'};}
fs.writeFileSync('src/ui/item-art.json',JSON.stringify(art,null,2)+'\n');
console.log('80 ícones de habilidade e quatro recursos de suprimentos exportados.');
