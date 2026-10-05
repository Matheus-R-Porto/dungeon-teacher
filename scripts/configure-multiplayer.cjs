const fs=require('node:fs');
const path=require('node:path');
const {endpoint}=require('../desktop/network.cjs');
const value=process.argv[2];
if(value===undefined)throw Error('Informe o endpoint público wss://servidor/hub ou uma string vazia para offline.');
const file=path.join(__dirname,'../config/multiplayer.json');
const config=JSON.parse(fs.readFileSync(file,'utf8'));config.serverUrl=endpoint(value);
fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n');console.log('Endpoint da próxima build: '+(config.serverUrl||'não configurado'));
