const path=require('node:path');
const {endpoint}=require('./network.cjs');
function testOptions(argv,appData,configured,releaseProfile='Dungeon Master'){
  if(!/^[A-Za-z0-9 ._-]{1,64}$/.test(releaseProfile)||releaseProfile==='.'||releaseProfile==='..')throw Error('Perfil da versão inválido.');
  const values=key=>argv.filter(a=>a.startsWith(key+'='));
  for(const key of ['--test-profile','--server']){if(argv.includes(key))throw Error('Use '+key+'=valor.');if(values(key).length>1)throw Error('Opção duplicada: '+key);}
  const profile=values('--test-profile')[0]?.slice('--test-profile='.length);
  const server=values('--server')[0]?.slice('--server='.length);
  if(profile!==undefined&&(!/^[A-Za-z0-9_-]{1,24}$/.test(profile)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(profile)))throw Error('Perfil de teste inválido. Use letras, números, _ ou -.');
  if(server!==undefined&&!profile)throw Error('--server exige --test-profile para proteger o perfil principal.');
  return {profile:profile?path.join(appData,'Dungeon Master Tests',profile):path.join(appData,releaseProfile),
    serverUrl:endpoint(profile?(server||'ws://127.0.0.1:8787/hub'):configured),
    query:profile?'?'+new URLSearchParams({shared:'1',online:argv.includes('--temporary-tower')||argv.includes('--legacy-world')?'0':'1',tower:argv.includes('--legacy-world')?'0':'1',name:('Teste '+profile).slice(0,24),server:endpoint(server||'ws://127.0.0.1:8787/hub')}):''};
}
module.exports={testOptions};
