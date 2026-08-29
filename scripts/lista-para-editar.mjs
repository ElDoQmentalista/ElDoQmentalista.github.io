// Genera la lista de videos que necesitan titulo o descripcion propios, ordenada por
// vistas (primero donde mas rinde el esfuerzo).
//   npm run lista
// Salida: data/para-editar.csv  — se abre en Excel o Google Sheets.
// Cuando lo tengas editado, se vuelve a cargar con:  npm run aplicar
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config, readJSON, humanDuration, fechaES } from './lib.mjs';

const cfg = config();
const BASE = cfg.site.domain.replace(/\/+$/, '');
const videos = (readJSON('data/videos.json', []) || []).filter((v) => v.id && v.title);
const sagas = readJSON('data/sagas.json', []) || [];

// Misma deteccion de plantilla que usa el generador, para que la lista coincida
// exactamente con lo que hoy queda fuera de Google.
const frasesDe = (t = '') => String(t).replace(/\s+/g, ' ').split(/(?<=[.!?…])\s+/).map((f) => f.trim()).filter(Boolean);
const clave = (f) => f.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 90);

const frecuencia = new Map();
for (const v of videos) {
  const vistos = new Set();
  for (const f of frasesDe(v.description)) {
    const k = clave(f);
    if (k.length < 35 || vistos.has(k)) continue;
    vistos.add(k);
    frecuencia.set(k, (frecuencia.get(k) || 0) + 1);
  }
}
const esPlantilla = (f) => (frecuencia.get(clave(f)) || 0) >= 8;
const esEtiquetas = (f) => { const p = f.split(/\s+/).length; return p > 6 && (f.match(/,/g) || []).length / p > 0.2; };

const textoPropio = (v) => frasesDe(v.description)
  .filter((f) => !esPlantilla(f) && !esEtiquetas(f) && !/^https?:\/\//.test(f))
  .join(' ');

const sagaDe = new Map();
for (const s of sagas) for (const id of s.videoIds) if (!sagaDe.has(id)) sagaDe.set(id, s.name);

// Titulos repetidos: al editarlos hay que saber cuales chocan entre si
const porTitulo = new Map();
for (const v of videos) {
  const k = v.title.trim().toLowerCase();
  porTitulo.set(k, (porTitulo.get(k) || 0) + 1);
}

const pendientes = videos
  .map((v) => ({ v, propio: textoPropio(v) }))
  .filter(({ propio }) => propio.length < 250 || (propio.match(/[.!?]/g) || []).length < 3)
  .sort((a, b) => (b.v.views || 0) - (a.v.views || 0));

const celda = (s) => {
  const t = String(s ?? '').replace(/\r?\n/g, ' ').trim();
  return /[",;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

const cabeceras = [
  'PRIORIDAD', 'VISTAS', 'ID', 'TITULO ACTUAL', 'TITULO REPETIDO', 'FECHA', 'DURACION',
  'TIPO', 'SAGA', 'TEMAS', 'VER EN YOUTUBE', 'PAGINA EN LA WEB',
  'NUEVO TITULO', 'NUEVA DESCRIPCION',
];

const filas = pendientes.map(({ v }, i) => [
  i + 1,
  v.views || 0,
  v.id,
  v.title,
  porTitulo.get(v.title.trim().toLowerCase()) > 1 ? `SI (x${porTitulo.get(v.title.trim().toLowerCase())})` : '',
  v.published ? fechaES(v.published) : '',
  humanDuration(v.duration),
  v.kind === 'short' ? 'short' : 'documental',
  sagaDe.get(v.id) || '',
  (v.tags || []).join(' / '),
  `https://www.youtube.com/watch?v=${v.id}`,
  `${BASE}/v/${v.slug}/`,
  '', '',
].map(celda).join(','));

// BOM para que Excel abra los acentos bien
const csv = '﻿' + [cabeceras.join(','), ...filas].join('\r\n') + '\r\n';
fs.writeFileSync(path.join(ROOT, 'data/para-editar.csv'), csv, 'utf8');

const conVistas = pendientes.filter(({ v }) => (v.views || 0) > 0);
const top100 = pendientes.slice(0, 100).reduce((n, { v }) => n + (v.views || 0), 0);
const totalVistas = videos.reduce((n, v) => n + (v.views || 0), 0);

console.log(`\nOK data/para-editar.csv`);
console.log(`   ${pendientes.length.toLocaleString('es-ES')} videos sin texto propio`);
console.log(`   de ellos ${conVistas.length.toLocaleString('es-ES')} tienen vistas registradas`);
console.log(`   los 100 primeros suman ${top100.toLocaleString('es-ES')} vistas (${((top100 / totalVistas) * 100).toFixed(1)}% del total del canal)`);
console.log(`\n   Estan ordenados por vistas: empezar por arriba es donde mas rinde.`);
console.log(`   Rellena NUEVO TITULO y NUEVA DESCRIPCION solo en los que quieras cambiar,`);
console.log(`   guarda el CSV y corre:  npm run aplicar\n`);
