# Historial del proyecto — eldoqmentalista.github.io

Exportado el 23 de octubre de 2026 desde el proyecto "Pagina Web EDQM" de claude.ai
(memoria del proyecto + 4 chats + estado real del repositorio en GitHub). Sirve para que
Claude Code arranque con todo el contexto. Si algo aquí contradice al repo, manda el repo.

---

## 1. Línea de tiempo

### Mayo 2026 — Sitio v1 (una sola página)
Chats de claude.ai (proyecto "Pagina Web EDQM"):

- **"Alojamiento gratuito para página del documentalista"** (25–27 may)
  https://claude.ai/chat/f9b6b9eb-1343-49ec-b48e-0402f4987fa9
  - Se eligió GitHub Pages como alojamiento gratuito. Repo creado el 25 may ("Initial commit"),
    sitio subido el 26 may.
  - `index.html` único con: nav, hero (foto + tagline), 6 carruseles vía YouTube Data API
    (Últimos, Más Vistos, Vaticano, México, Esoterismo, Conspiraciones), Sobre El DoQ,
    Herramientas Mágicas, Universo DoQ (4 canales), Sagas (5 playlists reales), FAQ (8
    acordeones), Contacto, footer con 5 redes.
  - Auditoría mobile-first (375 px) con 12 problemas resueltos en lote: favicons en 5 tamaños,
    H1, OG image 1200×630, Twitter Cards, toasts cinematográficos en vez de `alert()`,
    buscador que redirige a la búsqueda del canal en YouTube con 10 tags populares, links
    reales de Instagram/TikTok/X/Facebook, safe-area-inset, copy del footer.
  - SEO completo: Schema.org JSON-LD de 6 tipos (Person, Organization, WebSite, ProfilePage,
    VideoGallery, FAQPage), 27+ clústeres de keywords, sitemap.xml, robots.txt.
  - Google Search Console verificado por archivo HTML (`google89f14b601708673a.html`),
    sitemap enviado, indexación manual pedida.
  - QR codes con el logo (monje encapuchado) en 4 variantes de color.
  - Problema: la API key estaba en el HTML público y alguien agotó la cuota. Inri la
    encontró en una cuenta de Google distinta y la restringió a `eldoqmentalista.github.io/*`
    y a YouTube Data API v3 únicamente.
  - Caché de la API en localStorage 30 min, PAGE_SIZE 12.

- **"Herramienta del ángel según fecha de nacimiento"** (27 may)
  https://claude.ai/chat/5ebf212c-345c-4c55-a75e-49d877a1af49
  - Tercer oráculo "Descubre tu Ángel de Nacimiento" (72 ángeles del Shem HaMephorash).
    Oraciones reorientadas a Dios Padre; campo "don" en segunda persona (ver CLAUDE.md).
    Fondo `doq-angel.jpg` optimizado a 187 KB, 900×900.
  - Bug móvil arreglado en los 3 modales (bruja, animal, ángel): el modal se abría fuera de
    pantalla. Causa: `100dvh` + `body.overflow=hidden` no frenaba el scroll del `<html>`.
    Solución: `100svh`, clase `.modal-open` en `html` y `body` con `position:fixed`,
    guardar/restaurar scroll con `window.scrollTo(0,y)` y `body.style.top=-scrollY`,
    `modal.scrollTop=0` al abrir, `overscroll-behavior:contain`.
  - Paquete de motion graphics sin librerías (~10 KB): `.reveal-left/right/scale/blur/3d`,
    `.reveal-stagger` (hasta 8 hijos), tilt 3D solo desktop, grano de película animado
    (SVG feTurbulence), sigilo cabalístico rotando en Herramientas, parallax del hero con
    requestAnimationFrame, `prefers-reduced-motion` completo.
  - En este chat se habló de agentes de código (Claude Code, Cursor, Copilot).
  - Oráculos anteriores ya existentes desde una sesión previa: "Tu Nombre de Bruja/o"
    (4 pasos: fecha → color → elemento → género; ~1.13M combinaciones; ids `#oracleModal`,
    `#pane1-4`, `#paneLoading`, `#paneResult`) y "Animal Espiritual" (5 pasos: país → ciudad →
    fecha → género → elemento; 300 animales en 15 biorregiones).

### Agosto 2026 — Sitio v2 (generador, archivo completo, re-empaque de YouTube)
Hecho fuera de este proyecto de claude.ai (sesión de Cowork/Claude Code en la máquina de
Inri; la memoria de esa sesión vivía en un proyecto llamado "proyecto-reempaque-youtube").
Commits en el repo:

