// Iteration 32: provisional balance, shared by server, UI and documentation.
// Each value is the complete effect at this rank, never an additive rank delta.
export const CLASS_PATHS={warrior:['Ofensiva','Defesa','Persistência'],archer:['Precisão','Mobilidade','Controle'],rogue:['Furtividade','Agilidade','Oportunismo'],priest:['Restauração','Bênçãos','Julgamento'],mage:['Destruição Elemental','Controle Arcano','Concentração Mística']};
export const CLASS_DESCRIPTIONS={warrior:['Resiste na linha de frente e cresce em combates longos.','Combate próximo, defesa e persistência'],archer:['Controla a distância com flechas e posicionamento.','Precisão, mobilidade e controle'],rogue:['Prepara emboscadas e explora as fraquezas do alvo.','Furtividade, agilidade e veneno'],priest:['Sustenta aliados e pune inimigos com luz sagrada.','Cura, bênçãos e julgamento'],mage:['Combina fogo, gelo e eletricidade com preparo arcano.','Dano elemental, controle e concentração']};
const scale=(a,b,n)=>Number((a+b*(n-1)).toFixed(4));
const passive=(id,name,description,values)=>({id,name,description,type:'passive',values});
const active=(id,name,description,mechanic,values,options={})=>({id,name,description,type:'active',mechanic,values,...options});
const S=scale;
const rows={
 warrior:[
  active('breakingStrike','Golpe Rompedor','Ataque próximo que ignora parte da defesa física.','strike',n=>({power:S(1.3,.2,n),penetration:S(.15,.05,n)}),{mp:5,cd:3,range:1.6}),
  passive('weaponMastery','Domínio das Armas','Aumenta o ataque físico com espada e adaga.',n=>({meleeAttack:S(.04,.04,n)})),
  active('aggressiveStance','Postura Agressiva','Eleva o dano físico e reduz a defesa.','buff',n=>({attack:S(.10,.04,n),defense:-.15,duration:15}),{mp:8,cd:20}),
  passive('lethalPrecision','Precisão Letal','Aumenta acerto e chance crítica.',n=>({stats:{accuracy:n*2,criticalChance:n}})),
  passive('ironSkin','Pele de Ferro','Aumenta a defesa física.',n=>({stats:{physicalDefense:n*2}})),
  passive('ironVitality','Vitalidade de Ferro','Aumenta o HP máximo proporcionalmente.',n=>({hpPercent:n*.04})),
  passive('unshakableStance','Postura Inabalável','Reduz o dano recebido depois de um segundo imóvel.',n=>({stationaryReduction:n*.03})),
  active('taunt','Provocação','Provoca inimigos próximos com alta ameaça, sem exigir escudo.','taunt',n=>({radius:3,duration:S(3,.5,n),threat:100+n*25}),{mp:8,cd:12}),
  passive('battleRhythm','Ritmo de Batalha','Ganha até cinco acúmulos de velocidade de ataque durante combate.',n=>({combatSpeed:n*.01,stackInterval:2,maxStacks:5})),
  passive('combatBreath','Fôlego de Combate','Recuperação periódica de MP em combate.',n=>({combatMP:n*.25})),
  active('secondWind','Segundo Fôlego','Cura imediata seguida de recuperação gradual.','heal',n=>({healPercent:S(.06,.02,n),hotPercent:.02,duration:5,interval:1}),{mp:10,cd:24}),
  passive('enduringResistance','Resistência Prolongada','Reduz o custo de MP das habilidades.',n=>({costReduction:n*.03})),
  active('counterAttack','Contra-ataque','Com escudo e imóvel, bloqueia um golpe e contra-ataca.','buff',n=>({counterPower:S(.8,.3,n),duration:S(3,1,n),block:1}),{mp:12,cd:15,shield:true}),
  passive('finalDetermination','Determinação Final','Abaixo de 30% de HP, reduz o dano recebido.',n=>({lowHPReduction:n*.08,threshold:.3})),
  passive('growingMomentum','Ímpeto Crescente','Acertos consecutivos aumentam o dano; expira após quatro segundos sem acerto.',n=>({consecutiveDamage:n*.015,maxStacks:5,duration:4})),
  passive('unbreakableSpirit','Espírito Inquebrável','Uma vez por combate, ao cair abaixo de 25% de HP, recebe proteção e vigor por seis segundos.',()=>({threshold:.25,duration:6,reduction:.35,attack:.2}))
 ],
 archer:[
  active('piercingShot','Disparo Perfurante','Flecha guiada até o alvo selecionado; continua em linha reta atrás dele.','projectile',n=>({power:S(1.1,.15,n),pierce:2,speed:12}),{mp:4,cd:3,range:8,weapon:'bow',guided:true,ammo:1}),
  passive('eagleEyes','Olhos de Águia','Melhora acerto e chance crítica.',n=>({stats:{accuracy:n*3,criticalChance:n}})),
  active('focusedShot','Disparo Concentrado','Disparo carregado; movimentar-se cancela a preparação.','projectile',n=>({power:S(1.8,.3,n),speed:15}),{mp:10,cd:8,range:9,cast:1.2,weapon:'bow',guided:true,ammo:1}),
  passive('weakPointKnowledge','Conhecimento de Pontos Fracos','Aumenta o multiplicador do dano crítico.',n=>({criticalDamage:n*.08})),
  passive('lightSteps','Passos Leves','Aumenta a velocidade de movimento.',n=>({moveSpeed:n*.03})),
  active('tacticalRetreat','Recuo Tático','Recua na direção oposta à mira. Não concede invulnerabilidade.','dash',n=>({distance:S(2,.25,n),backward:true}),{mp:6,cd:8,target:'direction'}),
  passive('hunterReflexes','Reflexos de Caçador','Aumenta a evasão calculada nos ataques.',n=>({stats:{evasion:n*3}})),
  active('agileShot','Disparo Ágil','Disparo de preparação rápida.','projectile',n=>({power:S(.85,.15,n),speed:16}),{mp:3,cd:2,range:7,weapon:'bow',guided:true,ammo:1,cast:.05}),
  active('slowingArrow','Flecha Retardante','Flecha que reduz o movimento do inimigo.','projectile',n=>({power:S(.7,.1,n),slow:S(.15,.05,n),duration:4,speed:12}),{mp:6,cd:6,range:8,weapon:'bow',guided:true,ammo:1}),
  passive('distanceMastery','Domínio de Distância','Amplia o alcance de ataques e disparos de arco.',n=>({bowRange:n*.4})),
  active('arrowRain','Chuva de Flechas','Área fixa recebe seis salvas, consumindo seis flechas no início.','zone',n=>({power:S(.22,.04,n),radius:2.2,duration:3,interval:.5,ticks:6}),{mp:16,cd:14,range:8,weapon:'bow',target:'ground',ammo:6}),
  passive('arrowConservation','Conservação de Flechas','Chance por flecha de preservar munição, acrescida de 0,1% por LUK, limitada a 45%.',n=>({ammoSave:n*.05,luckScaling:.001,cap:.45})),
  active('retreatingShot','Disparo em Retirada','Dispara contra o alvo e recua sem atravessar obstáculos.','retreatShot',n=>({power:S(1.1,.2,n),distance:2,speed:14}),{mp:10,cd:10,range:8,weapon:'bow',guided:true,ammo:1}),
  active('transfixingArrow','Flecha Transpassante','Flecha de mira manual em linha reta, sem perseguição, perfura até cinco inimigos.','projectile',n=>({power:S(1.2,.25,n),pierce:5,speed:15}),{mp:12,cd:9,range:10,weapon:'bow',target:'direction',ammo:1}),
  passive('relentlessHunt','Caçada Implacável','Acertar inimigos lentos concede movimento e aumenta o dano contra eles.',n=>({slowBonus:n*.08,moveAfterHit:n*.04,duration:4})),
  active('predatorInstinct','Instinto do Predador','Concentração de caça: melhora acerto, crítico e movimento temporariamente.','buff',()=>({duration:10,accuracy:20,criticalChance:20,moveSpeed:.2}),{mp:24,cd:60})
 ],
 rogue:[
  active('concealment','Ocultação','Oculta da percepção inimiga; atacar, lançar ação ofensiva ou sofrer dano revela.','buff',n=>({stealth:true,duration:S(6,2,n)}),{mp:6,cd:16}),
  passive('surpriseAttack','Ataque Surpresa','Aumenta o dano do primeiro ataque saindo da ocultação.',n=>({stealthDamage:n*.12})),
  passive('discreetPresence','Presença Discreta','Reduz a ameaça gerada por dano.',n=>({threatReduction:n*.08})),
  passive('lethalPreparation','Preparação Letal','Primeiro golpe após ocultação ganha chance crítica e penetração.',n=>({openingCrit:n*.04,openingPenetration:n*.04})),
  active('quickLunge','Investida Rápida','Avança até o inimigo por um trajeto livre e aplica um golpe.', 'lunge',n=>({power:S(.8,.15,n),distance:4}),{mp:6,cd:7,range:4}),
  passive('keenReflexes','Reflexos Aguçados','Aumenta a evasão real.',n=>({stats:{evasion:n*3}})),
  active('daggerSequence','Sequência de Adagas','Três golpes reais alternando as mãos; movimento interrompe os golpes restantes.','sequence',n=>({power:S(.45,.08,n),hits:3,interval:.22}),{mp:9,cd:6,range:1.5,weapon:'dagger'}),
  passive('acceleratedRhythm','Ritmo Acelerado','Cada acerto concede velocidade de ataque, até cinco acúmulos por quatro segundos.',n=>({hitSpeed:n*.015,maxStacks:5,duration:4})),
  active('poisonBlade','Lâmina Envenenada','Encanta cada adaga equipada com veneno; limite global de três acúmulos por inimigo.','buff',n=>({poisonPower:S(.06,.02,n),poisonDuration:5,duration:20}),{mp:8,cd:22,weapon:'dagger'}),
  passive('weaknessKnowledge','Conhecimento de Fraquezas','Causa dano adicional contra inimigos sob condições negativas.',n=>({conditionDamage:n*.04})),
  active('treacherousBlow','Golpe Traiçoeiro','Golpe mais forte pelas costas, com bônus adicional contra alvos envenenados.','strike',n=>({power:S(1,.15,n),backBonus:.5,poisonBonus:.3}),{mp:8,cd:7,range:1.5}),
  passive('persistentToxins','Toxinas Persistentes','Melhora duração e dano do veneno.',n=>({poisonDamage:n*.06,poisonTime:n*.1})),
  active('shadowStep','Passo das Sombras','Desloca-se para trás do alvo somente se o trajeto e a posição estiverem livres.','shadow',n=>({distance:S(3,1,n)}),{mp:10,cd:12,range:5}),
  active('toxicAmbush','Emboscada Tóxica','Ataque saindo da ocultação aplica veneno mais intenso.', 'strike',n=>({power:S(1.1,.2,n),poisonPower:S(.15,.05,n),poisonDuration:6,stealthBonus:.5}),{mp:12,cd:12,range:1.5,weapon:'dagger'}),
  active('bladeDance','Dança das Lâminas','Dano moderado em pequena área ao redor do personagem.', 'burst',n=>({power:S(.9,.2,n),radius:2}),{mp:14,cd:12}),
  passive('invisiblePredator','Predador Invisível','Ao atacar saindo da ocultação recebe dano e velocidade por cinco segundos.',()=>({duration:5,attack:.15,attackSpeed:.25}))
 ],
 priest:[
  active('heal','Cura','Cura um aliado ou causa dano sagrado a um morto-vivo. Sem alvo, cura a si.', 'heal',n=>({heal:S(12,6,n),scaling:.65,power:S(.8,.12,n),element:'holy'}),{mp:5,cd:2,range:7,target:'allyOrUndead',cast:.3}),
  active('purifyingTouch','Toque Purificador','Remove condições até a gravidade do nível aprendido.', 'cleanse',n=>({severity:n}),{mp:7,cd:8,range:6,target:'ally'}),
  passive('sacredExpansion','Expansão Sagrada','Amplia o raio de Santuário e Aura de Esperança.',n=>({holyRadius:n*.1})),
  active('renewal','Renovação','Cura gradual única por alvo; renova a duração e conserva a potência mais forte.', 'heal',n=>({heal:0,hot:S(4,2,n),scaling:.15,duration:8,interval:1}),{mp:10,cd:8,range:7,target:'ally'}),
  active('courageBlessing','Bênção da Coragem','Bênção adaptada à classe do aliado: dano físico ou mágico, movimento e ataque.', 'allyBuff',n=>({attack:S(.04,.02,n),attackSpeed:.08,moveSpeed:.08,duration:20}),{mp:10,cd:16,range:6,target:'ally'}),
  active('divineProtection','Proteção Divina','Reduz moderadamente o dano recebido por um aliado, inclusive em movimento.', 'allyBuff',n=>({reduction:S(.08,.03,n),duration:10}),{mp:10,cd:16,range:6,target:'ally'}),
  active('teleport','Teleporte','Viaja para um andar superior já visitado e desbloqueado por todos os passageiros. Cada passageiro precisa aceitar.', 'teleport',n=>({mpPerFloor:S(6,-.5,n),radius:3}),{mp:10,cd:30,target:'floor',cast:2}),
  active('hopeAura','Aura de Esperança','Aura defensiva móvel; consome MP por segundo e suspende regeneração natural e periódica de MP.', 'aura',n=>({radius:3,reduction:S(.06,.02,n),upkeep:S(2,-.15,n),duration:30}),{mp:6,cd:3}),
  active('punishingLight','Luz Punitiva','Dano sagrado simples de baixo custo.', 'strike',n=>({power:S(.9,.15,n),element:'holy'}),{mp:3,cd:1.5,range:7,cast:.2,magic:true}),
  passive('sacredKnowledge','Conhecimento Sagrado','Amplifica apenas o próprio dano sagrado.',n=>({holyDamage:n*.05})),
  active('condemnationSeal','Selo da Condenação','Dano sagrado gradual e vulnerabilidade sagrada.', 'dot',n=>({power:S(.15,.04,n),duration:6,interval:1,holyVulnerability:S(.05,.02,n),element:'holy'}),{mp:10,cd:10,range:7,magic:true}),
  passive('conviction','Convicção','Recupera MP instantâneo uma única vez por conjuração que causar dano sagrado.',n=>({convictionMP:n*.6})),
  active('sanctuary','Santuário','Área fixa que cura e protege aliados, causando dano leve em mortos-vivos.', 'zone',n=>({heal:S(4,2,n),power:.15,radius:2.5,duration:8,interval:1,reduction:S(.06,.03,n),element:'holy'}),{mp:20,cd:20,range:6,target:'ground',magic:true}),
  active('redemptionLight','Luz da Redenção','Dano sagrado que restaura parte do dano causado como HP.', 'strike',n=>({power:S(1.1,.2,n),lifeSteal:S(.2,.1,n),element:'holy'}),{mp:14,cd:10,range:7,magic:true}),
  active('consecratedWeapon','Arma Consagrada','Adiciona dano sagrado proporcional ao dano base da arma, preservando o componente físico.', 'allyBuff',n=>({holyWeapon:S(.08,.04,n),duration:20}),{mp:12,cd:22,range:6,target:'ally'}),
  passive('faithMiracle','Milagre da Fé','A próxima Cura manual em um aliado abaixo de 30% de HP é 60% mais forte; recarga interna de 40 segundos.',()=>({threshold:.3,healBonus:.6,cooldown:40}))
 ],
 mage:[
  active('magicProjectile','Projétil Mágico','Projétil neutro de mira manual; pode ser conjurado em movimento. Maestria adiciona porções elementais separadas.', 'projectile',n=>({power:S(.85,.14,n),speed:11,element:'neutral'}),{mp:3,cd:1.2,range:8,target:'direction',magic:true,moving:true,cast:.1}),
  passive('elementalMastery','Maestria Elemental','Cinco pontos distribuíveis entre fogo, gelo e eletricidade; cada ponto adiciona 4% ao elemento.',n=>({elementPoints:n,elementBonus:.04})),
  active('fireball','Bola de Fogo','Projétil manual que explode ao atingir inimigo ou parede, aplicando queimadura.', 'projectile',n=>({power:S(1.2,.2,n),radius:2,burn:S(.1,.03,n),duration:4,speed:9,element:'fire'}),{mp:10,cd:7,range:8,target:'direction',magic:true,cast:.7}),
  active('chainLightning','Corrente Elétrica','Primeiro alvo dirigido, seguido de saltos automáticos sem repetir inimigos.', 'chain',n=>({power:S(.9,.15,n),jumps:2+Math.floor(n/2),jumpRange:3,decay:.8,speed:14,element:'lightning'}),{mp:14,cd:9,range:7,target:'direction',magic:true,cast:.5}),
  active('iceLance','Lança de Gelo','Projétil manual em linha reta, perfurante, com lentidão.', 'projectile',n=>({power:S(.8,.15,n),pierce:4,slow:S(.15,.03,n),duration:3,speed:12,element:'ice'}),{mp:7,cd:5,range:9,target:'direction',magic:true,cast:.4}),
  active('iceField','Campo de Gelo','Área fixa com dano periódico leve e lentidão.', 'zone',n=>({power:S(.13,.025,n),slow:S(.2,.025,n),radius:2.5,duration:6,interval:1,element:'ice'}),{mp:14,cd:12,range:7,target:'ground',magic:true,cast:.5}),
  active('arcaneBarrier','Barreira Arcana','Absorve dano físico e mágico até esgotar sua capacidade.', 'buff',n=>({barrier:S(20,10,n),scaling:.5,duration:15}),{mp:12,cd:18}),
  active('arcaneStep','Passo Arcano','Deslocamento curto na direção escolhida, bloqueado por obstáculos.', 'dash',n=>({distance:S(2,.3,n)}),{mp:8,cd:8,target:'direction'}),
  passive('acceleratedCasting','Conjuração Acelerada','Reduz o tempo de conjuração multiplicativamente.',n=>({castReduction:n*.04})),
  passive('arcaneReserve','Reserva Arcana','Aumenta o MP máximo, sem conceder regeneração.',n=>({mpPercent:n*.06})),
  passive('arcaneMeditation','Meditação Arcana','Recupera MP após dois segundos imóvel e sem executar ações.',n=>({meditationMP:n*.5,wait:2})),
  active('arcaneOverload','Sobrecarga Arcana','Amplifica magia neutra e elemental e aumenta seu custo de MP.', 'buff',n=>({magicDamage:S(.1,.04,n),costIncrease:.25,duration:15}),{mp:8,cd:20}),
  active('glacialExplosion','Explosão Glacial','Explosão de gelo próxima que afasta inimigos comuns, sem deslocar chefes.', 'burst',n=>({power:S(1,.25,n),radius:2.5,knockback:S(1,.3,n),element:'ice'}),{mp:16,cd:12,magic:true}),
  passive('arcaneFlow','Fluxo Arcano','Alternar conjurações elementais distintas recupera MP. Projétil Mágico não participa.',n=>({flowMP:n*1.5})),
  passive('defensiveConcentration','Concentração Defensiva','Reduz a conjuração enquanto Barreira Arcana tiver absorção restante.',n=>({barrierCast:n*.07})),
  passive('arcaneTrinity','Trindade Arcana','Acertar fogo, gelo e eletricidade no mesmo alvo em oito segundos causa dano neutro extra, com recarga de oito segundos por alvo.',()=>({window:8,power:.8,cooldown:8}))
 ]
};
export const CLASS_SKILLS=Object.freeze(Object.fromEntries(Object.entries(rows).flatMap(([classId,skills])=>skills.map((row,index)=>{
 const hybrid=index>=12,cap=index===15?1:hybrid?3:5,path=hybrid?'hybrid':Math.floor(index/4),tier=hybrid?index-12:index%4;
 const pair=hybrid?[[0,1],[1,2],[0,2],[0,1,2]][tier]:[];
 // Priest and rogue hybrid order is 0+1, 0+2, 1+2; warrior is 0+1,1+2,0+2.
 if(hybrid&&['archer','rogue','priest','mage'].includes(classId)){pair.splice(0,pair.length,...[[0,1],[0,2],[1,2],[0,1,2]][tier]);}
 const requires=hybrid?(index===15?[12,13,14].map(i=>({id:skills[i].id,level:1})):pair.map(p=>({id:skills[p*4+1].id,level:2}))):tier?[{id:skills[index-1].id,level:2}]:[];
 const pathRequires=pair.map(p=>({path:p,points:index===15?8:6}));
 const jobLevel=hybrid?(index===15?30:20):[1,5,10,15][tier];
 const ranks=Array.from({length:cap},(_,i)=>{const n=i+1,parameters=row.values(n);return row.type==='passive'?parameters:{id:row.id,name:row.name,description:row.description,mechanic:row.mechanic,parameters,targetingType:row.target??(row.range?'enemy':'self'),requiresTarget:!row.target&&!!row.range,requiresLineOfSight:true,weaponRequirements:row.weapon?[row.weapon]:[],range:row.range??0,manaCost:row.mp??0,cooldown:row.cd??0,castTime:row.cast??.15,recovery:.15,moving:!!row.moving,guided:!!row.guided,shield:!!row.shield,ammo:row.ammo??0,magic:!!row.magic,rank:n,effects:[{type:'class',at:0,power:parameters.power??0,damageType:row.magic?'magic':'physical'}]};});
 return [row.id,{id:row.id,name:row.name,description:row.description,classId,type:row.type,path,tier,jobLevel,requires,pathRequires,rankJobLevels:ranks.map((_,i)=>jobLevel+i*2),ranks}];
}))));
export const CLASS_ABILITIES=Object.freeze(Object.fromEntries(Object.values(CLASS_SKILLS).filter(s=>s.type==='active').map(s=>[s.id,s.ranks[0]])));
export function classRank(data,id){const j=data.jobs;if(!j)return 0;const skill=CLASS_SKILLS[id];if(!skill||j.active!==skill.classId)return 0;return j.origins[j.active]?.spent[id]??0;}
export function classValue(data,id){return CLASS_SKILLS[id]?.ranks[classRank(data,id)-1]??{};}
export function classAbility(data,id){const s=CLASS_SKILLS[id];return s?.type==='active'?s.ranks[classRank(data,id)-1]??null:null;}
export function prerequisiteReason(skill,rank,jobs,ranks,catalog){
 if(!rank)return '';
 if((jobs.origins[skill.classId]?.level??0)<(skill.rankJobLevels?.[rank-1]??skill.jobLevel))return 'Requer Job '+(skill.rankJobLevels?.[rank-1]??skill.jobLevel);
 for(const r of skill.requires)if((ranks[r.id]??0)<r.level)return 'Requer '+(catalog[r.id]?.name??r.id)+' nível '+r.level;
 for(const r of skill.pathRequires??[]){const total=Object.values(catalog).filter(s=>s.classId===skill.classId&&s.path===r.path).reduce((n,s)=>n+(ranks[s.id]??0),0);if(total<r.points)return 'Requer '+r.points+' pontos em '+CLASS_PATHS[skill.classId][r.path];}
 return '';
}
