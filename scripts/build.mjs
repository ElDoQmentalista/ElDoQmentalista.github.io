// Genera el sitio estatico completo en dist/ a partir de data/videos.json
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, config, readJSON, writeFile, esc, slugify,
  isoDuration, humanDuration, fechaES, truncate,
} from './lib.mjs';

const cfg = config();
const S = cfg.site;
const BASE = S.domain.replace(/\/+$/, '');
const POR_PAGINA = cfg.build.videosPerPage || 48;

// Trozos de HTML/CSS/JS rescatados del sitio anterior (oraculos, canales, herramientas)
const parte = (f) => {
  const p = path.join(ROOT, 'src/partes', f);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
};
const MODALES = parte('modales.html');
const SEC_HERRAMIENTAS = parte('seccion-herramientas.html');
const SEC_CANALES = parte('seccion-canales.html');

const sagas = (readJSON('data/sagas.json', []) || []).filter((s) => (s.videoIds || []).length);

const ORACULOS = [
  {
    slug: 'nombre-de-bruja',
    nombre: 'Tu nombre de bruja o brujo',
    h1: '¿Cuál es tu nombre de bruja o brujo?',
    titulo: 'Tu nombre de bruja o brujo — oráculo gratis',
    abre: 'openWitchTool()',
    img: '/assets/img/doq-brujos.jpg',
    resumen: 'Un oráculo que cruza tu fecha de nacimiento, tu signo y tu intuición para revelar el nombre con el que el círculo te llamaría.',
    intro: [
      'En casi todas las tradiciones de brujería existe la misma idea: el nombre con el que naciste te lo dieron otros, pero el nombre con el que la magia te reconoce te lo ganas tú. En los aquelarres antiguos se le llamaba nombre de arte, nombre de trabajo o nombre de círculo. Era el nombre que se usaba dentro del rito y solo ahí, porque se creía que quien conoce tu nombre verdadero tiene poder sobre ti.',
      'Este oráculo reconstruye esa costumbre con tres piezas: la fecha en que llegaste al mundo, el signo bajo el que naciste y el elemento con el que sientes que te identificas. De ahí sale un nombre, su significado y el mantra que le corresponde.',
      'No es un test de personalidad ni una predicción. Es un juego simbólico, igual que lo era el nombre de arte: sirve para ponerle palabras a algo que ya sabías de ti.',
    ],
  },
  {
    slug: 'animal-espiritual',
    nombre: 'Tu animal espiritual',
    h1: '¿Cuál es tu animal espiritual?',
    titulo: 'Tu animal espiritual — oráculo gratis',
    abre: 'openTotemTool()',
    img: '/assets/img/doq-animal.jpg',
    resumen: 'El espíritu que camina contigo desde tu primera respiración, según la tierra donde naciste, tu signo y tu elemento.',
    intro: [
      'La idea del animal guía no nació en un solo lugar. Los pueblos originarios de Mesoamérica hablaban del nahual, el animal que comparte destino con la persona desde el día de su nacimiento. En los Andes se hablaba de los apus y sus mensajeros. En el norte del continente, del tótem del clan. En Siberia y en el norte de Europa, del fylgja y del espíritu ayudante del chamán.',
      'Todas esas tradiciones coinciden en algo: el animal no se elige, se reconoce. Y el lugar donde naciste importa, porque los espíritus que te acompañan son los de tu tierra.',
      'Por eso este oráculo te pregunta primero de dónde vienes. Después cruza tu región con tu signo y con tu elemento para darte el animal que te corresponde, lo que enseña y lo que te pide.',
    ],
  },
  {
    slug: 'angel-de-nacimiento',
    nombre: 'Tu ángel de nacimiento',
    h1: '¿Cuál es tu ángel de nacimiento según la Kabbalah?',
    titulo: 'Tu ángel de nacimiento — los 72 de la Kabbalah',
    abre: 'openAngelTool()',
    img: '/assets/img/doq-angel.jpg',
    resumen: 'Según la Kabbalah hebrea cada fecha tiene un guardián. Descubre cuál de los 72 ángeles del Shem HaMephorash rige tu vida.',
    intro: [
      'El Shem HaMephorash — el Nombre Explícito — es uno de los secretos mejor guardados de la mística judía. Se obtiene de tres versículos del Éxodo, el 14:19, 20 y 21, cada uno de exactamente 72 letras. Al combinarlas de una manera concreta se forman 72 nombres de tres letras, y a cada uno se le añade una terminación divina: -el o -yah. Así nacen los 72 ángeles.',
      'Cada ángel gobierna cinco grados del círculo zodiacal, lo que equivale aproximadamente a cinco días del año. El ángel que rige los días de tu nacimiento es tu ángel guardián: el que, según la tradición, conoce tu tarea en esta vida.',
      'Los 72 se reparten en nueve coros — Serafines, Querubines, Tronos, Dominaciones, Potencias, Virtudes, Principados, Arcángeles y Ángeles — y cada coro tiene una función distinta. Aquí encontrarás tu ángel, su nombre en hebreo, su significado, sus virtudes, sus sombras, el salmo que le corresponde y su oración.',
    ],
  },
];

const videos = (readJSON('data/videos.json', []) || [])
  .filter((v) => v.id && v.title)
  .sort((a, b) => String(b.published || '').localeCompare(String(a.published || '')));

if (!videos.length) {
  console.log('\n! data/videos.json esta vacio. Corre:  npm run import\n');
}

// ---------- helpers ----------
const thumb = (id, size = 'maxresdefault') => `https://i.ytimg.com/vi/${id}/${size}.jpg`;
const videoUrl = (v) => `${BASE}/v/${v.slug}/`;
const watchUrl = (v) => `https://www.youtube.com/watch?v=${v.id}`;
const channelUrl = cfg.channel.url || (cfg.channel.handle ? `https://www.youtube.com/${cfg.channel.handle}` : '');
const trozos = (arr, n) => { const o = []; for (let i = 0; i < arr.length; i += n) o.push(arr.slice(i, i + n)); return o.length ? o : [[]]; };

// La mayoria de descripciones de YouTube arrastran el mismo bloque promocional
// ("Sumergete en el universo de El DoQmentalista...", enlaces de patrocinio, listas
// de palabras clave). Repetirlo en 1.500 paginas es contenido duplicado y hunde a
// todas. Se detecta por frecuencia y se aparta del texto que ve Google.
// El analisis va frase a frase, no por parrafo: el CSV de YouTube trae la descripcion
// aplanada en una sola linea, asi que un parrafo entero seria toda la descripcion y
// descartarlo tiraria tambien el texto bueno.
const frasesDe = (t = '') => String(t)
  .replace(/\s+/g, ' ')
  .split(/(?<=[.!?…])\s+/)
  .map((f) => f.trim())
  .filter(Boolean);

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
const REPETIDO_DESDE = 8;
const esBoilerplate = (f) => (frecuencia.get(clave(f)) || 0) >= REPETIDO_DESDE;