- 29 ago — "Sitio nuevo: archivo completo del canal con SEO, sagas y oraculos". Reemplaza el
  `index.html` por un generador en Node (`scripts/build.mjs`) que crea una página por video
  (2,930 entonces; 2,927 hoy), páginas de tema (13 temas automáticos), sagas, los 3 oráculos
  (rescatados en `src/partes/`), canales, FAQ y buscador. Deploy automático con GitHub
  Actions. El sistema visual cambió a negro `#0a0a0c` + dorado `#c9a227`, Cinzel + Inter.
- 29 ago — "Movimiento: transiciones de pagina, scroll y menu movil, sin librerias"
  (`@view-transition`, `animation-timeline: scroll()/view()`, clip-path, header que se
  esconde, menú móvil a pantalla completa, tilt solo con ratón). Inspiraciones:
  drone.riotters.com, sigma-imaging.se, jesperlandberg.com, gustavobatista.dev, finseo.ai,
  clubathletic.co.
- 30 ago — Piloto de re-empaque (9 videos) y lotes 2 (100) y 3 (87) con título,
  descripción y keywords nuevos, publicados a YouTube vía `youtube-update.mjs` (OAuth).
- 31 ago — "Publicacion nocturna: lotes 4 y 5 (195 videos) + parche de cuota". Lote 4:
  100/100. Lote 5: 95/100 (los ~5 últimos cayeron por cuota).

Decisión SEO clave del sitio v2: 1,477 videos comparten la misma descripción plantilla en
YouTube. El generador detecta frases que aparecen en ≥8 videos y las aparta; solo los
videos con texto propio (661 al inicio) entran al sitemap; el resto se publica con
`noindex`. Títulos repetidos: solo el de más vistas es indexable.
`"indexarSinTextoPropio": false` en `site.config.json` (cambiarlo a `true` indexa todo).

### Octubre 2026
- **"YouTube API key"** (20 oct) — https://claude.ai/chat/da30a2ee-8ab4-4837-bc65-17172491cb9b
  Inri pidió recuperar la key. Se localizó en el chat de mayo; termina en `5tDrNw`, está
  restringida al dominio `eldoqmentalista.github.io` y vive en una cuenta de Google
  distinta a la habitual. Si hay una key más nueva, está en `.env` (`YT_API_KEY`) de la
  máquina de Inri o en Google Cloud Console → Credenciales de esa cuenta.
- **Este chat** (23 oct) — migración del proyecto a Claude Code: se exportó este historial,
  `CLAUDE.md`, `.env.example` y las instrucciones de migración.

---

## 2. Estado actual del repositorio (último commit: 31 ago 2026)

```
.github/workflows/deploy.yml   build + test + publish a Pages en cada push a main
.claude/launch.json            config "pagina": npm run serve en puerto 4321
.claude/skills/                frontend-design, testing-practices, browser-testing,
                               design-bridge (Figma), db-schema-prisma (sin usar)
README.md                      documentación completa del sitio v2 (léelo)
package.json                   scripts npm (ver CLAUDE.md)
site.config.json               dominio, canal UCA0AXvVu2kZ4nauMgXs_Naw, opciones de build
data/videos.json               2,927 videos: id, title, description, published, duration,
                               tags, slug, ytTags, views, kind
data/sagas.json                videos por playlist
data/para-editar.csv           2,268 filas: cola de videos sin texto propio, por vistas
data/lote-2..5.csv             lotes ya generados (y publicados) de re-empaque
data/piloto.csv                piloto de 9 videos
data/cola-publicacion.md       reglas y estado de la cola de publicación a YouTube
data/pendientes.md             pendientes puntuales
data/auditoria-coherencia.csv, descripciones-repetidas.csv, _lote*.json/_*-formulas.txt
data/transcripciones/          419 subtítulos en texto plano (<id>.txt)
scripts/build.mjs (961 líneas), check.mjs, import.mjs, import-csv.mjs, import-sagas.mjs,
        lista-para-editar.mjs, aplicar-ediciones.mjs, transcripciones.mjs, temas.mjs,
        youtube-auth.mjs, youtube-update.mjs, serve.mjs, lib.mjs
src/styles.css, app.js, motion.css, motion.js, favicon.svg
src/partes/oraculos.js (4,816 líneas), oraculos.css, modales.html, herramientas.css,
           seccion-herramientas.html, seccion-canales.html
src/img/   hero, hero-mobile, logo, og-image, favicons, 4 iconos de canal, doq-angel,
           doq-animal, doq-brujos
src/google89f14b601708673a.html   verificación de Search Console (NO borrar)
```

