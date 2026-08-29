import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');

export function readJSON(rel, fallback = null) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function writeJSON(rel, data) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function writeFile(rel, content) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
}

export const config = () => readJSON('site.config.json');

export function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function slugify(s = '') {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'video';
}

// Extrae IDs de YouTube de cualquier formato de enlace
export function extractIds(text = '') {
  const ids = [];
  const seen = new Set();
  const patterns = [
    /(?:youtube\.com\/watch\?[^\s]*[?&]?v=)([A-Za-z0-9_-]{11})/g,
    /youtu\.be\/([A-Za-z0-9_-]{11})/g,
    /youtube\.com\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) { if (!seen.has(m[1])) { seen.add(m[1]); ids.push(m[1]); } }
  }
  // Lineas que son solo un ID pelado
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(t) && !seen.has(t)) { seen.add(t); ids.push(t); }
  }
  return ids;
}

export function isoDuration(seconds) {
  const s = Number(seconds);
  if (!s || !Number.isFinite(s)) return null;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return 'PT' + (h ? h + 'H' : '') + (m ? m + 'M' : '') + (sec ? sec + 'S' : (h || m ? '' : '0S'));
}

export function humanDuration(seconds) {
  const s = Number(seconds);
  if (!s || !Number.isFinite(s)) return '';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export function fechaES(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function truncate(s = '', n = 155) {
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}

export async function getText(url, extraHeaders = {}) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'accept-language': 'es-ES,es;q=0.9',
      ...extraHeaders,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}
