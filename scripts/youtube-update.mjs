// Aplica un CSV aprobado a YouTube via la API oficial (videos.update).
//   node scripts/youtube-update.mjs data/piloto-aprobado.csv
//   node scripts/youtube-update.mjs data/lote-2.csv --dry     (simula, no publica)
// Columnas del CSV: ID, NUEVO TITULO, NUEVA DESCRIPCION, KEYWORDS
//   - KEYWORDS separadas por coma; van al campo tags (max 500 caracteres en total).
//   - Los hashtags NO van aqui: van dentro de la descripcion (3 maximo).
// Cuota de Google: cada actualizacion cuesta ~51 unidades de 10.000/dia -> ~190 videos/dia.
// Tambien actualiza data/videos.json para que la web quede sincronizada.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJSON, writeJSON } from './lib.mjs';

const ENV = path.join(ROOT, '.env');
const env = fs.existsSync(ENV) ? fs.readFileSync(ENV, 'utf8') : '';
const leer = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();
const CLIENT_ID = leer('YT_CLIENT_ID'), CLIENT_SECRET = leer('YT_CLIENT_SECRET'), REFRESH = leer('YT_REFRESH_TOKEN');
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH) {
  console.error('\nFalta autorizar el canal. Corre primero:  node scripts/youtube-auth.mjs\n');
  process.exit(1);
}

const archivo = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!archivo || !fs.existsSync(path.resolve(ROOT, archivo))) {
  console.error('\nUso: node scripts/youtube-update.mjs <archivo.csv> [--dry]\n');
  process.exit(1);
}

function parseCSV(t) {
  const F = []; let f = [], c = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { f.push(c); c = ''; }
    else if (ch === '\n') { f.push(c); F.push(f); f = []; c = ''; }
    else if (ch !== '\r') c += ch;
  }
  if (c || f.length) { f.push(c); F.push(f); }
  return F;
}

async function tokenAcceso() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: REFRESH, grant_type: 'refresh_token' }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('refresh fallo: ' + JSON.stringify(j));
  return j.access_token;
}

// --- validaciones antes de tocar nada ---
function validar(fila) {
  const errores = [];
  const t = fila.titulo, d = fila.descripcion, k = fila.keywords;
  if (t && t.length > 100) errores.push(`titulo de ${t.length} caracteres (max 100)`);
  if (t && /[<>]/.test(t)) errores.push('el titulo no puede llevar < ni >');
  if (d && Buffer.byteLength(d, 'utf8') > 5000) errores.push('descripcion pasa de 5000 bytes');
  if (d && /[<>]/.test(d)) errores.push('la descripcion no puede llevar < ni >');
  const hashtags = (d.match(/#[\p{L}\p{N}_]+/gu) || []).length;
  if (hashtags > 3) errores.push(`${hashtags} hashtags en la descripcion (deben ser 3 maximo)`);
  if (k.length) {
    const total = k.join(',').length;
    if (total > 480) errores.push(`keywords suman ${total} caracteres (max ~480)`);
    const larga = k.find((x) => x.length > 100);
    if (larga) errores.push(`keyword demasiado larga: "${larga.slice(0, 40)}..."`);
  }
  return errores;
}

const filas = parseCSV(fs.readFileSync(path.resolve(ROOT, archivo), 'utf8').replace(/^﻿/, ''));
const cab = filas[0].map((c) => c.trim().toUpperCase());
const col = (n) => cab.findIndex((c) => c === n || c.startsWith(n));
const iId = col('ID'), iTit = col('NUEVO TITULO'), iDesc = col('NUEVA DESCRIPCION'), iKw = col('KEYWORDS');
if (iId === -1) { console.error('El CSV no tiene columna ID'); process.exit(1); }

const trabajos = filas.slice(1).map((f) => ({
  id: (f[iId] || '').trim(),
  titulo: (iTit === -1 ? '' : f[iTit] || '').trim(),
  descripcion: (iDesc === -1 ? '' : f[iDesc] || '').trim().replace(/\\n/g, '\n'),
  keywords: (iKw === -1 ? '' : f[iKw] || '').split(',').map((k) => k.trim()).filter(Boolean),
})).filter((t) => /^[A-Za-z0-9_-]{11}$/.test(t.id) && (t.titulo || t.descripcion || t.keywords.length));

console.log(`\n${trabajos.length} videos a actualizar${DRY ? '  (SIMULACRO: no se publica nada)' : ''}\n`);

let conError = 0;
for (const t of trabajos) {
  const errs = validar(t);
  if (errs.length) { console.log(`  !! ${t.id}: ${errs.join(' | ')}`); conError++; }
}
if (conError) { console.error(`\n${conError} filas con problemas. Corrige el CSV y vuelve a correr. No se publico nada.\n`); process.exit(1); }

const videosLocal = readJSON('data/videos.json', []) || [];
const porId = new Map(videosLocal.map((v) => [v.id, v]));

(async () => {
  const token = await tokenAcceso();
  const h = { authorization: 'Bearer ' + token, 'content-type': 'application/json' };
  let ok = 0, fallo = 0;

  for (const t of trabajos) {
    // snippet actual: la API exige mandar title+categoryId siempre, y si no
    // mandamos tags/description se BORRAN. Se lee primero y se mezcla.
    const rl = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${t.id}`, { headers: h });
    const jl = await rl.json();
    const actual = jl.items?.[0]?.snippet;
    if (!actual) { console.log(`  x ${t.id}: no existe o no es tuyo`); fallo++; continue; }

    const snippet = {
      title: t.titulo || actual.title,
      description: t.descripcion || actual.description,
      tags: t.keywords.length ? t.keywords : (actual.tags || []),
      categoryId: actual.categoryId,
      defaultLanguage: actual.defaultLanguage,
      defaultAudioLanguage: actual.defaultAudioLanguage,
    };

    if (DRY) {
      console.log(`  ~ ${t.id}  "${snippet.title.slice(0, 55)}"  [${snippet.tags.length} keywords, desc ${snippet.description.length} car.]`);
      ok++; continue;
    }

    const ru = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet', {
      method: 'PUT', headers: h,
      body: JSON.stringify({ id: t.id, snippet }),
    });
    if (ru.ok) {
      console.log(`  ok ${t.id}  "${snippet.title.slice(0, 55)}"`);
      ok++;
      const local = porId.get(t.id);
      if (local) {
        if (t.titulo) local.title = t.titulo;
        if (t.descripcion) local.description = t.descripcion;
        // el slug NO se toca: la URL indexada se queda
      }
    } else {
      const e = await ru.json().catch(() => ({}));
      const razon = e.error?.errors?.[0]?.reason || ru.status;
      console.log(`  x ${t.id}: ${razon}`);
      fallo++;
      if (razon === 'quotaExceeded') { console.log('\n  Cuota diaria agotada. Manana continua desde donde quedo (los ok ya no se repiten si quitas las filas).'); break; }
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  if (!DRY && ok) {
    writeJSON('data/videos.json', videosLocal);
    console.log('\ndata/videos.json sincronizado. Reconstruye la web con: npm run build');
  }
  console.log(`\nOK ${ok} actualizados | ${fallo} fallidos\n`);
})();
