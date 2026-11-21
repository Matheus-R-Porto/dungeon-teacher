import fs from 'node:fs';
import {CLASS_SKILLS,CLASS_PATHS,CLASS_DESCRIPTIONS} from '../src/domain/abilities/class-skills.js';
import {effectText,requirementsText} from '../src/ui/skill-presentation.js';
fs.writeFileSync('.logs/iteration32-catalog.json',JSON.stringify({paths:CLASS_PATHS,descriptions:CLASS_DESCRIPTIONS,skills:Object.values(CLASS_SKILLS).map(s=>({...s,progression:s.ranks.map((r,i)=>({rank:i+1,requirements:requirementsText(s,i+1),effect:effectText(s,i+1),values:r}))}))},null,2));
