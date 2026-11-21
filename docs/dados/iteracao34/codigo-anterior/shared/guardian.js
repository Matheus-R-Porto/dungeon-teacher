export const GUARDIAN=Object.freeze({id:'last-oath',name:'Cavaleiro do Último Juramento',floor:3,unlock:4,hp:1500,attack:24,defense:7,xp:300,phaseAt:.4,readyMs:30000,reconnectMs:45000,maxMs:900000,introSeconds:2.5,resultSeconds:8,entryRadius:3.5});
export const isArenaId=id=>typeof id==='string'&&/^arena-[0-9a-f-]{36}$/.test(id);
export const GUARDIAN_SKILLS=Object.freeze({
 sword:{name:'Golpe de Espada',windup:.85,recovery:.9,range:3.2,width:2.4,power:1},
 arc:{name:'Corte Arcano',windup:1.25,recovery:1.1,range:22,width:1.4,power:1.3,speed:9},
 rupture:{name:'Ruptura do Juramento',windup:1.8,recovery:1.3,range:6.5,width:6.5,power:1.4},
 charge:{name:'Investida Espectral',windup:1.3,recovery:1.4,range:12,width:1.3,power:1.2,speed:10},
});
