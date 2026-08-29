---
name: frontend-design
description: Reglas de diseño UI/UX para todo lo visual de este proyecto. Úsala SIEMPRE que crees o modifiques una página, plantilla, componente, hoja de estilos o layout — incluyendo el generador de HTML en scripts/build.mjs y cualquier CSS en src/. También si se migra a React/Next.js más adelante.
---

# Diseño de interfaz

## Antes de escribir una línea

1. Lee `src/styles.css` y reutiliza los tokens que ya existen (`--gold`, `--card`, `--line`,
   `--font-display`, `--font-body`). **Nunca** metas un color en crudo (`#333`, `white`) si
   ya hay una variable para ese rol.
2. Este sitio es HTML + CSS a mano, sin framework. No introduzcas Tailwind, React, ni una
   dependencia de build sin que el usuario lo pida: rompería la ventaja principal del sitio,
   que es cargar instantáneo.

## Identidad de este proyecto

Documental de misterio / ocultismo. La estética es **negro profundo con oro**, no "startup
azul". Concretamente:

- Fondo `--bg` casi negro, superficies `--card` apenas más claras, bordes `--line` sutiles.
- Un solo acento: oro (`--gold` / `--gold-soft`). No añadas un segundo color de acento.
- Titulares en `--font-display` (Cinzel, serif con carácter). Texto corrido en `--font-body`
  (Inter). Los títulos largos van en la fuente de cuerpo: Cinzel en un párrafo de 3 líneas
  es ilegible.
- La miniatura del video es el elemento visual protagonista. El diseño la enmarca, no compite
  con ella.

## Reglas que no se negocian

- **Mobile-first real.** Prueba a 375 px antes de darlo por bueno. Nada puede desbordar
  horizontalmente. El `<body>` nunca hace scroll lateral.
- **Toda imagen lleva `width`, `height` y `loading="lazy"`** (salvo la primera pantalla, que
  va `fetchpriority="high"`). Sin esto el layout salta y Google penaliza (CLS).
- **Contraste AA mínimo** (4.5:1 en texto normal). El gris `--muted` sobre `--bg` está al
  límite: no lo uses para texto largo, solo para metadatos.
- **Foco visible siempre** (`:focus-visible`). Nunca `outline: none` sin reemplazo.
- **Respeta `prefers-reduced-motion`**: las animaciones se desactivan, no se atenúan.
- Áreas táctiles de 44×44 px como mínimo.
- Nada de scripts de terceros ni fuentes externas más allá de Google Fonts ya declarado.

## Microinteracciones

Sutiles y baratas: `transform: scale(1.04)` en la miniatura al pasar el ratón, cambio de
color de borde, nada más. Sin librerías de animación. Si algún día se migra a React, ahí sí
Framer Motion, pero solo para transiciones de página.

## Verificación obligatoria

No des un cambio visual por terminado sin haberlo mirado. Levanta la vista previa
(`npm run dev`) y toma capturas a **375 px y a escritorio** con las herramientas de
navegador. Si no lo viste, no está hecho.
