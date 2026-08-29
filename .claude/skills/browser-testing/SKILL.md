---
name: browser-testing
description: Revisar el sitio dentro de un navegador real — capturas, consola, red, responsive. Úsala después de cualquier cambio en el generador, el CSS o el JS, y siempre antes de decir que algo funciona o de publicar.
---

# Revisión en navegador

Las herramientas de navegador **ya están disponibles en esta sesión** (`mcp__Claude_Browser__*`).
No hay que instalar Puppeteer ni Playwright para esto.

## Rutina estándar tras un cambio

```bash
npm run dev
```

Levanta el sitio en http://localhost:4321. Luego, en el navegador:

1. `navigate` a la página afectada.
2. `computer{action:"screenshot"}` — **una captura es obligatoria antes de cualquier
   `scroll` o `left_click` por coordenadas**, porque las coordenadas se leen de ella.
3. `read_console_messages` con `onlyErrors: true`. Un error en consola es un fallo, no un
   detalle.
4. `resize_window` a `mobile` (375×812), recarga y vuelve a capturar. Devuelve a `desktop`
   al terminar.

## Páginas que hay que revisar siempre

Un cambio en el generador afecta a miles de páginas. Revisa una de cada tipo:

- `/` — portada
- `/v/<slug>/` — ficha de video (comprueba que el reproductor carga al hacer clic)
- `/tema/<slug>/` — página de tema
- `/temas/` — índice de temas
- una página de paginación, p. ej. `/pagina/2/`
- `/404.html`

## Trucos que ahorran tiempo

- Encadena varias acciones en un solo `browser_batch` (navegar → esperar → capturar).
- Para comprobar texto y estructura, `read_page` o `get_page_text` cuesta mucho menos que
  una captura. Usa capturas solo cuando lo que evalúas es visual.
- Para inspeccionar datos estructurados sin salir del navegador:
  `javascript_tool` con `[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent))`

## Lo que cuenta como "verificado"

Ver la página cargada, sin errores de consola, en móvil y en escritorio. Cualquier cosa
menos que eso se reporta como "no verificado", no como "listo".
