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
- [~] data/lote-5.csv  (100 videos) — 95 publicados; los ~5 finales cayeron por cuota agotada (reintentar: el script ya salta los que estan al dia)

## Después de la cola

Generar lote 6+ siguiendo el pipeline documentado en la memoria
(proyecto-reempaque-youtube): ~2.058 pendientes en data/para-editar.csv
menos los ya publicados.

## Anotaciones

- Título pendiente: DU0YWfvohU4 → "Los 4 Jinetes del Apocalipsis: la advertencia que ya se cumple"
  (esperando fin de su Test & Compare).
- 10 IDs del lote 3 por verificar si existen (ver data/pendientes.md).

- 2026-08-31: FALSA ALARMA de videos muertos en lotes 3/5 — era cuota agotada, no borrado. La verificacion real de muertos queda pendiente (gastar ~4 unidades en videos.list por lotes de 50 ANTES de publicar el dia).
