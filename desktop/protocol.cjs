const path = require('node:path');
const fs = require('node:fs/promises');
const {connectSource} = require('./network.cjs');
const ORIGIN = 'dungeon://game';
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; media-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ogg':'audio/ogg','.mp3':'audio/mpeg'};
function resolveAsset(root, address) {
  const url = new URL(address);
  if (url.protocol !== 'dungeon:' || url.host !== 'game' || url.username || url.password) throw Error('Origem inválida');
  const name = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  if (name.includes('\\') || name.includes('\0') || name.includes(':')) throw Error('Caminho inválido');
  const file = path.resolve(root, '.' + name), relative = path.relative(root, file);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw Error('Caminho fora do jogo');
  if (!types[path.extname(file).toLowerCase()]) throw Error('Recurso não permitido');
  return file;
}
function assetHandler(root,serverUrl='') {
  const policy=CSP.replace("connect-src 'self'", "connect-src 'self'"+connectSource(serverUrl));
  return async request => {
    try {
      if (!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405});
      const file = resolveAsset(root,request.url), bytes = await fs.readFile(file);
      return new Response(request.method === 'HEAD' ? null : bytes,{headers:{'Content-Type':types[path.extname(file).toLowerCase()],'Content-Security-Policy':policy,'X-Content-Type-Options':'nosniff'}});
    } catch { return new Response('Recurso indisponível',{status:404}); }
  };
}
module.exports = {ORIGIN,CSP,resolveAsset,assetHandler};