Sagas (playlists):
- Documentales Completos — PLbip308elLHsPolplocZxrFeXqjcIERiK
- Misterios y Enigmas — PLbip308elLHtLKor8W_D37WyQ29bE4YtB
- Secretos del Vaticano — PLbip308elLHvtXQEq_AUDywM4688zF2iE
- El DoQmentalista Podcast — PLbip308elLHv2Z5JpvShw2O6Ws9MmCaMl
- Leyendas de Terror — PLbip308elLHsRCZwmGujQ6iqakoSpBJvJ

Dominio propio `www.eldoqmentalista.com`: es de Inri, el DNS apunta a Wix sin sitio
conectado. Pasos para traerlo a GitHub Pages están en el README (registros A/CNAME,
`site.domain` y `build.cname: true`). Hacerlo ANTES de reenviar el sitemap.

---

## 3. Pendientes (a 23 oct 2026)

1. ~~**Lote 5**~~ Hecho el 23 oct 2026 (los 4 restantes; y los 13 del lote 3; ambos 100/100): reintentar `node scripts/youtube-update.mjs data/lote-5.csv` (el script salta
   los que ya están al día) y marcarlo `[x]` en `data/cola-publicacion.md`.
2. **DU0YWfvohU4**: ponerle el título "Los 4 Jinetes del Apocalipsis: la advertencia que ya
   se cumple" cuando termine su Test & Compare en YouTube.
3. ~~**Verificar videos "muertos"**~~ Hecho el 23 oct 2026: los 100 IDs del lote 3 existen; los 3 retirados volvieron a la web. Los 13 que no se publicaron por cuota se publicaron el 23 oct 2026. Texto original: del lote 3 con `videos.list` (lotes de 50, ~4 unidades)
   antes de retirar nada; los 3 retirados el 30 ago (9CvlOizSWhU, sOilOsK0tbc, 9EPA4RZZAG8)
   se dieron por confirmados, pero el 31 ago se descubrió que los fallos eran cuota, no
   borrado — conviene re-verificar también esos 3.
4. **Lote 6 en adelante**: ~2,058 videos pendientes en `data/para-editar.csv` menos los ya
   publicados. Pipeline: `npm run lista` → elegir lote por vistas → generar título,
   descripción (con hasta 3 hashtags dentro) y keywords (tags ≤500 caracteres) → CSV con
   columnas `ID, NUEVO TITULO, NUEVA DESCRIPCION, KEYWORDS` → `--dry` → publicar →
   `npm run aplicar`/`import` → build → test → push.
5. ~~**Soy De Dios**~~ (hecho el 23 oct 2026: ahora dice "Reflexiones y fábulas con mensaje"): cambiar "Inspiración cristiana" en `src/partes/seccion-canales.html`
   (línea ~43) y en el FAQ de `scripts/build.mjs` (línea ~775) por algo como
   "Reflexiones y fábulas con mensaje" — Inri corrigió que el canal no es cristiano.
6. **Dominio propio**: conectar www.eldoqmentalista.com (ver README). Estado al 23 oct:
   pagado en Wix hasta el 18 abr 2028 (factura #1230718585, 19 mar 2026, 1,281.50 MXN,
   cobrada en la cuenta de el.doq.mentalista@gmail.com), pero el dominio vive en OTRA
   cuenta de Wix y no aparece en Dominios. Soporte de Wix (chat con Sarita) lo escaló al
   equipo de acceso de cuentas: **caso 3000341571**; responden por
   correo a el.doq.mentalista@gmail.com. Cuando aparezca: registros A de `@` →
   185.199.108.153 / .109.153 / .110.153 / .111.153, CNAME `www` → eldoqmentalista.github.io,
   luego `site.config.json` y Settings → Pages en GitHub. No pagar Premium para esto.
   Respuesta de Wix (23 oct, ref 096000251): el sitio tiene como PROPIETARIA a la agencia
   **Cropical** (Inri es copropietario desde el 10 abr 2023) y el dominio vive en la cuenta de
   Cropical aunque las facturas salen en la de Inri. Siguiente paso: pedir a Cropical que
   transfiera el dominio a la cuenta de el.doq.mentalista@gmail.com (o que lo deje a Inri
   como propietario). Si no responden, volver a escribir a Wix para escalar.
7. ~~**Bing Webmaster Tools**: importar desde Search Console.~~ Hecho el 23 oct 2026
   (importado desde GSC con su sitemap).
8. **Transcripciones como contenido** — CONSTRUIDO el 23 oct 2026 (commit local, pendiente de
   que Inri lo apruebe y se publique): sección "Transcripción" en las 419 páginas `/v/` que
   tienen archivo (2 párrafos visibles + desplegable), `[Música]` y similares limpiados,
   300+ palabras cuentan como texto propio (indexables 1,057 → 1,080). `npm test` verifica que
   las 419 se vean. Se apaga con `build.transcripciones: false`. Ojo: son subtítulos
   automáticos (errores tipo "super jisus") y contienen palabras vetadas del copy
   ("muertos" en 91, "abismo" en 27, "hereje" en 6) porque es la narración real. Texto original: hay 419 bajadas; usarlas como texto real de las
   páginas `/v/<slug>/` es la vía de mayor impacto SEO (cola larga). No construido aún.
