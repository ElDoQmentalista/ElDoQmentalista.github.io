// Vuelve a cargar data/para-editar.csv despues de que lo hayas editado a mano y
// escribe los titulos y descripciones nuevos en data/videos.json.
//   npm run aplicar
// Solo toca las filas donde rellenaste algo. Nunca borra lo que ya habia.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJSON, writeJSON, slugify } from './lib.mjs';

const ruta = path.join(ROOT, process.argv[2] || 'data/para-editar.csv');
if (!fs.existsSync(ruta)) {
  console.error(`\nNo encuentro ${ruta}. Genera la lista primero con:  npm run lista\n`);
  process.exit(1);
}

function parseCSV(texto) {
  const filas = [];
  let fila = [], campo = '', dentro = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentro) {
      if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else dentro = false; }
      else campo += c;
    } else if (c === '"') dentro = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

const filas = parseCSV(fs.readFileSync(ruta, 'utf8').replace(/^﻿/, '')).filter((f) => f.length > 1);
const cab = filas[0].map((c) => c.trim().toUpperCase());
const iId = cab.indexOf('ID');
const iTit = cab.indexOf('NUEVO TITULO');
const iDesc = cab.indexOf('NUEVA DESCRIPCION');

if (iId === -1 || iTit === -1 || iDesc === -1) {
  console.error('\nAl CSV le faltan columnas. Necesita: ID, NUEVO TITULO, NUEVA DESCRIPCION\n');
  process.exit(1);
}

const videos = readJSON('data/videos.json', []) || [];
const porId = new Map(videos.map((v) => [v.id, v]));
const slugsUsados = new Set(videos.map((v) => v.slug));

let titulos = 0, descripciones = 0, noEncontrados = 0;
const cambios = [];

for (const f of filas.slice(1)) {
  const id = (f[iId] || '').trim();
  if (!id) continue;
  const v = porId.get(id);
  if (!v) { noEncontrados++; continue; }

  const nuevoTitulo = (f[iTit] || '').trim();
  const nuevaDesc = (f[iDesc] || '').trim();

  if (nuevoTitulo && nuevoTitulo !== v.title) {
    cambios.push(`  titulo   ${id}  ${v.title.slice(0, 45)} -> ${nuevoTitulo.slice(0, 45)}`);
    v.title = nuevoTitulo;
    titulos++;
    // El slug NO se recalcula: si la pagina ya esta indexada, cambiar la URL la mata.
    if (!v.slug) {
      let s = slugify(nuevoTitulo), n = 2;
      while (slugsUsados.has(s)) s = `${slugify(nuevoTitulo)}-${n++}`;
      v.slug = s;
      slugsUsados.add(s);
    }
  }

  if (nuevaDesc && nuevaDesc !== v.description) {
    cambios.push(`  texto    ${id}  ${nuevaDesc.length} caracteres`);
    v.description = nuevaDesc;
    descripciones++;
  }
}

if (!titulos && !descripciones) {
  console.log('\nNo habia nada que aplicar: las columnas NUEVO TITULO y NUEVA DESCRIPCION estan vacias.\n');
  process.exit(0);
}

writeJSON('data/videos.json', videos);
console.log(`\n${cambios.slice(0, 20).join('\n')}`);
if (cambios.length > 20) console.log(`  ... y ${cambios.length - 20} cambios mas`);
console.log(`\nOK ${titulos} titulos y ${descripciones} descripciones actualizados.`);
if (noEncontrados) console.log(`   ${noEncontrados} filas con un ID que no esta en el archivo (ignoradas).`);
console.log(`\n   Ahora:  npm run build && npm test\n`);
