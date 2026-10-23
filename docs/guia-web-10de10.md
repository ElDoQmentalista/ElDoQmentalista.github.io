# Guía para Claude Code: web 10/10 (skills de diseño + Claude Design + referencias + SEO/AEO) para El DoQmentalista

Fuente: "This One Claude Skill Made My Website a 10/10", de Connor Davis | AI Agents (YouTube, 21 oct 2026, 10:43). https://www.youtube.com/watch?v=tztT3Cej2Y8
Material local: `/workspace/videos/estudio-tztT3Cej2Y8/` (video.mp4, transcript.txt, meta.info.json).
Complementa a `/workspace/edqm/claude-code-diseno-animacion.md` (allí están las 5 señales de slop, el bucle de 3 críticos, el sistema de diseño EDQM propuesto, la estructura de carpetas y la parte de motion graphics; aquí no se repiten).

- **Parte A: Lo que enseña el video** (solo lo dicho en audio o descripción).
- **Parte B: Adaptación a El DoQmentalista** (nuestra, no viene del video).

---

## Parte A: Lo que enseña el video

### A.0 Contexto
- Su web (hecha con Lovable en 2025) era un 3/10; tras 4 pasos la dejó en 10/10. En 30 días: visitas +74 %, páginas vistas +46 % (según su analítica).
- Todo corre sobre **Claude Opus 5.5**, que él considera el mejor modelo para diseño (dice que Opus 5 lo hacía "bien", Opus 5.5 mucho mejor). En la demo lo pone en esfuerzo "high".
- Una skill es "básicamente un prompt o un archivo tipo CLAUDE.md que conectas a cualquier sesión"; funciona en Claude Code, Codex y Claude.

### A.1 Paso 1: Skills de diseño (gratuitas)
Lista recomendada (nombres según la descripción del video):
1. **Taste**: referencias y reglas para pasar de web "AI slop" a algo bueno.
2. **UI/UX Pro Max**: de las primeras populares; "ya no es tan buena" pero aporta marcos sobre patrón, estilo y colores.
3. **Awesome DESIGN.md**: otro marco de diseño.
4. **Impeccable**: "un montón" de skills, referencias, imágenes de referencia y guías.
5. **Skills de diseño de Emil Kowalski**: su guía de referencia para diseñar como él.
6. **Vercel web design guidelines** (skill de agente de Vercel).
Se combinan; cada una cubre un aspecto. Resultado solo con skills: web bonita pero "sosa, se nota vibe-coded".

### A.2 Paso 2: Claude Design antes de programar
- Usar **Claude Design** para crear el brief/sistema de diseño antes de construir, y luego pasarlo a Claude Code (que puede referenciar Claude Design).
- Resultado skills + Claude Design: mucho más limpio y "como mi marca" (integraciones, precios, testimonios, FAQ).

### A.3 Paso 3: Sitios de referencia
- **Mobbin** (de pago): ~600,000 diseños de webs y apps, conectado mediante un **MCP** para que Claude consulte webs profesionales (presupuestos de 10k-100k USD), incluso de tu nicho/competencia, y mezcle lo mejor. Fue "el mayor salto": "las skills quitan el slop, Claude Design lo hace de mi marca, las referencias lo hacen parecer de 100,000 dólares".
- Otros: **Awwwards** (webs premiadas), **21st.dev** ("de los clásicos"; si no funciona, pasar a Mobbin) y uno que el audio transcribe como "Recent Design", útil para motion graphics (nombre exacto no confirmado).
- Claude mezcló aspectos de varias webs de referencia (empresas del sector de agentes de voz) en un "Frankenstein" que funcionó.

### A.4 Lo que dejó fuera a propósito
- Animaciones de scroll tipo video (las de Higgsfield, la web cambia al hacer scroll): "geniales en teoría, pero disparan la tasa de rebote".

### A.5 Paso 4 (bonus): SEO + AEO
- AEO = answer engine optimization: que ChatGPT o Claude recomienden tu negocio. La skill genera `llms.txt`, archivos Markdown para IA y `robots.txt`.

### A.6 La skill única "10/10 Website Builder"
- Junta los 4 pasos: **scorecard, reglas de diseño, bucle de feedback y SEO/AEO**. Le das tu web, la puntúa, la reconstruye, la vuelve a puntuar e itera hasta que esté perfecta. Una ejecución completa tarda ~1 h (30-60 min).
- Fallos detectados en su web vieja: sin llamada a la acción clara, sin prueba social con nombres concretos, aspecto de IA (emojis, todo centrado), fuera de marca, mal en iPhone.
- Se descarga gratis en su comunidad de Skool (Classroom > Resources > 10/10 Website Builder Skill). El contenido de la skill no se muestra.

