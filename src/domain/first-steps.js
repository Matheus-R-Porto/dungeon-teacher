import {equippedDefinition} from './items/inventory.js';
export const FIRST_STEPS = [
  {id:'movement',title:'Explore o Refúgio',hint:'Use WASD ou clique no chão para caminhar.'},
  {id:'camera',title:'Teste a câmera',hint:'Segure Q ou E para girar. Use a roda do mouse para aproximar.'},
  {id:'smith',title:'Converse com o Armeiro',hint:'Procure o Armeiro junto à tenda e pressione F.'},
  {id:'acquired',title:'Obtenha sua primeira arma',hint:'Na loja, escolha uma arma gratuita.'},
  {id:'equipped',title:'Equipe a arma',hint:'Abra I, selecione a arma e clique em Equipar.'},
  {id:'entered',title:'Entre no Portal da Torre',hint:'Com uma arma equipada, aproxime-se do Portal e pressione F.'},
  {id:'cleared',title:'Explore a Torre e avance',hint:'Siga as trilhas e resolva os encontros que bloqueiam passagens. Desvios são opcionais.'},
  {id:'returned',title:'Volte ao lobby',hint:'Conclua os três andares, derrote o Guardião, pegue o baú e use F no portal para voltar ao Refúgio.'},
  {id:'learned',title:'Aprenda uma habilidade',hint:'Você ganhou um Espaço de Habilidade! Pressione TAB para aprender uma técnica.'},
];
export const emptyFirstSteps=()=>Object.fromEntries(FIRST_STEPS.map(step=>[step.id,false]));
export function decodeFirstSteps(raw){const state=emptyFirstSteps();if(raw===undefined)return state;if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Progresso de missão inválido.');for(const key of Object.keys(state)){if(raw[key]!==undefined&&typeof raw[key]!=='boolean')throw Error('Progresso de missão inválido.');state[key]=raw[key]??false;}return state;}
export class FirstSteps {
  constructor(character,onChange=()=>{}){this.character=character;this.onChange=onChange;character.data.firstSteps??=emptyFirstSteps();}
  get state(){return this.character.data.firstSteps;}
  mark(id){if(!this.state[id]){this.state[id]=true;this.onChange();}}
  observe(game,orbit){if(game.distance>=1)this.mark('movement');if(orbit.traveled>=.08||Math.abs(orbit.targetHeight-23)>.5)this.mark('camera');}
  sync(session){const d=this.character.data,weapon=equippedDefinition(d);if(d.inventory.slots.some(Boolean)||weapon)this.mark('acquired');if(weapon)this.mark('equipped');if(d.knownAbilities.length)this.mark('learned');if(!session.area.safe)this.mark('entered');if(session.normalsCleared)this.mark('cleared');if(session.area.safe&&this.state.cleared)this.mark('returned');}
  get current(){return FIRST_STEPS.find(step=>!this.state[step.id])??null;}
  describe(session){const step=this.current;if(!step)return {title:'Primeiros passos concluídos!',hint:'Você preparou sua primeira aventura e voltou ao Refúgio. Experimente outras armas e habilidades.'};if(step.id==='entered'&&!equippedDefinition(this.character.data))return {...step,hint:'Equipe uma arma em I para liberar a entrada no Portal.'};if(step.id==='returned'&&!session.area.safe)return {...step,title:session.run?.bossDefeated?'Pegue o baú e volte ao Refúgio':'Continue a expedição',hint:session.objectiveText};if(step.id==='cleared')return {...step,hint:session.area.safe?'Volte ao Portal para tentar novamente. Equipe sua arma antes de entrar.':session.objectiveText};return step;}
}
