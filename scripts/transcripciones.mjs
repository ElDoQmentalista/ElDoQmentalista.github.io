// Baja los subtitulos de una lista de videos y los guarda como texto plano en
// data/transcripciones/<id>.txt (con cache: lo ya bajado no se vuelve a pedir).
//   node scripts/transcripciones.mjs id1 id2 ...
//   node scripts/transcripciones.mjs --top 10        (los N mas vistos de para-editar.csv)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, readJSON } from './lib.mjs';

const DIR = path.join(ROOT, 'data/transcripciones');
fs.mkdirSync(DIR, { recursive: true });

function idsDesdeArgs() {
  const args = process.argv.slice(2);
  const iTop = args.indexOf('--top');
  if (iTop !== -1) {
    const n = Number(args[iTop + 1]) || 10;
    // El orden de para-editar.csv es por vistas; aqui replicamos leyendo videos.json
    const videos = readJSON('data/videos.json', []) || [];
    const csv = fs.readFileSync(path.join(ROOT, 'data/para-editar.csv'), 'utf8');
    const pendientes = [...csv.matchAll(/,([A-Za-z0-9_-]{11}),/g)].map((m) => m[1]);
    const setP = new Set(pendientes);
    return videos.filter((v) => setP.has(v.id)).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, n).map((v) => v.id);
  }
  return args.filter((a) => /^[A-Za-z0-9_-]{11}$/.test(a));
}

function vttATexto(vtt) {
  return vtt
    .split(/\r?\n/)
    .filter((l) => l && !/^\d+$/.test(l) && !/-->/.test(l) && !/^WEBVTT|^Kind:|^Language:/.test(l))
    .join(' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    // Los subtitulos automaticos repiten cada linea dos veces al solaparse
    .trim();
}

// Quita repeticiones consecutivas (tipicas del VTT automatico con lineas solapadas)
function dedupe(t) {
  const palabras = t.split(' ');
  const out = [];
  for (let i = 0; i < palabras.length; i++) {
    // mira si las proximas 6 palabras son identicas a las 6 anteriores
    if (i >= 6 && palabras.slice(i, i + 6).join(' ') === palabras.slice(i - 6, i).join(' ')) { i += 5; continue; }
    out.push(palabras[i]);
  }
  return out.join(' ');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ids = idsDesdeArgs();
if (!ids.length) { console.log('\nUso: node scripts/transcripciones.mjs --top 10   (o una lista de IDs)\n'); process.exit(1); }

let ok = 0, cache = 0, fallo = 0;
for (const id of ids) {
  const destino = path.join(DIR, id + '.txt');
  if (fs.existsSync(destino) && fs.statSync(destino).size > 200) { cache++; continue; }
  try {
    execFileSync('python', ['-m', 'yt_dlp', '--skip-download',
      '--write-auto-subs', '--write-subs', '--sub-langs', 'es,es-419',
      '--sub-format', 'vtt', '-o', path.join(DIR, id + '.%(ext)s'),
      `https://www.youtube.com/watch?v=${id}`],
      { stdio: 'pipe', timeout: 90000 });
  } catch (e) { /* algunos idiomas fallan con 429; si cayo al menos un vtt, seguimos */ }

  const vtt = ['es', 'es-419', 'es-en'].map((l) => path.join(DIR, `${id}.${l}.vtt`)).find((p) => fs.existsSync(p));
  if (!vtt) { console.log(`  x ${id}: sin subtitulos`); fallo++; continue; }
  const texto = dedupe(vttATexto(fs.readFileSync(vtt, 'utf8')));
  fs.writeFileSync(destino, texto, 'utf8');
  for (const l of ['es', 'es-419', 'es-en']) { const p = path.join(DIR, `${id}.${l}.vtt`); if (fs.existsSync(p)) fs.unlinkSync(p); }
  console.log(`  ok ${id}: ${texto.split(' ').length} palabras`);
  ok++;
  await sleep(2500 + Math.random() * 2000); // no tentar el 429
}
console.log(`\nOK bajadas: ${ok} | en cache: ${cache} | sin subtitulos: ${fallo}\n`);
