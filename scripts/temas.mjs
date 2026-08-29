// Diccionario de temas del canal. Cada tema es un nombre visible + palabras que lo activan.
// Edita libremente: anade temas, quita, cambia nombres. Se aplica solo a videos SIN tags.
export const TEMAS = [
  ['Misterios de la Biblia', /biblia|biblic|evangeli|escritura|testamento|apocrifo|genesis|apocalipsis/i],
  ['Vaticano e Iglesia', /vaticano|papa\b|papal|iglesia|jesuit|opus dei|catolic|conclave|malaquias/i],
  ['Profecías', /profec|predijo|prediccion|baba vanga|nostradamus|vidente|anuncio.*futuro/i],
  ['Fin del mundo', /fin del mundo|apocalipsis|armagedon|ultimos tiempos|juicio final|rapto/i],
  ['Extraterrestres y OVNIs', /extraterrestre|alien|ovni|uap|nave|platillo|abduc|area 51|contacto.*espacio/i],
  ['Ángeles y demonios', /angel|arcangel|demonio|lucifer|satan|querubin|serafin|caidos/i],
  ['Exorcismos y posesiones', /exorcis|posei|posesion|endemoniad|rito.*expulsi/i],
  ['Ocultismo y esoterismo', /ocultis|esoter|masone|illuminati|ritual|magia|hermetic|cabala|logia/i],
  ['Paranormal', /paranormal|fantasma|espectro|encantad|poltergeist|aparicion|backrooms|leyenda/i],
  ['Arqueología y hallazgos', /arqueolog|excavaci|hallazgo|descubr.*tumba|reliquia|manuscrito|pergamino|sudario/i],
  ['Conspiraciones', /conspiraci|encubr|secreto.*gobierno|cia\b|nsa|documento.*clasificad|desclasific/i],
  ['Jesús y María', /jesus|cristo|maria|nazaret|calvario|resurrecc|crucifi/i],
  ['Protección espiritual', /proteccion|oracion|salmo|guerra espiritual|blindaje|sellar|limpieza espiritual/i],
];

const norm = (s = '') => s.normalize('NFD').replace(new RegExp('[\u0300-\u036f]','g'), '').toLowerCase();

export function clasificar(video, max = 3) {
  const texto = norm(`${video.title} ${video.title} ${(video.description || '').slice(0, 900)} ${(video.ytTags || []).join(' ')}`);
  const hits = [];
  for (const [nombre, re] of TEMAS) {
    const m = texto.match(new RegExp(re.source, 'gi'));
    if (m) hits.push({ nombre, peso: m.length });
  }
  return hits.sort((a, b) => b.peso - a.peso).slice(0, max).map((h) => h.nombre);
}
