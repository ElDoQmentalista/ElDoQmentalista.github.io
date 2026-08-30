// Autorizacion OAuth con YouTube (una sola vez).
//   node scripts/youtube-auth.mjs
// Necesita en .env:  YT_CLIENT_ID=...  YT_CLIENT_SECRET=...
// Abre el navegador, Inri autoriza su canal, y el refresh token queda en .env.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execSync } from 'node:child_process';
import { ROOT } from './lib.mjs';

const ENV = path.join(ROOT, '.env');
const env = fs.existsSync(ENV) ? fs.readFileSync(ENV, 'utf8') : '';
const leer = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();

const CLIENT_ID = leer('YT_CLIENT_ID');
const CLIENT_SECRET = leer('YT_CLIENT_SECRET');
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(`
Faltan credenciales. En Google Cloud Console:
  1. APIs y servicios -> Biblioteca -> habilita "YouTube Data API v3"
  2. Pantalla de consentimiento OAuth -> tipo Externo -> agregate como usuario de prueba
  3. Credenciales -> Crear credenciales -> ID de cliente OAuth -> "App de escritorio"
  4. Copia el ID y el secreto a E:/Pagina/.env asi:
       YT_CLIENT_ID=xxxx.apps.googleusercontent.com
       YT_CLIENT_SECRET=GOCSPX-xxxx
  5. Vuelve a correr:  node scripts/youtube-auth.mjs
`);
  process.exit(1);
}

const PUERTO = 8765;
const REDIRECT = `http://127.0.0.1:${PUERTO}`;
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT,
  response_type: 'code',
  scope: SCOPE,
  access_type: 'offline',
  prompt: 'select_account consent',
});

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  const code = u.searchParams.get('code');
  if (!code) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end('<h2 style="font-family:sans-serif">Listo. Ya puedes cerrar esta pestana y volver a la terminal.</h2>');
  server.close();

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT, grant_type: 'authorization_code',
    }),
  });
  const j = await r.json();
  if (!j.refresh_token) { console.error('\nNo llego refresh_token:', JSON.stringify(j)); process.exit(1); }

  const sinToken = env.replace(/^YT_REFRESH_TOKEN=.*$\n?/m, '');
  fs.writeFileSync(ENV, sinToken.trimEnd() + '\nYT_REFRESH_TOKEN=' + j.refresh_token + '\n', 'utf8');
  console.log('\nOK — canal autorizado. El token quedo guardado en .env (fuera de git).');
  console.log('Ya puedes correr:  node scripts/youtube-update.mjs <archivo.csv>\n');
  process.exit(0);
});

server.listen(PUERTO, () => {
  console.log('\nAbriendo el navegador para autorizar el canal...');
  console.log('Si no se abre solo, entra a:\n\n' + authUrl + '\n');
  try { execSync(`start "" "${authUrl.replace(/&/g, '^&')}"`, { shell: 'cmd.exe' }); } catch (e) {}
});
