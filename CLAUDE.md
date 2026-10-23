# CLAUDE.md — Sitio web de El DoQmentalista

Este archivo lo lee Claude Code al abrir el repositorio. Resume quién es el dueño, cómo
funciona el proyecto y las reglas que no se negocian. **El historial completo de lo que se
ha hecho (mayo–octubre 2026), el estado del re-empaque de YouTube y los pendientes están
en `docs/HISTORIAL-PROYECTO.md`: léelo al empezar cualquier sesión.**

## Quién es el dueño

- David Hernández Ríos, "Inri", "El DoQ" / "El DoQmentalista". Dirígete a él como David o Inri.
- Creador del canal El DoQmentalista (~4M suscriptores): documentales de misterio, Vaticano,
  Biblia, Kabbalah, México prehispánico, esoterismo, conspiraciones.
- Cuatro canales del "Universo DoQ": El DoQmentalista, El Oráculo (sueños y simbolismo),
  AterradorMente (terror), Soy De Dios. **Soy De Dios NO es cristiano**: son reflexiones y
  fábulas con mensaje, "con el sello de Dios" pero sin religión (corrección de Inri del
  26 sep 2026). En el sitio se describe como "Reflexiones y fábulas con mensaje" (corregido el 23 oct 2026).
- Contacto: el.doq.mentalista@gmail.com. Redes: @eldoqmentalista (YouTube/TikTok),
  eldoqmentalistaoficial (Instagram), DQMentalista (X), ElDoQmentalistaOficial (Facebook).
- Tagline oficial: "Trabajo desde las sombras, para servir a la luz."

## Qué es este proyecto

Sitio estático en GitHub Pages: `https://eldoqmentalista.github.io`
Repo: `ElDoQmentalista/ElDoQmentalista.github.io` (rama `main`). Un push a `main` dispara
`.github/workflows/deploy.yml`, que corre `npm run build` + `npm test` y publica `dist/`.

- Generador: `scripts/build.mjs` produce miles de páginas desde `data/videos.json`
  (2,927 videos): portada, `/videos/`, `/v/<slug>/`, `/sagas/`, `/temas/`,
  `/herramientas/` (3 oráculos), `/canales/`, `/preguntas-frecuentes/`, `/buscar/`.
- Datos: `data/videos.json` (base de datos editable), `data/sagas.json`, `data/para-editar.csv`,
  `data/lote-N.csv`, `data/transcripciones/*.txt` (419), `data/cola-publicacion.md`,
  `data/pendientes.md`.
- Front: `src/styles.css`, `src/app.js`, `src/motion.css/js`, `src/partes/` (oráculos y
  secciones rescatadas del sitio anterior), `src/img/`.
- Config: `site.config.json` (dominio, canal, opciones de build). Secretos solo en `.env`
  (ignorado por git): `YT_API_KEY`, `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`.
- Skills del repo en `.claude/skills/` (frontend-design, testing-practices, browser-testing,
  design-bridge, db-schema-prisma). Úsalos cuando apliquen.

## Comandos

```bash
npm run dev            # build + vista previa en http://localhost:4321
npm run build          # genera dist/
npm test               # verifica dist/ (enlaces, SEO, JSON-LD, sitemap). OBLIGATORIO antes de push
npm run import         # videos nuevos vía RSS del canal (15 más recientes)
npm run import:csv -- "ruta.csv"   # catálogo completo desde YouTube Studio / vidIQ
npm run import:sagas   # playlists (usa YT_API_KEY de .env)
npm run lista          # genera data/para-editar.csv (videos sin texto propio, por vistas)
npm run aplicar        # vuelca para-editar.csv editado a data/videos.json
node scripts/transcripciones.mjs --top 10      # baja subtítulos a data/transcripciones/
node scripts/youtube-auth.mjs                  # OAuth una sola vez → YT_REFRESH_TOKEN en .env
node scripts/youtube-update.mjs data/lote-N.csv [--dry]   # publica títulos/descr/tags en YouTube
```

## Reglas que no se negocian

