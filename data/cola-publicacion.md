# Cola de publicación — re-empaque El DoQmentalista

Reglas para el publicador (sesión nocturna o manual):
1. Publicar EN ORDEN los CSV listados abajo con `node scripts/youtube-update.mjs <csv>`.
2. Si un CSV se publica completo, marcarlo [x] aquí y seguir con el siguiente hasta agotar cuota.
3. Al terminar: `npm run build`, commit y push (la web se sincroniza sola).
4. Fallos "no existe o no es tuyo" = video borrado: anotarlo abajo y quitarlo de data/videos.json.
5. Fallos "UPDATE_TITLE_NOT_ALLOWED_DURING_TEST_AND_COMPARE": publicar ese video sin título
   (columna NUEVO TITULO vacía en un mini-CSV) y anotar el título pendiente.
6. NUNCA usar --force ni tocar videos fuera de estos CSV.

## Cola

- [x] data/lote-4.csv  (100 videos) — publicado 2026-08-31 madrugada, 100/100
- [x] data/lote-3.csv  (100 videos) — 87 el 2026-08-30; los 13 restantes (fallos de cuota) el 2026-10-23. 100/100 verificado
- [x] data/lote-5.csv  (100 videos) — 96 el 2026-08-31; los 4 restantes el 2026-10-23. 100/100 verificado
- [x] data/lote-6.csv  (98 videos) — publicado 2026-10-23, 98/98 verificado. Primer lote con
      títulos-hook (docs/tutorial-hooks.md). Ojo: un videos.list justo después de publicar puede
      devolver los tags viejos (caché de YouTube); se resuelve solo en segundos. Fuera:
      -kuDeBAvVmE (borrado de YouTube, verificado con videos.list), ZT6rLYuRnLw (Osowiec 1915,
      Primera Guerra Mundial = línea roja), A5YeT2n5dKs (5.8 M vistas, no se toca),
      is2AZW8DgI0 (Himmler/nazi = línea roja)

## Después de la cola

Generar lote 6+ siguiendo el pipeline documentado en la memoria
(proyecto-reempaque-youtube): ~2.058 pendientes en data/para-editar.csv
menos los ya publicados.

## Anotaciones

- Título pendiente: DU0YWfvohU4 → "Los 4 Jinetes del Apocalipsis: la advertencia que ya se cumple"
  (esperando fin de su Test & Compare).
- ~~10 IDs del lote 3 por verificar si existen~~ Resuelto 2026-10-23: los 100 existen, eran fallos de cuota.
- 2026-10-23: youtube-update.mjs comparaba exacto y YouTube normaliza espacios y orden de tags,
  asi que daba "distinto" en videos ya publicados. Ahora compara normalizado: re-correr un lote
  solo publica lo que de verdad falta.

- 2026-08-31: FALSA ALARMA de videos muertos en lotes 3/5 — era cuota agotada, no borrado. La verificacion real de muertos queda pendiente (gastar ~4 unidades en videos.list por lotes de 50 ANTES de publicar el dia).