9. **API key**: el límite diario no protege (la API es gratis). En su lugar, el 23 oct 2026 se creó
   la key `scripts-sitio-2026` (en la cuenta de Google aparte, solo YouTube Data API v3) en `.env`;
   falta borrar la vieja "Clave Claude 17" (…5tDrNw), que quedó en el historial público de git.

---

10. **Web 10/10** (guía en `docs/guia-web-10de10.md`): scorecard v1 = 4.9/10 en
    `docs/scorecard-v1.md`. Hecho el 23 oct: AEO (`llms.txt`, `llms-full.txt`, `index.md` por
    documental indexable, `npm test` lo verifica), acentos en títulos de sección, footer viejo
    con anclas rotas (#sobre, #contacto…) apuntando a páginas reales y chequeo de anclas en
    `npm test`. Siguiente pasada propuesta en el scorecard: prueba social (4 M suscriptores,
    642 M vistas, desde 2015, en `site.config.json` → channel), hero con el DoQ y lema, CTA de
    suscripción en móvil, página "Quién es".
11. **yt-dlp**: el Python 3.9 por defecto ya no recibe versiones nuevas. Bajar subtítulos con
    `YT_DLP_PYTHON=".../Python311/python.exe" node scripts/transcripciones.mjs ...`.

## 4. Memoria del proyecto en claude.ai (copiada tal cual, con fecha de mayo)

Estas notas describen el sitio v1. Lo que ya no aplica está marcado.

### overview.md
- Dueño: Inri David Hernández, "El DoQ" / "El DoQmentalista"; dirigirse como David.
- Canal El DoQmentalista (4M+), documentales de misterio.
- Sitio: eldoqmentalista.github.io, repo ElDoQmentalista/ElDoQmentalista.github.io.
  (~~index.html único~~ → ahora generador Node, ver sección 2).
- Marca v1: negro #0a0a0a, rojo #c8102e, crema #e8e2d5; Fraunces + Archivo. (~~Reemplazado~~
  en v2 por negro #0a0a0c + dorado #c9a227, Cinzel + Inter).
- Tagline: "Trabajo desde las sombras, para servir a la luz."
- Voz editorial: español MX, prosa cinematográfica. Oráculos sin género. Palabras vetadas:
  "muertos", "abismo", "Hereje", "círculo invoca", referencias mórbidas.
- Channel ID UCA0AXvVu2kZ4nauMgXs_Naw. API key restringida al dominio, en cuenta de
  Google aparte. Caché localStorage 30 min, PAGE_SIZE 12 (~~solo v1~~).
- Contacto y redes (ver CLAUDE.md).
- Estructura v1, 3 oráculos, motion graphics v1, fix de modales móviles, SEO e
  infraestructura, 5 sagas, 4 canales con iconos en `/assets/` (ahora `src/img/`).

### ways-of-working.md
- Mobile-first; Inri prueba en varios dispositivos y reporta.
- Aprobación: "luce bien", "funciona perfecto", "siiiiiii".
- Prefiere redirección a YouTube sobre reproductores incrustados.
- Contenido culturalmente auténtico en oráculos.
- Sin librerías externas; vanilla JS + CSS.
- Auditorías sistemáticas cuando pide revisión.
- Tono cinematográfico editorial en español MX.
- Abrir respuestas con 🔺, cerrar con 🌙🦌.
- Verificar implementaciones con scripts Python que cuenten comprobaciones.
- Decisiones múltiples: preguntar con opciones.

### Preferencias generales de Inri (cuenta)
- ~10 minutos máximo por respuesta; no gastar tokens de más.
- Pocos agentes, directo al entregable, un solo pase de verificación.
- Si pasa un link de YouTube sin navegador conectado: pedirle el .txt de subtítulos
  (DownSub), no decir que no se puede leer el video.

---

## 5. Tareas programadas

En claude.ai no hay ninguna tarea programada ligada a este proyecto web. La única tarea
programada de la cuenta ("Frases semanales Facebook — El DoQmentalista", lunes 3:00 UTC)
pertenece al proyecto Alfred/Facebook y no tiene que ver con el sitio. La "publicación
nocturna" de lotes a YouTube del 31 ago se hizo a mano en una sesión, no está
automatizada: si se quiere automatizar, hay que hacerlo en la máquina de Inri (tiene que
tener el `.env` con el refresh token).
