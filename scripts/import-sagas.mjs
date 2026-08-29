// Baja que videos pertenecen a cada saga (playlist de YouTube) y lo guarda en data/sagas.json.
// La API key SOLO se usa aqui, en tu maquina. Nunca sale publicada en el sitio.
//   node scripts/import-sagas.mjs            (lee la key de .env -> YT_API_KEY)
//   node scripts/import-sagas.mjs AIza...    (o se la pasas directo)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJSON, writeJSON, getText, slugify } from './lib.mjs';

const SAGAS = [
  { id: 'PLbip308elLHsPolplocZxrFeXqjcIERiK', name: 'Documentales Completos', desc: 'Los programas de larga duracion. Podcasts, audiolibros y documentales completos.' },
  { id: 'PLbip308elLHtLKor8W_D37WyQ29bE4YtB', name: 'Misterios y Enigmas', desc: 'Las historias mas inquietantes. Relatos de terror, leyendas, conspiraciones religiosas y politicas.' },
  { id: 'PLbip308elLHvtXQEq_AUDywM4688zF2iE', name: 'Secretos del Vaticano', desc: 'Las misiones del Papa y las criaturas del Vaticano. Todo en orden cronologico.' },
  { id: 'PLbip308elLHv2Z5JpvShw2O6Ws9MmCaMl', name: 'El DoQmentalista Podcast', desc: 'Charlas largas, exploraciones profundas, entrevistas. El formato mas intimo.' },
  { id: 'PLbip308elLHsRCZwmGujQ6iqakoSpBJvJ', name: 'Leyendas de Terror', desc: 'Historias reales que te haran dudar de la realidad. Lo que pasa cuando la noche guarda secretos.' },
];

function leerKey() {
  if (process.argv[2] && /^AIza/.test(process.argv[2])) return process.argv[2];
  if (process.env.YT_API_KEY) return process.env.YT_API_KEY;
  const env = path.join(ROOT, '.env');
  if (fs.existsSync(env)) {
    const m = fs.readFileSync(env, 'utf8').match(/^\s*YT_API_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

const KEY = leerKey();
if (!KEY) {
  console.error('\nFalta la API key. Pon YT_API_KEY=... en el archivo .env (que ya esta en .gitignore)\n');
  process.exit(1);
}

async function itemsDePlaylist(playlistId) {
  const ids = [];
  let pageToken = '';
  for (let i = 0; i < 60; i++) {
    const p = new URLSearchParams({ key: KEY, playlistId, part: 'contentDetails', maxResults: '50' });
    if (pageToken) p.set('pageToken', pageToken);
    // La key esta restringida por referente al dominio del sitio: hay que mandarlo.
    const j = JSON.parse(await getText(`https://www.googleapis.com/youtube/v3/playlistItems?${p}`, {
      referer: 'https://eldoqmentalista.github.io/',
      origin: 'https://eldoqmentalista.github.io',
    }));
    for (const it of j.items || []) {
      const id = it.contentDetails?.videoId;
      if (id) ids.push(id);
    }
    pageToken = j.nextPageToken || '';
    if (!pageToken) break;
  }
  return ids;
}

(async () => {
  const videos = readJSON('data/videos.json', []) || [];
  const conocidos = new Set(videos.map((v) => v.id));
  const salida = [];

  for (const s of SAGAS) {
    process.stdout.write(`  ${s.name}… `);
    try {
      const ids = await itemsDePlaylist(s.id);
      const enArchivo = ids.filter((id) => conocidos.has(id));
      salida.push({ ...s, slug: slugify(s.name), playlistId: s.id, videoIds: enArchivo, total: ids.length });
      console.log(`${ids.length} en la playlist, ${enArchivo.length} en el archivo`);
    } catch (e) {
      console.log(`error: ${e.message}`);
      salida.push({ ...s, slug: slugify(s.name), playlistId: s.id, videoIds: [], total: 0 });
    }
  }

  writeJSON('data/sagas.json', salida);
  console.log(`\nOK data/sagas.json -> ${salida.length} sagas\n`);
})();
