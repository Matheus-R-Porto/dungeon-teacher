const {endpoint}=require('../desktop/network.cjs');
const configured=endpoint(require('../config/multiplayer.json').serverUrl);
if(!configured||new URL(configured).protocol!=='wss:'||['localhost','127.0.0.1','[::1]'].includes(new URL(configured).hostname))throw Error('Playtest externo exige endpoint público WSS. Configure o servidor hospedado antes de gerar o instalador para os dois PCs.');
console.log('Endpoint de playtest incluído na build: '+configured);
