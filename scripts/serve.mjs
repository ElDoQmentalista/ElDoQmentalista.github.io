// Servidor local para revisar el sitio antes de publicarlo:  npm run dev
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 4321);
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png',
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(403).end('403'); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    const nf = path.join(DIST, '404.html');
    res.writeHead(404, { 'content-type': TIPOS['.html'] });
    res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'No encontrado');
    return;
  }
  res.writeHead(200, { 'content-type': TIPOS[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
}).listen(PORT, () => console.log(`\nVista previa: http://localhost:${PORT}\n(Ctrl+C para parar)\n`));
