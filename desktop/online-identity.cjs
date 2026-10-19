const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
function loadCredential(profile,serverUrl,storage,platform=process.platform){
 if(!storage.isEncryptionAvailable()||(platform==='linux'&&storage.getSelectedStorageBackend()==='basic_text'))throw Error('Proteção de credencial indisponível neste sistema.');
 const key=crypto.createHash('sha256').update(serverUrl).digest('hex'),file=path.join(profile,'online-'+key+'.key');
 if(fs.existsSync(file)){const value=storage.decryptString(fs.readFileSync(file));if(!/^[a-f0-9]{64}$/.test(value))throw Error('Credencial inválida; arquivo preservado.');return value;}
 const value=crypto.randomBytes(32).toString('hex'),fd=fs.openSync(file,'wx',0o600);try{fs.writeFileSync(fd,storage.encryptString(value));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}return value;
}
module.exports={loadCredential};