// Una "frase" que en realidad es una lista de etiquetas separadas por comas no aporta nada.
const esListaDeEtiquetas = (f) => {
  const palabras = f.split(/\s+/).length;
  return palabras > 6 && (f.match(/,/g) || []).length / palabras > 0.2;
};

// Frases utiles agrupadas en parrafos: se corta el parrafo alli donde se tiro algo.
videos.forEach((v) => {
  const parrafos = [];
  let actual = [];
  for (const f of frasesDe(v.description)) {
    if (esBoilerplate(f) || esListaDeEtiquetas(f) || /^https?:\/\//.test(f)) {
      if (actual.length) { parrafos.push(actual.join(' ')); actual = []; }
      continue;
    }
    actual.push(f);
    if (actual.length >= 4) { parrafos.push(actual.join(' ')); actual = []; }
  }
  if (actual.length) parrafos.push(actual.join(' '));
  v._parrafos = parrafos;
  v._texto = parrafos.join(' ');
});

// Ficha factual: datos reales del video, distintos en cada pagina. No inventa nada.
// Sirve para que la pagina tenga algo que decirle a quien llega, incluso cuando la
// descripcion de YouTube no aportaba nada propio.
const sagaDe = new Map();
for (const s of sagas) for (const id of s.videoIds) if (!sagaDe.has(id)) sagaDe.set(id, s);

videos.forEach((v) => {
  const partes = [];
  const cuando = v.published ? `publicado el ${fechaES(v.published)}` : '';
  const cuanto = v.duration ? `${humanDuration(v.duration)} de duración` : '';
  partes.push(`«${v.title}» es ${v.kind === 'short' ? 'un video corto' : 'un documental'} de ${S.name}${cuando ? `, ${cuando}` : ''}${cuanto ? `, con ${cuanto}` : ''}.`);
  const s = sagaDe.get(v.id);
  if (s) partes.push(`Forma parte de la saga «${s.name}», que reúne ${s.videoIds.length} videos del archivo.`);
  if ((v.tags || []).length) partes.push(`Temas que toca: ${v.tags.join(', ')}.`);
  if (v.views > 1000) partes.push(`Acumula ${v.views.toLocaleString('es-ES')} reproducciones en YouTube.`);
  v._ficha = partes.join(' ');
});

// Una pagina solo se manda a Google si tiene contenido propio que ofrecer.
function esDelgado(v) {
  const t = v._texto;
  if (t.length < 250) return true;
  return (t.match(/[.!?]/g) || []).length < 3;
}
// Si activas build.indexarSinTextoPropio, tambien se mandan a Google las paginas que
// solo tienen la ficha de datos. Mas paginas indexadas, pero mas flojas cada una.
const INDEXAR_TODO = cfg.build.indexarSinTextoPropio === true;
videos.forEach((v) => { v._indexable = INDEXAR_TODO || !esDelgado(v); });

// El canal tiene videos con titulos identicos (reediciones, directos, shorts en serie).
// Si se indexan todos, compiten entre si por la misma busqueda y Google no sabe cual mostrar.
// Se deja indexable el que mas vistas tiene; el resto pasa a noindex y sale del sitemap.
{
  const porTitulo = new Map();
  for (const v of videos) {
    const k = v.title.trim().toLowerCase();
    if (!porTitulo.has(k)) porTitulo.set(k, []);
    porTitulo.get(k).push(v);
  }
  for (const grupo of porTitulo.values()) {
    if (grupo.length < 2) continue;
    const orden = [...grupo].sort((a, b) => (b.views || 0) - (a.views || 0) || String(b.published).localeCompare(String(a.published)));
    orden.forEach((v, i) => {
      v._duplicado = i > 0;
      if (i > 0) v._indexable = false;
      // Aunque no se indexen, el titulo de la pestana no puede ser identico.
      // Varias reediciones comparten incluso la fecha, asi que hace falta el numero.
      v._tituloPagina = i === 0
        ? v.title
        : `${v.title} (${v.published ? fechaES(v.published) + ' · ' : ''}version ${i + 1})`;
    });
  }
}
const indexables = videos.filter((v) => v._indexable);

const temasTodos = (() => {
  const map = new Map();
  for (const v of videos) {
    for (const t of v.tags || []) {
      const s = slugify(t);
      if (!map.has(s)) map.set(s, { slug: s, name: t, videos: [] });
      map.get(s).videos.push(v);
    }
  }
  return [...map.values()].filter((t) => t.videos.length >= 3).sort((a, b) => b.videos.length - a.videos.length);
})();

