import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {X509Certificate} from 'node:crypto';
import selfsigned from 'selfsigned';
export function lanAddresses(){return Object.values(os.networkInterfaces()).flat().filter(a=>a&&!a.internal&&a.family==='IPv4').map(a=>a.address);}
export async function serverIdentity(directory){
 fs.mkdirSync(directory,{recursive:true});const file=path.join(directory,'server-identity.json');
 if(!fs.existsSync(file)){const now=Date.now(),pems=await selfsigned.generate([{name:'commonName',value:'Dungeon Teacher Escolar'}],{keySize:3072,algorithm:'sha256',notBeforeDate:new Date(now-300000),notAfterDate:new Date(now+5*365*86400000),extensions:[{name:'basicConstraints',cA:false},{name:'keyUsage',digitalSignature:true,keyEncipherment:true},{name:'extKeyUsage',serverAuth:true},{name:'subjectAltName',altNames:[{type:2,value:'localhost'},...['127.0.0.1',...lanAddresses()].map(ip=>({type:7,ip}))]}]});fs.writeFileSync(file,JSON.stringify({key:pems.private,cert:pems.cert}),{mode:0o600,flag:'wx'});}
 const identity=JSON.parse(fs.readFileSync(file,'utf8')),certificate=new X509Certificate(identity.cert);if(Date.parse(certificate.validTo)<=Date.now())throw Error('O certificado do servidor expirou. Renove a identidade TLS e confira novamente o código nos clientes.');return {...identity,fingerprint:certificate.fingerprint256.replaceAll(':','').toUpperCase(),validTo:certificate.validTo};
}
