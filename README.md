# El DoQmentalista — sitio web

Sitio estático (HTML puro, sin base de datos, sin servidor) con el archivo completo del
canal: una página propia por video, páginas de tema, las sagas, los tres oráculos y el
buscador. Se genera con Node y se publica en GitHub Pages.

---

## Los comandos

```bash
npm run dev
```
Construye y abre la vista previa en http://localhost:4321

```bash
npm run build
```
Genera el sitio completo en `dist/`. Eso es lo que se publica.

```bash
npm test
```
Verifica el sitio generado: enlaces rotos, títulos duplicados, datos estructurados,
sitemap, imágenes sin dimensiones. **Tiene que pasar antes de publicar.**

```bash
npm run import:csv -- "C:/ruta/al/export.csv"
```
Carga el catálogo desde el CSV de YouTube Studio / vidIQ.

```bash
npm run import
```
Actualiza con los videos nuevos vía el RSS del canal (los 15 más recientes). Es lo que hay
que correr cada vez que subes videos.

```bash
npm run import:sagas
```
Actualiza qué videos pertenecen a cada playlist. Necesita `YT_API_KEY` en `.env`.

---

## Qué hay publicado

| Ruta | Qué es |
|---|---|
| `/` | Portada: último documental, lo más visto, lo más reciente, sagas, oráculos, canales |
| `/videos/` | Archivo completo paginado (2.930 videos, 48 por página) |
| `/v/<slug>/` | Una página por video: reproductor, texto, temas, relacionados |
| `/sagas/` y `/saga/<slug>/` | Las 5 playlists, ordenadas |
| `/temas/` y `/tema/<slug>/` | 13 temas detectados automáticamente |
| `/herramientas/` | Los tres oráculos |
| `/herramientas/nombre-de-bruja/` | Oráculo del nombre de bruja o brujo |
| `/herramientas/animal-espiritual/` | Oráculo del animal espiritual |
| `/herramientas/angel-de-nacimiento/` | Oráculo de los 72 ángeles del Shem HaMephorash |
| `/canales/` | El universo DoQ: los cuatro canales |
| `/preguntas-frecuentes/` | FAQ con datos estructurados `FAQPage` |
| `/buscar/` | Buscador sobre los 2.930 videos (no se indexa, a propósito) |

---

## Lo que hay que saber sobre el contenido

**1.477 de tus videos tienen exactamente la misma descripción en YouTube** — el bloque que
empieza con "Sumérgete en el universo de El DoQmentalista…". Para Google eso es contenido
duplicado: si se publican 1.477 páginas con el mismo texto, no rankea ninguna y arrastra al
resto del sitio.

Cómo se resuelve aquí:

- El generador detecta ese bloque por frecuencia (una frase que aparece en 8 o más videos
  se considera plantilla) y lo aparta del texto que ve Google.
- **661 videos** tienen texto propio de verdad: esos van al sitemap y se indexan.
- El resto se publica igual, se puede ver y navegar, pero lleva `noindex` — existe para
  quien llega, no compite en Google.
- Los videos con título repetido (reediciones, directos) dejan indexable solo el de más
  vistas; los demás pasan a `noindex` para que no se canibalicen entre ellos.

**Cómo subir de 661 a varios miles de páginas indexadas** — por orden de esfuerzo:

1. Reescribir la descripción en YouTube de los videos que más te importen. En cuanto
   tengan texto propio, `npm run import` los detecta y pasan a indexables solos.
2. Editar el campo `description` directamente en `data/videos.json`.
3. Bajar las transcripciones automáticas de YouTube y usarlas como contenido de la página.
   Es la vía con más impacto: texto real, único y lleno de las palabras por las que la
   gente busca. Hay que construirlo, pero es lo que convertiría el sitio en una máquina
   de tráfico de cola larga.

Si prefieres indexarlo todo desde ya, pon `"indexarSinTextoPropio": true` en
`site.config.json`. Es tu decisión: más páginas indexadas, pero cada una más floja.

---

## Movimiento y comportamiento

Todo el movimiento del sitio es **CSS puro: cero librerias**. Es una decision, no una
limitacion — la mayoria de tu trafico es movil, y ahi una libreria de scroll suave (Lenis,
Locomotive) o un 3D con Three.js se nota en forma de tirones y bateria. Las animaciones
ligadas al scroll usan , que corre en el compositor del navegador: se
mueven suaves en un movil de gama media.

| Que hace | Como |
|---|---|
| Transicion entre paginas, sin recarga visible |  (3 lineas de CSS) |
| La miniatura que pulsas se convierte en el reproductor |  puesto al vuelo |
| La foto del narrador se aleja y se disuelve al bajar |  |
| Las tarjetas aparecen siguiendo tu dedo, escalonadas |  |
| Las miniaturas se revelan como una cortina |  animado con el scroll |
| Barra de progreso al leer un documental |  |
| Cabecera que se aparta al bajar y vuelve al subir | 20 lineas de JS |
| Menu de pantalla completa en movil | CSS + 25 lineas de JS |
| Tarjetas que se inclinan hacia el cursor, halo dorado | Solo con raton () |