function head({ title, description, url, image, extraJsonLd = [], noindex = false, prev = '', next = '', oraculos = false }) {
  const ld = extraJsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="${S.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
${noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">'}
${prev ? `<link rel="prev" href="${esc(prev)}">` : ''}${next ? `<link rel="next" href="${esc(next)}">` : ''}
<meta name="theme-color" content="${S.themeColor}">
<meta property="og:type" content="${/\/v\//.test(url) ? 'video.other' : 'website'}">
<meta property="og:site_name" content="${esc(S.name)}">
<meta property="og:locale" content="${S.locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
<link rel="preconnect" href="https://i.ytimg.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/assets/styles.css">
${oraculos ? '<link rel="stylesheet" href="/assets/oraculos.css">' : ''}
<link rel="alternate" type="application/rss+xml" title="${esc(S.name)}" href="/feed.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/img/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
${ld}
</head>
<body>`;
}

const header = (activo = '') => `
<a class="skip" href="#main">Ir al contenido</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-text">${esc(S.name)}</span>
    </a>
    <nav aria-label="Principal">
      <a href="/videos/"${activo === 'videos' ? ' aria-current="page"' : ''}>Videos</a>
      ${sagas.length ? `<a href="/sagas/"${activo === 'sagas' ? ' aria-current="page"' : ''}>Sagas</a>` : ''}
      ${temasTodos.length ? `<a href="/temas/"${activo === 'temas' ? ' aria-current="page"' : ''}>Temas</a>` : ''}
      <a href="/herramientas/"${activo === 'herramientas' ? ' aria-current="page"' : ''}>Oráculos</a>
      <a href="/buscar/"${activo === 'buscar' ? ' aria-current="page"' : ''}>Buscar</a>
      ${channelUrl ? `<a class="cta" href="${esc(channelUrl)}?sub_confirmation=1" rel="noopener" target="_blank">Suscribirse</a>` : ''}
    </nav>
  </div>
</header>`;

const footer = ({ oraculos = false } = {}) => `
<footer class="site-footer">
  <div class="wrap">
    <nav class="footer-nav" aria-label="Pie">
      <a href="/videos/">Archivo completo</a>
      ${sagas.length ? '<a href="/sagas/">Sagas</a>' : ''}
      <a href="/temas/">Temas</a>
      <a href="/herramientas/">Oráculos</a>
      <a href="/canales/">Canales</a>
      <a href="/preguntas-frecuentes/">Preguntas frecuentes</a>
    </nav>
    <p><strong>${esc(S.name)}</strong> — ${esc(S.tagline)}</p>
    <p class="muted">${videos.length.toLocaleString('es-ES')} videos en el archivo. ${channelUrl ? `<a href="${esc(channelUrl)}" rel="noopener" target="_blank">Ver el canal en YouTube</a>` : ''}</p>
    <p class="muted small">&copy; ${new Date().getFullYear()} ${esc(S.author)}. Todos los derechos reservados.</p>
  </div>
</footer>
<script src="/assets/app.js" defer></script>
${oraculos ? '<script src="/assets/oraculos.js" defer></script>' : ''}
</body>
</html>`;

function card(v, { eager = false } = {}) {
  const dur = humanDuration(v.duration);
  return `<article class="card">
  <a class="card-link" href="/v/${v.slug}/">
    <span class="thumb">
      <img src="${thumb(v.id, 'hqdefault')}" srcset="${thumb(v.id, 'hqdefault')} 480w, ${thumb(v.id, 'maxresdefault')} 1280w" sizes="(max-width:600px) 100vw, (max-width:1000px) 50vw, 33vw" alt="Miniatura: ${esc(v.title)}" width="480" height="270" loading="${eager ? 'eager' : 'lazy'}" decoding="async">
      <span class="play" aria-hidden="true"></span>
      ${dur ? `<span class="dur">${dur}</span>` : ''}
    </span>
    <h3 class="card-title">${esc(v.title)}</h3>
  </a>
  <p class="card-meta">${v.published ? `<time datetime="${v.published}">${fechaES(v.published)}</time>` : ''}</p>
</article>`;
}

function paginador(base, pagina, total) {
  if (total <= 1) return '';
  const url = (n) => (n === 1 ? base : `${base}${n}/`);
  const nums = [];
  for (let n = 1; n <= total; n++) {
    if (n === 1 || n === total || Math.abs(n - pagina) <= 2) nums.push(n);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return `<nav class="paginador" aria-label="Paginacion">
    ${pagina > 1 ? `<a class="pag-nav" href="${url(pagina - 1)}" rel="prev">&larr; Anterior</a>` : ''}
    ${nums.map((n) => (n === '…' ? '<span class="pag-sep">…</span>'
      : n === pagina ? `<span class="pag-actual" aria-current="page">${n}</span>`
      : `<a href="${url(n)}">${n}</a>`)).join('')}
    ${pagina < total ? `<a class="pag-nav" href="${url(pagina + 1)}" rel="next">Siguiente &rarr;</a>` : ''}
  </nav>`;
}

// ---------- portada ----------
function buildHome() {
  const url = BASE + '/';
  const destacado = videos[0];
  const recientes = videos.slice(1, 25);
  const masVistos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12);

  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'WebSite',
      name: S.name, url, description: S.description, inLanguage: S.lang,
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/buscar/?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
    },
    {
      '@context': 'https://schema.org', '@type': 'Person',
      name: S.author, url, description: S.tagline, sameAs: [channelUrl].filter(Boolean),
    },
  ];

  const html = head({ title: S.seoTitle || `${S.name} — documentales de misterio y ocultismo`, description: S.description, url, image: `${BASE}/assets/img/og-image.jpg`, extraJsonLd: jsonld, oraculos: true })
    + header('home') + `
<main id="main">
  <section class="hero">
    <div class="wrap">
      <h1>${esc(S.name)}</h1>
      <p class="lead">${esc(S.tagline)}</p>
      <p class="lead-sub">${esc(S.description)}</p>
      <form class="hero-buscar" action="/buscar/" method="get" role="search">
        <label class="sr-only" for="hq">Buscar en el archivo</label>
        <input id="hq" name="q" type="search" placeholder="Busca entre ${videos.length.toLocaleString('es-ES')} videos…" autocomplete="off">
        <button type="submit">Buscar</button>
      </form>
    </div>
  </section>

  ${destacado ? `<section class="wrap featured">
    <h2 class="section-title">Ultimo documental</h2>
    <a class="featured-card" href="/v/${destacado.slug}/">
      <span class="thumb">
        <img src="${thumb(destacado.id)}" alt="Miniatura: ${esc(destacado.title)}" width="1280" height="720" fetchpriority="high" decoding="async">
        <span class="play play-lg" aria-hidden="true"></span>
      </span>
      <div class="featured-body">
        <h3>${esc(destacado.title)}</h3>
        <p>${esc(truncate(destacado._texto || destacado.description, 230))}</p>
        <p class="card-meta">${destacado.published ? fechaES(destacado.published) : ''}${destacado.duration ? ' · ' + humanDuration(destacado.duration) : ''}</p>
      </div>
    </a>
  </section>` : ''}

  ${temasTodos.length ? `<section class="wrap tagbar">
    <h2 class="section-title">Explora por tema</h2>
    <ul class="chips">${temasTodos.slice(0, 14).map((t) => `<li><a href="/tema/${t.slug}/">${esc(t.name)} <span>${t.videos.length}</span></a></li>`).join('')}</ul>
  </section>` : ''}

  <section class="wrap">
    <h2 class="section-title">Lo mas visto</h2>
    <div class="grid">${masVistos.map((v, i) => card(v, { eager: i < 3 })).join('')}</div>
  </section>

  <section class="wrap">
    <h2 class="section-title">Lo mas reciente</h2>
    <div class="grid">${recientes.map((v) => card(v)).join('')}</div>
    <p class="actions"><a class="btn" href="/videos/">Ver el archivo completo (${videos.length.toLocaleString('es-ES')} videos)</a></p>
  </section>

  ${sagas.length ? `<section class="wrap">
    <h2 class="section-title">Sumergete en las sagas</h2>
    <p class="lead-sub">Series completas, ordenadas, listas para maratonear. Cada saga es un viaje.</p>
    <div class="grid sagas-grid">
      ${sagas.map((s) => {
        const primero = videos.find((v) => v.id === s.videoIds[0]);
        return `<article class="card saga-card">
          <a class="card-link" href="/saga/${s.slug}/">
            <span class="thumb">
              ${primero ? `<img src="${thumb(primero.id, 'hqdefault')}" alt="Saga: ${esc(s.name)}" width="480" height="270" loading="lazy" decoding="async">` : ''}
              <span class="play" aria-hidden="true"></span>
              <span class="dur">${s.videoIds.length} videos</span>
            </span>
            <h3 class="card-title">${esc(s.name)}</h3>
          </a>
          <p class="card-meta">${esc(s.desc)}</p>
        </article>`;
      }).join('')}
    </div>
  </section>` : ''}

  ${SEC_HERRAMIENTAS}
  ${SEC_CANALES}
</main>
${MODALES}` + footer({ oraculos: true });

  writeFile('dist/index.html', html);
}

// ---------- archivo paginado ----------
function buildArchivo() {
  const paginas = trozos(videos, POR_PAGINA);
  paginas.forEach((lote, i) => {
    const n = i + 1;
    const url = n === 1 ? `${BASE}/videos/` : `${BASE}/videos/${n}/`;
    const titulo = n === 1
      ? `Todos los videos de ${S.name} — archivo completo`
      : `Todos los videos de ${S.name} — pagina ${n}`;
    const descripcion = n === 1
      ? `El archivo completo de ${S.name}: ${videos.length.toLocaleString('es-ES')} documentales sobre misterio, ocultismo, la Biblia, el Vaticano, profecias y lo paranormal.`
      : `Pagina ${n} del archivo de ${S.name}. Videos publicados entre ${fechaES(lote[lote.length - 1].published)} y ${fechaES(lote[0].published)}.`;

    const ld = {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: titulo, url, description: descripcion, inLanguage: S.lang,
      mainEntity: { '@type': 'ItemList', numberOfItems: lote.length, itemListElement: lote.map((v, j) => ({ '@type': 'ListItem', position: (n - 1) * POR_PAGINA + j + 1, url: videoUrl(v), name: v.title })) },
    };

    const html = head({
      title: titulo, description: descripcion, url, image: thumb(lote[0].id), extraJsonLd: [ld],
      prev: n > 1 ? (n === 2 ? `${BASE}/videos/` : `${BASE}/videos/${n - 1}/`) : '',
      next: n < paginas.length ? `${BASE}/videos/${n + 1}/` : '',
    }) + header('videos') + `
<main id="main" class="wrap">
  <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <span aria-current="page">Videos${n > 1 ? ` — pagina ${n}` : ''}</span></nav>
  <h1 class="titulo-archivo">Archivo completo <span class="count">${videos.length.toLocaleString('es-ES')} videos</span></h1>
  ${n === 1 ? `<p class="lead-sub">Todo lo que se ha publicado en el canal, del mas reciente al mas antiguo. ¿Buscas algo concreto? <a href="/buscar/">Usa el buscador</a>.</p>` : `<p class="lead-sub">Pagina ${n} de ${paginas.length}.</p>`}
  <div class="grid">${lote.map((v, j) => card(v, { eager: j < 3 })).join('')}</div>
  ${paginador('/videos/', n, paginas.length)}
</main>` + footer();

    writeFile(n === 1 ? 'dist/videos/index.html' : `dist/videos/${n}/index.html`, html);
  });
  return paginas.length;
}

// ---------- pagina de video ----------
function buildVideo(v) {
  const url = videoUrl(v);
  const desc = truncate(v._texto || v._ficha, 158);
  const related = videos
    .filter((o) => o.id !== v.id)
    .map((o) => ({ o, score: (o.tags || []).filter((t) => (v.tags || []).includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.o.views || 0) - (a.o.views || 0))
    .slice(0, 6).map((x) => x.o);

  const vo = {
    '@context': 'https://schema.org', '@type': 'VideoObject',
    name: v.title,
    description: (v._texto || v._ficha).slice(0, 4900),
    thumbnailUrl: [thumb(v.id), thumb(v.id, 'hqdefault')],
    embedUrl: `https://www.youtube.com/embed/${v.id}`,
    contentUrl: watchUrl(v),
    url, inLanguage: S.lang,
    publisher: { '@type': 'Organization', name: S.name, url: BASE + '/' },
    creator: { '@type': 'Person', name: S.author, url: channelUrl || BASE + '/' },
  };
  if (v.published) vo.uploadDate = v.published;
  if (v.duration) vo.duration = isoDuration(v.duration);
  if (v.views) vo.interactionStatistic = { '@type': 'InteractionCounter', interactionType: { '@type': 'WatchAction' }, userInteractionCount: v.views };

  const bc = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Videos', item: BASE + '/videos/' },
      { '@type': 'ListItem', position: 3, name: v.title, item: url },
    ],
  };

  const parrafos = (v.description || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const html = head({ title: `${v._tituloPagina || v.title} | ${S.name}`, description: desc, url, image: thumb(v.id), extraJsonLd: [vo, bc], noindex: !v._indexable })
    + header() + `
<main id="main" class="wrap article">
  <nav class="breadcrumb" aria-label="Migas de pan">
    <a href="/">Inicio</a> <span>/</span> <a href="/videos/">Videos</a> <span>/</span> <span aria-current="page">${esc(truncate(v.title, 60))}</span>
  </nav>

  <h1>${esc(v.title)}</h1>
  <p class="card-meta">${v.published ? `<time datetime="${v.published}">${fechaES(v.published)}</time>` : ''}${v.duration ? ' · ' + humanDuration(v.duration) : ''}${v.views ? ' · ' + v.views.toLocaleString('es-ES') + ' vistas' : ''}</p>

  <div class="player" data-id="${v.id}" data-title="${esc(v.title)}">
    <img src="${thumb(v.id)}" alt="Miniatura: ${esc(v.title)}" width="1280" height="720" fetchpriority="high" decoding="async">
    <button type="button" class="play play-lg" aria-label="Reproducir ${esc(v.title)}"></button>
  </div>

  <div class="prose">
    <h2>Sobre este ${v.kind === 'short' ? 'video' : 'documental'}</h2>
    ${parrafos.length
      ? parrafos.map((p) => `<p>${esc(p).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" rel="nofollow noopener" target="_blank">$1</a>')}</p>`).join('')
      : `<p>${esc(v._ficha)}</p>`}
  </div>

  ${(v.tags || []).length ? `<ul class="chips small-chips">${(v.tags || []).map((t) => `<li><a href="/tema/${slugify(t)}/">${esc(t)}</a></li>`).join('')}</ul>` : ''}

  <p class="actions">
    <a class="btn" href="${watchUrl(v)}" rel="noopener" target="_blank">Ver en YouTube</a>
    ${channelUrl ? `<a class="btn ghost" href="${esc(channelUrl)}?sub_confirmation=1" rel="noopener" target="_blank">Suscribirse al canal</a>` : ''}
  </p>

  ${related.length ? `<section class="related">
    <h2 class="section-title">Tambien te puede interesar</h2>
    <div class="grid">${related.map((r) => card(r)).join('')}</div>
  </section>` : ''}
</main>` + footer();

  writeFile(`dist/v/${v.slug}/index.html`, html);
}

// ---------- paginas de tema ----------
function buildTemas() {
  if (!cfg.build.generateTagPages || !temasTodos.length) return 0;
  let generadas = 0;

  for (const t of temasTodos) {
    const lista = [...t.videos].sort((a, b) => String(b.published || '').localeCompare(String(a.published || '')));
    const paginas = trozos(lista, POR_PAGINA);
    paginas.forEach((lote, i) => {
      const n = i + 1;
      const url = n === 1 ? `${BASE}/tema/${t.slug}/` : `${BASE}/tema/${t.slug}/${n}/`;
      const titulo = n === 1 ? `${t.name} — ${lista.length} documentales de ${S.name}` : `${t.name} — pagina ${n} | ${S.name}`;
      const descripcion = n === 1
        ? `${lista.length} documentales de ${S.name} sobre ${t.name.toLowerCase()}. Archivo completo, ordenado del mas reciente al mas antiguo.`
        : `${t.name}: página ${n} de ${paginas.length}. Documentales ${(n - 1) * POR_PAGINA + 1} a ${(n - 1) * POR_PAGINA + lote.length} de ${lista.length}.`;
      const ld = {
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        name: titulo, url, description: descripcion, inLanguage: S.lang,
        mainEntity: { '@type': 'ItemList', numberOfItems: lote.length, itemListElement: lote.map((v, j) => ({ '@type': 'ListItem', position: (n - 1) * POR_PAGINA + j + 1, url: videoUrl(v), name: v.title })) },
      };
      const html = head({
        title: titulo, description: descripcion, url, image: thumb(lote[0].id), extraJsonLd: [ld],
        prev: n > 1 ? (n === 2 ? `${BASE}/tema/${t.slug}/` : `${BASE}/tema/${t.slug}/${n - 1}/`) : '',
        next: n < paginas.length ? `${BASE}/tema/${t.slug}/${n + 1}/` : '',
      }) + header('temas') + `
<main id="main" class="wrap">
  <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <a href="/temas/">Temas</a> <span>/</span> <span aria-current="page">${esc(t.name)}</span></nav>
  <h1 class="titulo-archivo">${esc(t.name)} <span class="count">${lista.length} videos</span></h1>
  <p class="lead-sub">${esc(descripcion)}</p>
  <div class="grid">${lote.map((v, j) => card(v, { eager: j < 3 })).join('')}</div>
  ${paginador(`/tema/${t.slug}/`, n, paginas.length)}
</main>` + footer();
      writeFile(n === 1 ? `dist/tema/${t.slug}/index.html` : `dist/tema/${t.slug}/${n}/index.html`, html);
      generadas++;
    });
  }

  const url = `${BASE}/temas/`;
  const html = head({ title: `Temas — ${S.name}`, description: `Los ${temasTodos.length} temas del archivo de ${S.name}: ${temasTodos.slice(0, 8).map((t) => t.name).join(', ')} y mas.`, url, image: videos[0] ? thumb(videos[0].id) : '' })
    + header('temas') + `
<main id="main" class="wrap article">
  <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <span aria-current="page">Temas</span></nav>
  <h1>Temas</h1>
  <p class="lead-sub">Entra por el tema que te interesa y ve todos los documentales sobre el.</p>
  <ul class="chips big-chips">${temasTodos.map((t) => `<li><a href="/tema/${t.slug}/">${esc(t.name)} <span>${t.videos.length}</span></a></li>`).join('')}</ul>
</main>` + footer();
  writeFile('dist/temas/index.html', html);
  return generadas;
}

// ---------- buscador ----------
function buildBuscador() {
  const indice = videos.map((v) => ({ i: v.id, t: v.title, s: v.slug, d: v.published || '', u: v.duration || 0 }));
  writeFile('dist/assets/search.json', JSON.stringify(indice));

  const url = `${BASE}/buscar/`;
  const html = head({ title: `Buscar en el archivo — ${S.name}`, description: `Busca entre los ${videos.length.toLocaleString('es-ES')} videos de ${S.name} por titulo o tema.`, url, image: videos[0] ? thumb(videos[0].id) : '', noindex: true })
    + header('buscar') + `
<main id="main" class="wrap article buscador">
  <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <span aria-current="page">Buscar</span></nav>
  <h1>Buscar</h1>
  <form class="hero-buscar" role="search" onsubmit="return false">
    <label class="sr-only" for="q">Buscar video</label>
    <input id="q" name="q" type="search" placeholder="Escribe un tema, un nombre, un titulo…" autocomplete="off" autofocus>
  </form>
  <p id="estado" class="lead-sub">Cargando el indice de ${videos.length.toLocaleString('es-ES')} videos…</p>
  <div class="grid" id="resultados"></div>
</main>` + footer();
  writeFile('dist/buscar/index.html', html);
}

// ---------- oraculos ----------
function buildHerramientas() {
  // Indice de herramientas
  const url = `${BASE}/herramientas/`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: `Oráculos y herramientas — ${S.name}`, url, inLanguage: S.lang,
    description: 'Tres oráculos digitales gratuitos: tu nombre de bruja, tu animal espiritual y tu ángel de nacimiento según la Kabbalah.',
  };
  writeFile('dist/herramientas/index.html', head({
    title: `Oráculos gratis | ${S.name}`,
    description: 'Tres oráculos gratis: tu nombre de bruja o brujo, tu animal espiritual y cuál de los 72 ángeles del Shem HaMephorash rige tu fecha de nacimiento.',
    url, image: `${BASE}/assets/img/og-image.jpg`, extraJsonLd: [ld], oraculos: true,
  }) + header('herramientas') + `
<main id="main">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <span aria-current="page">Oráculos</span></nav>
  </div>
  ${SEC_HERRAMIENTAS}
  <section class="wrap article">
    <h2>¿Qué son estos oráculos?</h2>
    <p>Son tres artefactos digitales construidos para acompañar los documentales del canal. Ninguno pide datos personales, ninguno guarda nada y todos son gratis. Funcionan con lo que tú les cuentes en el momento: una fecha, un signo, un elemento, una tierra.</p>
    <p>No predicen el futuro. Trabajan con símbolos — que es exactamente lo que hacían las tradiciones de las que salen. Un nombre de arte, un nahual, un ángel regente: los tres son formas antiguas de ponerle nombre a algo que ya intuías de ti.</p>
    <ul class="lista-simple">
      ${ORACULOS.map((o) => `<li><a href="/herramientas/${o.slug}/"><strong>${esc(o.nombre)}</strong></a> — ${esc(o.resumen)}</li>`).join('')}
    </ul>
  </section>
</main>
${MODALES}` + footer({ oraculos: true }));

  // Una pagina propia por oraculo: cada una puede posicionar por si sola
  for (const o of ORACULOS) {
    const u = `${BASE}/herramientas/${o.slug}/`;
    const otros = ORACULOS.filter((x) => x.slug !== o.slug);
    const jsonld = [
      {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: o.nombre, url: u, applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Web', inLanguage: S.lang, description: o.resumen,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Person', name: S.author, url: channelUrl || BASE + '/' },
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Oráculos', item: `${BASE}/herramientas/` },
          { '@type': 'ListItem', position: 3, name: o.nombre, item: u },
        ],
      },
    ];
    writeFile(`dist/herramientas/${o.slug}/index.html`, head({
      title: `${o.titulo || o.h1} | ${S.name}`,
      description: truncate(o.resumen, 158),
      url: u, image: `${BASE}${o.img}`, extraJsonLd: jsonld, oraculos: true,
    }) + header('herramientas') + `
<main id="main" class="wrap article">
  <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <a href="/herramientas/">Oráculos</a> <span>/</span> <span aria-current="page">${esc(o.nombre)}</span></nav>
  <h1>${esc(o.h1)}</h1>
  <p class="lead">${esc(o.resumen)}</p>

  <div class="oraculo-lanzador" style="background-image:linear-gradient(180deg,rgba(10,10,12,.35),rgba(10,10,12,.92)),url('${o.img}')">
    <button type="button" class="btn" onclick="${o.abre}">Consultar al oráculo →</button>
  </div>

  <div class="prose">
    ${o.intro.map((p) => `<p>${esc(p)}</p>`).join('')}
  </div>

  <p class="actions"><button type="button" class="btn" onclick="${o.abre}">Consultar al oráculo →</button></p>

  <section class="related">
    <h2 class="section-title">Los otros oráculos</h2>
    <ul class="lista-simple">
      ${otros.map((x) => `<li><a href="/herramientas/${x.slug}/"><strong>${esc(x.nombre)}</strong></a> — ${esc(x.resumen)}</li>`).join('')}
    </ul>
  </section>
</main>
${MODALES}` + footer({ oraculos: true }));
  }
  return ORACULOS.length + 1;
}

// ---------- sagas (playlists) ----------
function buildSagas() {
  if (!sagas.length) return 0;
  const porId = new Map(videos.map((v) => [v.id, v]));
  let generadas = 0;

  const url = `${BASE}/sagas/`;
  writeFile('dist/sagas/index.html', head({
    title: `Las sagas de ${S.name} — series completas en orden`,
    description: `Las series completas de ${S.name}: ${sagas.map((s) => s.name).join(', ')}. Cada saga, ordenada y lista para maratonear.`,
    url, image: `${BASE}/assets/img/og-image.jpg`,
    extraJsonLd: [{
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Sagas de ${S.name}`, url, inLanguage: S.lang,
      mainEntity: { '@type': 'ItemList', numberOfItems: sagas.length, itemListElement: sagas.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}/saga/${s.slug}/`, name: s.name })) },
    }],
  }) + header('sagas') + `
<main id="main" class="wrap">
  <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <span aria-current="page">Sagas</span></nav>
  <h1 class="titulo-archivo">Las sagas</h1>
  <p class="lead-sub">Series completas, ordenadas, listas para maratonear. Cada saga es un viaje.</p>
  <div class="grid sagas-grid">
    ${sagas.map((s) => {
      const primero = porId.get(s.videoIds[0]);
      return `<article class="card saga-card">
        <a class="card-link" href="/saga/${s.slug}/">
          <span class="thumb">
            ${primero ? `<img src="${thumb(primero.id, 'hqdefault')}" alt="Saga: ${esc(s.name)}" width="480" height="270" loading="lazy" decoding="async">` : ''}
            <span class="play" aria-hidden="true"></span>
            <span class="dur">${s.videoIds.length} videos</span>
          </span>
          <h3 class="card-title">${esc(s.name)}</h3>
        </a>
        <p class="card-meta">${esc(s.desc)}</p>
      </article>`;
    }).join('')}
  </div>
</main>` + footer());
  generadas++;

  for (const s of sagas) {
    const lista = s.videoIds.map((id) => porId.get(id)).filter(Boolean);
    const paginas = trozos(lista, POR_PAGINA);
    paginas.forEach((lote, i) => {
      const n = i + 1;
      const u = n === 1 ? `${BASE}/saga/${s.slug}/` : `${BASE}/saga/${s.slug}/${n}/`;
      const titulo = n === 1 ? `${s.name} — ${lista.length} documentales en orden | ${S.name}` : `${s.name} — página ${n} | ${S.name}`;
      const descripcion = n === 1
        ? `${s.desc} ${lista.length} videos de ${S.name}, en orden.`
        : `${s.name}: página ${n} de ${paginas.length}. Videos ${(n - 1) * POR_PAGINA + 1} a ${(n - 1) * POR_PAGINA + lote.length} de la saga.`;
      const ld = {
        '@context': 'https://schema.org', '@type': 'CollectionPage', name: titulo, url: u, description: descripcion, inLanguage: S.lang,
        mainEntity: { '@type': 'ItemList', numberOfItems: lote.length, itemListElement: lote.map((v, j) => ({ '@type': 'ListItem', position: (n - 1) * POR_PAGINA + j + 1, url: videoUrl(v), name: v.title })) },
      };
      writeFile(n === 1 ? `dist/saga/${s.slug}/index.html` : `dist/saga/${s.slug}/${n}/index.html`, head({
        title: titulo, description: truncate(descripcion, 158), url: u,
        image: lote[0] ? thumb(lote[0].id) : '', extraJsonLd: [ld],
        prev: n > 1 ? (n === 2 ? `${BASE}/saga/${s.slug}/` : `${BASE}/saga/${s.slug}/${n - 1}/`) : '',
        next: n < paginas.length ? `${BASE}/saga/${s.slug}/${n + 1}/` : '',
      }) + header('sagas') + `
<main id="main" class="wrap">
  <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <a href="/sagas/">Sagas</a> <span>/</span> <span aria-current="page">${esc(s.name)}</span></nav>
  <h1 class="titulo-archivo">${esc(s.name)} <span class="count">${lista.length} videos</span></h1>
  <p class="lead-sub">${esc(s.desc)}</p>
  <p class="actions"><a class="btn ghost" href="https://www.youtube.com/playlist?list=${s.playlistId}" rel="noopener" target="_blank">Ver la playlist completa en YouTube (${s.total})</a></p>
  <div class="grid">${lote.map((v, j) => card(v, { eager: j < 3 })).join('')}</div>
  ${paginador(`/saga/${s.slug}/`, n, paginas.length)}
</main>` + footer());
      generadas++;
    });
  }
  return generadas;
}

// ---------- canales ----------
function buildCanales() {
  const url = `${BASE}/canales/`;
  writeFile('dist/canales/index.html', head({
    title: `El universo DoQ: los 4 canales de ${S.name}`,
    description: 'Cuatro canales, el mismo narrador: El DoQmentalista, El Oráculo, AterradorMente y Soy De Dios. Cuatro maneras de mirar lo invisible.',
    url, image: `${BASE}/assets/img/og-image.jpg`,
  }) + header('canales') + `
<main id="main">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <span aria-current="page">Canales</span></nav>
  </div>
  ${SEC_CANALES}
</main>` + footer());
  return 1;
}

// ---------- preguntas frecuentes ----------
const FAQ = [
  ['¿Quién es El DoQmentalista?', 'El DoQmentalista es un investigador y creador de documentales en español, especializado en historia oculta, misterios sin resolver, secretos del Vaticano, Kabbalah, México prehispánico, esoterismo y conspiraciones. Su canal es una de las voces más reconocidas del género en habla hispana.'],
  ['¿Dónde puedo ver los documentales completos?', 'Todos los documentales están gratis en YouTube, y aquí los tienes ordenados y buscables. Las sagas completas están organizadas para verlas en orden cronológico.'],
  ['¿De qué tratan los documentales?', 'Investigan los secretos del Vaticano, criaturas bíblicas, Kabbalah y misticismo judío, el México prehispánico y su mitología azteca y maya, leyendas urbanas mexicanas, conspiraciones históricas, lo paranormal y el ocultismo. La narración es cinematográfica, pero los datos son verificables.'],
  ['¿Cuáles son los canales del Universo DoQ?', 'Son cuatro: El DoQmentalista (documentales del misterio), El Oráculo (sueños y simbolismo), AterradorMente (lo oscuro que nos habita) y Soy De Dios (inspiración cristiana).'],
  ['¿Las investigaciones están basadas en hechos reales?', 'Sí. Cada documental se basa en investigación, fuentes históricas, archivos, testimonios y bibliografía especializada. Cuando se exploran teorías o leyendas, se aclara el contexto.'],
  ['¿Qué contenido hay sobre el Vaticano?', 'La saga "Secretos del Vaticano" investiga las criaturas bíblicas que la Iglesia habría documentado, las misiones secretas del Papa, los archivos vaticanos, casos de exorcismo y demonología cristiana, todo en orden cronológico.'],
  ['¿Hay documentales sobre México prehispánico y leyendas mexicanas?', 'Sí: mitología azteca, dioses como Quetzalcóatl y Tezcatlipoca, rituales mexicas, cultura maya y sus profecías, y leyendas urbanas como La Llorona o El Charro Negro.'],
  ['¿Los oráculos de la web son gratis?', 'Sí, los tres son gratuitos y no piden registro ni guardan tus datos: tu nombre de bruja o brujo, tu animal espiritual y tu ángel de nacimiento según los 72 nombres del Shem HaMephorash.'],
  ['¿Cómo contacto para prensa o colaboraciones?', 'Escribe a el.doq.mentalista@gmail.com. Las respuestas pueden tardar unos días por el volumen de mensajes.'],
];

function buildFAQ() {
  const url = `${BASE}/preguntas-frecuentes/`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  writeFile('dist/preguntas-frecuentes/index.html', head({
    title: `Preguntas frecuentes sobre ${S.name}`,
    description: `Quién es El DoQmentalista, de qué tratan sus documentales, cuáles son los cuatro canales del Universo DoQ y cómo contactar.`,
    url, image: `${BASE}/assets/img/og-image.jpg`, extraJsonLd: [ld],
  }) + header() + `
<main id="main" class="wrap article">
  <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> <span>/</span> <span aria-current="page">Preguntas frecuentes</span></nav>
  <h1>Preguntas frecuentes</h1>
  <div class="faq">
    ${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
  </div>
</main>` + footer());
  return 1;
}

// ---------- sitemaps / robots / feed ----------
function buildSitemaps(numPaginasArchivo) {
  const hoy = new Date().toISOString().slice(0, 10);
  const mapas = [];

  // 1. paginas fijas y de coleccion
  const fijas = [
    `<url><loc>${BASE}/</loc><lastmod>${hoy}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...Array.from({ length: numPaginasArchivo }, (_, i) => `<url><loc>${BASE}/videos/${i === 0 ? '' : (i + 1) + '/'}</loc><lastmod>${hoy}</lastmod><changefreq>weekly</changefreq><priority>${i === 0 ? '0.9' : '0.5'}</priority></url>`),
    ...(temasTodos.length ? [`<url><loc>${BASE}/temas/</loc><lastmod>${hoy}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`] : []),
    ...temasTodos.map((t) => `<url><loc>${BASE}/tema/${t.slug}/</loc><lastmod>${hoy}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    ...(sagas.length ? [`<url><loc>${BASE}/sagas/</loc><lastmod>${hoy}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`] : []),
    ...sagas.map((s) => `<url><loc>${BASE}/saga/${s.slug}/</loc><lastmod>${hoy}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    `<url><loc>${BASE}/herramientas/</loc><lastmod>${hoy}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`,
    ...ORACULOS.map((o) => `<url><loc>${BASE}/herramientas/${o.slug}/</loc><lastmod>${hoy}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`),
    `<url><loc>${BASE}/canales/</loc><lastmod>${hoy}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    `<url><loc>${BASE}/preguntas-frecuentes/</loc><lastmod>${hoy}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  ];
  writeFile('dist/sitemap-paginas.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${fijas.join('\n  ')}
</urlset>
`);
  mapas.push('sitemap-paginas.xml');

  // 2. videos indexables, en tandas de 800 (los delgados no van: no se le manda basura a Google)
  const tandas = trozos(indexables, 800);
  tandas.forEach((lote, i) => {
    const nombre = `sitemap-videos-${i + 1}.xml`;
    const urls = lote.map((v) => `<url>
    <loc>${videoUrl(v)}</loc>
    <lastmod>${v.published || hoy}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <video:video>
      <video:thumbnail_loc>${thumb(v.id)}</video:thumbnail_loc>
      <video:title>${esc(truncate(v.title, 100))}</video:title>
      <video:description>${esc(truncate(v._texto || v._ficha, 2000))}</video:description>
      <video:player_loc>https://www.youtube.com/embed/${v.id}</video:player_loc>${v.duration ? `
      <video:duration>${v.duration}</video:duration>` : ''}${v.published ? `
      <video:publication_date>${v.published}T00:00:00+00:00</video:publication_date>` : ''}${v.views ? `
      <video:view_count>${v.views}</video:view_count>` : ''}
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>`);
    writeFile(`dist/${nombre}`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${urls.join('\n  ')}
</urlset>
`);
    mapas.push(nombre);
  });

  writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${mapas.map((m) => `  <sitemap><loc>${BASE}/${m}</loc><lastmod>${hoy}</lastmod></sitemap>`).join('\n')}
</sitemapindex>
`);

  writeFile('dist/robots.txt', `User-agent: *
Allow: /
Disallow: /buscar/

Sitemap: ${BASE}/sitemap.xml
`);

  const items = indexables.slice(0, 40).map((v) => `  <item>
    <title>${esc(v.title)}</title>
    <link>${videoUrl(v)}</link>
    <guid isPermaLink="true">${videoUrl(v)}</guid>
    ${v.published ? `<pubDate>${new Date(v.published + 'T12:00:00Z').toUTCString()}</pubDate>` : ''}
    <description>${esc(truncate(v._texto || v._ficha, 400))}</description>
  </item>`).join('\n');
  writeFile('dist/feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${esc(S.name)}</title>
  <link>${BASE}/</link>
  <description>${esc(S.description)}</description>
  <language>${S.lang}</language>
${items}
</channel></rss>
`);
  return mapas.length;
}

function build404() {
  const html = head({ title: `Pagina no encontrada — ${S.name}`, description: 'Esta pagina no existe.', url: BASE + '/404.html', image: videos[0] ? thumb(videos[0].id) : '', noindex: true })
    + header() + `
<main id="main" class="wrap article center">
  <h1>404</h1>
  <p class="lead">Esa pagina no existe o cambio de sitio.</p>
  <p class="actions"><a class="btn" href="/videos/">Ver el archivo completo</a> <a class="btn ghost" href="/buscar/">Buscar</a></p>
</main>` + footer();
  writeFile('dist/404.html', html);
}

function copyAssets() {
  const dest = path.join(ROOT, 'dist/assets');
  fs.mkdirSync(dest, { recursive: true });

  for (const f of fs.readdirSync(path.join(ROOT, 'src'), { withFileTypes: true })) {
    const origen = path.join(ROOT, 'src', f.name);
    if (f.isDirectory()) {
      if (f.name === 'partes') continue; // se compilan aparte, no se publican sueltos
      fs.cpSync(origen, path.join(dest, f.name), { recursive: true });
    } else if (/^google[0-9a-f]+\.html$/i.test(f.name)) {
      fs.copyFileSync(origen, path.join(ROOT, 'dist', f.name)); // verificacion de Search Console: va en la raiz
    } else {
      fs.copyFileSync(origen, path.join(dest, f.name));
    }
  }

  // CSS y JS de los oraculos: un solo archivo cada uno, cargado solo donde hace falta
  const css = parte('oraculos.css') + '\n' + parte('herramientas.css');
  if (css.trim()) writeFile('dist/assets/oraculos.css', css);
  // Sin envolver en IIFE a proposito: los botones usan onclick="openWitchTool()" y
  // esas funciones tienen que quedar en el ambito global, igual que en el sitio anterior.
  const js = parte('oraculos.js');
  if (js.trim()) writeFile('dist/assets/oraculos.js', js);

  // El navegador pide /favicon.ico en la raiz aunque declares otros iconos
  const ico = path.join(ROOT, 'src/img/favicon.ico');
  if (fs.existsSync(ico)) fs.copyFileSync(ico, path.join(ROOT, 'dist/favicon.ico'));

  if (cfg.build.cname && !/TU-DOMINIO/.test(BASE)) writeFile('dist/CNAME', BASE.replace(/^https?:\/\//, '') + '\n');
  writeFile('dist/.nojekyll', '');
  writeFile('dist/_headers', `/assets/*
  Cache-Control: public, max-age=31536000, immutable
/*.html
  Cache-Control: public, max-age=0, must-revalidate
`);
}

// ---------- run ----------
console.time('build');
fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });
buildHome();
const numPaginasArchivo = buildArchivo();
videos.forEach(buildVideo);
const numTemas = buildTemas();
const numSagas = buildSagas();
const numHerr = buildHerramientas();
buildCanales();
buildFAQ();
buildBuscador();
const numMapas = buildSitemaps(numPaginasArchivo);
build404();
copyAssets();
console.timeEnd('build');

console.log(`\nOK sitio generado en dist/`);
console.log(`   ${videos.length.toLocaleString('es-ES')} paginas de video  (${indexables.length.toLocaleString('es-ES')} indexables, ${(videos.length - indexables.length).toLocaleString('es-ES')} en noindex por texto insuficiente)`);
console.log(`   ${numPaginasArchivo} paginas de archivo  ·  ${numTemas} paginas de tema (${temasTodos.length} temas)`);
console.log(`   ${numSagas} paginas de saga (${sagas.length} sagas)  ·  ${numHerr} paginas de oraculos`);
console.log(`   canales + preguntas frecuentes + buscador`);
console.log(`   ${numMapas} sitemaps + robots.txt + feed.xml`);
if (/TU-DOMINIO/.test(BASE)) console.log(`\n!  Falta poner tu dominio real en site.config.json (campo site.domain)\n`);
