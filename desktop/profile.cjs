const path=require('node:path');
// Preserve the established default across updates/installers/portable builds.
// Electron's explicit standard override permits isolated acceptance testing and
// managed deployments. It changes storage location only, never authentication.
function profileDirectory(app,name,argv=process.argv,env=process.env){
 const override=argv.find(a=>a.startsWith('--user-data-dir='))?.slice('--user-data-dir='.length);
 if(override){if(!path.isAbsolute(override))throw Error('A pasta de dados precisa ser um caminho absoluto.');return path.resolve(override);}
 if(!app.isPackaged&&env.DT_TEST_PROFILE)return path.resolve(env.DT_TEST_PROFILE);
 return path.join(app.getPath('appData'),name);
}
module.exports={profileDirectory};
