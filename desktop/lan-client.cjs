const tls=require('node:tls');
const {X509Certificate}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
function address(input){let value=String(input??'').trim();const qualified=value.includes('://');if(!qualified)value='wss://'+value;const u=new URL(value);if(u.pathname==='/')u.pathname='/hub';if(!u.port&&!qualified)u.port='8787';if(u.protocol!=='wss:'||!u.hostname||u.username||u.password||u.search||u.hash||u.pathname!=='/hub')throw Error('Informe o IP ou endereço do computador ADM e sua porta.');return u.href;}
function fingerprint(pem){const c=new X509Certificate(pem),now=Date.now();if(now<Date.parse(c.validFrom)||now>Date.parse(c.validTo))throw Error('O certificado do servidor está fora da validade.');return c.fingerprint256.replaceAll(':','').toUpperCase();}
function probe(input){const url=address(input),u=new URL(url);return new Promise((resolve,reject)=>{const socket=tls.connect({host:u.hostname.replace(/^\[|\]$/g,''),port:Number(u.port||443),rejectUnauthorized:false,minVersion:'TLSv1.2'},()=>{try{const pin=fingerprint(socket.getPeerCertificate(true).raw);resolve({url,fingerprint:pin});}catch(e){reject(e);}finally{socket.destroy();}});socket.setTimeout(5000,()=>{socket.destroy();reject(Error('Servidor indisponível. Confira IP, porta e se o ADM iniciou o servidor.'));});socket.on('error',()=>reject(Error('Servidor indisponível. Confira IP, porta e a conexão de rede.')));});}
class Connection {
 constructor(profile){this.file=path.join(profile,'school-connection.json');try{const s=JSON.parse(fs.readFileSync(this.file,'utf8'));if(/^[A-F0-9]{64}$/.test(s.fingerprint))this.value={url:address(s.url),fingerprint:s.fingerprint};}catch{}this.value??=null;}
 async trust({url,fingerprint:pin,confirmed}){if(confirmed!==true)throw Error('Confira a identidade no ADM antes de continuar.');const current=await probe(url);if(current.fingerprint!==pin)throw Error('A identidade mudou. Confira novamente no ADM.');fs.writeFileSync(this.file,JSON.stringify(current),{mode:0o600});this.value=current;return current;}
 verify(hostname,pem){try{return !!this.value&&hostname===new URL(this.value.url).hostname.replace(/^\[|\]$/g,'')&&fingerprint(pem)===this.value.fingerprint;}catch{return false;}}
}
module.exports={address,fingerprint,probe,Connection};