**Nada de esto se activa con el dedo.** La inclinacion y el halo estan detras de
: en movil no existen, ni siquiera se calculan.

**Degrada solo.** Si el navegador no soporta , entra un
IntersectionObserver. Si tampoco, el contenido se ve normal desde el principio — nunca
queda nada invisible esperando un script que no llego.

** desactiva todo**, incluidas las transiciones de pagina. No es un
detalle: hay gente a la que este tipo de animacion le provoca mareo de verdad.

### De donde salio cada idea

-  — el objeto que se mueve con el scroll. Ellos usan Three.js + Lenis
  (~400 KB de JavaScript). Aqui la misma sensacion con una imagen y : 0 KB.
-  — no usa **ninguna** libreria de animacion. Su elegancia viene de la
  contencion: aire, tipografia fina, poco cromo. De ahi salio el menu movil a pantalla completa.
- ,  — el halo que sigue al cursor. Deliberadamente
  no se sustituye el cursor del sistema: estorba mas de lo que aporta.
-  — la calma. Se traduce en curvas de animacion lentas y sin rebotes.

---

## Publicar en GitHub Pages

El repositorio de destino es `eldoqmentalista/eldoqmentalista.github.io`. Se publica el
contenido de `dist/`.

```bash
npm run build
npm test
```

Y luego:

```bash
git add -A
git commit -m "Nuevo sitio: archivo completo, sagas, oraculos y SEO"
git push
```

> El sitio anterior de ese repositorio queda reemplazado. Del sitio viejo se conservan
> **los oráculos, las imágenes, los cuatro canales, las sagas y el archivo de verificación
> de Google Search Console** (`google89f14b601708673a.html`), que se copia a la raíz en
> cada build. Sin él perderías la verificación de Search Console.

### Conectar www.eldoqmentalista.com

El dominio sigue siendo tuyo y sus DNS apuntan a Wix (`ns2.wixdns.net`), pero **no hay
ningún sitio conectado**: hoy muestra la página de error de Wix. Para traerlo aquí:

1. Entra al panel de dominios de Wix (la compra del dominio es independiente del plan
   Premium; comprueba que no esté vencido).
2. Cambia los registros DNS a los de GitHub Pages:

| Tipo | Nombre | Valor |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | eldoqmentalista.github.io |

3. En GitHub: **Settings → Pages → Custom domain** → `www.eldoqmentalista.com`, y marca
   *Enforce HTTPS*.
4. En `site.config.json` cambia `site.domain` a `https://www.eldoqmentalista.com` y pon
   `build.cname` en `true`. Reconstruye y publica.

Hazlo **antes** de enviar el sitemap a Google, para no tener que pedir reindexación dos veces.

---

## Después de publicar (esto sí o sí)

1. **Google Search Console** — https://search.google.com/search-console
   Añade la propiedad y envía `sitemap.xml`. Sin esto Google tarda semanas; con esto, días.
2. **Bing Webmaster Tools** — https://www.bing.com/webmasters (se importa desde Search
   Console en un clic). Bing alimenta a ChatGPT y a Copilot.
3. **Enlaza cada video con su página**: en la descripción de YouTube, pon
   `https://www.eldoqmentalista.com/v/<slug>/`. Es la señal más fuerte y más barata que
   tienes, y además te trae tráfico de vuelta al canal.
4. Pon el sitio en los enlaces del perfil del canal y en tus redes.

### Expectativa realista

Para "El DoQmentalista", para los títulos exactos de tus videos y para los tres oráculos
("nombre de bruja", "ángel de nacimiento kabbalah", "animal espiritual") vas a posicionar
rápido: semanas, no meses. Para términos genéricos y peleados no hay técnica que dé el
primer puesto de inmediato; eso se gana con contenido, tiempo y enlaces.

---

## Seguridad: la API key

`AIzaSy…` estaba publicada en el `index.html` del repositorio anterior. Está restringida
por dominio (`eldoqmentalista.github.io`), así que el daño posible es limitado, pero una
restricción por referente se puede falsificar. En el sitio nuevo **la key ya no se publica**:
solo vive en `.env`, que está en `.gitignore`, y se usa únicamente al construir.

Recomendado: entra a Google Cloud Console → APIs y servicios → Credenciales, y **ponle un
límite de cuota diario**. Si alguna vez ves consumo raro, bórrala y crea otra.

---

## Estructura

```
site.config.json      Dominio, textos, canal, opciones de build
.env                  YT_API_KEY (no se sube a git)
data/videos.txt       Enlaces sueltos que quieras añadir a mano
data/videos.json      Base de datos del sitio (editable)
data/sagas.json       Qué videos tiene cada playlist
scripts/build.mjs     Genera el sitio
scripts/check.mjs     npm test
scripts/import*.mjs   Importadores (RSS, CSV, sagas)
scripts/temas.mjs     Diccionario de temas
src/                  CSS, JS, imágenes
src/partes/           Oráculos y secciones rescatados del sitio anterior
dist/                 Salida generada. Esto es lo que se publica.
.claude/skills/       Skills del proyecto (diseño, navegador, calidad, datos, Figma)
```
