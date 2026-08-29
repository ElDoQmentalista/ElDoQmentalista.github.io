// Importa el catalogo completo desde el CSV exportado de YouTube Studio / vidIQ.
//   node scripts/import-csv.mjs "C:/ruta/al/archivo.csv"
// Columnas que usa (por nombre, no por posicion):
//   ID, TITULO, DESCRIPCION, DURACION, ESTADO, FECHA DE PUBLICACION, ETIQUETAS, VIEWS
import fs from 'node:fs';
import { readJSON, writeJSON, slugify } from './lib.mjs';
import { clasificar } from './temas.mjs';

const ruta = process.argv[2];
if (!ruta || !fs.existsSync(ruta)) {
  console.error('\nUso: node scripts/import-csv.mjs "C:/ruta/al/archivo.csv"\n');
  process.exit(1);
}

// --- parser CSV (RFC 4180: comillas, comillas dobles escapadas, saltos de linea dentro del campo)
function parseCSV(texto) {
  const filas = [];
  let fila = [], campo = '', dentro = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentro) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; } else dentro = false;
      } else campo += c;
    } else if (c === '"') dentro = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

const sinAcentos = (s = '') => s.normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]', 'g'), '').trim().toUpperCase();

function aSegundos(d = '') {
  const p = d.trim().split(':').map(Number);
  if (p.some(isNaN) || !p.length) return null;
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return p[0];
}

function aISO(f = '') {
  const m = f.trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/); // d/m/aaaa
  if (m) return `${m[3]}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
  const iso = f.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? iso[0] : '';
}

const texto = fs.readFileSync(ruta, 'utf8').replace(/^\uFEFF/, '');
const filas = parseCSV(texto).filter((f) => f.length > 1);
const cab = filas[0].map(sinAcentos);
const col = (...nombres) => {
  for (const n of nombres) { const i = cab.indexOf(sinAcentos(n)); if (i !== -1) return i; }
  return -1;
};

const iId = col('ID', 'VIDEO ID');
const iTit = col('TITULO');
const iDesc = col('DESCRIPCION');
const iDur = col('DURACION');
const iEst = col('ESTADO', 'VISIBILIDAD');
const iFecha = col('FECHA DE PUBLICACION', 'FECHA');
const iTags = col('ETIQUETAS');
const iViews = col('VIEWS', 'VISTAS');

if (iId === -1) { console.error('No encontre la columna ID en el CSV. Cabeceras:', cab.join(' | ')); process.exit(1); }

const previos = new Map((readJSON('data/videos.json', []) || []).map((v) => [v.id, v]));
const slugsUsados = new Set();
const salida = [];
let omitidosNoPublicos = 0, omitidosSinId = 0;

for (const f of filas.slice(1)) {
  const id = (f[iId] || '').trim();
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) { omitidosSinId++; continue; }

  const estado = (f[iEst] || '').trim().toLowerCase();
  if (estado && !/^(public|publico|publicado)$/.test(estado)) { omitidosNoPublicos++; continue; }

  const prev = previos.get(id) || {};
  const title = (f[iTit] || prev.title || '').trim();
  if (!title) { omitidosSinId++; continue; }

  const duration = aSegundos(f[iDur] || '') ?? prev.duration ?? null;
  const ytTags = (f[iTags] || '').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 30);

  // El slug manual que ya existiera manda: no se rompen URLs ya indexadas.
  let slug = prev.slug || slugify(title);
  if (slugsUsados.has(slug)) { let n = 2; while (slugsUsados.has(`${slug}-${n}`)) n++; slug = `${slug}-${n}`; }
  slugsUsados.add(slug);

  const v = {
    id,
    title,
    description: (f[iDesc] || prev.description || '').trim(),
    published: aISO(f[iFecha] || '') || prev.published || '',
    duration,
    views: Number(String(f[iViews] || '').replace(/[^\d]/g, '')) || prev.views || 0,
    kind: duration !== null && duration <= 180 ? 'short' : 'documental',
    slug,
    ytTags,
    tags: (prev.tags && prev.tags.length) ? prev.tags : [],
  };
  v.tags = v.tags.length ? v.tags : clasificar(v);
  salida.push(v);
}

// Los que ya estaban en videos.json y no vienen en el CSV se conservan.
for (const [id, v] of previos) if (!salida.some((x) => x.id === id)) salida.push(v);

salida.sort((a, b) => String(b.published || '').localeCompare(String(a.published || '')));
writeJSON('data/videos.json', salida);

const largos = salida.filter((v) => v.kind !== 'short');
const cortos = salida.filter((v) => v.kind === 'short');
const conDesc = salida.filter((v) => (v.description || '').length > 300);

console.log(`\nOK data/videos.json`);
console.log(`   total:        ${salida.length}`);
console.log(`   documentales: ${largos.length}   (mas de 3 min)`);
console.log(`   shorts:       ${cortos.length}`);
console.log(`   con descripcion larga (300+ car.): ${conDesc.length}`);
if (omitidosNoPublicos) console.log(`   omitidos por no ser publicos: ${omitidosNoPublicos}`);
if (omitidosSinId) console.log(`   filas ignoradas (sin ID o sin titulo): ${omitidosSinId}`);
console.log('');
