// Importa/actualiza data/videos.json desde:
//   1) data/videos.txt  (enlaces o IDs pegados a mano)
//   2) el RSS del canal  (los 15 mas recientes, con fecha y descripcion)
//   3) la pagina del video (fallback: titulo, descripcion, fecha, duracion)
//   4) oEmbed (ultimo recurso: titulo + miniatura)
// Nunca pisa lo que hayas editado a mano en data/videos.json.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config, readJSON, writeJSON, extractIds, slugify, getText } from './lib.mjs';
import { clasificar } from './temas.mjs';

const cfg = config();
const FORCE = process.argv.includes('--force');

const RE_STR = '((?:[^"\\\\]|\\\\.)*)';
const reField = (name) => new RegExp('"' + name + '"\\s*:\\s*"' + RE_STR + '"');

const unescapeJson = (s) => { try { return JSON.parse('"' + s + '"'); } catch { return s; } };
const decodeEntities = (s = '') => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d))
  .replace(/&amp;/g, '&');

async function resolveChannelId() {
  if (cfg.channel.id && /^UC[\w-]{22}$/.test(cfg.channel.id)) return cfg.channel.id;
  const handle = (cfg.channel.handle || '').trim();
  const url = cfg.channel.url || (handle ? `https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}` : '');
  if (!url) return null;
  try {
    const html = await getText(url + '/videos');
    const m = html.match(/"(?:channelId|externalId)"\s*:\s*"(UC[\w-]{22})"/);
    if (m) { console.log(`  · channelId detectado: ${m[1]}`); return m[1]; }
  } catch (e) { console.log(`  · no pude leer el canal (${e.message})`); }
  return null;
}

async function fromRSS(channelId) {
  const out = new Map();
  try {
    const xml = await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    const entries = xml.split('<entry>').slice(1);
    for (const e of entries) {
      const id = (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
      if (!id) continue;
      out.set(id, {
        id,
        title: decodeEntities((e.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''),
        description: decodeEntities((e.match(/<media:description>([\s\S]*?)<\/media:description>/) || [])[1] || ''),
        published: ((e.match(/<published>([^<]+)<\/published>/) || [])[1] || '').slice(0, 10),
      });
    }
    console.log(`  · RSS: ${out.size} videos recientes`);
  } catch (e) { console.log(`  · RSS no disponible (${e.message})`); }
  return out;
}

async function fromWatchPage(id) {
  const html = await getText(`https://www.youtube.com/watch?v=${id}`);
  const det = html.match(/"videoDetails"\s*:\s*\{[\s\S]{0,6000}?"isLiveContent"/);
  const blob = det ? det[0] : html;
  const grab = (re, src = blob) => { const m = src.match(re); return m ? m[1] : null; };
  const title = grab(reField('title'));
  const desc = grab(reField('shortDescription'));
  const len = grab(/"lengthSeconds"\s*:\s*"(\d+)"/);
  const date = grab(/"uploadDate"\s*:\s*"([^"]+)"/, html) || grab(/"publishDate"\s*:\s*"([^"]+)"/, html);
  const kw = html.match(/"keywords"\s*:\s*\[([^\]]*)\]/);
  const tags = kw ? (kw[1].match(new RegExp('"' + RE_STR + '"', 'g')) || []).map((s) => unescapeJson(s.slice(1, -1))) : [];
  if (!title) throw new Error('sin titulo');
  return {
    id,
    title: unescapeJson(title),
    description: desc ? unescapeJson(desc) : '',
    published: date ? date.slice(0, 10) : '',
    duration: len ? Number(len) : null,
    ytTags: tags.slice(0, 12),
  };
}

async function fromOEmbed(id) {
  const j = JSON.parse(await getText(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`));
  return { id, title: j.title || '', description: '', published: '', duration: null };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const txtPath = path.join(ROOT, 'data/videos.txt');
  const crudo = fs.existsSync(txtPath) ? fs.readFileSync(txtPath, 'utf8') : '';
  const sinComentarios = crudo.split(/\r?\n/).filter((l) => !/^\s*#/.test(l)).join('\n');
  const manualIds = extractIds(sinComentarios);
  console.log(`\n> data/videos.txt: ${manualIds.length} IDs`);

  console.log('> Resolviendo canal...');
  const channelId = await resolveChannelId();
  const rss = channelId ? await fromRSS(channelId) : new Map();

  const existing = readJSON('data/videos.json', []) || [];
  const byId = new Map(existing.map((v) => [v.id, v]));

  const allIds = [...new Set([...manualIds, ...rss.keys(), ...byId.keys()])];
  console.log(`> Total a procesar: ${allIds.length}\n`);

  let n = 0;
  for (const id of allIds) {
    n++;
    const prev = byId.get(id) || { id };
    const needs = FORCE || !prev.title || !prev.published || !prev.duration;
    let fetched = rss.get(id) || null;

    if (needs) {
      try { fetched = { ...(fetched || {}), ...(await fromWatchPage(id)) }; }
      catch {
        try { fetched = { ...(fetched || {}), ...(await fromOEmbed(id)) }; }
        catch (e2) { console.log(`  x ${id}: ${e2.message}`); }
      }
      await sleep(250);
    }

    const merged = { ...prev };
    for (const k of ['title', 'description', 'published', 'duration']) {
      const val = fetched?.[k];
      if (val !== undefined && val !== null && val !== '' && (FORCE || !merged[k])) merged[k] = val;
    }
    if (!merged.tags) merged.tags = [];
    if (!merged.slug) merged.slug = slugify(merged.title || id);
    if (fetched?.ytTags && !merged.ytTags) merged.ytTags = fetched.ytTags;
    byId.set(id, merged);
    if (merged.title) console.log(`  ${String(n).padStart(3)}. ${merged.title.slice(0, 70)}`);
  }

  // Clasificacion automatica por tema (solo si no le pusiste tags a mano)
  for (const v of byId.values()) {
    if (!v.tags || !v.tags.length) v.tags = clasificar(v);
  }

  const list = [...byId.values()].sort((a, b) => String(b.published || '').localeCompare(String(a.published || '')));
  writeJSON('data/videos.json', list);
  const sinFecha = list.filter((v) => !v.published).length;
  console.log(`\nOK data/videos.json -> ${list.length} videos${sinFecha ? ` (${sinFecha} sin fecha)` : ''}\n`);
})();
