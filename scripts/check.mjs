// Verificacion de calidad del sitio generado. Se ejecuta con:  npm test
// Valida dist/ y data/videos.json. Sale con codigo 1 si hay algun fallo.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config, readJSON } from './lib.mjs';

const cfg = config();
const BASE = cfg.site.domain.replace(/\/+$/, '');
const DIST = path.join(ROOT, 'dist');
const fallos = [];
const avisos = [];
const fallo = (m) => fallos.push(m);
const aviso = (m) => avisos.push(m);

if (!fs.existsSync(DIST)) {
  console.error('\nNo existe dist/. Corre primero:  npm run build\n');
  process.exit(1);
}

// ---------- datos ----------
const videos = readJSON('data/videos.json', []) || [];
console.log(`\n> Datos (${videos.length} videos)`);

const slugs = new Map();
for (const v of videos) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(v.id || '')) fallo(`ID de YouTube invalido: "${v.id}" (${v.title || 'sin titulo'})`);
  if (!v.slug) fallo(`Video sin slug: ${v.id}`);
  else if (slugs.has(v.slug)) fallo(`Slug duplicado "${v.slug}": ${slugs.get(v.slug)} y ${v.id}`);
  else slugs.set(v.slug, v.id);
  if (!v.title) fallo(`Video sin titulo: ${v.id}`);
  if (!v.published) aviso(`Sin fecha de publicacion: ${v.title || v.id}`);
}

// ---------- recorrer el HTML generado ----------
const htmls = [];
(function recorrer(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p);
    else if (e.name.endsWith('.html') && !/^google[0-9a-f]+.html$/i.test(e.name)) htmls.push(p);
  }
})(DIST);

console.log(`> HTML generado (${htmls.length} paginas)`);

const rel = (p) => p.slice(DIST.length).replace(/\\/g, '/');
const titulos = new Map();
const descripciones = new Map();
const enlacesInternos = new Map();
const noindex = new Set();

for (const p of htmls) {
  const html = fs.readFileSync(p, 'utf8');
  const r = rel(p);

  const mt = html.match(/<title>([\s\S]*?)<\/title>/);
  const titulo = mt ? mt[1].trim() : '';
  if (!titulo) fallo(`${r}: sin <title>`);
  else {
    // El titulo de un video ES el titulo del video: recortarlo seria peor. Solo se avisa en paginas fijas.
    if (titulo.length > 70 && !r.startsWith('/v/')) aviso(`${r}: title de ${titulo.length} caracteres (Google corta sobre 60-65)`);
    if (titulos.has(titulo)) fallo(`Title duplicado en ${r} y ${titulos.get(titulo)}`);
    else titulos.set(titulo, r);
  }

  const md = html.match(/<meta name="description" content="([^"]*)"/);
  const desc = md ? md[1].trim() : '';
  if (!desc) fallo(`${r}: sin meta description`);
  else {
    if (desc.length > 170) aviso(`${r}: meta description de ${desc.length} caracteres`);
    if (descripciones.has(desc)) aviso(`Meta description repetida en ${r} y ${descripciones.get(desc)}`);
    else descripciones.set(desc, r);
  }

  if (!/<link rel="canonical"/.test(html)) fallo(`${r}: sin canonical`);
  if (/name="robots" content="noindex/.test(html)) noindex.add(r.replace(/index\.html$/, ''));

  // JSON-LD parseable y con los campos que Google exige en VideoObject
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const b of bloques) {
    let datos;
    try { datos = JSON.parse(b[1]); } catch (e) { fallo(`${r}: JSON-LD no parseable (${e.message})`); continue; }
    if (datos['@type'] === 'VideoObject') {
      for (const campo of ['name', 'description', 'thumbnailUrl', 'uploadDate']) {
        if (!datos[campo]) fallo(`${r}: VideoObject sin "${campo}"`);
      }
    }
  }

  // Imagenes: sin dimensiones el layout salta (CLS); sin alt no es accesible
  for (const img of html.match(/<img\b[^>]*>/g) || []) {
    if (!/\balt=/.test(img)) fallo(`${r}: <img> sin alt`);
    if (!/\bwidth=/.test(img) || !/\bheight=/.test(img)) aviso(`${r}: <img> sin width/height`);
  }

  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) enlacesInternos.set(m[1], r);
}

// ---------- enlaces internos rotos ----------
console.log('> Enlaces internos');
const existe = (u) => {
  const limpio = u.replace(/^\//, '');
  const cand = [path.join(DIST, limpio), path.join(DIST, limpio, 'index.html'), path.join(DIST, limpio.replace(/\/$/, '') + '.html')];
  return cand.some((c) => fs.existsSync(c));
};
for (const [url, desde] of enlacesInternos) {
  if (!existe(url)) fallo(`Enlace roto ${url} (en ${desde})`);
}

// ---------- sitemaps ----------
console.log('> Sitemaps');
const indice = path.join(DIST, 'sitemap.xml');
if (!fs.existsSync(indice)) fallo('Falta dist/sitemap.xml');
else {
  const mapas = [...fs.readFileSync(indice, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  let totalUrls = 0;
  for (const m of mapas) {
    const nombre = m.replace(BASE + '/', '');
    const f = path.join(DIST, nombre);
    if (!fs.existsSync(f)) { fallo(`El indice apunta a ${nombre} pero el archivo no existe`); continue; }
    for (const u of [...fs.readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1])) {
      totalUrls++;
      const ruta = u.replace(BASE, '') || '/';
      if (!existe(ruta)) fallo(`El sitemap lista ${ruta} pero la pagina no existe`);
      if (noindex.has(ruta)) fallo(`${ruta} esta en el sitemap pero tiene noindex`);
    }
  }
  console.log(`  ${mapas.length} sitemaps, ${totalUrls} URLs`);
}

if (!fs.existsSync(path.join(DIST, 'robots.txt'))) fallo('Falta dist/robots.txt');

// ---------- resultado ----------
const mostrar = (lista, etiqueta, limite = 15) => {
  if (!lista.length) return;
  console.log(`\n${etiqueta} (${lista.length}):`);
  lista.slice(0, limite).forEach((m) => console.log(`  - ${m}`));
  if (lista.length > limite) console.log(`  ... y ${lista.length - limite} mas`);
};

mostrar(avisos, 'AVISOS');
mostrar(fallos, 'FALLOS');

if (fallos.length) {
  console.log(`\nFALLO: ${fallos.length} problema(s) que hay que arreglar antes de publicar.\n`);
  process.exit(1);
}
console.log(`\nOK todo correcto${avisos.length ? ` (${avisos.length} avisos, no bloquean)` : ''}.\n`);
