// Stable public town geometry, shared by authority and rendering. No per-player generation.
export const CITY_ID='shared-city';
export const CITY_WATCHTOWERS=Object.freeze([[-31,-29,5.5,true],[31,-29,6.5,true],[-31,29,5,false],[31,29,5.5,true],[-4,29,5.6,true],[4,29,5.6,true],[31,3,5,false],[31,11,5,false],[-31,-2,4.8,false]].map(([x,z,height,roof],i)=>Object.freeze({id:'city-watchtower-'+i,x,z,height,roof,radius:2.3})));
export const CITY_NPCS=[
 {id:'reset-angel',name:'Serafina · Anjo do Reset',x:-8,z:-8,art:0,lines:['Toda jornada pode encontrar um novo rumo. Sou Serafina, guardiã dos recomeços.','No futuro, poderei ajudar a reorganizar atributos e habilidades. Esse serviço ainda não está disponível.']},
 {id:'warehouse',name:'Marta · Armazeneira',x:9,z:7,art:1,lines:['Bem-vindo ao Armazém do Limiar! Aqui cada objeto terá seu lugar.','O armazenamento online ainda está em preparação. Por enquanto, seus itens continuam no inventário do personagem.']},
 {id:'blacksmith',name:'Brasa · Ferreiro',x:9,z:-1,art:2,lines:['Uma boa aventura começa com equipamento bem cuidado! Eu sou Brasa.','Forja e aprimoramentos online ainda estão em preparação. A espada de treino já permite explorar a Torre.']},
 {id:'cook',name:'Lina · Cozinheira',x:-9,z:6,art:3,lines:['Sinta o cheiro da taverna! Uma refeição e uma boa conversa preparam qualquer expedição.','As receitas já podem ser exploradas na campanha local. A cozinha compartilhada ainda não está disponível.']},
 {id:'potion-mage',name:'Orin · Mago das Poções',x:-9,z:-1,art:4,lines:['Cada frasco guarda um pouco de cuidado. Recuperar-se também faz parte da aventura!','A loja de poções online ainda está sendo preparada. Observe seu HP e procure um lugar seguro antes de continuar.']},
 {id:'tower-guide',name:'Caio · Guia da Torre',x:3,z:-9,art:5,lines:['A Torre está logo adiante! Aproxime-se do portal e pressione F para entrar.','Clique em um monstro para aproximar e atacar. Forme uma party de até seis pessoas no painel social.','A experiência fortalece seu personagem. Depois da batalha, aproxime-se do saque e colete sua recompensa. O portal da entrada permite voltar à cidade.']},
].map(n=>({...n,radius:2.7,options:[],actions:[]}));
const building=(id,x,z,halfX,halfZ,label,roof)=>({id,shape:'rect',kind:'building',x,z,halfX,halfZ,label,roof});
// District coordinates are also used by the local campaign adapter.
export const CITY_DISTRICTS=[
 {id:'plaza',name:'Praça das Águas',x:0,z:0},
 {id:'market',name:'Mercado dos Viajantes',x:-17,z:1},
 {id:'workshops',name:'Pátio das Oficinas',x:17,z:1},
 {id:'homes',name:'Jardins do Sul',x:0,z:18},
 {id:'sanctuary',name:'Santuário da Aurora',x:-17,z:-17},
 {id:'tower',name:'Caminho da Torre',x:0,z:-22},
 {id:'tavern',name:'Largo da Taverna',x:17,z:17},
];
const positions={'reset-angel':[-17,-17],warehouse:[-20,10],blacksmith:[17,0],cook:[17,17],'potion-mage':[-17,-2],'tower-guide':[4,-20]};
for(const npc of CITY_NPCS)[npc.x,npc.z]=positions[npc.id];
export function cityMap(){
 const b=(id,x,z,hx,hz,label,roof,style='house',height=2.5)=>({...building(id,x,z,hx,hz,label,roof),style,height});
 const obstacles=[
 b('forge-house',22,-4,3,2.8,'FORJA DO BRASA',0xa4583b,'workshop',3),
 b('toolshop',22,6,2.5,2,'FERRAMENTAS',0x5b7181,'workshop'),
 b('tavern',22,18,3.5,3,'TAVERNA DA LINA',0x52745a,'tavern',4),
 b('potions',-22,-5,2.8,2.5,'POÇÕES DO ORIN',0x76649a,'tower',4),
 b('warehouse-house',-25,10,3,3,'ARMAZÉM',0x557f8a,'warehouse',3.5),
 b('sanctuary-house',-22,-21,3.4,3,'SANTUÁRIO',0x8788b3,'sanctuary',4.5),
 b('house-west',-12,20,2.3,2,'',0xa66d50,'house',3),
 b('house-east',-5,23,2.2,2,'',0x5f8495,'house',2.5),
 b('house-garden',5,23,2.6,2.2,'',0x9d654d,'house',3.5),
 b('house-north',14,-20,2.6,2.3,'',0x718f72,'house',3),
 b('gate-west',-5,-25,1.5,1.7,'',0x566775,'tower',5),
 b('gate-east',5,-25,1.5,1.7,'',0x566775,'tower',5),
 {id:'fountain',kind:'fountain',shape:'circle',x:0,z:0,radius:1.7},
 ...CITY_NPCS.map(n=>({id:'npc-'+n.id,kind:'npc',shape:'circle',x:n.x,z:n.z,radius:.32}))];
 for(const [i,[x,z]]of [[-5,3],[5,3],[-5,-3],[5,-3]].entries())obstacles.push({id:'bench-'+i,kind:'bench',shape:'rect',x,z,halfX:1,halfZ:.35});
 const add=(kind,points,radius)=>points.forEach(([x,z],i)=>obstacles.push({id:'city-'+kind+'-'+i,kind,shape:'circle',x,z,radius}));
 add('tree',[[-28,-24],[-28,-15],[-26,21],[-19,22],[-14,25],[11,25],[27,25],[28,11],[28,-13],[22,-23],[-9,-17],[10,-13],[-10,12],[10,12]],.5);
 add('lamp',[[-5,-7],[5,-7],[-5,7],[5,7],[-12,-7],[12,-7],[-12,7],[12,7],[-3,-18],[3,-18],[-3,16],[3,16],[16,13],[-17,12]],.2);
 for(const [i,[x,z]] of [[-8,0],[8,0],[-16,-22],[10,18]].entries())obstacles.push({id:'garden-'+i,kind:'garden',shape:'rect',x,z,halfX:1.8,halfZ:1.2});
 for(const [i,[x,z]] of [[-16,4],[-16,9],[-11,4]].entries())obstacles.push({id:'stall-'+i,kind:'stall',shape:'rect',x,z,halfX:1.3,halfZ:.8});
 for(const [i,[x,z]] of [[24,1],[26,14],[-26,15]].entries())obstacles.push({id:'supplies-'+i,kind:'supplies',shape:'rect',x,z,halfX:.9,halfZ:.5});
 const smith=CITY_NPCS.find(n=>n.id==='blacksmith');obstacles.push({id:'smith-workbench',kind:'workbench',shape:'rect',x:smith.x-.65,z:smith.z+.55,halfX:.63,halfZ:.3});
 obstacles.push({id:'city-forge',kind:'anvil',shape:'circle',x:17,z:-4,radius:.8});
 for(const tower of CITY_WATCHTOWERS)obstacles.push({...tower,kind:'watchtower',shape:'circle'});
 return {id:CITY_ID,layoutVersion:3,name:'Cidade do Limiar',environment:'city',floorId:0,safe:true,bounds:{minX:-30,maxX:30,minZ:-28,maxZ:28},spawn:{x:0,z:5},portal:{x:0,z:-24,interactRadius:2.7},enemySpawns:[],districts:structuredClone(CITY_DISTRICTS),npcs:structuredClone(CITY_NPCS),obstacles,interactables:[{id:'tower-portal',x:0,z:-24,radius:2.7,priority:1,label:'Entrar na Torre · Andar 1',action:'travel',content:{areaId:'shared-floor-1'}}],zones:[]};
}
