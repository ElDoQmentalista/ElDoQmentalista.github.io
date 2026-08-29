---
name: testing-practices
description: Comprobaciones de calidad del sitio generado — enlaces rotos, datos estructurados, slugs duplicados, sitemap, SEO. Úsala antes de publicar, después de cambiar el generador y cada vez que se importen videos nuevos.
---

# Calidad y verificación

Este proyecto genera **miles de páginas estáticas** desde un solo generador. Un fallo no
afecta a una página: afecta a todas. Por eso la verificación es automática, no manual.

## Comando único

```bash
npm test
```

Ejecuta `scripts/check.mjs`, que valida sobre `dist/` y `data/videos.json`:

| Comprobación | Por qué importa |
|---|---|
| Slugs duplicados o vacíos | Dos videos peleando por la misma URL |
| Enlaces internos rotos | Google los penaliza y el usuario se pierde |
| `<title>` y `<meta description>` únicos y con largo correcto | Títulos duplicados = páginas que no rankean |
| JSON-LD parseable y con los campos obligatorios de `VideoObject` | Sin esto no hay resultado enriquecido |
| Toda URL del sitemap existe en `dist/` | Un sitemap con 404 quema credibilidad ante Google |
| Ninguna página `noindex` está en el sitemap | Señal contradictoria |
| Imágenes con `width`, `height` y `alt` | Layout estable + accesibilidad |
| IDs de YouTube con formato válido (11 caracteres) | Un ID malo = reproductor roto |

## Regla de trabajo

`npm test` tiene que pasar **antes** de dar cualquier cambio por terminado y **antes** de
publicar. Si falla, se arregla la causa en el generador — nunca se parchea el HTML de
`dist/`, porque `dist/` se borra y se regenera en cada build.

## Cuando falle

El reporte dice archivo y motivo. El orden de diagnóstico es siempre el mismo:

1. ¿Es un dato malo? → arregla `data/videos.json` (o el CSV de origen).
2. ¿Es una plantilla mala? → arregla `scripts/build.mjs`.
3. Reconstruye (`npm run build`) y vuelve a pasar `npm test`.

## Qué NO hace falta aquí

No hay Vitest, Jest ni Testing Library en este proyecto, y no hacen falta: no hay componentes
ni lógica de negocio que probar unitariamente. Si algún día se añade una API o un frontend
con estado, entonces sí — Vitest + Testing Library, y las pruebas se escriben antes de dar
la función por cerrada.