### A.7 Publicar
1. Crear repo **privado** en GitHub; copiar URL (recomienda HTTPS, más fácil que SSH) y pedir a Claude Code que haga push.
2. En **Vercel** (cuenta gratis sirve) importar el repo y desplegar.
3. Vercel > Domains > añadir dominio; en el proveedor DNS añadir registro **A** para el dominio raíz y **CNAME** para `www` (Vercel indica los valores).
- Lo repitió con la web de un amigo (CFive) y la publicaron el mismo día, casi en un solo intento.

---

## Parte B: Adaptación a El DoQmentalista

### B.1 Qué tomamos
- El orden: skills de diseño, luego Claude Design (brief), luego referencias, luego SEO/AEO, luego puntuar e iterar. Combinar con el bucle de 3 críticos y el sistema de diseño de la otra guía.
- La regla anti-rebote: nada de scroll-video pesado en la home; animación sobria (coherente con el motion definido en la otra guía).
- Para el canal, el AEO es clave: que ChatGPT/Claude recomienden "El DoQmentalista" cuando alguien pregunte por documentales de misterio en español.

### B.2 Sección para pegar en CLAUDE.md (añadir a la de la otra guía)
```markdown
## Web 10/10 (proceso obligatorio)
Modelo: el Opus más reciente disponible, esfuerzo alto.
Skills de diseño instaladas en .claude/skills/: taste, ui-ux-pro-max, awesome-design-md, impeccable, emil-kowalski-design, vercel-web-design-guidelines. Úsalas cuando apliquen.

1. SCORECARD inicial (0-10) de la web actual en: llamada a la acción clara, prueba social concreta (cifras reales del canal, prensa, colaboraciones), marca EDQM, móvil (iPhone), señales de IA (emojis, todo centrado, rejillas genéricas), velocidad, SEO, AEO. Guarda en criticas/scorecard-v1.md.
2. BRIEF: usa el sistema de diseño de design-system/ (o el exportado de Claude Design) antes de escribir código.
3. REFERENCIAS: consulta Mobbin (MCP si está conectado), Awwwards o 21st.dev; elige 3 referencias de webs de cine documental, plataformas de streaming o medios editoriales oscuros. Explica qué tomas de cada una.
4. CONSTRUYE y vuelve a puntuar. Itera (con el bucle de 3 críticos) hasta 10/10 o 4 iteraciones.
5. SEO/AEO: metadatos y Open Graph en español, schema.org (Organization, Person para Inri David Hernández, VideoObject por documental), sitemap.xml, robots.txt, llms.txt y páginas Markdown limpias por documental.
- Prohibido: animaciones de scroll tipo video en la home, emojis decorativos, todo centrado.
```

### B.3 Flujo paso a paso
1. Instalar las 6 skills (buscar sus repos públicos; verificar URLs, el video no las da en audio).
2. Claude Design: pedir el brief con la identidad EDQM (ver otra guía, B.2) y exportarlo al repo.
3. Si hay suscripción a Mobbin, conectar su MCP; si no, capturas de Awwwards/21st.dev en `design-system/referencias/`.
4. Prompt: "Puntúa [web actual o maqueta] con el scorecard de CLAUDE.md, luego reconstrúyela para El DoQmentalista: home con documental destacado, categorías, archivo de videos, sobre Inri, patrocinios/contacto. Vuelve a puntuar e itera hasta 10/10."
5. Prompt AEO: "Genera llms.txt, robots.txt, sitemap y una página Markdown por documental con título, resumen, fecha y enlace de YouTube."
6. GitHub privado, luego push desde Claude Code, después Vercel y dominio (A en la raíz + CNAME www).
7. Medir visitas antes/después, como en el video.

### B.4 Para diseños y videos
- El video solo trata webs. Lo trasladable: usar referencias de alto presupuesto (y la fuente de motion graphics mencionada) como benchmark para títulos y lower thirds, y el scorecard antes/después aplicado a miniaturas y gráficos. El flujo de animación está en la otra guía.

---

## Pendiente / revisión visual
- URLs y repos exactos de cada skill (aparecen en pantalla ~0:58-3:07).
- Nombre real de "Recent Design" (fuente de motion graphics, ~4:30) y de las webs de referencia usadas ("Victor", "Vappy", "Retail" en la transcripción automática, probablemente marcas de agentes de voz).
- El audio dice "el equipo de Balsamiq" como autor de skills; no confirmado en la descripción.
- El contenido de la skill 10/10 está solo en Skool (no accesible).
