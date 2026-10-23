# Scorecard v1 — eldoqmentalista.github.io (23 oct 2026)

Proceso de `docs/guia-web-10de10.md`. Revisión en celular (375 px) y escritorio, sobre el
build local del 23 oct. Datos reales del canal (API de YouTube, 23 oct): 4,080,000
suscriptores, 642 millones de vistas, en YouTube desde octubre de 2015.

| Criterio | Nota | Qué se vio |
|---|---|---|
| Llamada a la acción clara | 4/10 | El CTA del hero es el buscador. "Suscribirse" solo aparece en el header de escritorio; en celular queda dentro del menú. No hay ningún CTA de suscripción a mitad de la portada. |
| Prueba social concreta | 1/10 | Ni una cifra del canal en todo el sitio: ni los 4 millones de suscriptores, ni los 642 millones de vistas, ni los 11 años. Lo único medible es "2930 videos". |
| Marca El DoQmentalista | 6/10 | Paleta negro/dorado y Cinzel + Inter correctas. Pero el hero es texto sobre negro, sin la imagen del DoQ (el estilo gráfico dice que el protagonista siempre aparece), y el lema oficial "Trabajo desde las sombras, para servir a la luz" no está en la portada. El subtítulo usa la muletilla gastada "lo que nadie te contó de la Biblia". |
| Móvil (iPhone) | 7/10 | Sin scroll horizontal, botones de buen tamaño. La portada mide ~21,400 px en celular (unas 26 pantallas). |
| Señales de IA / descuido | 6/10 | Hero todo centrado. Títulos de sección sin acentos: "Ultimo documental", "Lo mas visto", "Lo mas reciente", "Sumergete en las sagas". Emojis solo los que traen algunos títulos de YouTube. |
| Enlaces rotos | 3/10 | El footer de la portada y los oráculos apunta a anclas que no existen: #hero, #expedientes, #faq, #sobre, #contacto ("Quién es El DoQ", "Prensa", "Colaboraciones", "Contacto" no llevan a ningún lado). `npm test` no los detecta porque ignora enlaces con #. |
| Velocidad | 7/10 | Portada ~1.1 MB transferidos, 47 imágenes. Sin medición de Lighthouse todavía. |
| SEO | 8/10 | Sitemaps, JSON-LD (VideoObject, Breadcrumb, FAQ), canónicas, transcripciones en 419 páginas. 1,850 páginas en noindex por falta de texto propio. |
| AEO (ChatGPT, Claude, Perplexity) | 2/10 | No hay llms.txt ni versiones Markdown; robots.txt permite todo pero no guía a los asistentes. |

**Promedio: 4.9 / 10**

## Arreglado en esta pasada (v1 → v1.1)
- AEO: `llms.txt`, `llms-full.txt` y una versión Markdown limpia por documental indexable.
- Acentos en los títulos de sección y enlaces del footer apuntando a páginas reales.

## Siguiente pasada (propuesta, pendiente de aprobación de Inri)
1. Prueba social en el hero y en "Quién es": 4 millones de suscriptores, 642 millones de vistas, desde 2015.
2. Hero con la imagen del DoQ, el lema oficial y CTA de suscripción visible en celular.
3. Página propia "Quién es El DoQmentalista" (voz de la Biblia de Voz, sin datos privados) con contacto para prensa y colaboraciones.
4. Subtítulo del sitio sin la muletilla "lo que nadie te contó".
5. Portada más corta en celular: menos tarjetas por sección.
6. `npm test` que detecte anclas rotas.
