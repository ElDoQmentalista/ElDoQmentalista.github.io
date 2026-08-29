---
name: design-bridge
description: Puente entre Figma y el código — extraer colores, tipografías, espaciados e imágenes SVG de un archivo de Figma, o llevar una página del sitio a Figma. Úsala cuando se comparta un enlace de figma.com o se pida maquetar un diseño, un rediseño o una miniatura.
---

# Figma ↔ código

El **MCP de Figma ya está conectado** en esta sesión (`mcp__*__get_figma_skill`,
`get_design_context`, `get_screenshot`, `use_figma`, `generate_figma_design`…). No hay nada
que instalar.

## Regla previa obligatoria

Antes de llamar a `use_figma`, carga primero la skill `/figma-use` (o
`skill://figma/figma-use/SKILL.md`). Está documentado en las instrucciones del servidor y
saltárselo produce resultados malos.

## De Figma a código

1. `get_metadata` para ver la estructura del archivo sin traerte todo.
2. `get_design_context` sobre el frame concreto, no sobre la página entera.
3. `get_screenshot` para tener la referencia visual al lado mientras maquetas.
4. **Traduce a los tokens que ya existen** en `src/styles.css`. Si Figma trae un
   `#C9A227`, eso es `var(--gold)`, no un literal nuevo. Si aparece un color que de verdad
   no existe en el sistema, se añade como variable en `:root`, nunca suelto.
5. Los iconos y adornos se bajan como SVG y se pegan **en línea** en el HTML: son unos pocos
   bytes y evitan una petición extra.

## De código a Figma

`generate_figma_design` para llevar una página ya construida a Figma cuando se quiera
rediseñar visualmente. Útil para probar variantes de portada sin tocar el generador.

## Lo que no se hace

- No se copia un diseño de Figma píxel a píxel si rompe el responsive. El diseño manda en
  intención; el mobile-first manda en ejecución.
- No se introducen fuentes nuevas por capricho del archivo de Figma: cada familia extra es
  una descarga más y el sitio vive de cargar rápido.
- No se pisa `src/styles.css` con una exportación automática de Figma. Se integra a mano.
