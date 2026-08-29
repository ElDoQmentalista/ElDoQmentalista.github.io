---
name: db-schema-prisma
description: Diseño de esquemas de base de datos con Prisma o Drizzle — modelos, migraciones, índices, seeding y seguridad. Úsala SOLO si este proyecto incorpora una base de datos real (login de usuarios, comentarios, suscripciones, panel de administración). Hoy el sitio no tiene base de datos.
---

# Base de datos

> **Estado en este proyecto: sin usar.** El sitio es estático y su "base de datos" es
> `data/videos.json`, un archivo plano que se regenera desde el CSV de YouTube. Mientras siga
> así, **no** introduzcas Prisma, Postgres ni ningún ORM: añadiría un servidor, un coste
> mensual y un punto de fallo a cambio de nada.

Esta skill entra en juego el día que haga falta guardar algo que un archivo no puede: cuentas
de usuario, comentarios, una lista de favoritos, un panel de administración.

## Cuándo sí

| Necesidad | Solución correcta |
|---|---|
| Buscar entre los videos | Índice JSON estático (lo que ya hay) |
| Contar visitas | Analítica (Plausible, GA4) |
| Comentarios | Servicio externo (Disqus) o entonces sí, base de datos |
| Cuentas / contenido privado / miembros | Base de datos + autenticación |

## Reglas si se llega a ese punto

1. **Elige por el caso, no por moda.** Contenido con relaciones → Postgres + Prisma.
   Edge/serverless con SQLite → Drizzle + Turso. Nada de MongoDB "porque es flexible".
2. **El esquema primero, el código después.** Define modelos, relaciones y restricciones en
   `schema.prisma` antes de escribir una consulta.
3. **Índices donde se filtra.** Toda columna que aparezca en un `where` o en un `orderBy` de
   una consulta frecuente lleva `@@index`. Con miles de videos, sin índice la página se cae.
4. **Migraciones versionadas y en git** (`prisma migrate dev` en local,
   `prisma migrate deploy` en producción). Nunca `db push` contra producción.
5. **Seed reproducible** en `prisma/seed.ts`, alimentado desde `data/videos.json`, para que
   cualquiera levante el entorno de cero.
6. **Seguridad desde el minuto uno:** nada de credenciales en el repo (van en `.env`, y
   `.env` en `.gitignore`); si es Supabase, **RLS activado en todas las tablas** — una tabla
   sin RLS es una tabla pública; valida toda entrada en el servidor (Zod), nunca confíes en
   la validación del formulario.
7. **Tipos derivados del esquema**, jamás escritos a mano en paralelo: si divergen, mienten.

## Antes de proponer una base de datos

Di en voz alta qué se guarda, quién lo escribe y quién lo lee. Si la respuesta es "datos que
solo yo edito y que todos leen igual", eso es un archivo estático, no una base de datos.
