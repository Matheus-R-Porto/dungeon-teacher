function endpoint(value) {
  if(value==='')return '';
  const url=new URL(value);
  const loopback=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
  if(!['ws:','wss:'].includes(url.protocol)||! /^[a-z0-9.\-:\[\]]+$/i.test(url.hostname)||url.username||url.password||url.search||url.hash||url.pathname!=='/hub'||(url.protocol==='ws:'&&!loopback))throw Error('Use wss://servidor/hub; ws somente para desenvolvimento local.');
  return url.href;
}
function networkAllowed(address,configured) {try{return !!configured&&new URL(address).href===endpoint(configured);}catch{return false;}}
function connectSource(configured){const value=endpoint(configured);return value?` ${value}`:'';}
module.exports={endpoint,networkAllowed,connectSource};