1. **Nunca** subas `.env` ni pegues una API key en código, HTML o commits. En mayo la key
   quedó expuesta en el `index.html` público y agotaron la cuota; no se repite.
2. `npm test` tiene que pasar antes de cualquier push. Si falla, no se publica.
3. **Nunca** uses `--force` en `youtube-update.mjs` ni toques videos fuera de los CSV de la
   cola (`data/cola-publicacion.md`). Cada update cuesta ~51 unidades de 10,000/día
   (~190 videos/día). Si sale `quotaExceeded`, se para y se sigue mañana.
4. Un fallo "no existe o no es tuyo" puede ser cuota agotada, NO video borrado
   (falsa alarma del 31 ago). Verifica con `videos.list` antes de retirar nada de la web.
5. Mobile-first siempre: la mayoría del tráfico es móvil. Nada se activa con el dedo que
   dependa de hover; tilt/halo solo detrás de `@media (hover: hover) and (pointer: fine)`.
6. Cero librerías externas de animación o UI. CSS puro + JS vanilla. `prefers-reduced-motion`
   desactiva todo el movimiento.
7. Conserva siempre `src/google89f14b601708673a.html` (verificación de Search Console) — el
   build lo copia a la raíz.
8. Los videos se abren en YouTube (redirección), no con reproductores incrustados en listados.
9. No borres lo editado a mano en `data/videos.json`; los importadores nunca pisan ediciones.

## Voz, copy y marca

- **Títulos de YouTube = hooks.** Todo título nuevo (lotes de re-empaque, videos nuevos) sigue
  `docs/tutorial-hooks.md`: afirmativo, herético contra la creencia establecida de ese tema,
  discordante, sin preguntas ni "podría/según/lo que nadie te contó", y cubre el video completo
  (regla de Inri, 23 oct 2026).

- Español de México, prosa cinematográfica, tono editorial solemne. Nada de "muertos",
  "abismo", "Hereje", "círculo invoca" ni referencias mórbidas en el copy del sitio.
- Oráculos sin lenguaje de género: "Eres alguien con…" en vez de "Portadora/Hijo".
- Oración del Ángel de Nacimiento dirigida a Dios Padre, no al ángel:
  "Padre Dios, creador del universo y de todo lo visible e invisible, yo, [Nombre], te pido
  que envíes al ángel [Ángel], para que me ayude a [petición]. Para [propósito de servicio],
  en el nombre de Dios, que así sea."
- Campo "don" del ángel en segunda persona: "Tienes el don de [Don]. El poder de [extensión].
  Puedes usar tu don para ayudar a los demás a [acción 1] y a [acción 2]."
- Sistema visual actual (sitio nuevo, ago 2026): fondo `#0a0a0c`, texto `#eae7e1`, dorado
  `#c9a227` / `#e0c264`, tipografías Cinzel (display) + Inter (cuerpo), radio 14px.
  El sistema anterior (mayo) era negro `#0a0a0a`, rojo `#c8102e`, crema `#e8e2d5`,
  Fraunces + Archivo; ya no aplica salvo que Inri lo pida de vuelta.
- Contenido culturalmente auténtico en los oráculos (300 animales en 15 biorregiones,
  72 ángeles del Shem HaMephorash, ~1.13M combinaciones del nombre de bruja/o).

## Cómo trabaja Inri

- Prueba en tiempo real en varios dispositivos y reporta observaciones concretas.
  Señales de aprobación: "luce bien", "funciona perfecto", "siiiiiii".
- Pide auditorías sistemáticas cuando dice "revisa el sitio". Verifica implementaciones con
  scripts que cuenten comprobaciones, no con "debería funcionar".
- Respuestas directas y cortas; límite de ~10 minutos de trabajo por respuesta; pocos
  agentes y un solo pase de verificación aunque pida "varios agentes".
- Convención de este proyecto: abre las respuestas con 🔺 y cierra con 🌙🦌.
- Decisiones de opción múltiple: pregúntale con opciones, no asumas.
