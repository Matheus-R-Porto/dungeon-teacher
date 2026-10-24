// Individual portrait files are independent of world/class sprites and loaded on demand.
// Orientation reviewed per portrait; original v271 artwork remains untouched.
const portraits=Object.freeze({'reset-angel':['serafina',false],warehouse:['marta',true],blacksmith:['brasa',true],cook:['lina',true],'potion-mage':['orin',false],'tower-guide':['caio',true]});
export function npcPortrait(id){const portrait=portraits[id==='weaponsmith'?'blacksmith':id];return portrait?{src:'/assets/portraits/'+portrait[0]+'-full-v271.png',flipX:portrait[1]}:null;}
