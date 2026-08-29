  // ============ TOAST (reemplaza alert) ============
  let _toastTimer = null;
  function showToast(message, type) {
    const t = document.getElementById('doqToast');
    if (!t) { return; }
    t.textContent = message;
    t.className = 'doq-toast';
    if (type) t.classList.add('toast-' + type);
    // Forzar reflow
    void t.offsetWidth;
    t.classList.add('is-visible');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
      t.classList.remove('is-visible');
    }, 3000);
  }

  /* ============================================================
     ORACLE: NOMBRE DE BRUJA — v3 simplificado y robusto
     ============================================================ */

  // Estado del oráculo
  var oracleState = {
    day: null, month: null, year: null,
    color: null, element: null, gender: null,
    zodiac: null, lifePath: null,
    lastResult: null,
    currentStep: 1
  };

  // Cálculo del zodiaco
  function oracleZodiac(day, month) {
    var d = parseInt(day), m = parseInt(month);
    if ((m == 3 && d >= 21) || (m == 4 && d <= 19)) return 'aries';
    if ((m == 4 && d >= 20) || (m == 5 && d <= 20)) return 'tauro';
    if ((m == 5 && d >= 21) || (m == 6 && d <= 20)) return 'geminis';
    if ((m == 6 && d >= 21) || (m == 7 && d <= 22)) return 'cancer';
    if ((m == 7 && d >= 23) || (m == 8 && d <= 22)) return 'leo';
    if ((m == 8 && d >= 23) || (m == 9 && d <= 22)) return 'virgo';
    if ((m == 9 && d >= 23) || (m == 10 && d <= 22)) return 'libra';
    if ((m == 10 && d >= 23) || (m == 11 && d <= 21)) return 'escorpio';
    if ((m == 11 && d >= 22) || (m == 12 && d <= 21)) return 'sagitario';
    if ((m == 12 && d >= 22) || (m == 1 && d <= 19)) return 'capricornio';
    if ((m == 1 && d >= 20) || (m == 2 && d <= 18)) return 'acuario';
    return 'piscis';
  }

  // Numerología
  function oracleLifePath(day, month, year) {
    var sum = String(day).split('').reduce(function(a,b){return a+parseInt(b);},0) +
              String(month).split('').reduce(function(a,b){return a+parseInt(b);},0) +
              String(year).split('').reduce(function(a,b){return a+parseInt(b);},0);
    var n = sum;
    while (n > 9) {
      n = String(n).split('').reduce(function(a,b){return a+parseInt(b);},0);
    }
    return n;
  }

  // Banco de nombres
  // Nombres curados: sonido claramente masculino/femenino/neutro
  var NAME_ROOTS = {
    tierra: {
      femenino: ['Vesna','Selvae','Olmara','Terrae','Gaiana','Roana','Nyrea','Adira','Mirena','Hierba','Brisana','Yara','Itzae','Ananya','Liriah'],
      masculino: ['Korven','Selvar','Olmaro','Terrón','Garan','Roen','Nyron','Adrián','Mireno','Sabel','Brisán','Yarán','Itzán','Petrón','Liriam'],
      neutro: ['Vesni','Selvai','Olmen','Terrai','Gaïa','Roen','Nyre','Adiri','Miren','Sabri','Brisén','Yarë','Itzë','Ananí','Lirian']
    },
    aire: {
      femenino: ['Aëra','Sylvana','Brisena','Velina','Aurelia','Wrenia','Thalira','Naima','Zerah','Liana','Citlali','Iriana','Mahari','Cendra','Aelia'],
      masculino: ['Aëron','Sylvan','Briseno','Velón','Aurelio','Wrenian','Thalir','Naïm','Zeran','Liano','Citlan','Irián','Mahar','Cendren','Aelius'],
      neutro: ['Aëri','Sylven','Brisen','Velin','Aureï','Wrenë','Thaliê','Naimë','Zerai','Liani','Citlë','Irië','Mahrë','Cendrë','Aelan']
    },
    fuego: {
      femenino: ['Xolana','Ignia','Pyrrha','Astaria','Roxana','Vermelha','Aksana','Saraïa','Brixa','Tlalli','Émberis','Cendria','Nirah','Solára','Kira'],
      masculino: ['Xolán','Igneo','Pyrrhos','Astar','Roxán','Vermo','Aksán','Saraïm','Brixán','Tlaltzín','Émbero','Cendrar','Niraël','Solar','Kirán'],
      neutro: ['Xolé','Ignë','Pyrë','Astaë','Roxai','Vermë','Aksaë','Saraï','Brixë','Tlalï','Émberë','Cendrei','Nirë','Solaï','Kiraë']
    },
    agua: {
      femenino: ['Morwenna','Naïsa','Liraea','Undina','Maraïa','Selené','Avalonia','Riena','Atlanea','Coyolxia','Thessa','Marenya','Yorena','Lyssa','Aquilea'],
      masculino: ['Morwen','Naïsen','Liraen','Undón','Maraïn','Selén','Avalon','Riano','Atlán','Coyol','Thessen','Mareno','Yoren','Lysso','Aquilo'],
      neutro: ['Morwë','Naïsi','Lirë','Undë','Maraë','Selë','Avalë','Rienë','Atlae','Coyë','Thessë','Marenë','Yorë','Lyssë','Aquilë']
    }
  };

  // Epítetos por zodiaco — TONO EMPODERADOR, sin elementos oscuros gratuitos
  // Tres opciones por signo: una neutra (sin género), una femenina, una masculina
  var EPITETOS = {
    aries:       { neutro: 'El Filo del Alba',       femenino: 'La Llamada del Amanecer',  masculino: 'El Heredero del Fuego' },
    tauro:       { neutro: 'La Raíz del Bosque',     femenino: 'La Voz de la Tierra',      masculino: 'El Guardián del Roble' },
    geminis:     { neutro: 'La Dualidad Sagrada',    femenino: 'La Tejedora de Caminos',   masculino: 'El Mensajero del Viento' },
    cancer:      { neutro: 'El Espejo de la Luna',   femenino: 'La Hija del Mar Sereno',   masculino: 'El Guardián de las Mareas' },
    leo:         { neutro: 'El Corazón Solar',       femenino: 'La Llama Soberana',        masculino: 'El León de la Corona' },
    virgo:       { neutro: 'La Letra Sagrada',       femenino: 'La Escriba del Templo',    masculino: 'El Sabio de la Hoja' },
    libra:       { neutro: 'El Equilibrio Eterno',   femenino: 'La Voz de la Balanza',     masculino: 'El Juez de las Estrellas' },
    escorpio:    { neutro: 'La Transformación',      femenino: 'La Que Renace del Fuego',  masculino: 'El Maestro del Renacer' },
    sagitario:   { neutro: 'La Flecha del Horizonte',femenino: 'La Cazadora de la Verdad', masculino: 'El Arquero del Trueno' },
    capricornio: { neutro: 'La Cumbre Antigua',      femenino: 'La Guardiana del Tiempo',  masculino: 'El Señor de la Montaña' },
    acuario:     { neutro: 'El Faro del Mañana',     femenino: 'La Portadora del Río',     masculino: 'El Visionario del Trueno' },
    piscis:      { neutro: 'El Velo de los Sueños',  femenino: 'La Soñadora del Mar',      masculino: 'El Profeta de la Niebla' }
  };

  // Colores: tono empoderador, sin referencias morbidas
  var COLOR_LORE = {
    negro:   { palabra: 'misterio',  esencia: 'el secreto que da fuerza' },
    rojo:    { palabra: 'pasión',    esencia: 'la llama que enciende el alma' },
    purpura: { palabra: 'magia',     esencia: 'el umbral entre los mundos' },
    verde:   { palabra: 'vida',      esencia: 'la fuerza que florece' },
    azul:    { palabra: 'profundidad', esencia: 'la sabiduría de las aguas' },
    dorado:  { palabra: 'luz',       esencia: 'el sol que nunca se apaga' },
    blanco:  { palabra: 'pureza',    esencia: 'la memoria de las estrellas' }
  };

  // Elementos: tono empoderador
  var ELEMENT_LORE = {
    tierra: { sustantivo: 'tierra', verbo: 'respira', cualidad: 'milenaria', invocacion: 'por las raíces que sostienen al mundo' },
    aire:   { sustantivo: 'viento', verbo: 'canta',   cualidad: 'antigua',   invocacion: 'por los vientos que viajan sin límite' },
    fuego:  { sustantivo: 'fuego',  verbo: 'ilumina', cualidad: 'ancestral', invocacion: 'por la llama que despierta al espíritu' },
    agua:   { sustantivo: 'agua',   verbo: 'fluye',   cualidad: 'profunda',  invocacion: 'por las aguas que guardan la memoria' }
  };

  // Prefijos opcionales por número
  var PREFIX = {
    1:['','Sol-','Ar-'], 2:['Lun-','Mor-',''], 3:['Tri-','','Vel-'],
    4:['','Quart-','Her-'], 5:['','Pent-','Vey-'], 6:['Hex-','','Ser-'],
    7:['','Sep-','Mys-'], 8:['','Och-','Vor-'], 9:['','Nov-','En-']
  };

  var ZODIAC_LABEL = {
    aries:'♈ Aries', tauro:'♉ Tauro', geminis:'♊ Géminis', cancer:'♋ Cáncer',
    leo:'♌ Leo', virgo:'♍ Virgo', libra:'♎ Libra', escorpio:'♏ Escorpio',
    sagitario:'♐ Sagitario', capricornio:'♑ Capricornio', acuario:'♒ Acuario', piscis:'♓ Piscis'
  };

  // Bancos de significados — frases neutras de género, con variación
  // 5 versiones por elemento. Se selecciona según día+mes para variar
  var SIGNIFICADOS = {
    tierra: [
      'Alguien con raíces profundas que sostiene a quienes la rodean. Tu fuerza es paciente, y tu paso firme abre caminos donde otros ven obstáculos.',
      'Una presencia serena con la calma de la montaña. Sabes esperar, sabes construir, y lo que tocas se vuelve duradero.',
      'Tu naturaleza es la del bosque: silenciosa por fuera, viva por dentro. Hay sabiduría en tu paciencia, y poder en tu constancia.',
      'Caminas con los pies en la tierra y la mirada en lo que importa. Eres refugio para los que se sienten perdidos.',
      'Tu fuerza nace de lo simple. Eres alguien que florece donde otros se rinden, porque entiendes el tiempo de las raíces.'
    ],
    aire: [
      'Alguien que piensa antes de hablar, y cuando habla, los demás escuchan. Tu mente vuela alto y tu palabra tiene peso.',
      'Una mente curiosa que no se queda en un solo lugar. Vas tejiendo ideas como quien siembra estrellas, y donde pasas, dejas chispas.',
      'Tu inteligencia es libre como el viento. Cuestionas lo que otros aceptan, y por eso ves lo que muchos no alcanzan a mirar.',
      'Alguien que escucha con todo el cuerpo. Tu intuición se mueve rápido, y tu voz tiene el poder de despertar a otros.',
      'Eres puente entre mundos. Tu palabra abre caminos, y tu mente vuela donde el cuerpo no puede llegar.'
    ],
    fuego: [
      'Alguien con una chispa imposible de apagar. Donde llegas, las cosas se mueven, y tu pasión despierta lo dormido en los demás.',
      'Tu energía enciende cuartos enteros. Eres de quienes no se conforman, y por eso transforman lo que tocan.',
      'Llevas dentro un sol pequeño. Hay coraje en tu paso y calor en tu mirada. La gente busca tu fuego cuando el suyo se apaga.',
      'Alguien valiente que no le teme al cambio. Tu fuerza arde clara, y tu presencia inspira a los que dudan.',
      'Tu corazón late con la intensidad de una hoguera. Eres alma de líder, aunque no busques liderar.'
    ],
    agua: [
      'Alguien con una intuición profunda que rara vez se equivoca. Sientes lo que otros no ven, y por eso ayudas sin que te pidan.',
      'Tu sensibilidad es tu superpoder. Lees el alma de los demás como quien lee un libro abierto, y eso te hace inolvidable.',
      'Eres alguien que fluye con la vida. No te rompes: te adaptas, te transformas, y siempre encuentras tu camino al mar.',
      'Tu corazón es ancho y hondo. Quien te conoce de verdad, recibe un regalo que no sabe nombrar.',
      'Alguien con una memoria emocional única. Recuerdas, sientes, comprendes. Por eso eres ancla para quienes amas.'
    ]
  };

  // Frases poéticas — reemplazan la "invocación ritual"
  // 5 versiones por elemento + color (combinatoria amplia)
  var FRASES = {
    tierra: [
      'Donde otros buscan tormentas, yo planto silencio.',
      'No camino rápido, camino siempre. Esa es mi forma de ganar.',
      'Lo que tengo lo he construido piedra por piedra, y nadie puede quitármelo.',
      'Soy paciencia hecha persona. El mundo gira; yo permanezco.',
      'En mi pecho hay un bosque, y en el bosque hay un secreto que nadie conoce.'
    ],
    aire: [
      'Mi mente vuela donde el miedo no se atreve a ir.',
      'Las palabras que pronuncio cambian el clima del cuarto.',
      'No me retienen las paredes; soy aire que cruza ventanas.',
      'Hay quien busca respuestas; yo busco mejores preguntas.',
      'Si me escuchan con atención, descubrirán que hablo en clave.'
    ],
    fuego: [
      'Lo que me apaga me convierte. Por eso sigo encendido.',
      'No pido permiso para arder. Quien quiera calor, que se acerque.',
      'Tengo el sol metido en el pecho, y lo reparto sin perder brillo.',
      'Cuando el mundo se pone frío, yo me convierto en hoguera.',
      'No conozco el invierno: conmigo siempre es solsticio.'
    ],
    agua: [
      'Lo que parece debilidad es profundidad. Lo sabré tarde o temprano.',
      'Soy quien recuerda lo que los demás eligen olvidar.',
      'Mi forma cambia, mi esencia no. Por eso llego siempre al mar.',
      'En mí caben muchas tormentas, y aún así, mi superficie es serena.',
      'Hay un océano dentro de mí, y a veces se asoma por los ojos.'
    ]
  };

  // Cierres poéticos para la frase (variación adicional)
  var CIERRES = {
    negro:   'Y eso es lo que me da fuerza.',
    rojo:    'Y eso es lo que me hace vibrar.',
    purpura: 'Y eso es lo que me hace distinto.',
    verde:   'Y eso es lo que me mantiene vivo.',
    azul:    'Y eso es lo que me hace profundo.',
    dorado:  'Y eso es lo que me hace brillar.',
    blanco:  'Y eso es lo que me hace recordar.'
  };

  // === ABRIR / CERRAR MODAL ===
  function openWitchTool() {
    var modal = document.getElementById('oracleModal');
    if (!modal) return;
    // Guardar posición de scroll actual antes de abrir
    window.__scrollY_oracle = window.scrollY || window.pageYOffset || 0;
    modal.classList.add('is-open');
    // Bloqueo robusto: clase en html y body
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    // Compensar el salto visual del position:fixed
    document.body.style.top = '-' + window.__scrollY_oracle + 'px';
    oracleReset();
    // Resetear scroll interno del modal al inicio
    modal.scrollTop = 0;
    var inner = modal.querySelector('.oracle-modal-inner');
    if (inner) inner.scrollTop = 0;
  }

  function oracleClose() {
    var modal = document.getElementById('oracleModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    // Restaurar scroll a donde estaba
    var y = window.__scrollY_oracle || 0;
    window.scrollTo(0, y);
  }

  // === RESET ===
  function oracleReset() {
    oracleState.day = null; oracleState.month = null; oracleState.year = null;
    oracleState.color = null; oracleState.element = null; oracleState.gender = null;
    oracleState.zodiac = null; oracleState.lifePath = null; oracleState.lastResult = null;

    // Limpiar campos
    var el;
    el = document.getElementById('oDay'); if (el) el.value = '';
    el = document.getElementById('oMonth'); if (el) el.value = '';
    el = document.getElementById('oYear'); if (el) el.value = '';

    // Limpiar selecciones
    var picked = document.querySelectorAll('.picked');
    for (var i = 0; i < picked.length; i++) picked[i].classList.remove('picked');

    // Deshabilitar botones
    el = document.getElementById('oBtn2'); if (el) el.disabled = true;
    el = document.getElementById('oBtn3'); if (el) el.disabled = true;
    el = document.getElementById('oBtnInvoke'); if (el) el.disabled = true;

    // Ir al paso 1
    oracleGoto(1);
  }

  // === NAVEGACIÓN ===
  // step puede ser 1,2,3,4 o 'loading' o 'result'
  function oracleGoto(step) {
    // Ocultar todos los panes
    var panes = document.querySelectorAll('.oracle-pane');
    for (var i = 0; i < panes.length; i++) {
      panes[i].classList.remove('oracle-pane-active');
    }

    // Mostrar el solicitado
    var paneId;
    if (step === 'loading') paneId = 'paneLoading';
    else if (step === 'result') paneId = 'paneResult';
    else paneId = 'pane' + step;

    var pane = document.getElementById(paneId);
    if (pane) {
      pane.classList.add('oracle-pane-active');
    }

    // Actualizar dots solo para pasos numéricos
    var dots = document.querySelectorAll('.oracle-progress .dot');
    for (var j = 0; j < dots.length; j++) {
      dots[j].classList.remove('dot-active', 'dot-done');
      var num = j + 1;
      if (typeof step === 'number') {
        if (num < step) dots[j].classList.add('dot-done');
        else if (num === step) dots[j].classList.add('dot-active');
      }
    }

    // Scroll al top
    var modal = document.getElementById('oracleModal');
    if (modal) modal.scrollTop = 0;

    oracleState.currentStep = step;
  }

  // === PASO 1 → 2 (validar fecha) ===
  function oracleStep1Next() {
    var d = parseInt(document.getElementById('oDay').value);
    var m = parseInt(document.getElementById('oMonth').value);
    var y = parseInt(document.getElementById('oYear').value);

    if (!d || !m || !y || d < 1 || d > 31 || y < 1900 || y > 2026) {
      showToast('Completa tu fecha de nacimiento');
      return;
    }

    oracleState.day = d;
    oracleState.month = m;
    oracleState.year = y;
    oracleState.zodiac = oracleZodiac(d, m);
    oracleState.lifePath = oracleLifePath(d, m, y);

    oracleGoto(2);
  }

  // === SELECCIONES ===
  function oraclePickColor(btn) {
    var all = document.querySelectorAll('.oracle-color');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('picked');
    btn.classList.add('picked');
    oracleState.color = btn.getAttribute('data-color');
    document.getElementById('oBtn2').disabled = false;
  }

  function oraclePickElement(btn) {
    var all = document.querySelectorAll('.oracle-el');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('picked');
    btn.classList.add('picked');
    oracleState.element = btn.getAttribute('data-element');
    document.getElementById('oBtn3').disabled = false;
  }

  function oraclePickGender(btn) {
    var all = document.querySelectorAll('.oracle-gen');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('picked');
    btn.classList.add('picked');
    oracleState.gender = btn.getAttribute('data-gender');
    document.getElementById('oBtnInvoke').disabled = false;
  }

  // === GENERAR NOMBRE ===
  function oracleGenerate() {
    var s = oracleState;
    var roots = NAME_ROOTS[s.element][s.gender];
    var seed = (s.day + s.month + s.year) % roots.length;
    var name = roots[seed];

    // Prefijo opcional según número
    var prefOpts = PREFIX[s.lifePath] || [''];
    var pref = prefOpts[s.day % prefOpts.length];
    if (pref) {
      name = pref + name.toLowerCase();
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Epíteto del zodiaco según género
    var epiObj = EPITETOS[s.zodiac];
    var epi = epiObj[s.gender] || epiObj.neutro;

    // SIGNIFICADO — banco sin género, con variación
    // Se elige según día+mes para que varíe entre personas pero sea estable para la misma
    var signs = SIGNIFICADOS[s.element];
    var signIdx = (s.day + s.month) % signs.length;
    var meaning = signs[signIdx];

    // FRASE PERSONAL — banco neutro + cierre por color
    // Se elige según día+año para variar
    var frases = FRASES[s.element];
    var fraseIdx = (s.day + s.year) % frases.length;
    var frase = frases[fraseIdx];
    var cierre = CIERRES[s.color];
    var ritual = '"' + frase + ' ' + cierre + '"';

    // META
    var meta = ZODIAC_LABEL[s.zodiac] + ' · NÚMERO ' + s.lifePath + ' · ' + s.element.toUpperCase() + ' · ' + s.color.toUpperCase();

    return { name: name, epiteto: epi, meaning: meaning, ritual: ritual, meta: meta };
  }

  // === INVOCAR ===
  function oracleInvoke() {
    oracleGoto('loading');

    var mantras = [
      'El círculo escucha tu fecha...',
      'Los astros responden a tu llamado...',
      'El color revela tu esencia...',
      'Tu nombre emerge del silencio...',
      'El oráculo afina la voz...'
    ];
    var idx = 0;
    var mEl = document.getElementById('oMantra');
    if (mEl) mEl.textContent = mantras[0];

    var interval = setInterval(function() {
      idx = (idx + 1) % mantras.length;
      if (mEl) {
        mEl.style.opacity = '0';
        setTimeout(function() {
          mEl.textContent = mantras[idx];
          mEl.style.opacity = '1';
        }, 400);
      }
    }, 900);

    setTimeout(function() {
      clearInterval(interval);
      var r = oracleGenerate();
      oracleState.lastResult = r;

      var set = function(id, txt) {
        var el = document.getElementById(id);
        if (el) el.textContent = txt;
      };
      set('oName', r.name);
      set('oEpi', r.epiteto);
      set('oMeaning', r.meaning);
      set('oRitual', r.ritual);
      set('oMeta', r.meta);

      oracleGoto('result');
    }, 3000);
  }

  // === COMPARTIR ===
  function oracleShare() {
    if (!oracleState.lastResult) return;
    var r = oracleState.lastResult;
    var text = 'Mi nombre de bruja es ' + r.name + ', ' + r.epiteto + '.\n\nDescubre el tuyo en el oráculo de El DoQmentalista:';
    var url = window.location.href;

    if (navigator.share) {
      navigator.share({ title: 'Mi nombre de bruja', text: text, url: url }).catch(function(){});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + '\n' + url).then(function() {
        showToast('Copiado al portapapeles', 'success');
      });
    } else {
      showToast('Copia este texto: ' + text);
    }
  }

  // ESC cierra modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById('oracleModal');
      if (modal && modal.classList.contains('is-open')) oracleClose();
    }
  });

  // ============================================================
  // TOTEM ANIMAL — Oráculo del espíritu animal
  // ============================================================

  // === BANCO DE ANIMALES ESPIRITUALES ===
  var TOTEM_COUNTRIES = [{"code": "MX", "name": "México", "flag": "🇲🇽"}, {"code": "AR", "name": "Argentina", "flag": "🇦🇷"}, {"code": "CO", "name": "Colombia", "flag": "🇨🇴"}, {"code": "PE", "name": "Perú", "flag": "🇵🇪"}, {"code": "VE", "name": "Venezuela", "flag": "🇻🇪"}, {"code": "CL", "name": "Chile", "flag": "🇨🇱"}, {"code": "EC", "name": "Ecuador", "flag": "🇪🇨"}, {"code": "GT", "name": "Guatemala", "flag": "🇬🇹"}, {"code": "CU", "name": "Cuba", "flag": "🇨🇺"}, {"code": "BO", "name": "Bolivia", "flag": "🇧🇴"}, {"code": "DO", "name": "República Dominicana", "flag": "🇩🇴"}, {"code": "HN", "name": "Honduras", "flag": "🇭🇳"}, {"code": "PY", "name": "Paraguay", "flag": "🇵🇾"}, {"code": "SV", "name": "El Salvador", "flag": "🇸🇻"}, {"code": "NI", "name": "Nicaragua", "flag": "🇳🇮"}, {"code": "CR", "name": "Costa Rica", "flag": "🇨🇷"}, {"code": "PA", "name": "Panamá", "flag": "🇵🇦"}, {"code": "UY", "name": "Uruguay", "flag": "🇺🇾"}, {"code": "PR", "name": "Puerto Rico", "flag": "🇵🇷"}, {"code": "BR", "name": "Brasil", "flag": "🇧🇷"}, {"code": "ES", "name": "España", "flag": "🇪🇸"}, {"code": "US", "name": "Estados Unidos", "flag": "🇺🇸"}, {"code": "BZ", "name": "Belice", "flag": "🇧🇿"}, {"code": "HT", "name": "Haití", "flag": "🇭🇹"}, {"code": "JM", "name": "Jamaica", "flag": "🇯🇲"}, {"code": "PT", "name": "Portugal", "flag": "🇵🇹"}, {"code": "CA", "name": "Canadá", "flag": "🇨🇦"}, {"code": "FR", "name": "Francia", "flag": "🇫🇷"}, {"code": "IT", "name": "Italia", "flag": "🇮🇹"}, {"code": "DE", "name": "Alemania", "flag": "🇩🇪"}, {"code": "GB", "name": "Reino Unido", "flag": "🇬🇧"}, {"code": "PH", "name": "Filipinas", "flag": "🇵🇭"}, {"code": "IN", "name": "India", "flag": "🇮🇳"}, {"code": "JP", "name": "Japón", "flag": "🇯🇵"}, {"code": "CN", "name": "China", "flag": "🇨🇳"}, {"code": "ID", "name": "Indonesia", "flag": "🇮🇩"}, {"code": "TH", "name": "Tailandia", "flag": "🇹🇭"}, {"code": "VN", "name": "Vietnam", "flag": "🇻🇳"}, {"code": "EG", "name": "Egipto", "flag": "🇪🇬"}, {"code": "ZA", "name": "Sudáfrica", "flag": "🇿🇦"}, {"code": "NG", "name": "Nigeria", "flag": "🇳🇬"}, {"code": "KE", "name": "Kenia", "flag": "🇰🇪"}, {"code": "MA", "name": "Marruecos", "flag": "🇲🇦"}, {"code": "AU", "name": "Australia", "flag": "🇦🇺"}, {"code": "NZ", "name": "Nueva Zelanda", "flag": "🇳🇿"}];
  var TOTEM_COUNTRY_REGION = {"MX": "mesoamerica", "GT": "mesoamerica", "BZ": "mesoamerica", "HN": "mesoamerica", "SV": "mesoamerica", "CR": "centroamerica", "PA": "centroamerica", "NI": "centroamerica", "CU": "caribe", "DO": "caribe", "PR": "caribe", "JM": "caribe", "HT": "caribe", "PE": "andes", "BO": "andes", "EC": "andes", "BR": "amazonia", "CO": "pampas", "VE": "pampas", "AR": "conosur", "CL": "conosur", "UY": "conosur", "PY": "conosur", "US": "norteamerica", "CA": "norteamerica", "ES": "iberia", "PT": "iberia", "FR": "europa", "DE": "europa", "IT": "europa", "GB": "europa", "PH": "sudeste_asia", "ID": "sudeste_asia", "VN": "sudeste_asia", "TH": "sudeste_asia", "IN": "asia", "CN": "asia", "JP": "asia", "EG": "africa", "ZA": "africa", "NG": "africa", "KE": "africa", "MA": "africa", "AU": "oceania", "NZ": "oceania"};
  var TOTEM_ANIMALS = {
  "mesoamerica": [
    {
      "emoji": "🐆",
      "name": "Jaguar",
      "element": "fuego",
      "epithet": "El Espejo Humeante",
      "identity": "Tienes presencia silenciosa pero imposible de ignorar. Lees a la gente antes de que abra la boca. Tu poder no grita: acecha.",
      "strength": "Lectura del entorno. Donde otros ven caos, tú ves patrones. Esperas el momento exacto y por eso casi nunca fallas.",
      "message": "\"No malgastes tu rugido. Guárdalo para cuando importe. La selva respeta al que sabe cuándo callar y cuándo morder.\""
    },
    {
      "emoji": "🐺",
      "name": "Coyote",
      "element": "fuego",
      "epithet": "El Trickster",
      "identity": "Tienes una inteligencia rápida y un humor que desarma. Sobrevives a todo porque sabes leer a la gente como nadie.",
      "strength": "Tu astucia. Encuentras caminos donde otros ven paredes. La adaptación es tu arte.",
      "message": "\"Tu sentido del humor es magia. No lo apagues por agradar a quienes no entienden el chiste.\""
    },
    {
      "emoji": "🦂",
      "name": "Alacrán",
      "element": "fuego",
      "epithet": "El Centinela del Desierto",
      "identity": "Eres alguien que protege con fiereza lo suyo. No buscas pelea, pero tampoco la esquivas cuando llega.",
      "strength": "Tu defensa. Sabes poner límites claros. Quien te conoce, sabe que respeto se gana con respeto.",
      "message": "\"No eres veneno: eres frontera. Lo que custodias merece ser custodiado.\""
    },
    {
      "emoji": "🦌",
      "name": "Venado Cola Blanca",
      "element": "fuego",
      "epithet": "El Corredor del Bosque",
      "identity": "Tienes una sensibilidad afinada y una elegancia natural. Sientes el peligro antes de que llegue.",
      "strength": "Tu intuición y velocidad. Cuando algo no va, lo sabes en el cuerpo y respondes rápido.",
      "message": "\"Confía en lo que tu piel te dice. No siempre necesitas pruebas para saber que algo es verdad.\""
    },
    {
      "emoji": "🐍",
      "name": "Serpiente Emplumada",
      "element": "fuego",
      "epithet": "Quetzalcóatl",
      "identity": "Eres alguien en eterna transformación. Cada cierto tiempo dejas atrás una versión de ti, y eso te asusta y te libera al mismo tiempo.",
      "strength": "Tu capacidad de renacer. Lo que te rompe se vuelve sabiduría. No te quedas atrapado en lo que fuiste.",
      "message": "\"La piel vieja no es muerte: es regalo. Suéltala sin nostalgia, lo nuevo ya espera.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Real",
      "element": "aire",
      "epithet": "La Mirada del Sol",
      "identity": "Naciste para ver lejos. Mientras otros se enredan en lo pequeño, tú observas el panorama completo.",
      "strength": "Tu enfoque. Lo que decides perseguir, lo persigues hasta el final. Nadie te distrae de tu cumbre.",
      "message": "\"Vuela alto pero recuerda dónde está tu nido. La altura sin raíz se vuelve soledad.\""
    },
    {
      "emoji": "🐦",
      "name": "Colibrí",
      "element": "aire",
      "epithet": "Huitzilopochtli",
      "identity": "Eres alguien que se mueve rápido y con propósito. Tu corazón late más fuerte que el de la mayoría, en todos los sentidos.",
      "strength": "Tu agilidad mental y emocional. Procesas rápido, sientes intenso, decides ágil.",
      "message": "\"Tu pequeñez es tu superpoder. Estás donde no te ven venir, y eso te hace imparable.\""
    },
    {
      "emoji": "🦜",
      "name": "Quetzal",
      "element": "aire",
      "epithet": "El Espíritu Sagrado",
      "identity": "Tienes una belleza que no es superficial. Hay algo en ti que la gente nota aunque no sepa qué es.",
      "strength": "Tu autenticidad. No imitas: eres origen. Tu presencia inspira sin que tengas que esforzarte.",
      "message": "\"No naciste para enjaularte. Lo que eres solo florece en libertad.\""
    },
    {
      "emoji": "🦉",
      "name": "Búho",
      "element": "aire",
      "epithet": "El Ojo de la Noche",
      "identity": "Ves lo que otros no quieren ver. Tu sabiduría incomoda a veces, pero buscan tu consejo cuando lo necesitan de verdad.",
      "strength": "Tu visión nocturna. Entiendes lo oculto, lo no dicho, lo que pasa entre líneas.",
      "message": "\"El silencio es tu maestro. Habla menos, observa más, y tu palabra tendrá peso.\""
    },
    {
      "emoji": "🦋",
      "name": "Mariposa Monarca",
      "element": "aire",
      "epithet": "La Migrante Sagrada",
      "identity": "Tienes alma de viajero. Algo en ti sabe que el destino no es un lugar: es un movimiento.",
      "strength": "Tu transformación constante. No te quedas en lo que fuiste. Vas hacia donde el alma llama.",
      "message": "\"Lo frágil también es eterno. Tu belleza no necesita armadura.\""
    },
    {
      "emoji": "🐊",
      "name": "Cocodrilo",
      "element": "agua",
      "epithet": "El Guardián del Pantano",
      "identity": "Eres alguien antiguo en alma. Cargas calma de quien ya vio mucho, y por eso pocas cosas te alteran.",
      "strength": "Tu resistencia. Aguantas lo que rompería a otros. Tu fuerza está en lo que no se ve.",
      "message": "\"No reacciones a todo. Algunas cosas se resuelven solo con que tú permanezcas.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga Marina",
      "element": "agua",
      "epithet": "La Memoria del Océano",
      "identity": "Tienes el ritmo del tiempo largo. No corres porque sabes que llegarás. Tu paciencia es ancestral.",
      "strength": "Tu constancia. Donde otros se rinden, tú sigues. Lo lento también es poder.",
      "message": "\"Tu casa va contigo. Eres refugio donde sea que pises.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín",
      "element": "agua",
      "epithet": "El Sanador del Agua",
      "identity": "Tienes alma alegre y sanadora. La gente busca tu cercanía porque contigo se siente bien.",
      "strength": "Tu energía. Levantas el ánimo sin esfuerzo. Eres medicina viva.",
      "message": "\"No subestimes tu alegría. En tiempos oscuros, esa luz es revolucionaria.\""
    },
    {
      "emoji": "🦎",
      "name": "Iguana",
      "element": "agua",
      "epithet": "El Tomador del Sol",
      "identity": "Sabes esperar tu momento. No te apresuras, no te angustias. Confías en que el sol siempre vuelve.",
      "strength": "Tu paciencia activa. Esperas pero no te quedas inmóvil. Ahorras energía para cuando importe.",
      "message": "\"Descansar también es estrategia. No estás perdiendo tiempo: estás cargando.\""
    },
    {
      "emoji": "🐸",
      "name": "Rana de Árbol",
      "element": "agua",
      "epithet": "La Voz de la Lluvia",
      "identity": "Tienes voz que llama a otros. Cuando hablas, las cosas se mueven. Hay magia en tu palabra.",
      "strength": "Tu expresión. Sabes nombrar lo que otros no logran articular.",
      "message": "\"Tu voz convoca tormentas o calmas. Úsala con conciencia, tiene más poder del que crees.\""
    },
    {
      "emoji": "🐆",
      "name": "Puma",
      "element": "tierra",
      "epithet": "El León de Plata",
      "identity": "Tienes una dignidad serena. No necesitas ruido para imponer respeto. Tu sola presencia ya dice lo necesario.",
      "strength": "Tu independencia. No dependes emocionalmente de nadie, y eso te hace estable para los demás.",
      "message": "\"Tu silencio es poder. No te justifiques tanto: deja que tu presencia hable.\""
    },
    {
      "emoji": "🦊",
      "name": "Zorro Gris",
      "element": "tierra",
      "epithet": "El Sabio Tramposo",
      "identity": "Tienes una mente rápida y un alma juguetona. Te diviertes con la vida aunque la tomes en serio.",
      "strength": "Tu astucia con corazón. Resuelves problemas con creatividad, no con fuerza bruta.",
      "message": "\"Reír también es resistencia. No dejes que la gravedad te robe el ingenio.\""
    },
    {
      "emoji": "🐝",
      "name": "Abeja",
      "element": "tierra",
      "epithet": "La Tejedora del Panal",
      "identity": "Eres alguien colaborativo. Sabes que solo no se llega lejos, y por eso construyes redes y comunidad.",
      "strength": "Tu sentido de propósito colectivo. Lo que haces, lo haces para algo más grande que tú.",
      "message": "\"Tu trabajo es dulce aunque no lo veas. Sigue construyendo, ya cosecharás.\""
    },
    {
      "emoji": "🐕",
      "name": "Xoloitzcuintle",
      "element": "tierra",
      "epithet": "El Guía de Almas",
      "identity": "Tienes una lealtad sagrada. Acompañas a los tuyos en lo más oscuro sin pedir nada a cambio.",
      "strength": "Tu presencia incondicional. Eres ancla emocional para quienes están perdidos.",
      "message": "\"Tu compañía es medicina. No subestimes el poder de simplemente estar.\""
    },
    {
      "emoji": "🐗",
      "name": "Pecarí",
      "element": "tierra",
      "epithet": "El Guardián de la Manada",
      "identity": "Eres alguien de tribu. La gente que amas es tu fuerza, y por ellos eres capaz de todo.",
      "strength": "Tu lealtad. No abandonas. Donde tú estás, hay refugio.",
      "message": "\"Tu fuerza no es individual: es comunitaria. Recuerda pedir ayuda cuando la necesites.\""
    }
  ],
  "centroamerica": [
    {
      "emoji": "🐆",
      "name": "Jaguar",
      "element": "fuego",
      "epithet": "El Rey del Manglar",
      "identity": "Tienes presencia silenciosa pero imposible de ignorar. Lees a la gente antes de que abra la boca.",
      "strength": "Lectura del entorno. Donde otros ven caos, tú ves patrones.",
      "message": "\"No malgastes tu rugido. Guárdalo para cuando importe.\""
    },
    {
      "emoji": "🐍",
      "name": "Boa",
      "element": "fuego",
      "epithet": "El Abrazo Largo",
      "identity": "Tienes paciencia y fuerza al mismo tiempo. Cuando decides algo, lo sostienes hasta lograrlo.",
      "strength": "Tu persistencia. No sueltas lo que importa.",
      "message": "\"No tienes que apresurarte. Lo que abrazas, te pertenece.\""
    },
    {
      "emoji": "🐊",
      "name": "Caimán",
      "element": "fuego",
      "epithet": "El Antiguo del Río",
      "identity": "Llevas memoria de generaciones. Hay algo en ti que parece de otro tiempo.",
      "strength": "Tu sabiduría ancestral. Sabes esperar, sabes cuándo emerger.",
      "message": "\"Tu calma intimida a los que solo conocen la prisa.\""
    },
    {
      "emoji": "🦌",
      "name": "Venado Rojo",
      "element": "fuego",
      "epithet": "El Mensajero del Bosque",
      "identity": "Llegas y cambias el aire del lugar. Tienes una gracia natural que la gente nota.",
      "strength": "Tu presencia. No necesitas hablar mucho para inspirar.",
      "message": "\"Tu belleza no es vanidad: es señal. Cuídala como cuidarías un templo.\""
    },
    {
      "emoji": "🦂",
      "name": "Escorpión Tropical",
      "element": "fuego",
      "epithet": "El Sigiloso",
      "identity": "Sabes esperar y golpear solo cuando es necesario. Tu poder está en tu autocontrol.",
      "strength": "Tu paciencia estratégica. No reaccionas, respondes.",
      "message": "\"No tienes que ganar todas las batallas. Solo las que decidas pelear.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Arpía",
      "element": "aire",
      "epithet": "La Reina de los Cielos",
      "identity": "Eres poderoso pero reservado. Tu fuerza es enorme, pero no necesitas mostrarla todo el tiempo.",
      "strength": "Tu autoridad natural. Cuando hablas, los demás escuchan.",
      "message": "\"Tu poder asusta a quien no está listo. No lo apagues: eleva tu vuelo.\""
    },
    {
      "emoji": "🦜",
      "name": "Guacamayo Rojo",
      "element": "aire",
      "epithet": "El Heraldo del Sol",
      "identity": "Tienes una personalidad explosiva y carismática. La gente se acerca a ti porque irradias vida.",
      "strength": "Tu carisma. Te abre puertas que ni esperabas tocar.",
      "message": "\"Tu voz es regalo. Úsala para construir, no para llenar silencio.\""
    },
    {
      "emoji": "🐦",
      "name": "Tucán",
      "element": "aire",
      "epithet": "El Que Anuncia",
      "identity": "Eres mensajero natural. Te enteras de cosas que otros no, y sabes cuándo compartirlas.",
      "strength": "Tu comunicación. Conviertes lo complejo en simple.",
      "message": "\"Tu palabra tiene peso. No la regales: regálala bien.\""
    },
    {
      "emoji": "🦋",
      "name": "Mariposa Morfo Azul",
      "element": "aire",
      "epithet": "El Reflejo del Cielo",
      "identity": "Tienes una belleza que llama atención sin querer. La gente se gira cuando pasas.",
      "strength": "Tu magnetismo. No buscas, te encuentran.",
      "message": "\"Lo que brilla atrae mucha mirada. Aprende a distinguir admiración de envidia.\""
    },
    {
      "emoji": "🐝",
      "name": "Colibrí Esmeralda",
      "element": "aire",
      "epithet": "La Joya del Aire",
      "identity": "Te mueves rápido y con propósito. No paras, y ese movimiento te define.",
      "strength": "Tu energía. La aplicas en mil cosas al día y aún así sigues con reservas.",
      "message": "\"Recuerda detenerte. Hasta el colibrí descansa al atardecer.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga Verde",
      "element": "agua",
      "epithet": "La Memoria del Mar",
      "identity": "Tienes el ritmo del tiempo largo. No corres porque sabes que llegarás.",
      "strength": "Tu constancia. Donde otros se rinden, tú sigues.",
      "message": "\"Tu casa va contigo. Eres refugio donde sea que pises.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín",
      "element": "agua",
      "epithet": "El Sanador",
      "identity": "Tienes alma alegre y sanadora. La gente busca tu cercanía porque contigo se siente bien.",
      "strength": "Tu energía. Levantas el ánimo sin esfuerzo.",
      "message": "\"No subestimes tu alegría. En tiempos oscuros, esa luz es revolucionaria.\""
    },
    {
      "emoji": "🦀",
      "name": "Cangrejo Ermitaño",
      "element": "agua",
      "epithet": "El Que Lleva su Casa",
      "identity": "Aprendiste a moverte con tu mundo a cuestas. No dependes del lugar para sentirte tú.",
      "strength": "Tu autonomía emocional. Tu hogar está dentro, no afuera.",
      "message": "\"Donde tú estés, ahí está tu lugar. Eso es libertad real.\""
    },
    {
      "emoji": "🐠",
      "name": "Pez Loro",
      "element": "agua",
      "epithet": "El Pintor del Arrecife",
      "identity": "Tienes creatividad que no se apaga. Donde otros ven gris, tú ves paleta.",
      "strength": "Tu imaginación. Conviertes problemas en arte.",
      "message": "\"Tu mirada cambia las cosas. Sigue pintando el mundo.\""
    },
    {
      "emoji": "🐸",
      "name": "Rana de Cristal",
      "element": "agua",
      "epithet": "La Transparente",
      "identity": "Eres alguien honesto hasta la médula. Lo que sientes se nota, y eso te hace confiable.",
      "strength": "Tu transparencia. La gente confía en ti porque no juegas a esconderte.",
      "message": "\"Tu honestidad puede asustar a quien vive de máscaras. Sigue siendo así.\""
    },
    {
      "emoji": "🐒",
      "name": "Mono Cara Blanca",
      "element": "tierra",
      "epithet": "El Curioso del Dosel",
      "identity": "Tienes curiosidad sin límite. Lo tocas todo, lo pruebas todo, aprendes todo el tiempo.",
      "strength": "Tu mente abierta. No tienes prejuicios fáciles, eso te hace ver más.",
      "message": "\"Tu curiosidad es regalo. No dejes que el cinismo del mundo la apague.\""
    },
    {
      "emoji": "🦥",
      "name": "Perezoso",
      "element": "tierra",
      "epithet": "El Filósofo del Árbol",
      "identity": "Tienes el ritmo del que entiende que la vida no se mide en velocidad. Tu calma es tu marca.",
      "strength": "Tu pausa. En un mundo apurado, tú recuerdas que pensar también es trabajo.",
      "message": "\"Lo lento no es perezoso: es deliberado. Sigue moviéndote a tu ritmo.\""
    },
    {
      "emoji": "🐜",
      "name": "Hormiga Cortadora",
      "element": "tierra",
      "epithet": "La Trabajadora Sagrada",
      "identity": "Tienes una ética de trabajo poco común. No esperas inspiración: actúas.",
      "strength": "Tu disciplina. Donde otros postergan, tú avanzas.",
      "message": "\"Tu trabajo silencioso construye montañas. No necesitas que te aplaudan para seguir.\""
    },
    {
      "emoji": "🐢",
      "name": "Armadillo",
      "element": "tierra",
      "epithet": "El Acorazado",
      "identity": "Te proteges con sabiduría. No por miedo, sino porque sabes qué merece tu energía y qué no.",
      "strength": "Tu límite saludable. No te abres con cualquiera, y eso te ahorra heridas innecesarias.",
      "message": "\"Tu coraza no es muro: es filtro. Decide tú quién pasa y quién no.\""
    },
    {
      "emoji": "🐌",
      "name": "Caracol del Bosque",
      "element": "tierra",
      "epithet": "El Constructor",
      "identity": "Vas a tu ritmo, construyes a tu tiempo. Lo que haces, lo haces para que dure.",
      "strength": "Tu paciencia constructiva. No improvisas: construyes con base.",
      "message": "\"Lo que se hace despacio, se hace bien. No te dejes apurar.\""
    }
  ],
  "caribe": [
    {
      "emoji": "🦜",
      "name": "Tocororo",
      "element": "fuego",
      "epithet": "El Símbolo Libre",
      "identity": "Tienes alma indomable. No te adaptas a jaulas, ni siquiera doradas. Tu libertad es tu identidad.",
      "strength": "Tu autenticidad. No actúas para nadie, y eso te hace inolvidable.",
      "message": "\"Quien intente cambiarte no te amó nunca. Sigue siendo lo que eres.\""
    },
    {
      "emoji": "🦅",
      "name": "Halcón Cernícalo",
      "element": "fuego",
      "epithet": "El Centinela",
      "identity": "Eres alerta natural. Observas, evalúas, decides. No te dejas llevar por impulsos.",
      "strength": "Tu juicio. Ves a través de la apariencia. A la gente real, la conoces rápido.",
      "message": "\"Tu intuición sobre la gente casi nunca falla. Escúchala desde el primer encuentro.\""
    },
    {
      "emoji": "🐊",
      "name": "Cocodrilo Cubano",
      "element": "fuego",
      "epithet": "El Antiguo de la Isla",
      "identity": "Cargas historia en el alma. Hay en ti algo que parece de otro tiempo.",
      "strength": "Tu paciencia ancestral. Esperas con calma lo que sabes que viene.",
      "message": "\"Tu calma intimida a los apresurados. No la cambies por encajar.\""
    },
    {
      "emoji": "🐗",
      "name": "Jutía",
      "element": "fuego",
      "epithet": "El Sobreviviente",
      "identity": "Sobrevives a todo. Donde hay obstáculo, tú encuentras forma de seguir.",
      "strength": "Tu resiliencia. Te has caído y levantado tantas veces que ya nada te asusta.",
      "message": "\"Tu resistencia es leyenda. Recuérdate eso cuando dudes.\""
    },
    {
      "emoji": "🦂",
      "name": "Escorpión Caribeño",
      "element": "fuego",
      "epithet": "El Defensor",
      "identity": "Proteges con fiereza lo tuyo. No buscas pelea, pero tampoco la esquivas cuando llega.",
      "strength": "Tu defensa. Sabes poner límites claros.",
      "message": "\"No eres veneno: eres frontera.\""
    },
    {
      "emoji": "🦩",
      "name": "Flamenco",
      "element": "aire",
      "epithet": "El Bailarín Rosado",
      "identity": "Tienes una elegancia natural. La gente te mira sin saber por qué.",
      "strength": "Tu estilo. Conviertes lo cotidiano en escena.",
      "message": "\"Tu belleza es tu firma. Cuídala como cuidarías un templo.\""
    },
    {
      "emoji": "🦜",
      "name": "Cotorra Puertorriqueña",
      "element": "aire",
      "epithet": "La Voz que Resiste",
      "identity": "No te callas aunque te pidan silencio. Tu voz es tu fuerza.",
      "strength": "Tu expresión. Dices lo que otros no se atreven, y por eso te necesitan.",
      "message": "\"Tu palabra cambia salas. Úsala sin miedo, ya alguien la necesita.\""
    },
    {
      "emoji": "🐦",
      "name": "Zumbador",
      "element": "aire",
      "epithet": "El Colibrí del Trópico",
      "identity": "Tienes energía concentrada. Pequeño en apariencia, enorme en presencia.",
      "strength": "Tu velocidad. Procesas y respondes rápido, eso te da ventaja.",
      "message": "\"Tu pequeñez es ilusión óptica. Por dentro eres tormenta.\""
    },
    {
      "emoji": "🦉",
      "name": "Cárabo Caribeño",
      "element": "aire",
      "epithet": "El Sabio Nocturno",
      "identity": "Ves lo que otros no quieren ver. Te buscan cuando importa.",
      "strength": "Tu visión nocturna. Entiendes lo no dicho.",
      "message": "\"El silencio es tu maestro. Habla menos, observa más.\""
    },
    {
      "emoji": "🐦",
      "name": "Sinsonte",
      "element": "aire",
      "epithet": "El Imitador Sagrado",
      "identity": "Tienes capacidad camaleónica. Te adaptas, aprendes voces, te haces entender en cualquier lugar.",
      "strength": "Tu adaptación social. Funcionas en mil ambientes sin perder tu centro.",
      "message": "\"Aprende de todos, pero recuerda tu propia voz. Esa es la que importa.\""
    },
    {
      "emoji": "🐢",
      "name": "Manatí",
      "element": "agua",
      "epithet": "El Gigante Gentil",
      "identity": "Tienes una calma poderosa. La gente se siente segura contigo aunque no entienda por qué.",
      "strength": "Tu serenidad. En el caos, eres ancla.",
      "message": "\"Tu tamaño no es para imponer: es para abrazar. Sigue siendo refugio.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín Mular",
      "element": "agua",
      "epithet": "El Sanador del Mar",
      "identity": "Tienes alma alegre y sanadora. La gente busca tu cercanía porque contigo se siente bien.",
      "strength": "Tu energía. Levantas el ánimo sin esfuerzo.",
      "message": "\"No subestimes tu alegría. En tiempos oscuros, esa luz es revolucionaria.\""
    },
    {
      "emoji": "🦀",
      "name": "Juey",
      "element": "agua",
      "epithet": "El Caminante Lateral",
      "identity": "No vas de frente: vas inteligente. Llegas por donde nadie esperaba.",
      "strength": "Tu estrategia. Conviertes lo \"raro\" en ventaja.",
      "message": "\"Tu camino no tiene que parecerse a ninguno.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga Carey",
      "element": "agua",
      "epithet": "La Joya del Mar",
      "identity": "Tienes el ritmo del tiempo largo. Tu paciencia es ancestral.",
      "strength": "Tu constancia. Donde otros se rinden, tú sigues.",
      "message": "\"Tu casa va contigo. Eres refugio donde sea que pises.\""
    },
    {
      "emoji": "🐸",
      "name": "Coquí",
      "element": "agua",
      "epithet": "La Voz de la Noche",
      "identity": "Te haces notar sin pelear por atención. Tu sola voz convoca.",
      "strength": "Tu expresión natural. Lo que dices, queda. Lo que cantas, se recuerda.",
      "message": "\"Tu voz pequeña llena montes enteros. Sigue cantando aunque no haya quien escuche.\""
    },
    {
      "emoji": "🦎",
      "name": "Anolis Verde",
      "element": "tierra",
      "epithet": "El Camaleón del Patio",
      "identity": "Tienes adaptación natural. Te ajustas a cada ambiente sin perder tu esencia.",
      "strength": "Tu flexibilidad. No te quiebras: te adaptas.",
      "message": "\"Cambiar de color no es traicionarte. Es sobrevivir con estilo.\""
    },
    {
      "emoji": "🐝",
      "name": "Abeja Melipona",
      "element": "tierra",
      "epithet": "La Constructora Dulce",
      "identity": "Eres colaborativo. Sabes que solo no se llega lejos.",
      "strength": "Tu sentido de propósito colectivo.",
      "message": "\"Tu trabajo es dulce aunque no lo veas. Sigue construyendo.\""
    },
    {
      "emoji": "🦊",
      "name": "Mangosta",
      "element": "tierra",
      "epithet": "La Cazadora de Serpientes",
      "identity": "Enfrentas lo que da miedo. No te paralizas: vas hacia eso.",
      "strength": "Tu valentía con cabeza. No te lanzas: calculas y atacas.",
      "message": "\"Tu miedo no decide por ti. Eso es coraje real.\""
    },
    {
      "emoji": "🐌",
      "name": "Caracol Cubano",
      "element": "tierra",
      "epithet": "El Pintado",
      "identity": "Tienes una belleza única que no se imita. Tu marca personal es inconfundible.",
      "strength": "Tu originalidad. No hay otro como tú, y se nota.",
      "message": "\"No diluyas tus colores para encajar. Lo único es lo que vale.\""
    },
    {
      "emoji": "🐗",
      "name": "Jabalí",
      "element": "tierra",
      "epithet": "El Solitario del Monte",
      "identity": "Necesitas tu espacio para funcionar. Tu independencia es sagrada.",
      "strength": "Tu autonomía. No dependes de aprobación para moverte.",
      "message": "\"Tu soledad no es huida: es taller. Ahí construyes.\""
    }
  ],
  "andes": [
    {
      "emoji": "🦅",
      "name": "Cóndor Andino",
      "element": "aire",
      "epithet": "El Mensajero del Apu",
      "identity": "Tienes una visión que abarca lo enorme. Donde otros se agotan, tú aún subes.",
      "strength": "Tu resistencia y altura. Lo que para otros es cumbre, para ti es base.",
      "message": "\"Tu vuelo no es huida: es perspectiva. Sigue elevándote, otros no lo entenderán.\""
    },
    {
      "emoji": "🐆",
      "name": "Puma",
      "element": "fuego",
      "epithet": "El Hijo de los Apus",
      "identity": "Tienes una dignidad serena que impone respeto. Tu poder no necesita anunciarse.",
      "strength": "Tu independencia. No dependes de aprobación. Eso te hace estable.",
      "message": "\"Tu silencio es poder. Deja que tu presencia hable por ti.\""
    },
    {
      "emoji": "🦙",
      "name": "Llama",
      "element": "tierra",
      "epithet": "La Compañera del Camino",
      "identity": "Eres alguien que carga responsabilidades sin quejarse. La gente confía en ti porque cumples.",
      "strength": "Tu paciencia y resistencia. Llevas lo pesado y aún así sigues.",
      "message": "\"Sí cargas mucho, pero también puedes decir basta. Conocer tu límite no es debilidad.\""
    },
    {
      "emoji": "🐻",
      "name": "Oso de Anteojos",
      "element": "tierra",
      "epithet": "El Vigilante del Páramo",
      "identity": "Eres alguien con observación profunda. Lo que ves, lo entiendes en capas.",
      "strength": "Tu introspección. Te conoces bien, y por eso entiendes a otros.",
      "message": "\"Tu soledad es estudio, no aislamiento. Sigue investigando lo que el mundo te muestra.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Andina",
      "element": "aire",
      "epithet": "La Cazadora del Risco",
      "identity": "Tienes precisión y enfoque. Cuando decides, no titubeas.",
      "strength": "Tu claridad. Eliminas lo innecesario. Vas directo al núcleo.",
      "message": "\"Tu velocidad solo sirve si apuntas bien. Mide antes de lanzarte.\""
    },
    {
      "emoji": "🦙",
      "name": "Vicuña",
      "element": "aire",
      "epithet": "La Reina de la Altura",
      "identity": "Tienes una elegancia que no se imita. La gente nota tu manera de moverte.",
      "strength": "Tu gracia natural. Conviertes lo simple en hermoso.",
      "message": "\"Tu fineza es regalo. No la disimules para parecer común.\""
    },
    {
      "emoji": "🦙",
      "name": "Alpaca",
      "element": "tierra",
      "epithet": "La Tejedora del Sol",
      "identity": "Tienes una ternura poderosa. La gente quiere estar cerca de ti porque transmites paz.",
      "strength": "Tu suavidad con propósito. Tu calma es estratégica, no pasiva.",
      "message": "\"Tu dulzura no es debilidad: es un imán que atrae lo bueno.\""
    },
    {
      "emoji": "🐍",
      "name": "Serpiente Andina",
      "element": "fuego",
      "epithet": "Amaru",
      "identity": "Estás en transformación constante. Lo que fuiste no te define.",
      "strength": "Tu capacidad de renacer. Sueltas pieles cuando otros se aferran.",
      "message": "\"La transformación duele pero libera. No la temas.\""
    },
    {
      "emoji": "🐦",
      "name": "Picaflor Gigante",
      "element": "aire",
      "epithet": "El Heraldo del Sol",
      "identity": "Eres energético, vivo, alegre. Donde llegas, las cosas se animan.",
      "strength": "Tu vitalidad contagiosa. Repartes energía sin agotarte.",
      "message": "\"Tu alegría es revolución. Sigue siendo así, el mundo necesita más como tú.\""
    },
    {
      "emoji": "🦉",
      "name": "Lechuza Andina",
      "element": "aire",
      "epithet": "La Sabia de la Montaña",
      "identity": "Ves cosas que otros prefieren ignorar. Tu sabiduría incomoda pero salva.",
      "strength": "Tu observación. Entiendes contextos que se le escapan a otros.",
      "message": "\"Tu mirada es regalo. No la apagues por agradar.\""
    },
    {
      "emoji": "🦆",
      "name": "Pato Zambullidor",
      "element": "agua",
      "epithet": "El Buzo del Titicaca",
      "identity": "Vas a fondo en lo que te importa. No te quedas en superficie.",
      "strength": "Tu profundidad. Entiendes capas donde otros solo ven encima.",
      "message": "\"Tu necesidad de profundidad es regalo. No la cambies por conversaciones huecas.\""
    },
    {
      "emoji": "🐟",
      "name": "Suche",
      "element": "agua",
      "epithet": "El Pez Sagrado",
      "identity": "Tienes conexión con lo ancestral. Algo en ti sabe cosas sin haberlas estudiado.",
      "strength": "Tu intuición. Es tu mejor guía cuando la lógica no alcanza.",
      "message": "\"Confía en lo que sabes sin saber cómo. Esa voz interna casi nunca miente.\""
    },
    {
      "emoji": "🐸",
      "name": "Rana del Titicaca",
      "element": "agua",
      "epithet": "La Voz del Lago",
      "identity": "Tienes una resistencia poco común. Sobrevives donde otros no se animarían a vivir.",
      "strength": "Tu fortaleza silenciosa. No presumes, pero aguantas más que cualquiera.",
      "message": "\"Tu resistencia es discreta y por eso poderosa. Sigue ahí, aunque no te aplaudan.\""
    },
    {
      "emoji": "🦦",
      "name": "Nutria Andina",
      "element": "agua",
      "epithet": "La Juguetona del Río",
      "identity": "Tienes alma alegre y curiosa. Encuentras juego donde otros solo ven trabajo.",
      "strength": "Tu capacidad de disfrute. Conviertes lo simple en celebración.",
      "message": "\"No dejes que el mundo te robe la risa. Reír también es ganar.\""
    },
    {
      "emoji": "🦅",
      "name": "Caracara",
      "element": "aire",
      "epithet": "El Carroñero Sabio",
      "identity": "Eres alguien que encuentra valor donde otros descartan. Tu mirada ve oportunidades.",
      "strength": "Tu reciclaje creativo. Transformas lo descartado en recurso.",
      "message": "\"Lo que otros desechan, tú lo conviertes en oro. Sigue confiando en tu ojo.\""
    },
    {
      "emoji": "🐂",
      "name": "Toro Andino",
      "element": "tierra",
      "epithet": "El Firme",
      "identity": "Eres alguien con palabra. Lo que dices, lo cumples.",
      "strength": "Tu integridad. La gente puede contar contigo, y eso no es poco.",
      "message": "\"Tu palabra es tu sello. Cuídala más que tu reputación.\""
    },
    {
      "emoji": "🐗",
      "name": "Pecarí Andino",
      "element": "tierra",
      "epithet": "El Guardián de Manada",
      "identity": "Eres alguien de comunidad. Tu fuerza nace de tu gente.",
      "strength": "Tu lealtad. No abandonas a los tuyos.",
      "message": "\"Tu fuerza es colectiva. Pide ayuda cuando la necesites, eso te hace más fuerte.\""
    },
    {
      "emoji": "🦌",
      "name": "Taruca",
      "element": "tierra",
      "epithet": "El Venado de Altura",
      "identity": "Tienes sensibilidad y elegancia natural. Notas cosas sutiles que otros pasan por alto.",
      "strength": "Tu intuición fina. Lo que sientes en el cuerpo es brújula.",
      "message": "\"Confía en lo que tu piel detecta. Tu cuerpo sabe antes que tu mente.\""
    },
    {
      "emoji": "🦊",
      "name": "Zorro Andino",
      "element": "tierra",
      "epithet": "El Astuto del Altiplano",
      "identity": "Tienes mente rápida y alma juguetona. Te diviertes con la vida aunque sea dura.",
      "strength": "Tu astucia con corazón. Resuelves con creatividad, no con fuerza.",
      "message": "\"Tu humor es resistencia. No dejes que la gravedad te lo robe.\""
    },
    {
      "emoji": "🐍",
      "name": "Coral Andina",
      "element": "fuego",
      "epithet": "La Brillante Silenciosa",
      "identity": "Tienes poder reservado. La gente te subestima por tu apariencia tranquila.",
      "strength": "Tu fuerza interna. Quien te subestima, lo lamenta tarde.",
      "message": "\"No necesitas probar tu valor. Quien sabe ver, verá.\""
    }
  ],
  "amazonia": [
    {
      "emoji": "🐆",
      "name": "Onça-Pintada",
      "element": "fuego",
      "epithet": "La Soberana de la Selva",
      "identity": "Tienes una presencia que silencia el cuarto. Tu fuerza no es ruidosa: es magnética.",
      "strength": "Tu autoridad natural. No mandas: simplemente eres seguido.",
      "message": "\"Tu poder no necesita gritar. La selva sabe quién eres.\""
    },
    {
      "emoji": "🐍",
      "name": "Sucuri",
      "element": "agua",
      "epithet": "La Abrazo del Río",
      "identity": "Tienes paciencia y fuerza al mismo tiempo. Cuando decides algo, no sueltas.",
      "strength": "Tu persistencia. Lo que abrazas, te pertenece.",
      "message": "\"No te apresures. Lo que aprietas con paciencia, no se escapa.\""
    },
    {
      "emoji": "🦜",
      "name": "Guacamayo Azul",
      "element": "aire",
      "epithet": "El Cielo Vivo",
      "identity": "Tienes una personalidad enorme y carismática. La gente se entera cuando llegas.",
      "strength": "Tu carisma. Abres puertas con tu sola presencia.",
      "message": "\"Tu voz colorea el día. Úsala para construir, no para llenar silencio.\""
    },
    {
      "emoji": "🐢",
      "name": "Capibara",
      "element": "tierra",
      "epithet": "La Reina del Encuentro",
      "identity": "Tienes una capacidad de coexistencia poco común. Vives bien con casi todos.",
      "strength": "Tu diplomacia natural. Unes en lugar de dividir.",
      "message": "\"Tu paz no es debilidad: es maestría. Sigue tejiendo puentes.\""
    },
    {
      "emoji": "🐠",
      "name": "Pirarucú",
      "element": "agua",
      "epithet": "El Gigante del Río",
      "identity": "Eres alguien grande en presencia y carácter. La gente nota tu peso aunque no lo busques.",
      "strength": "Tu presencia. Donde estás, las cosas se ordenan.",
      "message": "\"Tu tamaño no es solo físico: es energético. Cuida cómo lo usas.\""
    },
    {
      "emoji": "🦋",
      "name": "Mariposa Azul",
      "element": "aire",
      "epithet": "El Espíritu del Bosque",
      "identity": "Tienes una sensibilidad poética. Lo que ves, lo guardas como tesoro.",
      "strength": "Tu mirada artística. Conviertes lo cotidiano en imagen.",
      "message": "\"Tu manera de ver cambia mundos. No la apagues por practicidad.\""
    },
    {
      "emoji": "🐬",
      "name": "Boto Rosado",
      "element": "agua",
      "epithet": "El Espíritu Sanador",
      "identity": "Tienes un magnetismo misterioso. La gente se acerca a ti sin saber por qué.",
      "strength": "Tu energía sanadora. Tu sola compañía cura.",
      "message": "\"Tu magia es real aunque otros no la nombren. Sigue siendo así.\""
    },
    {
      "emoji": "🦥",
      "name": "Bicho-preguiça",
      "element": "tierra",
      "epithet": "El Filósofo Colgado",
      "identity": "Tienes el ritmo del que no se deja apurar. Tu calma es marca registrada.",
      "strength": "Tu pausa. Recuerdas que pensar también es acción.",
      "message": "\"Lo lento no es lento: es deliberado. Sigue moviéndote a tu ritmo.\""
    },
    {
      "emoji": "🐒",
      "name": "Mono Aullador",
      "element": "aire",
      "epithet": "La Voz del Dosel",
      "identity": "Tu voz se hace notar. Cuando hablas, los demás voltean.",
      "strength": "Tu expresión. Dices lo que otros temen decir.",
      "message": "\"Tu voz convoca y rompe. Úsala con conciencia, tiene peso.\""
    },
    {
      "emoji": "🐊",
      "name": "Yacaré",
      "element": "agua",
      "epithet": "El Antiguo del Pantano",
      "identity": "Cargas calma de quien ya vio mucho. Pocas cosas te alteran.",
      "strength": "Tu resistencia. Aguantas lo que rompería a otros.",
      "message": "\"No reacciones a todo. Algunas cosas se resuelven con tu sola permanencia.\""
    },
    {
      "emoji": "🐦",
      "name": "Tucán Toco",
      "element": "aire",
      "epithet": "El Heraldo del Color",
      "identity": "Tienes una presencia visual que llama atención. La gente recuerda tu manera de aparecer.",
      "strength": "Tu memoria. La gente no te olvida fácil.",
      "message": "\"Tu impacto es real. Sigue siendo inconfundible.\""
    },
    {
      "emoji": "🐗",
      "name": "Tapir",
      "element": "tierra",
      "epithet": "El Jardinero Silencioso",
      "identity": "Eres alguien que mueve la vida sin ruido. Lo que tocas, lo nutres.",
      "strength": "Tu impacto callado. Construyes sin pedir crédito.",
      "message": "\"Tu trabajo no necesita aplauso para ser real. Sigue sembrando.\""
    },
    {
      "emoji": "🐍",
      "name": "Anaconda",
      "element": "agua",
      "epithet": "La Reina del Río",
      "identity": "Tienes paciencia y poder simultáneos. No te apresuras porque sabes que llegarás.",
      "strength": "Tu calma estratégica. Esperas el momento y nunca fallas.",
      "message": "\"Tu paciencia es tu mejor arma. Sigue confiando en el tiempo.\""
    },
    {
      "emoji": "🦊",
      "name": "Lobo de Crin",
      "element": "fuego",
      "epithet": "El Solitario del Cerrado",
      "identity": "Tienes elegancia con independencia. No necesitas compañía constante para sentirte completo.",
      "strength": "Tu autonomía. Vives bien contigo mismo, eso es raro.",
      "message": "\"Tu soledad es taller, no destierro. Ahí construyes lo que después das.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Harpía",
      "element": "aire",
      "epithet": "La Reina del Dosel",
      "identity": "Tienes poder con propósito. Cuando actúas, hay razón clara.",
      "strength": "Tu enfoque. No malgastas energía en lo que no importa.",
      "message": "\"Tu fuerza no es para todos. Reserva tu rugido para lo que merece.\""
    },
    {
      "emoji": "🐦",
      "name": "Garza Cucharón",
      "element": "aire",
      "epithet": "La Paciente Pescadora",
      "identity": "Tienes paciencia que rinde frutos. Sabes esperar lo que vale la pena.",
      "strength": "Tu calma activa. Esperas pero no te quedas inmóvil.",
      "message": "\"La paciencia con propósito siempre gana. Sigue ahí.\""
    },
    {
      "emoji": "🐟",
      "name": "Pirarara",
      "element": "agua",
      "epithet": "El Pez Rugoso",
      "identity": "Tienes una resistencia poco común. Lo que te golpea, te endurece sin hacerte amargo.",
      "strength": "Tu fortaleza emocional. Has pasado tormentas y aún sigues.",
      "message": "\"Tu coraza es prueba de batallas ganadas. Llévala con orgullo.\""
    },
    {
      "emoji": "🐝",
      "name": "Abeja Tiúba",
      "element": "tierra",
      "epithet": "La Tejedora Sagrada",
      "identity": "Eres alguien colaborativo. Sabes que solo no se llega lejos.",
      "strength": "Tu sentido de propósito colectivo.",
      "message": "\"Tu trabajo es dulce aunque no lo veas. Sigue construyendo.\""
    },
    {
      "emoji": "🦌",
      "name": "Veado-mateiro",
      "element": "tierra",
      "epithet": "El Silencioso del Bosque",
      "identity": "Tienes sensibilidad afinada y elegancia natural. Sientes el peligro antes de que llegue.",
      "strength": "Tu intuición y velocidad. Tu cuerpo sabe antes que tu mente.",
      "message": "\"Confía en lo que sientes. No siempre necesitas pruebas.\""
    },
    {
      "emoji": "🐢",
      "name": "Tartaruga Amazónica",
      "element": "tierra",
      "epithet": "La Memoria del Río",
      "identity": "Tienes el ritmo del tiempo largo. No corres porque sabes que llegarás.",
      "strength": "Tu constancia. Donde otros se rinden, tú sigues.",
      "message": "\"Tu casa va contigo. Eres refugio.\""
    }
  ],
  "pampas": [
    {
      "emoji": "🐆",
      "name": "Jaguar de Llano",
      "element": "fuego",
      "epithet": "El Cazador de Sabana",
      "identity": "Tienes presencia silenciosa pero imposible de ignorar. Tu poder no grita: acecha.",
      "strength": "Lectura del entorno. Donde otros ven caos, tú ves patrones.",
      "message": "\"No malgastes tu rugido. Guárdalo para cuando importe.\""
    },
    {
      "emoji": "🐊",
      "name": "Caimán Llanero",
      "element": "agua",
      "epithet": "El Antiguo del Río",
      "identity": "Cargas calma ancestral. Pocas cosas te alteran porque ya viste mucho.",
      "strength": "Tu resistencia. Aguantas lo que rompería a otros.",
      "message": "\"No reacciones a todo. Tu sola permanencia ya resuelve.\""
    },
    {
      "emoji": "🐬",
      "name": "Tonina",
      "element": "agua",
      "epithet": "El Espíritu del Orinoco",
      "identity": "Tienes magnetismo misterioso. La gente se acerca a ti sin saber por qué.",
      "strength": "Tu energía sanadora. Tu compañía cura.",
      "message": "\"Tu magia es real aunque otros no la nombren.\""
    },
    {
      "emoji": "🐍",
      "name": "Anaconda",
      "element": "agua",
      "epithet": "La Reina del Río",
      "identity": "Paciencia y poder simultáneos. No te apresuras porque sabes que llegarás.",
      "strength": "Tu calma estratégica. Esperas el momento y nunca fallas.",
      "message": "\"Tu paciencia es tu mejor arma. Sigue confiando en el tiempo.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Pescadora",
      "element": "aire",
      "epithet": "La Cazadora del Río",
      "identity": "Tienes precisión y enfoque. Cuando actúas, vas directo al punto.",
      "strength": "Tu claridad. Eliminas distracciones, vas al núcleo.",
      "message": "\"Tu velocidad sin dirección no sirve. Apunta bien.\""
    },
    {
      "emoji": "🦜",
      "name": "Guacamayo Bandera",
      "element": "aire",
      "epithet": "El Heraldo de los Llanos",
      "identity": "Tienes una personalidad explosiva y carismática. Donde llegas, lo notan.",
      "strength": "Tu carisma. Te abre puertas que ni esperabas tocar.",
      "message": "\"Tu voz es regalo. Úsala para construir.\""
    },
    {
      "emoji": "🐎",
      "name": "Caballo Criollo",
      "element": "aire",
      "epithet": "El Libre del Llano",
      "identity": "Tu libertad es sagrada. No funcionas en jaulas, ni siquiera bonitas.",
      "strength": "Tu independencia. No dependes de aprobación para moverte.",
      "message": "\"Tu libertad cuesta cara pero no se cambia. Sigue siendo libre.\""
    },
    {
      "emoji": "🦋",
      "name": "Mariposa de Llano",
      "element": "aire",
      "epithet": "La Frágil Sagrada",
      "identity": "Tienes belleza con propósito. Lo que llamas atención, lo haces para que importe.",
      "strength": "Tu impacto sutil. No necesitas mucho para dejar huella.",
      "message": "\"Lo frágil también es eterno.\""
    },
    {
      "emoji": "🐗",
      "name": "Capibara",
      "element": "tierra",
      "epithet": "La Reina del Encuentro",
      "identity": "Tienes capacidad de coexistencia. Vives bien con casi todos.",
      "strength": "Tu diplomacia natural. Unes en lugar de dividir.",
      "message": "\"Tu paz no es debilidad: es maestría.\""
    },
    {
      "emoji": "🦌",
      "name": "Venado de Cola Blanca",
      "element": "tierra",
      "epithet": "El Mensajero",
      "identity": "Tienes sensibilidad y elegancia. Sientes el peligro antes de que llegue.",
      "strength": "Tu intuición. Tu cuerpo te avisa antes que tu mente.",
      "message": "\"Confía en lo que sientes.\""
    },
    {
      "emoji": "🦊",
      "name": "Zorro Sabanero",
      "element": "tierra",
      "epithet": "El Astuto del Llano",
      "identity": "Mente rápida y alma juguetona. Te diviertes con la vida.",
      "strength": "Tu astucia con corazón. Resuelves con creatividad.",
      "message": "\"Tu humor es resistencia. No dejes que te lo roben.\""
    },
    {
      "emoji": "🐦",
      "name": "Garza Real",
      "element": "aire",
      "epithet": "La Paciente del Caño",
      "identity": "Paciencia poco común. Sabes que las cosas importantes llegan.",
      "strength": "Tu calma. Esperas sin desesperar.",
      "message": "\"Quietud no es pasividad. Es el arte de estar listo.\""
    },
    {
      "emoji": "🐦",
      "name": "Pájaro Carpintero",
      "element": "tierra",
      "epithet": "El Insistente",
      "identity": "Tienes una persistencia que rompe paredes. Lo que decides, lo logras a base de insistir.",
      "strength": "Tu constancia. Pequeño golpe + repetición = montaña movida.",
      "message": "\"Tu insistencia es tu superpoder. Sigue picando.\""
    },
    {
      "emoji": "🐌",
      "name": "Caracol Llanero",
      "element": "tierra",
      "epithet": "El Constructor",
      "identity": "Vas a tu ritmo, construyes a tu tiempo. Lo que haces dura.",
      "strength": "Tu paciencia constructiva. No improvisas: construyes con base.",
      "message": "\"Lo que se hace despacio, se hace bien.\""
    },
    {
      "emoji": "🐝",
      "name": "Abeja Angelita",
      "element": "tierra",
      "epithet": "La Pequeña Dulce",
      "identity": "Eres pequeño en apariencia pero enorme en utilidad. Lo que haces ayuda a muchos.",
      "strength": "Tu generosidad silenciosa. Das sin pedir reconocimiento.",
      "message": "\"Tu trabajo dulce alimenta sin que te vean. Sigue siendo así.\""
    },
    {
      "emoji": "🐗",
      "name": "Pecarí",
      "element": "tierra",
      "epithet": "El Guardián",
      "identity": "Eres alguien de comunidad. La gente que amas es tu fuerza.",
      "strength": "Tu lealtad. No abandonas.",
      "message": "\"Tu fuerza es colectiva. Pide ayuda cuando la necesites.\""
    },
    {
      "emoji": "🦂",
      "name": "Escorpión de Llano",
      "element": "fuego",
      "epithet": "El Defensor",
      "identity": "Proteges con fiereza lo tuyo. No buscas pelea, pero la enfrentas si llega.",
      "strength": "Tu defensa. Sabes poner límites claros.",
      "message": "\"No eres veneno: eres frontera.\""
    },
    {
      "emoji": "🐎",
      "name": "Mula",
      "element": "tierra",
      "epithet": "La Resistente",
      "identity": "Eres alguien que carga lo pesado sin quejarse. Tu fortaleza es legendaria.",
      "strength": "Tu resistencia. Aguantas lo que otros no aguantarían.",
      "message": "\"Sí cargas mucho, pero también puedes decir basta.\""
    },
    {
      "emoji": "🐕",
      "name": "Perro Llanero",
      "element": "tierra",
      "epithet": "El Compañero del Trabajo",
      "identity": "Tienes una lealtad sin condiciones. Donde estás, hay tribu.",
      "strength": "Tu compañía. La gente sabe que contigo no está sola.",
      "message": "\"Tu presencia es medicina. No la subestimes.\""
    },
    {
      "emoji": "🐍",
      "name": "Cascabel de Llano",
      "element": "fuego",
      "epithet": "La Anunciadora",
      "identity": "Avisas antes de actuar. Eres directo, claro, sin trampas.",
      "strength": "Tu transparencia. La gente sabe a qué atenerse contigo.",
      "message": "\"Tu claridad asusta pero protege. Sigue avisando antes.\""
    }
  ],
  "conosur": [
    {
      "emoji": "🐆",
      "name": "Puma",
      "element": "fuego",
      "epithet": "El León del Sur",
      "identity": "Tienes dignidad serena que impone respeto. Tu poder no necesita anunciarse.",
      "strength": "Tu independencia. No dependes de aprobación. Eso te hace estable.",
      "message": "\"Tu silencio es poder. Deja que tu presencia hable.\""
    },
    {
      "emoji": "🦅",
      "name": "Cóndor",
      "element": "aire",
      "epithet": "El Rey de los Andes",
      "identity": "Tienes visión que abarca lo enorme. Donde otros se agotan, tú aún subes.",
      "strength": "Tu altura. Lo que para otros es cumbre, para ti es base.",
      "message": "\"Tu vuelo no es huida: es perspectiva.\""
    },
    {
      "emoji": "🦙",
      "name": "Guanaco",
      "element": "aire",
      "epithet": "El Libre de la Estepa",
      "identity": "Eres independiente, ágil, libre. No te dejas domesticar fácil.",
      "strength": "Tu autonomía. Vives bien sin rebaño constante.",
      "message": "\"Tu libertad es tu mejor herencia. Cuídala.\""
    },
    {
      "emoji": "🦊",
      "name": "Zorro Gris Patagónico",
      "element": "tierra",
      "epithet": "El Astuto del Sur",
      "identity": "Mente rápida y alma juguetona. Te diviertes con la vida.",
      "strength": "Tu astucia con corazón. Resuelves con creatividad.",
      "message": "\"Tu humor es resistencia. No lo apagues.\""
    },
    {
      "emoji": "🐧",
      "name": "Pingüino",
      "element": "agua",
      "epithet": "El Compañero del Frío",
      "identity": "Tienes lealtad sin condiciones. Eres familia para los tuyos.",
      "strength": "Tu compromiso. La gente sabe que contigo se puede contar.",
      "message": "\"Tu lealtad es regalo poco común. Sigue siendo así.\""
    },
    {
      "emoji": "🦌",
      "name": "Huemul",
      "element": "tierra",
      "epithet": "El Espíritu de la Cordillera",
      "identity": "Tienes sensibilidad fina y elegancia natural. La gente nota tu manera de moverte.",
      "strength": "Tu intuición. Sientes lo sutil donde otros no.",
      "message": "\"Tu sensibilidad no es debilidad: es radar fino.\""
    },
    {
      "emoji": "🐎",
      "name": "Caballo Criollo",
      "element": "aire",
      "epithet": "El Libre de la Pampa",
      "identity": "Tu libertad es sagrada. No funcionas en jaulas.",
      "strength": "Tu independencia. No dependes de aprobación para moverte.",
      "message": "\"Tu libertad cuesta cara pero no se cambia.\""
    },
    {
      "emoji": "🦅",
      "name": "Caracara",
      "element": "aire",
      "epithet": "El Carroñero Sabio",
      "identity": "Encuentras valor donde otros descartan. Tu mirada ve oportunidades.",
      "strength": "Tu reciclaje creativo. Transformas lo descartado en recurso.",
      "message": "\"Lo que otros desechan, tú lo conviertes en oro.\""
    },
    {
      "emoji": "🐦",
      "name": "Ñandú",
      "element": "aire",
      "epithet": "El Veloz de la Pampa",
      "identity": "No vuelas, pero corres como nadie. Tu fuerza está en tus pies.",
      "strength": "Tu velocidad práctica. Avanzas sin necesidad de despegar.",
      "message": "\"No todo lo grande necesita alas. Tu camino terrestre es válido.\""
    },
    {
      "emoji": "🐦",
      "name": "Hornero",
      "element": "aire",
      "epithet": "El Arquitecto",
      "identity": "Construyes hogares duraderos. Tu casa es tu legado.",
      "strength": "Tu disciplina constructiva. Sabes que lo duradero requiere planificación.",
      "message": "\"Tu trabajo de hormiga construye monumentos.\""
    },
    {
      "emoji": "🐟",
      "name": "Trucha Arcoíris",
      "element": "agua",
      "epithet": "La Viajera del Río",
      "identity": "Vas contra corriente cuando hay que ir. No te dejas llevar.",
      "strength": "Tu fuerza para subir. Donde otros se rinden, tú sigues.",
      "message": "\"Tu camino cuesta arriba te formó. Sigue subiendo.\""
    },
    {
      "emoji": "🦭",
      "name": "Lobo Marino",
      "element": "agua",
      "epithet": "El Sociable del Mar",
      "identity": "Vives bien en comunidad. Tu energía social es alta y contagiosa.",
      "strength": "Tu calidez. La gente quiere estar cerca de ti.",
      "message": "\"Tu alegría es regalo. No la racionalices.\""
    },
    {
      "emoji": "🐳",
      "name": "Ballena Franca",
      "element": "agua",
      "epithet": "La Antigua del Sur",
      "identity": "Tienes profundidad emocional poco común. Sientes en grande.",
      "strength": "Tu capacidad de profundizar. No te quedas en superficie.",
      "message": "\"Tu profundidad asusta a quien vive en lo plano. Sigue así.\""
    },
    {
      "emoji": "🐬",
      "name": "Tonina Overa",
      "element": "agua",
      "epithet": "La Bailarina del Atlántico",
      "identity": "Tienes alegría que sana. La gente busca tu cercanía sin saber por qué.",
      "strength": "Tu energía. Levantas el ánimo sin esfuerzo.",
      "message": "\"No subestimes tu alegría. Es revolucionaria.\""
    },
    {
      "emoji": "🐊",
      "name": "Yacaré",
      "element": "agua",
      "epithet": "El Guardián del Estero",
      "identity": "Cargas calma de quien ya vio mucho. Pocas cosas te alteran.",
      "strength": "Tu resistencia. Aguantas lo que rompería a otros.",
      "message": "\"No reacciones a todo. Algunas cosas se resuelven con que tú permanezcas.\""
    },
    {
      "emoji": "🦦",
      "name": "Lobito de Río",
      "element": "agua",
      "epithet": "El Juguetón",
      "identity": "Tienes alma alegre y curiosa. Encuentras juego donde otros ven trabajo.",
      "strength": "Tu capacidad de disfrute. Conviertes lo simple en celebración.",
      "message": "\"No dejes que el mundo te robe la risa.\""
    },
    {
      "emoji": "🐗",
      "name": "Carpincho",
      "element": "tierra",
      "epithet": "El Pacífico Gigante",
      "identity": "Tienes capacidad de coexistencia. Vives bien con casi todos.",
      "strength": "Tu diplomacia natural. Unes en lugar de dividir.",
      "message": "\"Tu paz no es debilidad: es maestría.\""
    },
    {
      "emoji": "🐂",
      "name": "Toro Pampeano",
      "element": "tierra",
      "epithet": "El Firme",
      "identity": "Eres alguien con palabra. Lo que dices, lo cumples.",
      "strength": "Tu integridad. La gente puede contar contigo.",
      "message": "\"Tu palabra es tu sello. Cuídala más que tu reputación.\""
    },
    {
      "emoji": "🐕",
      "name": "Ovejero",
      "element": "tierra",
      "epithet": "El Compañero del Campo",
      "identity": "Tienes lealtad incondicional. Donde estás, hay tribu.",
      "strength": "Tu compañía. La gente sabe que contigo no está sola.",
      "message": "\"Tu presencia es medicina.\""
    },
    {
      "emoji": "🦂",
      "name": "Escorpión Patagónico",
      "element": "fuego",
      "epithet": "El Centinela del Sur",
      "identity": "Proteges con fiereza lo tuyo. No buscas pelea, pero la enfrentas si llega.",
      "strength": "Tu defensa. Sabes poner límites claros.",
      "message": "\"No eres veneno: eres frontera.\""
    }
  ],
  "norteamerica": [
    {
      "emoji": "🦅",
      "name": "Águila Calva",
      "element": "aire",
      "epithet": "El Símbolo Libre",
      "identity": "Naciste para ver lejos. Mientras otros se enredan en lo pequeño, tú observas el panorama.",
      "strength": "Tu enfoque. Lo que decides perseguir, lo persigues hasta el final.",
      "message": "\"Vuela alto pero recuerda dónde está tu nido.\""
    },
    {
      "emoji": "🐻",
      "name": "Oso Grizzly",
      "element": "tierra",
      "epithet": "El Soberano del Bosque",
      "identity": "Tienes una fuerza tranquila pero imponente. La gente respeta tu espacio sin que lo pidas.",
      "strength": "Tu autoridad natural. Tu sola presencia ya impone.",
      "message": "\"Tu fuerza no necesita demostrarse. Quien sabe, sabe.\""
    },
    {
      "emoji": "🐺",
      "name": "Lobo Gris",
      "element": "fuego",
      "epithet": "El Líder de la Manada",
      "identity": "Eres alguien de tribu pero con liderazgo natural. La gente busca tu orientación.",
      "strength": "Tu intuición social. Sabes leer dinámicas grupales.",
      "message": "\"Tu manada te necesita más estratégico que feroz. Lidera con cabeza.\""
    },
    {
      "emoji": "🦬",
      "name": "Bisonte",
      "element": "tierra",
      "epithet": "El Antiguo de la Pradera",
      "identity": "Tienes resistencia ancestral. Lo que te golpea, te endurece sin amargarte.",
      "strength": "Tu fortaleza emocional. Has pasado tormentas y sigues.",
      "message": "\"Tu peso es tu poder. No te apresures por nada.\""
    },
    {
      "emoji": "🐆",
      "name": "Puma",
      "element": "fuego",
      "epithet": "El León de la Montaña",
      "identity": "Tienes dignidad serena que impone respeto. Tu poder no grita.",
      "strength": "Tu independencia. No dependes de aprobación.",
      "message": "\"Tu silencio es poder. Deja que tu presencia hable.\""
    },
    {
      "emoji": "🦅",
      "name": "Halcón Peregrino",
      "element": "aire",
      "epithet": "El Más Veloz",
      "identity": "Tienes precisión y velocidad. Cuando decides algo, vas con todo.",
      "strength": "Tu enfoque láser. Eliminas distracciones.",
      "message": "\"Tu velocidad sin dirección no sirve. Apunta antes de lanzarte.\""
    },
    {
      "emoji": "🦌",
      "name": "Alce",
      "element": "tierra",
      "epithet": "El Gigante del Bosque",
      "identity": "Tienes presencia imponente sin ser agresivo. La gente nota cuando llegas.",
      "strength": "Tu autoridad natural. Lideras sin pedirlo.",
      "message": "\"Tu tamaño es responsabilidad. Cuida cómo lo usas.\""
    },
    {
      "emoji": "🦫",
      "name": "Castor",
      "element": "tierra",
      "epithet": "El Constructor",
      "identity": "Eres alguien que transforma su entorno. Lo que tocas, lo mejoras.",
      "strength": "Tu disciplina constructiva. No esperas: construyes.",
      "message": "\"Tu trabajo cambia paisajes. Sigue construyendo.\""
    },
    {
      "emoji": "🦝",
      "name": "Mapache",
      "element": "tierra",
      "epithet": "El Astuto Nocturno",
      "identity": "Eres curioso, inteligente, con manos hábiles. Encuentras valor donde otros no buscan.",
      "strength": "Tu ingenio. Resuelves problemas con creatividad inusual.",
      "message": "\"Tu curiosidad es regalo. Sigue investigando.\""
    },
    {
      "emoji": "🦊",
      "name": "Zorro Rojo",
      "element": "tierra",
      "epithet": "El Astuto",
      "identity": "Mente rápida y alma juguetona. Te diviertes con la vida.",
      "strength": "Tu astucia con corazón. Resuelves con creatividad.",
      "message": "\"Tu humor es resistencia. No lo apagues.\""
    },
    {
      "emoji": "🦉",
      "name": "Búho Nival",
      "element": "aire",
      "epithet": "El Sabio del Norte",
      "identity": "Ves lo que otros no quieren ver. Te buscan cuando importa.",
      "strength": "Tu visión nocturna. Entiendes lo no dicho.",
      "message": "\"El silencio es tu maestro. Habla menos, observa más.\""
    },
    {
      "emoji": "🐦",
      "name": "Cuervo",
      "element": "aire",
      "epithet": "El Mensajero Negro",
      "identity": "Tienes inteligencia poco común. Resuelves problemas que parecen imposibles.",
      "strength": "Tu intelecto. Procesas patrones complejos sin esfuerzo.",
      "message": "\"Tu mente es regalo. Úsala para construir, no para juzgar.\""
    },
    {
      "emoji": "🦫",
      "name": "Coyote",
      "element": "fuego",
      "epithet": "El Trickster del Desierto",
      "identity": "Inteligencia rápida y humor que desarma. Sobrevives a todo.",
      "strength": "Tu astucia. Encuentras caminos donde otros ven paredes.",
      "message": "\"Tu humor es magia. No lo apagues por agradar.\""
    },
    {
      "emoji": "🦂",
      "name": "Serpiente Cascabel",
      "element": "fuego",
      "epithet": "La Anunciadora",
      "identity": "Avisas antes de actuar. Eres directo, claro, sin trampas.",
      "strength": "Tu transparencia. La gente sabe a qué atenerse contigo.",
      "message": "\"Tu claridad asusta pero protege.\""
    },
    {
      "emoji": "🦅",
      "name": "Halcón de Cola Roja",
      "element": "aire",
      "epithet": "El Cazador",
      "identity": "Tienes precisión natural. Lo que apuntas, lo alcanzas.",
      "strength": "Tu enfoque. Eliminas lo innecesario.",
      "message": "\"Tu velocidad es regalo, pero no sin dirección.\""
    },
    {
      "emoji": "🐟",
      "name": "Salmón",
      "element": "agua",
      "epithet": "El Que Sube",
      "identity": "Vas contra corriente cuando hay que ir. No te dejas llevar por lo fácil.",
      "strength": "Tu fuerza para subir. Donde otros se rinden, tú sigues.",
      "message": "\"Tu camino cuesta arriba te formó. Sigue subiendo.\""
    },
    {
      "emoji": "🐬",
      "name": "Orca",
      "element": "agua",
      "epithet": "La Reina del Mar",
      "identity": "Eres alguien estratégico y poderoso. Cuando decides, no titubeas.",
      "strength": "Tu inteligencia táctica. Planeas antes de actuar.",
      "message": "\"Tu poder es responsabilidad. Úsalo con sabiduría.\""
    },
    {
      "emoji": "🦦",
      "name": "Nutria Marina",
      "element": "agua",
      "epithet": "La Juguetona",
      "identity": "Tienes alegría que sana. Encuentras juego en todo.",
      "strength": "Tu capacidad de disfrute. Conviertes lo simple en celebración.",
      "message": "\"Tu alegría es revolución.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga Mordedora",
      "element": "agua",
      "epithet": "La Antigua del Lago",
      "identity": "Cargas calma de quien ya vio mucho.",
      "strength": "Tu resistencia. Aguantas lo que rompería a otros.",
      "message": "\"Tu casa va contigo.\""
    },
    {
      "emoji": "🦅",
      "name": "Mariposa Monarca",
      "element": "aire",
      "epithet": "La Migrante",
      "identity": "Tienes alma de viajero. El destino para ti no es un lugar: es movimiento.",
      "strength": "Tu transformación constante. No te quedas en lo que fuiste.",
      "message": "\"Lo frágil también es eterno.\""
    }
  ],
  "iberia": [
    {
      "emoji": "🐺",
      "name": "Lobo Ibérico",
      "element": "fuego",
      "epithet": "El Sobreviviente de la Sierra",
      "identity": "Eres alguien que sobrevivió a todo. Tu fortaleza nació de épocas duras y por eso ya no le temes a casi nada.",
      "strength": "Tu resiliencia. Has aprendido a vivir donde otros se rendirían.",
      "message": "\"Tu cicatriz no es debilidad: es prueba. Sigue caminando, ya hiciste lo difícil.\""
    },
    {
      "emoji": "🐆",
      "name": "Lince Ibérico",
      "element": "fuego",
      "epithet": "El Cazador Solitario",
      "identity": "Tienes una elegancia indomable. No te juntas con cualquiera, y eso te hace especial.",
      "strength": "Tu selectividad. No malgastas tu energía con quien no la merece.",
      "message": "\"Tu manera de elegir compañía es sabiduría. No te explayes.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Imperial",
      "element": "aire",
      "epithet": "La Soberana del Cielo",
      "identity": "Tienes presencia regia natural. La gente nota tu manera de estar en el mundo.",
      "strength": "Tu autoridad sin esfuerzo. No buscas mandar: simplemente eres seguido.",
      "message": "\"Tu altura no es soberbia: es perspectiva. Sigue volando.\""
    },
    {
      "emoji": "🐻",
      "name": "Oso Pardo",
      "element": "tierra",
      "epithet": "El Antiguo del Bosque",
      "identity": "Tienes fuerza tranquila pero imponente. Cargas algo ancestral en el alma.",
      "strength": "Tu fortaleza serena. No buscas pelea, pero la enfrentas con todo si llega.",
      "message": "\"Tu calma intimida más que mil gritos. Cuídala.\""
    },
    {
      "emoji": "🦅",
      "name": "Buitre Leonado",
      "element": "aire",
      "epithet": "El Sabio del Cielo",
      "identity": "Encuentras valor donde otros descartan. Tu mirada ve oportunidades.",
      "strength": "Tu reciclaje creativo. Transformas lo descartado en recurso.",
      "message": "\"Lo que otros desechan, tú lo conviertes en oro.\""
    },
    {
      "emoji": "🦊",
      "name": "Zorro Rojo",
      "element": "tierra",
      "epithet": "El Astuto Ibérico",
      "identity": "Mente rápida y alma juguetona. Te diviertes con la vida.",
      "strength": "Tu astucia con corazón. Resuelves con creatividad.",
      "message": "\"Tu humor es resistencia. No lo apagues.\""
    },
    {
      "emoji": "🐗",
      "name": "Jabalí",
      "element": "tierra",
      "epithet": "El Solitario del Monte",
      "identity": "Necesitas tu espacio para funcionar. Tu independencia es sagrada.",
      "strength": "Tu autonomía. No dependes de aprobación para moverte.",
      "message": "\"Tu soledad no es huida: es taller.\""
    },
    {
      "emoji": "🦌",
      "name": "Ciervo Ibérico",
      "element": "tierra",
      "epithet": "El Berreador",
      "identity": "Tienes sensibilidad afinada con dignidad. Sientes intenso pero no pierdes elegancia.",
      "strength": "Tu intuición y porte. Lo que sientes en el cuerpo, lo expresas con clase.",
      "message": "\"Tu sensibilidad no debilita: te hace humano completo.\""
    },
    {
      "emoji": "🐎",
      "name": "Caballo Andaluz",
      "element": "aire",
      "epithet": "El Noble del Sur",
      "identity": "Tienes una elegancia que se nota en cada gesto. Llevas siglos de dignidad en la sangre.",
      "strength": "Tu porte. Sin esfuerzo, la gente te respeta.",
      "message": "\"Tu dignidad es legado. Honra a quienes te formaron.\""
    },
    {
      "emoji": "🐦",
      "name": "Cigüeña",
      "element": "aire",
      "epithet": "La Mensajera del Pueblo",
      "identity": "Eres alguien de regresar. Donde sea que vayas, vuelves a tus raíces.",
      "strength": "Tu memoria de hogar. Sabes de dónde vienes y eso te ancla.",
      "message": "\"Tus raíces te sostienen, aunque vueles lejos.\""
    },
    {
      "emoji": "🐦",
      "name": "Águila Pescadora",
      "element": "aire",
      "epithet": "La Cazadora del Tajo",
      "identity": "Tienes precisión y enfoque. Vas directo al núcleo.",
      "strength": "Tu claridad. Eliminas distracciones, vas al objetivo.",
      "message": "\"Tu velocidad sin dirección no sirve. Apunta antes de lanzarte.\""
    },
    {
      "emoji": "🦉",
      "name": "Búho Real",
      "element": "aire",
      "epithet": "El Vigilante de la Noche",
      "identity": "Ves lo que otros no quieren ver. Te buscan cuando importa de verdad.",
      "strength": "Tu visión nocturna. Entiendes lo no dicho.",
      "message": "\"El silencio es tu maestro. Habla menos, observa más.\""
    },
    {
      "emoji": "🐦",
      "name": "Mochuelo",
      "element": "aire",
      "epithet": "El Pequeño Sabio",
      "identity": "Eres pequeño pero perspicaz. Lo que ves, lo entiendes en profundidad.",
      "strength": "Tu observación detallada. Notas cosas sutiles que otros no.",
      "message": "\"Tu tamaño no limita tu mirada. Sigue observando.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín Atlántico",
      "element": "agua",
      "epithet": "El Sanador del Mar",
      "identity": "Tienes alma alegre y sanadora. La gente busca tu cercanía.",
      "strength": "Tu energía. Levantas el ánimo sin esfuerzo.",
      "message": "\"No subestimes tu alegría. Es revolucionaria.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga Boba",
      "element": "agua",
      "epithet": "La Viajera del Mediterráneo",
      "identity": "Tienes el ritmo del tiempo largo. Tu paciencia es ancestral.",
      "strength": "Tu constancia. Donde otros se rinden, tú sigues.",
      "message": "\"Tu casa va contigo. Eres refugio.\""
    },
    {
      "emoji": "🐟",
      "name": "Atún Rojo",
      "element": "agua",
      "epithet": "El Rey del Estrecho",
      "identity": "Eres alguien fuerte y migrante. No te quedas estancado en ningún lugar.",
      "strength": "Tu velocidad y resistencia. Cubres distancias enormes sin agotarte.",
      "message": "\"Tu necesidad de movimiento es legítima. No te disculpes por irte.\""
    },
    {
      "emoji": "🦦",
      "name": "Nutria",
      "element": "agua",
      "epithet": "La Juguetona del Río",
      "identity": "Tienes alma alegre y curiosa. Encuentras juego donde otros ven trabajo.",
      "strength": "Tu capacidad de disfrute. Conviertes lo simple en celebración.",
      "message": "\"No dejes que el mundo te robe la risa.\""
    },
    {
      "emoji": "🦂",
      "name": "Escorpión Mediterráneo",
      "element": "fuego",
      "epithet": "El Centinela",
      "identity": "Proteges con fiereza lo tuyo. No buscas pelea, pero la enfrentas si llega.",
      "strength": "Tu defensa. Sabes poner límites claros.",
      "message": "\"No eres veneno: eres frontera.\""
    },
    {
      "emoji": "🐝",
      "name": "Abeja Negra",
      "element": "tierra",
      "epithet": "La Tejedora Antigua",
      "identity": "Eres colaborativo. Sabes que solo no se llega lejos.",
      "strength": "Tu sentido de propósito colectivo.",
      "message": "\"Tu trabajo es dulce aunque no lo veas.\""
    },
    {
      "emoji": "🐍",
      "name": "Culebra Bastarda",
      "element": "fuego",
      "epithet": "La Veloz del Campo",
      "identity": "Estás en transformación constante. Cambias de piel sin nostalgia.",
      "strength": "Tu capacidad de renovación. No te aferras a lo que fuiste.",
      "message": "\"La piel vieja no es muerte: es regalo. Suéltala.\""
    }
  ],
  "europa": [
    {
      "emoji": "🐺",
      "name": "Lobo Gris",
      "element": "fuego",
      "epithet": "El Líder de la Manada",
      "identity": "Eres alguien de tribu pero con liderazgo natural. La gente busca tu orientación.",
      "strength": "Tu intuición social. Sabes leer dinámicas grupales.",
      "message": "\"Tu manada te necesita estratégico, no feroz. Lidera con cabeza.\""
    },
    {
      "emoji": "🐻",
      "name": "Oso Pardo",
      "element": "tierra",
      "epithet": "El Antiguo del Bosque",
      "identity": "Tienes fuerza tranquila pero imponente. Cargas algo ancestral.",
      "strength": "Tu fortaleza serena. No buscas pelea, pero la enfrentas si llega.",
      "message": "\"Tu calma intimida más que mil gritos.\""
    },
    {
      "emoji": "🦌",
      "name": "Ciervo",
      "element": "tierra",
      "epithet": "El Noble del Bosque",
      "identity": "Tienes elegancia natural y sensibilidad fina.",
      "strength": "Tu intuición y porte. Lo que sientes lo expresas con clase.",
      "message": "\"Tu sensibilidad no debilita: te hace humano completo.\""
    },
    {
      "emoji": "🦊",
      "name": "Zorro Rojo",
      "element": "tierra",
      "epithet": "El Astuto",
      "identity": "Mente rápida y alma juguetona. Te diviertes con la vida.",
      "strength": "Tu astucia con corazón.",
      "message": "\"Tu humor es resistencia.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Dorada",
      "element": "aire",
      "epithet": "La Soberana",
      "identity": "Tienes visión que abarca lo enorme. Donde otros se agotan, tú aún subes.",
      "strength": "Tu altura. Lo que para otros es cumbre, para ti es base.",
      "message": "\"Tu vuelo no es huida: es perspectiva.\""
    },
    {
      "emoji": "🦉",
      "name": "Búho Real",
      "element": "aire",
      "epithet": "El Sabio Nocturno",
      "identity": "Ves lo que otros no quieren ver.",
      "strength": "Tu visión nocturna. Entiendes lo no dicho.",
      "message": "\"El silencio es tu maestro.\""
    },
    {
      "emoji": "🦅",
      "name": "Halcón Peregrino",
      "element": "aire",
      "epithet": "El Más Veloz",
      "identity": "Tienes precisión y velocidad. Cuando decides, vas con todo.",
      "strength": "Tu enfoque láser.",
      "message": "\"Tu velocidad sin dirección no sirve. Apunta primero.\""
    },
    {
      "emoji": "🐦",
      "name": "Cuervo",
      "element": "aire",
      "epithet": "El Mensajero Negro",
      "identity": "Tienes inteligencia poco común. Resuelves problemas imposibles.",
      "strength": "Tu intelecto. Procesas patrones complejos sin esfuerzo.",
      "message": "\"Tu mente es regalo. Úsala para construir, no para juzgar.\""
    },
    {
      "emoji": "🐦",
      "name": "Mirlo",
      "element": "aire",
      "epithet": "El Cantor del Amanecer",
      "identity": "Tienes voz que llama. Cuando hablas o cantas, el aire cambia.",
      "strength": "Tu expresión. Sabes nombrar lo que otros no logran articular.",
      "message": "\"Tu voz convoca. Úsala con conciencia.\""
    },
    {
      "emoji": "🦆",
      "name": "Cisne",
      "element": "aire",
      "epithet": "El Elegante del Lago",
      "identity": "Tienes una elegancia que llama atención sin esfuerzo.",
      "strength": "Tu porte. Conviertes lo cotidiano en escena.",
      "message": "\"Tu belleza es firma. Cuídala como un templo.\""
    },
    {
      "emoji": "🐗",
      "name": "Jabalí",
      "element": "tierra",
      "epithet": "El Solitario del Monte",
      "identity": "Necesitas espacio para funcionar. Tu independencia es sagrada.",
      "strength": "Tu autonomía. No dependes de aprobación.",
      "message": "\"Tu soledad es taller, no destierro.\""
    },
    {
      "emoji": "🐇",
      "name": "Liebre",
      "element": "tierra",
      "epithet": "La Veloz",
      "identity": "Tienes velocidad y reflejos. Reaccionas antes de que otros entiendan qué pasó.",
      "strength": "Tu respuesta rápida. Cuando hay que moverse, eres el primero.",
      "message": "\"Tu miedo no es debilidad: es radar fino.\""
    },
    {
      "emoji": "🦡",
      "name": "Tejón",
      "element": "tierra",
      "epithet": "El Constructor Subterráneo",
      "identity": "Vas a tu ritmo y construyes mundos enteros bajo la superficie. Nadie ve cuánto trabajo invertiste.",
      "strength": "Tu trabajo silencioso. Construyes legados sin pedir reconocimiento.",
      "message": "\"Tu obra es real aunque otros no la vean.\""
    },
    {
      "emoji": "🦔",
      "name": "Erizo",
      "element": "tierra",
      "epithet": "El Acorazado",
      "identity": "Te proteges con sabiduría. Sabes qué merece tu energía y qué no.",
      "strength": "Tu límite saludable. No te abres con cualquiera.",
      "message": "\"Tu coraza no es muro: es filtro.\""
    },
    {
      "emoji": "🐝",
      "name": "Abeja Europea",
      "element": "tierra",
      "epithet": "La Tejedora del Panal",
      "identity": "Eres colaborativo. Sabes que solo no se llega lejos.",
      "strength": "Tu sentido de propósito colectivo.",
      "message": "\"Tu trabajo es dulce aunque no lo veas.\""
    },
    {
      "emoji": "🐍",
      "name": "Víbora Áspid",
      "element": "fuego",
      "epithet": "La Sabia del Camino",
      "identity": "Tienes claridad para avisar antes de actuar. Eres directo sin trampas.",
      "strength": "Tu transparencia. La gente sabe a qué atenerse contigo.",
      "message": "\"Tu claridad asusta pero protege.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín del Mediterráneo",
      "element": "agua",
      "epithet": "El Sanador",
      "identity": "Tienes alma alegre y sanadora.",
      "strength": "Tu energía. Levantas el ánimo sin esfuerzo.",
      "message": "\"No subestimes tu alegría.\""
    },
    {
      "emoji": "🐟",
      "name": "Trucha Común",
      "element": "agua",
      "epithet": "La Viajera del Río",
      "identity": "Vas contra corriente cuando hay que ir. No te dejas llevar.",
      "strength": "Tu fuerza para subir.",
      "message": "\"Tu camino cuesta arriba te formó.\""
    },
    {
      "emoji": "🦦",
      "name": "Nutria Europea",
      "element": "agua",
      "epithet": "La Juguetona",
      "identity": "Tienes alma alegre y curiosa.",
      "strength": "Tu capacidad de disfrute.",
      "message": "\"No dejes que el mundo te robe la risa.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga Mediterránea",
      "element": "agua",
      "epithet": "La Antigua",
      "identity": "Tienes el ritmo del tiempo largo.",
      "strength": "Tu constancia.",
      "message": "\"Tu casa va contigo.\""
    }
  ],
  "sudeste_asia": [
    {
      "emoji": "🐅",
      "name": "Tigre",
      "element": "fuego",
      "epithet": "El Soberano de la Selva",
      "identity": "Tienes una presencia que silencia el cuarto. Tu fuerza es magnética.",
      "strength": "Tu autoridad natural. No mandas: simplemente eres seguido.",
      "message": "\"Tu poder no necesita gritar. La selva sabe quién eres.\""
    },
    {
      "emoji": "🐘",
      "name": "Elefante Asiático",
      "element": "tierra",
      "epithet": "La Memoria Eterna",
      "identity": "Cargas memoria profunda. Lo que viviste, lo entiendes a fondo.",
      "strength": "Tu sabiduría emocional. Aprendes de cada experiencia.",
      "message": "\"Tu memoria es regalo, no carga. Honra lo aprendido.\""
    },
    {
      "emoji": "🐉",
      "name": "Dragón Komodo",
      "element": "fuego",
      "epithet": "El Antiguo de la Isla",
      "identity": "Eres alguien que parece de otro tiempo. Tu poder es ancestral.",
      "strength": "Tu paciencia ancestral. Esperas con calma lo que viene.",
      "message": "\"Tu calma intimida a los apresurados. No cambies.\""
    },
    {
      "emoji": "🐒",
      "name": "Macaco",
      "element": "aire",
      "epithet": "El Curioso",
      "identity": "Tienes curiosidad sin límite. Lo tocas todo, lo aprendes todo.",
      "strength": "Tu mente abierta. No tienes prejuicios fáciles.",
      "message": "\"Tu curiosidad es regalo. No dejes que la apaguen.\""
    },
    {
      "emoji": "🦜",
      "name": "Cacatúa",
      "element": "aire",
      "epithet": "La Voz Brillante",
      "identity": "Tienes personalidad explosiva y carismática.",
      "strength": "Tu carisma. Te abre puertas.",
      "message": "\"Tu voz es regalo. Úsala para construir.\""
    },
    {
      "emoji": "🐍",
      "name": "Cobra Real",
      "element": "fuego",
      "epithet": "La Reina Encapuchada",
      "identity": "Tienes poder con elegancia. Cuando te muestras, no hay duda.",
      "strength": "Tu presencia. Quien te conoce, te respeta.",
      "message": "\"Tu poder no es para todos. Reserva tu muestra para lo que importa.\""
    },
    {
      "emoji": "🦋",
      "name": "Mariposa de Atlas",
      "element": "aire",
      "epithet": "La Gigante Sagrada",
      "identity": "Tienes una belleza enorme que sorprende. La gente nota tu impacto.",
      "strength": "Tu presencia inolvidable. No pasas desapercibido.",
      "message": "\"Lo grande también es frágil. Cuídate.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Filipina",
      "element": "aire",
      "epithet": "La Reina del Cielo",
      "identity": "Tienes presencia regia natural.",
      "strength": "Tu autoridad sin esfuerzo.",
      "message": "\"Tu altura no es soberbia: es perspectiva.\""
    },
    {
      "emoji": "🐦",
      "name": "Pavo Real",
      "element": "aire",
      "epithet": "El Joya Viviente",
      "identity": "Tienes belleza que no se imita. La gente se gira cuando pasas.",
      "strength": "Tu magnetismo. No buscas, te encuentran.",
      "message": "\"Lo que brilla atrae mucha mirada. Distingue admiración de envidia.\""
    },
    {
      "emoji": "🦉",
      "name": "Búho Pescador",
      "element": "aire",
      "epithet": "El Sabio del Manglar",
      "identity": "Ves lo que otros no quieren ver.",
      "strength": "Tu visión nocturna.",
      "message": "\"El silencio es tu maestro.\""
    },
    {
      "emoji": "🐊",
      "name": "Cocodrilo de Agua Salada",
      "element": "agua",
      "epithet": "El Antiguo del Mar",
      "identity": "Cargas calma de quien ya vio mucho.",
      "strength": "Tu resistencia. Aguantas lo que rompería a otros.",
      "message": "\"No reacciones a todo. Tu sola permanencia ya resuelve.\""
    },
    {
      "emoji": "🦈",
      "name": "Tiburón Ballena",
      "element": "agua",
      "epithet": "El Gigante Gentil",
      "identity": "Tienes calma poderosa. Eres grande pero pacífico.",
      "strength": "Tu serenidad. En el caos, eres ancla.",
      "message": "\"Tu tamaño no es para imponer: es para abrazar.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga Carey",
      "element": "agua",
      "epithet": "La Joya del Mar",
      "identity": "Tienes el ritmo del tiempo largo.",
      "strength": "Tu constancia.",
      "message": "\"Tu casa va contigo.\""
    },
    {
      "emoji": "🐠",
      "name": "Pez Mandarín",
      "element": "agua",
      "epithet": "El Pintor del Arrecife",
      "identity": "Tienes creatividad que no se apaga.",
      "strength": "Tu imaginación. Conviertes problemas en arte.",
      "message": "\"Tu mirada cambia las cosas. Sigue pintando el mundo.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín Rosado",
      "element": "agua",
      "epithet": "El Sanador",
      "identity": "Tienes alma alegre y sanadora.",
      "strength": "Tu energía. Levantas el ánimo sin esfuerzo.",
      "message": "\"No subestimes tu alegría.\""
    },
    {
      "emoji": "🦌",
      "name": "Sambar",
      "element": "tierra",
      "epithet": "El Gentil del Bosque",
      "identity": "Tienes sensibilidad afinada y elegancia.",
      "strength": "Tu intuición.",
      "message": "\"Confía en lo que sientes.\""
    },
    {
      "emoji": "🦝",
      "name": "Civeta",
      "element": "tierra",
      "epithet": "La Nocturna Discreta",
      "identity": "Tienes una vida intensa pero discreta. La gente solo conoce una parte de ti.",
      "strength": "Tu privacidad estratégica. No todo el mundo merece toda tu historia.",
      "message": "\"Lo que reservas, lo proteges. Tu silencio es sabiduría.\""
    },
    {
      "emoji": "🐗",
      "name": "Jabalí Verrugoso",
      "element": "tierra",
      "epithet": "El Solitario",
      "identity": "Necesitas espacio para funcionar.",
      "strength": "Tu autonomía.",
      "message": "\"Tu soledad es taller.\""
    },
    {
      "emoji": "🦎",
      "name": "Varano",
      "element": "tierra",
      "epithet": "El Cazador Paciente",
      "identity": "Sabes esperar tu momento. Confías en que llegará.",
      "strength": "Tu paciencia activa. Esperas pero no te quedas inmóvil.",
      "message": "\"Descansar también es estrategia.\""
    },
    {
      "emoji": "🐍",
      "name": "Pitón",
      "element": "fuego",
      "epithet": "El Abrazo Eterno",
      "identity": "Tienes paciencia y fuerza simultáneas.",
      "strength": "Tu persistencia. Lo que abrazas, te pertenece.",
      "message": "\"No te apresures. Lo que aprietas con paciencia, no se escapa.\""
    }
  ],
  "asia": [
    {
      "emoji": "🐅",
      "name": "Tigre de Bengala",
      "element": "fuego",
      "epithet": "El Rey Solitario",
      "identity": "Tienes presencia que silencia. Tu fuerza es magnética y solitaria.",
      "strength": "Tu autoridad natural.",
      "message": "\"Tu poder no necesita gritar.\""
    },
    {
      "emoji": "🐉",
      "name": "Dragón",
      "element": "fuego",
      "epithet": "El Sagrado del Cielo",
      "identity": "Cargas poder ancestral. Hay en ti algo que la gente reconoce sin nombrar.",
      "strength": "Tu energía vital. Tu sola presencia transforma ambientes.",
      "message": "\"Tu poder es regalo. Úsalo para construir.\""
    },
    {
      "emoji": "🐼",
      "name": "Panda",
      "element": "tierra",
      "epithet": "El Pacífico de las Montañas",
      "identity": "Tienes una calma poderosa y un humor sutil. La gente subestima tu fuerza por tu apariencia.",
      "strength": "Tu paciencia con autoridad. Cuando hablas, los demás escuchan.",
      "message": "\"Tu suavidad no es debilidad. Es elección.\""
    },
    {
      "emoji": "🐘",
      "name": "Elefante Asiático",
      "element": "tierra",
      "epithet": "La Memoria Eterna",
      "identity": "Cargas memoria profunda.",
      "strength": "Tu sabiduría emocional.",
      "message": "\"Tu memoria es regalo, no carga.\""
    },
    {
      "emoji": "🐒",
      "name": "Mono Dorado",
      "element": "aire",
      "epithet": "El Sabio de las Alturas",
      "identity": "Tienes curiosidad e inteligencia. Encuentras juego en cada situación.",
      "strength": "Tu ingenio. Resuelves con creatividad.",
      "message": "\"Tu curiosidad es regalo.\""
    },
    {
      "emoji": "🦚",
      "name": "Pavo Real",
      "element": "aire",
      "epithet": "La Joya Viviente",
      "identity": "Tienes belleza que no se imita.",
      "strength": "Tu magnetismo. No buscas, te encuentran.",
      "message": "\"Lo que brilla atrae mucha mirada.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Esteparia",
      "element": "aire",
      "epithet": "La Soberana del Cielo",
      "identity": "Tienes visión que abarca lo enorme.",
      "strength": "Tu altura.",
      "message": "\"Tu vuelo no es huida: es perspectiva.\""
    },
    {
      "emoji": "🦉",
      "name": "Búho Real",
      "element": "aire",
      "epithet": "El Sabio Nocturno",
      "identity": "Ves lo que otros no quieren ver.",
      "strength": "Tu visión nocturna.",
      "message": "\"El silencio es tu maestro.\""
    },
    {
      "emoji": "🦩",
      "name": "Grulla Manchú",
      "element": "aire",
      "epithet": "La Longeva Sagrada",
      "identity": "Tienes elegancia y longevidad simbólicas. La gente nota tu manera de estar.",
      "strength": "Tu porte. No buscas atención, pero la atraes.",
      "message": "\"Tu dignidad es legado. Honra a quienes te formaron.\""
    },
    {
      "emoji": "🐦",
      "name": "Fénix",
      "element": "fuego",
      "epithet": "El Renacido",
      "identity": "Tienes una capacidad de renacer poco común. Lo que te quema, te reconstruye.",
      "strength": "Tu transformación. No te quedas atrapado en cenizas.",
      "message": "\"Tus crisis no son finales: son combustible. Sigue renaciendo.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga China",
      "element": "agua",
      "epithet": "La Sabia del Lago",
      "identity": "Tienes el ritmo del tiempo largo.",
      "strength": "Tu constancia.",
      "message": "\"Tu casa va contigo.\""
    },
    {
      "emoji": "🐟",
      "name": "Carpa Koi",
      "element": "agua",
      "epithet": "La Constante",
      "identity": "Vas contra corriente cuando hay que ir. Tu fuerza está en seguir.",
      "strength": "Tu fuerza para subir.",
      "message": "\"Tu camino cuesta arriba te formó. Sigue subiendo.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín del Indo",
      "element": "agua",
      "epithet": "El Sanador del Río",
      "identity": "Tienes alma alegre y sanadora.",
      "strength": "Tu energía.",
      "message": "\"No subestimes tu alegría.\""
    },
    {
      "emoji": "🐊",
      "name": "Cocodrilo del Ganges",
      "element": "agua",
      "epithet": "El Antiguo",
      "identity": "Cargas calma de quien ya vio mucho.",
      "strength": "Tu resistencia.",
      "message": "\"No reacciones a todo.\""
    },
    {
      "emoji": "🦈",
      "name": "Tiburón Ballena",
      "element": "agua",
      "epithet": "El Gigante Gentil",
      "identity": "Tienes calma poderosa.",
      "strength": "Tu serenidad.",
      "message": "\"Tu tamaño es para abrazar.\""
    },
    {
      "emoji": "🦊",
      "name": "Zorro de Nieve",
      "element": "tierra",
      "epithet": "El Astuto Blanco",
      "identity": "Mente rápida y alma juguetona.",
      "strength": "Tu astucia con corazón.",
      "message": "\"Tu humor es resistencia.\""
    },
    {
      "emoji": "🦌",
      "name": "Sika",
      "element": "tierra",
      "epithet": "El Sagrado Manchado",
      "identity": "Tienes sensibilidad y elegancia.",
      "strength": "Tu intuición.",
      "message": "\"Confía en lo que sientes.\""
    },
    {
      "emoji": "🐃",
      "name": "Búfalo de Agua",
      "element": "tierra",
      "epithet": "El Trabajador Antiguo",
      "identity": "Cargas responsabilidades sin quejarte. La gente confía en ti.",
      "strength": "Tu paciencia y resistencia.",
      "message": "\"Tu fuerza es real. Recuérdate descansar.\""
    },
    {
      "emoji": "🐍",
      "name": "Cobra India",
      "element": "fuego",
      "epithet": "La Reina Sagrada",
      "identity": "Tienes poder con elegancia.",
      "strength": "Tu presencia. Quien te conoce, te respeta.",
      "message": "\"Tu poder no es para todos.\""
    },
    {
      "emoji": "🦂",
      "name": "Escorpión Imperial",
      "element": "fuego",
      "epithet": "El Centinela",
      "identity": "Proteges con fiereza lo tuyo.",
      "strength": "Tu defensa.",
      "message": "\"No eres veneno: eres frontera.\""
    }
  ],
  "africa": [
    {
      "emoji": "🦁",
      "name": "León",
      "element": "fuego",
      "epithet": "El Rey de la Sabana",
      "identity": "Tienes presencia regia natural. Cuando entras a un cuarto, la gente nota tu peso.",
      "strength": "Tu autoridad sin esfuerzo. No mandas: simplemente eres seguido.",
      "message": "\"Tu rugido es respetado. No lo malgastes en peleas pequeñas.\""
    },
    {
      "emoji": "🐘",
      "name": "Elefante Africano",
      "element": "tierra",
      "epithet": "La Memoria Sagrada",
      "identity": "Cargas memoria profunda. Lo que viviste, lo entiendes a fondo.",
      "strength": "Tu sabiduría emocional. Aprendes de cada experiencia.",
      "message": "\"Tu memoria es regalo, no carga.\""
    },
    {
      "emoji": "🦒",
      "name": "Jirafa",
      "element": "aire",
      "epithet": "La Vigilante",
      "identity": "Tienes una visión que abarca lo enorme. Ves desde altura, eso te da claridad.",
      "strength": "Tu perspectiva. Lo que para otros es noticia, para ti era obvio.",
      "message": "\"Tu altura es regalo. Sigue mirando lejos.\""
    },
    {
      "emoji": "🐆",
      "name": "Leopardo",
      "element": "fuego",
      "epithet": "El Cazador Sigiloso",
      "identity": "Tienes presencia silenciosa pero imposible de ignorar.",
      "strength": "Lectura del entorno.",
      "message": "\"No malgastes tu rugido.\""
    },
    {
      "emoji": "🐆",
      "name": "Guepardo",
      "element": "fuego",
      "epithet": "El Más Veloz",
      "identity": "Tienes velocidad y precisión. Cuando vas, no hay quien te alcance.",
      "strength": "Tu velocidad. Pero también tu inteligencia para saber cuándo correr.",
      "message": "\"Tu velocidad agota. Pero también es regalo. Cuida cuándo la usas.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Marcial",
      "element": "aire",
      "epithet": "La Reina del Cielo",
      "identity": "Tienes presencia regia natural.",
      "strength": "Tu autoridad sin esfuerzo.",
      "message": "\"Tu altura no es soberbia: es perspectiva.\""
    },
    {
      "emoji": "🦅",
      "name": "Halcón Africano",
      "element": "aire",
      "epithet": "El Cazador del Sol",
      "identity": "Tienes precisión y enfoque.",
      "strength": "Tu claridad.",
      "message": "\"Tu velocidad sin dirección no sirve.\""
    },
    {
      "emoji": "🐦",
      "name": "Avestruz",
      "element": "aire",
      "epithet": "El Veloz de la Sabana",
      "identity": "No vuelas, pero corres como nadie. Tu fuerza está en tus pies.",
      "strength": "Tu velocidad práctica.",
      "message": "\"No todo lo grande necesita alas.\""
    },
    {
      "emoji": "🦉",
      "name": "Búho Pescador",
      "element": "aire",
      "epithet": "El Sabio Nocturno",
      "identity": "Ves lo que otros no quieren ver.",
      "strength": "Tu visión nocturna.",
      "message": "\"El silencio es tu maestro.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín",
      "element": "agua",
      "epithet": "El Sanador",
      "identity": "Tienes alma alegre y sanadora.",
      "strength": "Tu energía.",
      "message": "\"No subestimes tu alegría.\""
    },
    {
      "emoji": "🐊",
      "name": "Cocodrilo del Nilo",
      "element": "agua",
      "epithet": "El Antiguo Sagrado",
      "identity": "Cargas calma ancestral. Eres el sobreviviente más antiguo.",
      "strength": "Tu paciencia milenaria.",
      "message": "\"No reacciones a todo. Tu sola permanencia ya resuelve.\""
    },
    {
      "emoji": "🦛",
      "name": "Hipopótamo",
      "element": "agua",
      "epithet": "El Guardián del Río",
      "identity": "Tienes presencia subestimada pero feroz. La gente cree conocerte y se equivoca.",
      "strength": "Tu defensa. No buscas pelea, pero la enfrentas con todo.",
      "message": "\"Quien te subestima, lo lamenta. Sigue siendo así.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga Africana",
      "element": "agua",
      "epithet": "La Antigua",
      "identity": "Tienes el ritmo del tiempo largo.",
      "strength": "Tu constancia.",
      "message": "\"Tu casa va contigo.\""
    },
    {
      "emoji": "🐠",
      "name": "Pez Globo",
      "element": "agua",
      "epithet": "El Defensor Inflado",
      "identity": "Sabes mostrar tu poder cuando lo necesitas. Te haces más grande ante la amenaza.",
      "strength": "Tu defensa con apariencia. No siempre tienes que pelear: a veces basta con asustar.",
      "message": "\"Tu poder de mostrarte es estrategia.\""
    },
    {
      "emoji": "🐬",
      "name": "Manatí Africano",
      "element": "agua",
      "epithet": "El Gigante Gentil",
      "identity": "Tienes calma poderosa.",
      "strength": "Tu serenidad.",
      "message": "\"Tu tamaño es para abrazar.\""
    },
    {
      "emoji": "🦏",
      "name": "Rinoceronte",
      "element": "tierra",
      "epithet": "El Antiguo Indomable",
      "identity": "Tienes fuerza que no se discute. Cuando decides, embistes.",
      "strength": "Tu determinación. No te tambaleas con cada viento.",
      "message": "\"Tu firmeza es regalo, pero aprende a doblarte. No todo se gana embistiendo.\""
    },
    {
      "emoji": "🦓",
      "name": "Cebra",
      "element": "tierra",
      "epithet": "La Inconfundible",
      "identity": "Tienes una identidad única. La gente te reconoce de lejos.",
      "strength": "Tu autenticidad visible. No te disfrazas para encajar.",
      "message": "\"Tus rayas son tu sello. No las borres.\""
    },
    {
      "emoji": "🐂",
      "name": "Búfalo",
      "element": "tierra",
      "epithet": "El Firme",
      "identity": "Eres alguien con palabra. Lo que dices, lo cumples.",
      "strength": "Tu integridad.",
      "message": "\"Tu palabra es tu sello.\""
    },
    {
      "emoji": "🐗",
      "name": "Facoquero",
      "element": "tierra",
      "epithet": "El Sobreviviente",
      "identity": "Has sobrevivido a todo. Lo que te golpea, te endurece sin amargarte.",
      "strength": "Tu resiliencia.",
      "message": "\"Tu cicatriz es prueba de batallas ganadas.\""
    },
    {
      "emoji": "🐍",
      "name": "Mamba Negra",
      "element": "fuego",
      "epithet": "La Veloz",
      "identity": "Eres directo, claro, sin trampas. Cuando actúas, no titubeas.",
      "strength": "Tu claridad. La gente sabe a qué atenerse contigo.",
      "message": "\"Tu claridad asusta pero protege.\""
    }
  ],
  "oceania": [
    {
      "emoji": "🐨",
      "name": "Koala",
      "element": "tierra",
      "epithet": "El Pacífico",
      "identity": "Tienes calma que pocos entienden. Tu ritmo es tu marca.",
      "strength": "Tu pausa estratégica. Sabes que el descanso también es trabajo.",
      "message": "\"Lo lento no es lento: es deliberado.\""
    },
    {
      "emoji": "🦘",
      "name": "Canguro",
      "element": "tierra",
      "epithet": "El Saltador",
      "identity": "Tienes una manera de moverte distinta. Avanzas en saltos, no en pasos.",
      "strength": "Tu impulso. Cuando decides, vas con todo de una.",
      "message": "\"Tu camino no se parece a ninguno. Eso es ventaja.\""
    },
    {
      "emoji": "🐊",
      "name": "Cocodrilo Marino",
      "element": "agua",
      "epithet": "El Antiguo del Mar",
      "identity": "Cargas calma ancestral.",
      "strength": "Tu paciencia milenaria.",
      "message": "\"No reacciones a todo.\""
    },
    {
      "emoji": "🦈",
      "name": "Tiburón Blanco",
      "element": "agua",
      "epithet": "El Cazador Profundo",
      "identity": "Eres alguien que actúa con decisión. No dudas cuando tienes claro lo que quieres.",
      "strength": "Tu instinto de movimiento.",
      "message": "\"Seguir adelante también es sabiduría.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín Mular",
      "element": "agua",
      "epithet": "El Sanador",
      "identity": "Tienes alma alegre y sanadora.",
      "strength": "Tu energía.",
      "message": "\"No subestimes tu alegría.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga Verde",
      "element": "agua",
      "epithet": "La Memoria del Pacífico",
      "identity": "Tienes el ritmo del tiempo largo.",
      "strength": "Tu constancia.",
      "message": "\"Tu casa va contigo.\""
    },
    {
      "emoji": "🐙",
      "name": "Pulpo",
      "element": "agua",
      "epithet": "El Sabio Camaleón",
      "identity": "Tienes inteligencia poco común y capacidad camaleónica. Te adaptas a cada ambiente.",
      "strength": "Tu adaptación inteligente. No te quiebras: cambias.",
      "message": "\"Tu flexibilidad es regalo. Sigue siendo así.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila Audaz",
      "element": "aire",
      "epithet": "La Soberana",
      "identity": "Tienes presencia regia natural.",
      "strength": "Tu autoridad sin esfuerzo.",
      "message": "\"Tu altura es perspectiva.\""
    },
    {
      "emoji": "🦜",
      "name": "Kookaburra",
      "element": "aire",
      "epithet": "El Reidor",
      "identity": "Tu risa convoca. Donde estás, la gente respira más fácil.",
      "strength": "Tu humor. Conviertes ambientes tensos en bromas que liberan.",
      "message": "\"Tu risa es medicina. No la apagues.\""
    },
    {
      "emoji": "🦜",
      "name": "Cacatúa Galah",
      "element": "aire",
      "epithet": "La Voz Rosa",
      "identity": "Tienes personalidad explosiva y carismática.",
      "strength": "Tu carisma.",
      "message": "\"Tu voz es regalo. Úsala para construir.\""
    },
    {
      "emoji": "🦅",
      "name": "Halcón de Brown",
      "element": "aire",
      "epithet": "El Cazador",
      "identity": "Tienes precisión natural.",
      "strength": "Tu enfoque.",
      "message": "\"Tu velocidad necesita dirección.\""
    },
    {
      "emoji": "🦉",
      "name": "Búho Powerful",
      "element": "aire",
      "epithet": "El Sabio del Eucalipto",
      "identity": "Ves lo que otros no quieren ver.",
      "strength": "Tu visión nocturna.",
      "message": "\"El silencio es tu maestro.\""
    },
    {
      "emoji": "🦅",
      "name": "Emú",
      "element": "aire",
      "epithet": "El Veloz de Tierra",
      "identity": "No vuelas, pero corres como nadie.",
      "strength": "Tu velocidad práctica.",
      "message": "\"No todo lo grande necesita alas.\""
    },
    {
      "emoji": "🐍",
      "name": "Serpiente Taipán",
      "element": "fuego",
      "epithet": "La Veloz",
      "identity": "Eres directo y claro. Cuando actúas, no titubeas.",
      "strength": "Tu claridad.",
      "message": "\"Tu claridad asusta pero protege.\""
    },
    {
      "emoji": "🦂",
      "name": "Escorpión de Madera",
      "element": "fuego",
      "epithet": "El Centinela",
      "identity": "Proteges con fiereza lo tuyo.",
      "strength": "Tu defensa.",
      "message": "\"No eres veneno: eres frontera.\""
    },
    {
      "emoji": "🐊",
      "name": "Dragón Barbudo",
      "element": "fuego",
      "epithet": "El Antiguo del Desierto",
      "identity": "Sabes esperar tu momento.",
      "strength": "Tu paciencia activa.",
      "message": "\"Descansar también es estrategia.\""
    },
    {
      "emoji": "🦘",
      "name": "Wallaby",
      "element": "tierra",
      "epithet": "El Ágil",
      "identity": "Tienes movimiento rápido y reflexivo. No improvisas: calculas.",
      "strength": "Tu agilidad.",
      "message": "\"Tu velocidad sirve si la diriges.\""
    },
    {
      "emoji": "🦡",
      "name": "Wombat",
      "element": "tierra",
      "epithet": "El Constructor Subterráneo",
      "identity": "Construyes mundos enteros que nadie ve. Tu trabajo es invisible pero esencial.",
      "strength": "Tu trabajo silencioso.",
      "message": "\"Tu obra es real aunque otros no la vean.\""
    },
    {
      "emoji": "🦔",
      "name": "Equidna",
      "element": "tierra",
      "epithet": "La Acorazada",
      "identity": "Te proteges con sabiduría.",
      "strength": "Tu límite saludable.",
      "message": "\"Tu coraza no es muro: es filtro.\""
    },
    {
      "emoji": "🐦",
      "name": "Kiwi",
      "element": "tierra",
      "epithet": "El Discreto",
      "identity": "Eres alguien que vive intensamente pero sin alarde. Tu vida es rica aunque no la muestres.",
      "strength": "Tu humildad real. No necesitas que te aplaudan para sentirte completo.",
      "message": "\"Tu manera de vivir es válida. No necesitas mostrarla.\""
    }
  ],
  "otros": [
    {
      "emoji": "🐺",
      "name": "Lobo",
      "element": "fuego",
      "epithet": "El Líder",
      "identity": "Eres alguien de tribu pero con liderazgo natural.",
      "strength": "Tu intuición social.",
      "message": "\"Tu manada te necesita estratégico, no feroz.\""
    },
    {
      "emoji": "🦁",
      "name": "León",
      "element": "fuego",
      "epithet": "El Soberano",
      "identity": "Tienes presencia regia natural.",
      "strength": "Tu autoridad sin esfuerzo.",
      "message": "\"Tu rugido es respetado. No lo malgastes.\""
    },
    {
      "emoji": "🐆",
      "name": "Pantera",
      "element": "fuego",
      "epithet": "La Sombra Elegante",
      "identity": "Tienes presencia silenciosa pero imposible de ignorar.",
      "strength": "Lectura del entorno.",
      "message": "\"No malgastes tu rugido.\""
    },
    {
      "emoji": "🐉",
      "name": "Dragón",
      "element": "fuego",
      "epithet": "El Sagrado",
      "identity": "Cargas poder ancestral.",
      "strength": "Tu energía vital.",
      "message": "\"Tu poder es regalo. Úsalo para construir.\""
    },
    {
      "emoji": "🐍",
      "name": "Serpiente",
      "element": "fuego",
      "epithet": "La Transformadora",
      "identity": "Estás en transformación constante.",
      "strength": "Tu capacidad de renacer.",
      "message": "\"La piel vieja no es muerte: es regalo.\""
    },
    {
      "emoji": "🦅",
      "name": "Águila",
      "element": "aire",
      "epithet": "La Visionaria",
      "identity": "Tienes una visión que abarca lo enorme.",
      "strength": "Tu altura.",
      "message": "\"Tu vuelo no es huida: es perspectiva.\""
    },
    {
      "emoji": "🦉",
      "name": "Búho",
      "element": "aire",
      "epithet": "El Sabio Nocturno",
      "identity": "Ves lo que otros no quieren ver.",
      "strength": "Tu visión nocturna.",
      "message": "\"El silencio es tu maestro.\""
    },
    {
      "emoji": "🦋",
      "name": "Mariposa",
      "element": "aire",
      "epithet": "La Transformada",
      "identity": "Tienes alma de viajero. El destino es movimiento.",
      "strength": "Tu transformación constante.",
      "message": "\"Lo frágil también es eterno.\""
    },
    {
      "emoji": "🐦",
      "name": "Cuervo",
      "element": "aire",
      "epithet": "El Mensajero",
      "identity": "Tienes inteligencia poco común.",
      "strength": "Tu intelecto.",
      "message": "\"Tu mente es regalo.\""
    },
    {
      "emoji": "🦅",
      "name": "Halcón",
      "element": "aire",
      "epithet": "El Cazador",
      "identity": "Tienes precisión natural.",
      "strength": "Tu enfoque.",
      "message": "\"Tu velocidad necesita dirección.\""
    },
    {
      "emoji": "🐬",
      "name": "Delfín",
      "element": "agua",
      "epithet": "El Sanador",
      "identity": "Tienes alma alegre y sanadora.",
      "strength": "Tu energía.",
      "message": "\"No subestimes tu alegría.\""
    },
    {
      "emoji": "🐢",
      "name": "Tortuga",
      "element": "agua",
      "epithet": "La Antigua",
      "identity": "Tienes el ritmo del tiempo largo.",
      "strength": "Tu constancia.",
      "message": "\"Tu casa va contigo.\""
    },
    {
      "emoji": "🐳",
      "name": "Ballena",
      "element": "agua",
      "epithet": "La Profunda",
      "identity": "Tienes profundidad emocional poco común.",
      "strength": "Tu capacidad de profundizar.",
      "message": "\"Tu profundidad asusta a quien vive en lo plano.\""
    },
    {
      "emoji": "🦈",
      "name": "Tiburón",
      "element": "agua",
      "epithet": "El Cazador del Mar",
      "identity": "Actúas con decisión.",
      "strength": "Tu instinto de movimiento.",
      "message": "\"Seguir adelante también es sabiduría.\""
    },
    {
      "emoji": "🦦",
      "name": "Nutria",
      "element": "agua",
      "epithet": "La Juguetona",
      "identity": "Tienes alma alegre y curiosa.",
      "strength": "Tu capacidad de disfrute.",
      "message": "\"No dejes que el mundo te robe la risa.\""
    },
    {
      "emoji": "🐻",
      "name": "Oso",
      "element": "tierra",
      "epithet": "El Solitario",
      "identity": "Necesitas tu espacio para funcionar.",
      "strength": "Tu autoconocimiento.",
      "message": "\"Tu soledad es taller, no destierro.\""
    },
    {
      "emoji": "🦊",
      "name": "Zorro",
      "element": "tierra",
      "epithet": "El Astuto",
      "identity": "Mente rápida y alma juguetona.",
      "strength": "Tu astucia con corazón.",
      "message": "\"Tu humor es resistencia.\""
    },
    {
      "emoji": "🦌",
      "name": "Ciervo",
      "element": "tierra",
      "epithet": "El Sensible",
      "identity": "Tienes sensibilidad afinada y elegancia.",
      "strength": "Tu intuición.",
      "message": "\"Confía en lo que sientes.\""
    },
    {
      "emoji": "🐘",
      "name": "Elefante",
      "element": "tierra",
      "epithet": "La Memoria",
      "identity": "Cargas memoria profunda.",
      "strength": "Tu sabiduría emocional.",
      "message": "\"Tu memoria es regalo, no carga.\""
    },
    {
      "emoji": "🐝",
      "name": "Abeja",
      "element": "tierra",
      "epithet": "La Tejedora",
      "identity": "Eres colaborativo.",
      "strength": "Tu sentido de propósito colectivo.",
      "message": "\"Tu trabajo es dulce aunque no lo veas.\""
    }
  ]
};

  var totemState = { country: '', city: '', day: 0, month: 0, year: 0, gender: '', element: '', lastResult: null };

  // Inicializar dropdown de países
  function totemInitCountries() {
    var sel = document.getElementById('totemCountry');
    if (!sel) return;
    // Limpiar opciones excepto la primera
    while (sel.options.length > 1) sel.remove(1);
    TOTEM_COUNTRIES.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.code;
      opt.textContent = c.flag + '  ' + c.name;
      sel.appendChild(opt);
    });
  }

  function openTotemTool() {
    totemInitCountries();
    var modal = document.getElementById('totemModal');
    if (!modal) return;
    // Guardar scroll antes de abrir
    window.__scrollY_totem = window.scrollY || window.pageYOffset || 0;
    modal.classList.add('is-open');
    // Bloqueo robusto: clase en html y body
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.top = '-' + window.__scrollY_totem + 'px';
    totemReset();
    // Resetear scroll interno del modal
    modal.scrollTop = 0;
    var inner = modal.querySelector('.oracle-modal-inner');
    if (inner) inner.scrollTop = 0;
  }

  function totemClose() {
    var modal = document.getElementById('totemModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    var y = window.__scrollY_totem || 0;
    window.scrollTo(0, y);
  }

  function totemReset() {
    totemState = { country: '', city: '', day: 0, month: 0, year: 0, gender: '', element: '', lastResult: null };
    document.getElementById('totemCountry').value = '';
    document.getElementById('totemCity').value = '';
    document.getElementById('totemDay').value = '';
    document.getElementById('totemMonth').value = '';
    document.getElementById('totemYear').value = '';
    totemGoto(1);
  }

  function totemGoto(step) {
    // Ocultar todos los panes
    var panes = document.querySelectorAll('#totemModal .oracle-pane');
    panes.forEach(function(p) { p.classList.remove('oracle-pane-active'); });

    // Mostrar el correcto
    var target;
    if (step === 'loading') target = document.getElementById('tpaneLoading');
    else if (step === 'result') target = document.getElementById('tpaneResult');
    else target = document.getElementById('tpane' + step);

    if (target) target.classList.add('oracle-pane-active');

    // Actualizar dots de progreso
    var dots = document.querySelectorAll('#totemModal .oracle-dot');
    dots.forEach(function(d, i) {
      d.classList.remove('oracle-dot-active');
      var dotStep = parseInt(d.getAttribute('data-step'), 10);
      if (typeof step === 'number' && dotStep === step) {
        d.classList.add('oracle-dot-active');
      }
    });

    // Scroll al inicio del modal
    var inner = document.querySelector('#totemModal .oracle-modal-inner');
    if (inner) inner.scrollTop = 0;
  }

  function totemNext(step) {
    if (step === 1) {
      var country = document.getElementById('totemCountry').value;
      if (!country) {
        showToast('Selecciona tu país');
        return;
      }
      totemState.country = country;
      totemGoto(2);
    } else if (step === 2) {
      var city = document.getElementById('totemCity').value.trim();
      if (!city) {
        showToast('Escribe tu ciudad o estado');
        return;
      }
      totemState.city = city;
      totemGoto(3);
    } else if (step === 3) {
      var day = parseInt(document.getElementById('totemDay').value, 10);
      var month = parseInt(document.getElementById('totemMonth').value, 10);
      var year = parseInt(document.getElementById('totemYear').value, 10);

      if (!day || day < 1 || day > 31 || !month || !year || year < 1900 || year > 2025) {
        showToast('Completa una fecha válida');
        return;
      }
      totemState.day = day;
      totemState.month = month;
      totemState.year = year;
      totemGoto(4);
    }
  }

  function totemSelectGender(g) {
    totemState.gender = g;
    totemGoto(5);
  }

  function totemSelectElement(e) {
    totemState.element = e;
    totemGoto('loading');

    // Mensajes rotativos durante el loading
    var mensajes = [
      'Consultando los espíritus de tu tierra...',
      'Escuchando lo que el viento susurra...',
      'Buscando al guardián que camina contigo...',
      'El espíritu se acerca...'
    ];
    var idx = 0;
    var loadingEl = document.getElementById('totemLoadingText');
    if (loadingEl) loadingEl.textContent = mensajes[0];
    var interval = setInterval(function() {
      idx = (idx + 1) % mensajes.length;
      if (loadingEl) loadingEl.textContent = mensajes[idx];
    }, 800);

    setTimeout(function() {
      clearInterval(interval);
      totemReveal();
    }, 3200);
  }

  // === ALGORITMO DE SELECCIÓN ===
  function totemGetZodiac(day, month) {
    var zodiacs = [
      ['capricornio', 19], ['acuario', 18], ['piscis', 20], ['aries', 19],
      ['tauro', 20], ['geminis', 20], ['cancer', 22], ['leo', 22],
      ['virgo', 22], ['libra', 22], ['escorpio', 21], ['sagitario', 21], ['capricornio', 31]
    ];
    var z = zodiacs[month - 1];
    return (day <= z[1]) ? z[0] : zodiacs[month][0];
  }

  function totemReveal() {
    var s = totemState;
    var region = TOTEM_COUNTRY_REGION[s.country] || 'otros';
    var pool = TOTEM_ANIMALS[region] || TOTEM_ANIMALS['otros'];

    // Filtrar por elemento
    var filtered = pool.filter(function(a) { return a.element === s.element; });
    if (filtered.length === 0) filtered = pool;

    // Selección determinística según fecha
    var seed = s.day + s.month * 31 + s.year;
    var animal = filtered[seed % filtered.length];

    // Encontrar el nombre del país
    var countryObj = TOTEM_COUNTRIES.find(function(c) { return c.code === s.country; });
    var countryName = countryObj ? countryObj.name : s.country;
    var countryFlag = countryObj ? countryObj.flag : '';

    // Mostrar resultado
    document.getElementById('totemEmoji').textContent = animal.emoji;
    document.getElementById('totemName').textContent = animal.name.toUpperCase();
    document.getElementById('totemEpithet').textContent = animal.epithet;
    document.getElementById('totemIdentity').textContent = animal.identity;
    document.getElementById('totemStrength').textContent = animal.strength;
    document.getElementById('totemMessage').innerHTML = animal.message;

    var zodiac = totemGetZodiac(s.day, s.month);
    var meta = zodiac.toUpperCase() + ' · ' + animal.element.toUpperCase() + ' · ' + countryFlag + ' ' + s.city.toUpperCase() + ', ' + countryName.toUpperCase();
    document.getElementById('totemMeta').textContent = meta;

    totemState.lastResult = {
      name: animal.name,
      epithet: animal.epithet,
      emoji: animal.emoji
    };

    totemGoto('result');
  }

  function totemShare() {
    if (!totemState.lastResult) return;
    var r = totemState.lastResult;
    var text = 'Mi animal espiritual es ' + r.emoji + ' ' + r.name + ', ' + r.epithet + '.\n\nDescubre el tuyo en el oráculo de El DoQmentalista:';
    var url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'Mi animal espiritual', text: text, url: url }).catch(function(){});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + '\n' + url).then(function() {
        showToast('Copiado al portapapeles', 'success');
      });
    } else {
      showToast('Copia este texto: ' + text);
    }
  }

  // ESC cierra modal Tótem también
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var tm = document.getElementById('totemModal');
      if (tm && tm.classList.contains('is-open')) totemClose();
    }
  });


  // ============================================================
  // ÁNGEL CABALÍSTICO — BASE DE DATOS + LÓGICA (v2 - 27 mayo)
  // Oraciones reorientadas al Padre Dios
  // Dones expandidos en segunda persona con propósito de servicio
  // ============================================================

// ============================================================
// LOS 72 ÁNGELES CABALÍSTICOS DEL SHEM HAMEPHORASH — v2
// Voz editorial DoQ: oraciones dirigidas al Padre Dios.
// Dones expandidos en segunda persona con propósito de servicio.
// ============================================================

var ANGELES_72 = [
  // ========== CORO 1: SERAFINES (Fuego) ==========
  {
    n: 1,
    nombre: "Vehuiah",
    hebreo: "וְהוּיָה",
    significado: "Dios elevado y exaltado por encima de todas las cosas",
    coro: "Serafines",
    regente: "Metatrón",
    elemento: "Fuego",
    fecha_inicio: "03-21",
    fecha_fin: "03-25",
    don: "Tienes el don de la Voluntad Primordial. El poder de encender la chispa que mueve montañas y comenzar de cero cuando todo parece imposible. Puedes usar tu don para ayudar a los demás a iniciar proyectos que no se atreven a empezar y a recuperar la fuerza interior cuando han perdido el rumbo.",
    virtudes: "Coraje, iniciativa, fuerza de voluntad, capacidad de empezar de cero, liderazgo natural.",
    sombras: "Impaciencia, arrogancia, querer imponer sin escuchar, agotamiento por exceso de fuego interno.",
    salmo: "Salmo 3:3 — «Mas tú, Señor, eres escudo alrededor de mí; mi gloria, y el que levanta mi cabeza.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Vehuiah, para que me ayude a encender la chispa de la voluntad y comenzar lo que mi alma me pide. Para que use ese fuego al servicio de los demás y no para imponerme sobre nadie, en el nombre de Dios, que así sea."
  },
  {
    n: 2,
    nombre: "Jeliel",
    hebreo: "יְלִיאֵל",
    significado: "Dios socorredor",
    coro: "Serafines",
    regente: "Metatrón",
    elemento: "Fuego",
    fecha_inicio: "03-26",
    fecha_fin: "03-30",
    don: "Tienes el don de la Fidelidad y la Reconciliación. El poder de apaciguar tormentas en los corazones y reconciliar a quienes el orgullo separó. Puedes usar tu don para ayudar a los demás a sanar sus relaciones rotas y a encontrar paz en sus hogares.",
    virtudes: "Fidelidad conyugal, talento para apaciguar guerras internas, capacidad de mediar entre opuestos.",
    sombras: "Celos, posesividad, dependencia emocional, miedo al abandono.",
    salmo: "Salmo 22:19 — «Mas tú, Señor, no te alejes; fortaleza mía, apresúrate a socorrerme.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Jeliel, para que me ayude a suavizar las tormentas de mi corazón y a ser fiel a quienes amo. Para que pueda reconciliar a quienes el orgullo separó y traer paz donde haya conflicto, en el nombre de Dios, que así sea."
  },
  {
    n: 3,
    nombre: "Sitael",
    hebreo: "סִיטָאֵל",
    significado: "Dios esperanza de todas las criaturas",
    coro: "Serafines",
    regente: "Metatrón",
    elemento: "Fuego",
    fecha_inicio: "03-31",
    fecha_fin: "04-04",
    don: "Tienes el don de la Protección y la Edificación. El poder de construir sobre roca firme y proteger a los que necesitan refugio. Puedes usar tu don para ayudar a los demás a edificar lo que ninguna tormenta pueda derrumbar y a sostenerlos cuando el suelo tiemble bajo sus pies.",
    virtudes: "Nobleza de espíritu, generosidad, capacidad de proteger a otros, integridad inquebrantable.",
    sombras: "Ingratitud, hipocresía, traición a la propia palabra, vivir de las apariencias.",
    salmo: "Salmo 91:2 — «Diré yo al Señor: Esperanza mía y castillo mío; mi Dios, en quien confiaré.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Sitael, para que me ayude a construir sobre cimientos firmes y a ser refugio para quienes lo necesiten. Para proteger con nobleza a los más débiles y honrar siempre mi palabra, en el nombre de Dios, que así sea."
  },
  {
    n: 4,
    nombre: "Elemiah",
    hebreo: "עֶלֶמְיָה",
    significado: "Dios oculto y secreto",
    coro: "Serafines",
    regente: "Metatrón",
    elemento: "Fuego",
    fecha_inicio: "04-05",
    fecha_fin: "04-09",
    don: "Tienes el don del Discernimiento del Camino. El poder de reconocer la vocación verdadera y hallar el sendero correcto entre muchas opciones. Puedes usar tu don para ayudar a los demás a salir de la confusión y a recuperarse cuando hayan fracasado en empresas que no eran las suyas.",
    virtudes: "Reconocer la propia vocación, hallar el camino correcto, recuperarse de fracasos, sabiduría práctica.",
    sombras: "Pereza, indecisión crónica, sabotearse a uno mismo, perderse en caminos que no son propios.",
    salmo: "Salmo 6:5 — «Vuélvete, oh Señor, libra mi alma; sálvame por tu misericordia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Elemiah, para que me ayude a reconocer mi vocación verdadera y a encontrar el sendero que mi alma reconoce. Para guiar también a quienes están perdidos y necesitan dirección, en el nombre de Dios, que así sea."
  },
  {
    n: 5,
    nombre: "Mahasiah",
    hebreo: "מַהֲשִׁיָה",
    significado: "Dios salvador",
    coro: "Serafines",
    regente: "Metatrón",
    elemento: "Fuego",
    fecha_inicio: "04-10",
    fecha_fin: "04-14",
    don: "Tienes el don de la Rectificación. El poder de deshacer lo torcido y vivir en paz con los demás convirtiendo los errores en maestros. Puedes usar tu don para ayudar a los demás a sanar relaciones rotas y a transformar sus tropiezos en aprendizaje.",
    virtudes: "Aprendizaje fácil, atracción natural, capacidad de sanar relaciones rotas, carácter conciliador.",
    sombras: "Ignorancia voluntaria, hostilidad, vicios que dañan al cuerpo, soberbia intelectual.",
    salmo: "Salmo 34:5 — «Busqué al Señor y él me oyó, y me libró de todos mis temores.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Mahasiah, para que me ayude a rectificar lo torcido en mi vida y a convivir en paz con los demás. Para que mis errores se vuelvan maestros y pueda ayudar a otros a sanar lo que entre ellos se rompió, en el nombre de Dios, que así sea."
  },
  {
    n: 6,
    nombre: "Lelahel",
    hebreo: "לֶלָהֵל",
    significado: "Dios loable y exaltado",
    coro: "Serafines",
    regente: "Metatrón",
    elemento: "Fuego",
    fecha_inicio: "04-15",
    fecha_fin: "04-20",
    don: "Tienes el don de la Luz Sanadora. El poder de iluminar lo oscuro con belleza y de inspirar a otros con tu arte. Puedes usar tu don para ayudar a los demás a sanar a través de la belleza y a brillar sin opacar a nadie a su alrededor.",
    virtudes: "Don artístico, belleza interior y exterior, capacidad de inspirar a otros, fama bien ganada.",
    sombras: "Vanidad, ambición desmedida, deseo de poder por poder, envidia del reconocimiento ajeno.",
    salmo: "Salmo 9:11 — «Cantad al Señor, que habita en Sion; publicad entre los pueblos sus obras.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Lelahel, para que me ayude a iluminar lo que en mí está oscuro y a sanar a través de la belleza. Para que mi luz no ciegue a otros sino los acompañe en su propio camino, en el nombre de Dios, que así sea."
  },
  {
    n: 7,
    nombre: "Achaiah",
    hebreo: "אַכַאיָה",
    significado: "Dios bueno y paciente",
    coro: "Serafines",
    regente: "Metatrón",
    elemento: "Fuego",
    fecha_inicio: "04-21",
    fecha_fin: "04-25",
    don: "Tienes el don de la Paciencia y la Revelación. El poder de esperar lo que tarda en llegar y descubrir los secretos que la naturaleza guarda. Puedes usar tu don para ayudar a los demás a perseverar en sus procesos lentos y a reconocer las señales que el mundo les manda.",
    virtudes: "Amor por aprender, paciencia con los lentos procesos, descubrimientos y revelaciones, perseverancia.",
    sombras: "Negligencia, abandono de proyectos, ignorar los signos, falta de constancia.",
    salmo: "Salmo 103:8 — «Misericordioso y clemente es el Señor; lento para la ira y grande en misericordia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Achaiah, para que me ayude a tener paciencia con lo que tarda y a descubrir los secretos que la vida revela despacio. Para acompañar también a quienes desesperan ante procesos lentos, en el nombre de Dios, que así sea."
  },
  {
    n: 8,
    nombre: "Cahetel",
    hebreo: "כַהֲטֵל",
    significado: "Dios adorable",
    coro: "Serafines",
    regente: "Metatrón",
    elemento: "Fuego",
    fecha_inicio: "04-26",
    fecha_fin: "04-30",
    don: "Tienes el don de la Gratitud y la Bendición. El poder de reconocer lo recibido y volver tu vida un altar de lo cotidiano. Puedes usar tu don para ayudar a los demás a valorar lo que tienen y a bendecir su trabajo con frutos abundantes.",
    virtudes: "Gratitud profunda, capacidad de bendecir lo que se tiene, conexión con la tierra y los frutos.",
    sombras: "Materialismo, queja constante, no reconocer lo recibido, avaricia.",
    salmo: "Salmo 95:6 — «Venid, adoremos y postrémonos; arrodillémonos delante del Señor nuestro Hacedor.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Cahetel, para que me ayude a dar gracias antes de pedir y a reconocer todo lo que ya he recibido. Para enseñar a otros a bendecir lo que tienen y a vivir en abundancia honrada, en el nombre de Dios, que así sea."
  },

  // ========== CORO 2: QUERUBINES (Amor) ==========
  {
    n: 9,
    nombre: "Haziel",
    hebreo: "הַזִיאֵל",
    significado: "Dios de misericordia",
    coro: "Querubines",
    regente: "Raziel",
    elemento: "Tierra",
    fecha_inicio: "05-01",
    fecha_fin: "05-05",
    don: "Tienes el don del Perdón y la Reconciliación. El poder de ablandar corazones endurecidos y soltar rencores antiguos sin olvidar la lección. Puedes usar tu don para ayudar a los demás a perdonarse a sí mismos y a restaurar amistades que parecían perdidas.",
    virtudes: "Compasión, capacidad de perdonar, amistad sincera, lealtad.",
    sombras: "Rencor que no suelta, hipocresía, falsa amistad, traición velada.",
    salmo: "Salmo 25:6 — «Acuérdate, oh Señor, de tus piedades y de tus misericordias, que son perpetuas.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Haziel, para que me ayude a perdonar a quienes me hirieron y a perdonarme a mí mismo. Para liberar mi corazón del rencor y poder acompañar a otros en su propio camino de reconciliación, en el nombre de Dios, que así sea."
  },
  {
    n: 10,
    nombre: "Aladiah",
    hebreo: "אַלַדִיָה",
    significado: "Dios propicio",
    coro: "Querubines",
    regente: "Raziel",
    elemento: "Tierra",
    fecha_inicio: "05-06",
    fecha_fin: "05-10",
    don: "Tienes el don de la Gracia y las Segundas Oportunidades. El poder de sanar heridas antiguas que el tiempo no pudo curar y comenzar de nuevo con sabiduría. Puedes usar tu don para ayudar a los demás a soltar la culpa que cargan y a aprovechar las nuevas oportunidades que la vida les da.",
    virtudes: "Buena salud, capacidad de regeneración, encanto natural, segundas oportunidades.",
    sombras: "Culpa que no se suelta, autosabotaje, vivir en el pasado, enfermedades psicosomáticas.",
    salmo: "Salmo 33:22 — «Sea tu misericordia, oh Señor, sobre nosotros, según esperamos en ti.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Aladiah, para que me ayude a sanar las heridas que cargo desde hace tiempo y a recibir las segundas oportunidades con sabiduría. Para acompañar a otros que también necesitan soltar su pasado, en el nombre de Dios, que así sea."
  },
  {
    n: 11,
    nombre: "Lauviah",
    hebreo: "לַאוִיָה",
    significado: "Dios alabado y exaltado",
    coro: "Querubines",
    regente: "Raziel",
    elemento: "Tierra",
    fecha_inicio: "05-11",
    fecha_fin: "05-15",
    don: "Tienes el don de la Victoria Humilde. El poder de destacar por mérito propio sin pisotear a nadie y recibir el reconocimiento con humildad. Puedes usar tu don para ayudar a los demás a brillar en lo suyo y a celebrar el éxito ajeno sin envidia.",
    virtudes: "Talento reconocido, sabiduría, capacidad de destacar sin pisotear, intuición clara.",
    sombras: "Soberbia, hambre de protagonismo, celos del éxito ajeno, vanagloria.",
    salmo: "Salmo 18:46 — «Vive el Señor, y bendita sea mi Roca; sea exaltado el Dios de mi salvación.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Lauviah, para que me ayude a alcanzar el triunfo sin perder la humildad y a recibir el reconocimiento sin soberbia. Para celebrar también las victorias de quienes me rodean, en el nombre de Dios, que así sea."
  },
  {
    n: 12,
    nombre: "Hahaiah",
    hebreo: "הַהַעיָה",
    significado: "Dios refugio",
    coro: "Querubines",
    regente: "Raziel",
    elemento: "Tierra",
    fecha_inicio: "05-16",
    fecha_fin: "05-20",
    don: "Tienes el don de los Sueños Reveladores. El poder de recibir mensajes en el silencio nocturno y descifrar misterios que el día no muestra. Puedes usar tu don para ayudar a los demás a entender lo que sus sueños les comunican y a encontrar sentido en lo oculto.",
    virtudes: "Capacidad de interpretar sueños, descubrir misterios ocultos, sensibilidad espiritual fina.",
    sombras: "Mentira reiterada, hipocresía espiritual, escapismo, vivir solo en lo imaginario.",
    salmo: "Salmo 10:1 — «¿Por qué estás lejos, oh Señor, y te escondes en el tiempo de la tribulación?»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Hahaiah, para que me ayude a comprender los sueños que mi alma me manda y a escuchar lo que el día no me deja oír. Para guiar también a otros que buscan sentido en sus visiones nocturnas, en el nombre de Dios, que así sea."
  },
  {
    n: 13,
    nombre: "Iezalel",
    hebreo: "יְזָלְאֵל",
    significado: "Dios glorificado sobre todas las cosas",
    coro: "Querubines",
    regente: "Raziel",
    elemento: "Tierra",
    fecha_inicio: "05-21",
    fecha_fin: "05-25",
    don: "Tienes el don de la Fidelidad y la Memoria. El poder de sostener amores duraderos y recordar lo importante con precisión. Puedes usar tu don para ayudar a los demás a construir uniones sinceras y a honrar los pactos que han hecho.",
    virtudes: "Memoria privilegiada, capacidad para los idiomas, fidelidad amorosa, amistades duraderas.",
    sombras: "Ignorancia voluntaria, error reiterado, mentira en el amor, traición a la palabra dada.",
    salmo: "Salmo 98:4 — «Cantad alegres al Señor, toda la tierra; levantad la voz, y aplaudid, y cantad salmos.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Iezalel, para que me ayude a ser fiel a quienes merecen mi amor y a recordar con claridad lo que de verdad importa. Para fortalecer también las uniones sinceras de quienes me rodean, en el nombre de Dios, que así sea."
  },
  {
    n: 14,
    nombre: "Mebahel",
    hebreo: "מְבַהֵל",
    significado: "Dios conservador",
    coro: "Querubines",
    regente: "Raziel",
    elemento: "Tierra",
    fecha_inicio: "05-26",
    fecha_fin: "05-31",
    don: "Tienes el don de la Justicia y la Defensa. El poder de proteger al inocente y dar voz a quienes no la tienen. Puedes usar tu don para ayudar a los demás a encontrar libertad cuando son oprimidos y a defenderse de quien los calumnia.",
    virtudes: "Sentido de la justicia, amor por la verdad, defensa de los inocentes, libertad interior.",
    sombras: "Calumnia, falso testimonio, opresión sobre los débiles, mentir para conveniencia.",
    salmo: "Salmo 9:9 — «El Señor será refugio del pobre, refugio para el tiempo de angustia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Mebahel, para que me ayude a defender al inocente y a dar voz a quienes el mundo silencia. Para que mi palabra sirva donde otros callan, en el nombre de Dios, que así sea."
  },
  {
    n: 15,
    nombre: "Hariel",
    hebreo: "הַרִיאֵל",
    significado: "Dios creador",
    coro: "Querubines",
    regente: "Raziel",
    elemento: "Tierra",
    fecha_inicio: "06-01",
    fecha_fin: "06-05",
    don: "Tienes el don de la Inteligencia Sagrada. El poder de unir la mente y el alma en una sola sabiduría y de descubrir lo que sirve a la humanidad. Puedes usar tu don para ayudar a los demás a estudiar con propósito y a usar el conocimiento sin desprecio por lo sagrado.",
    virtudes: "Inteligencia clara, capacidad científica, fe razonada, descubrimiento de inventos útiles.",
    sombras: "Ateísmo militante, ciencia sin conciencia, frialdad emocional, desprecio por lo sagrado.",
    salmo: "Salmo 94:22 — «El Señor me ha sido por refugio, y mi Dios por roca de mi confianza.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Hariel, para que me ayude a unir la mente y el alma en una sola sabiduría. Para que lo que descubra y aprenda sirva a los demás y no se use para destruir, en el nombre de Dios, que así sea."
  },
  {
    n: 16,
    nombre: "Hekamiah",
    hebreo: "הֲקַמְיָה",
    significado: "Dios que erige el universo",
    coro: "Querubines",
    regente: "Raziel",
    elemento: "Tierra",
    fecha_inicio: "06-06",
    fecha_fin: "06-10",
    don: "Tienes el don de la Lealtad y la Palabra de Honor. El poder de ser leal sin ser ciego y de hacer que tu palabra valga más que cualquier firma. Puedes usar tu don para ayudar a los demás a construir confianza duradera y a protegerse de los traidores.",
    virtudes: "Lealtad inquebrantable, nobleza de carácter, amistad con los poderosos sin servilismo, palabra de honor.",
    sombras: "Rebeldía sin causa, traición a quien confía, odio acumulado, espíritu de venganza.",
    salmo: "Salmo 88:1 — «Oh Señor, Dios de mi salvación, día y noche clamo delante de ti.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Hekamiah, para que me ayude a ser leal con nobleza y a sostener mi palabra ante todo. Para proteger también a quienes confían en mí de los que traicionan, en el nombre de Dios, que así sea."
  },

  // ========== CORO 3: TRONOS (Voluntad) ==========
  {
    n: 17,
    nombre: "Lauviah",
    hebreo: "לַוַויָה",
    significado: "Dios admirable",
    coro: "Tronos",
    regente: "Tsaphkiel",
    elemento: "Agua",
    fecha_inicio: "06-11",
    fecha_fin: "06-15",
    don: "Tienes el don de la Revelación y el Descanso Profundo. El poder de recibir sabiduría cuando el ego calla y de transformar el sueño en revelación. Puedes usar tu don para ayudar a los demás a encontrar respuestas en el silencio y a sanar el insomnio del alma.",
    virtudes: "Don de revelación, gran inteligencia, sabiduría profunda, sensibilidad mística.",
    sombras: "Tristeza melancólica, insomnio crónico, pesadillas, depresión espiritual.",
    salmo: "Salmo 8:1 — «Oh Señor, Soberano nuestro, cuán glorioso es tu nombre en toda la tierra!»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Lauviah, para que me ayude a descansar con sueños verdaderos y a recibir revelaciones cuando mi mente calle. Para acompañar a quienes sufren insomnio y necesitan paz nocturna, en el nombre de Dios, que así sea."
  },
  {
    n: 18,
    nombre: "Caliel",
    hebreo: "כַלִיאֵל",
    significado: "Dios pronto a oír",
    coro: "Tronos",
    regente: "Tsaphkiel",
    elemento: "Agua",
    fecha_inicio: "06-16",
    fecha_fin: "06-21",
    don: "Tienes el don de la Verdad Revelada. El poder de hacer que la verdad salga a la luz aunque tarde y de mantener la integridad bajo presión. Puedes usar tu don para ayudar a los demás a defenderse de calumnias y a confiar en que la justicia divina llega a su tiempo.",
    virtudes: "Integridad probada, honradez radical, fe en la justicia divina, paciencia para esperarla.",
    sombras: "Calumnia, proceso injusto, condena de inocentes, hipocresía judicial.",
    salmo: "Salmo 7:8 — «Júzgame, oh Señor, conforme a mi justicia, y conforme a mi integridad que hay en mí.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Caliel, para que me ayude a sostener la verdad cuando me cueste y a confiar en que la justicia llega aunque tarde. Para defender a los inocentes que son acusados injustamente, en el nombre de Dios, que así sea."
  },
  {
    n: 19,
    nombre: "Leuviah",
    hebreo: "לֵוּוִיָה",
    significado: "Dios que escucha a los pecadores",
    coro: "Tronos",
    regente: "Tsaphkiel",
    elemento: "Agua",
    fecha_inicio: "06-22",
    fecha_fin: "06-26",
    don: "Tienes el don de la Memoria del Alma. El poder de recordar quién eres en realidad cuando lo olvidas y de resistir el dolor con gracia. Puedes usar tu don para ayudar a los demás a reconectar con su origen y a agradecer a quienes los han ayudado.",
    virtudes: "Memoria prodigiosa, inteligencia jovial, capacidad de resistir el dolor, gracia natural.",
    sombras: "Olvido del propio origen, ingratitud con quien ayudó, queja constante, pereza moral.",
    salmo: "Salmo 40:1 — «Pacientemente esperé al Señor, y se inclinó a mí y oyó mi clamor.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Leuviah, para que me ayude a recordar quién soy cuando lo olvide y a resistir el dolor sin perder la gracia. Para acompañar a quienes han olvidado su propia luz, en el nombre de Dios, que así sea."
  },
  {
    n: 20,
    nombre: "Pahaliah",
    hebreo: "פַהֲלִיָה",
    significado: "Dios redentor",
    coro: "Tronos",
    regente: "Tsaphkiel",
    elemento: "Agua",
    fecha_inicio: "06-27",
    fecha_fin: "07-01",
    don: "Tienes el don de la Conversión y el Regreso. El poder de transformar tu vida cuando te has perdido y de devolverte al camino sagrado. Puedes usar tu don para ayudar a los demás a redimirse de sus errores y a recuperar la fe que habían perdido.",
    virtudes: "Vocación espiritual, capacidad de transformar la propia vida, devoción sincera, castidad cuando se elige.",
    sombras: "Vicios sin freno, libertinaje sin alegría, traición a las propias convicciones, apostasía.",
    salmo: "Salmo 116:5 — «Clemente es el Señor, y justo; sí, misericordioso es nuestro Dios.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Pahaliah, para que me ayude a regresar al camino cuando me extravíe y a transformar mi vida con devoción sincera. Para acompañar también a otros que han perdido la fe y buscan volver, en el nombre de Dios, que así sea."
  },
  {
    n: 21,
    nombre: "Nelchael",
    hebreo: "נֶלְכָאֵל",
    significado: "Dios único",
    coro: "Tronos",
    regente: "Tsaphkiel",
    elemento: "Agua",
    fecha_inicio: "07-02",
    fecha_fin: "07-06",
    don: "Tienes el don del Conocimiento Liberador. El poder de aprender con facilidad y enseñar lo que sabes sin presunción. Puedes usar tu don para ayudar a los demás a liberarse de la ignorancia y de los prejuicios que los limitan.",
    virtudes: "Amor por aprender, talento matemático y astronómico, capacidad de enseñar, claridad mental.",
    sombras: "Ignorancia presumida, error reiterado, prejuicio, pereza intelectual.",
    salmo: "Salmo 31:14 — «Mas yo en ti confío, oh Señor; digo: Tú eres mi Dios.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Nelchael, para que me ayude a iluminar mi entendimiento y a que el saber me haga libre y no orgulloso. Para enseñar también a otros lo que he aprendido con humildad, en el nombre de Dios, que así sea."
  },
  {
    n: 22,
    nombre: "Yeiayel",
    hebreo: "יְיָיאֵל",
    significado: "La diestra de Dios",
    coro: "Tronos",
    regente: "Tsaphkiel",
    elemento: "Agua",
    fecha_inicio: "07-07",
    fecha_fin: "07-11",
    don: "Tienes el don de la Fama Merecida. El poder de alcanzar reconocimiento por el trabajo bien hecho y de navegar con éxito en aguas difíciles. Puedes usar tu don para ayudar a los demás a construir reputaciones honradas y a llegar a buen puerto en sus empresas.",
    virtudes: "Buena reputación, fortuna conseguida con esfuerzo, capacidad de viajar y comerciar, valentía marina.",
    sombras: "Naufragio (real o simbólico), pérdida del crédito ganado, traición de socios, ambición ciega.",
    salmo: "Salmo 121:5 — «El Señor es tu guardador; el Señor es tu sombra a tu mano derecha.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Yeiayel, para que me ayude a navegar por aguas seguras y a construir una buena reputación con mi trabajo. Para guiar también a quienes emprenden viajes inciertos, en el nombre de Dios, que así sea."
  },
  {
    n: 23,
    nombre: "Melahel",
    hebreo: "מֵלָהֵל",
    significado: "Dios que libera de los males",
    coro: "Tronos",
    regente: "Tsaphkiel",
    elemento: "Agua",
    fecha_inicio: "07-12",
    fecha_fin: "07-16",
    don: "Tienes el don de la Curación Natural. El poder de sanar el cuerpo y el alma usando la sabiduría de las plantas y la medicina antigua. Puedes usar tu don para ayudar a los demás a recuperar su salud y a vencer enfermedades difíciles con valentía.",
    virtudes: "Don curativo, conocimiento de la medicina natural, valor en la adversidad, capacidad de proteger.",
    sombras: "Cobardía ante el peligro, enfermedades difíciles, uso de venenos, envidia oculta.",
    salmo: "Salmo 121:8 — «El Señor guardará tu salida y tu entrada desde ahora y para siempre.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Melahel, para que me ayude a sanar mi cuerpo, mi alma y mi memoria de lo que esté enfermo. Para acompañar también a quienes sufren enfermedades difíciles y necesitan curación, en el nombre de Dios, que así sea."
  },
  {
    n: 24,
    nombre: "Haheuiah",
    hebreo: "הַחֲהֻעיָה",
    significado: "Dios bueno por sí mismo",
    coro: "Tronos",
    regente: "Tsaphkiel",
    elemento: "Agua",
    fecha_inicio: "07-17",
    fecha_fin: "07-22",
    don: "Tienes el don del Refugio Compasivo. El poder de proteger a los exiliados y de ser puerta abierta para quien huye sin culpa. Puedes usar tu don para ayudar a los demás a encontrar amparo cuando todo está perdido y a no traicionar a los suyos en momentos difíciles.",
    virtudes: "Sinceridad espiritual, amor por la verdad, capacidad de proteger refugiados, conocimiento del exilio interior.",
    sombras: "Mentira piadosa, cobardía, abandono de los propios, traición política o moral.",
    salmo: "Salmo 33:18 — «He aquí el ojo del Señor sobre los que le temen, sobre los que esperan en su misericordia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Haheuiah, para que me ayude a ser refugio para quien huye sin culpa y a no abandonar a los míos en momentos difíciles. Para proteger a quienes necesitan amparo en su exilio, en el nombre de Dios, que así sea."
  },

  // ========== CORO 4: DOMINACIONES (Sabiduría) ==========
  {
    n: 25,
    nombre: "Nith-Haiah",
    hebreo: "נִתְהָיָה",
    significado: "Dios que da sabiduría",
    coro: "Dominaciones",
    regente: "Tsadkiel",
    elemento: "Aire",
    fecha_inicio: "07-23",
    fecha_fin: "07-27",
    don: "Tienes el don de la Sabiduría Oculta. El poder de acceder a los misterios espirituales sin perderte en ellos y de iniciar a otros en lo sagrado. Puedes usar tu don para ayudar a los demás a buscar la verdad profunda y a distinguir la luz auténtica de la falsa.",
    virtudes: "Sabiduría esotérica, amor por la verdad oculta, capacidad de iniciación espiritual, magia blanca.",
    sombras: "Curiosidad malsana, magia negra, ocultismo sin disciplina, soberbia espiritual.",
    salmo: "Salmo 9:1 — «Te alabaré, oh Señor, con todo mi corazón; contaré todas tus maravillas.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Nith-Haiah, para que me ayude a abrir las puertas de los misterios con sabiduría y sin soberbia. Para guiar también a otros que buscan la verdad oculta con corazón limpio, en el nombre de Dios, que así sea."
  },
  {
    n: 26,
    nombre: "Haaiah",
    hebreo: "הַאַעיָה",
    significado: "Dios oculto",
    coro: "Dominaciones",
    regente: "Tsadkiel",
    elemento: "Aire",
    fecha_inicio: "07-28",
    fecha_fin: "08-01",
    don: "Tienes el don de la Diplomacia y el Equilibrio. El poder de encontrar palabras justas en momentos delicados y de mantener la paz entre fuerzas opuestas. Puedes usar tu don para ayudar a los demás a alcanzar acuerdos sin traicionarse y a resolver conflictos con prudencia.",
    virtudes: "Don diplomático, capacidad para los acuerdos, amor por la verdad y la justicia política, prudencia.",
    sombras: "Traición, conspiración, ambición política sin escrúpulos, doble cara.",
    salmo: "Salmo 119:145 — «Clamé con todo mi corazón; respóndeme, Señor, y guardaré tus estatutos.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Haaiah, para que me ayude a hallar palabras justas en momentos delicados y a llevar la paz donde haya conflicto. Para mediar también entre quienes se enfrentan sin escucharse, en el nombre de Dios, que así sea."
  },
  {
    n: 27,
    nombre: "Yerathel",
    hebreo: "יְרַתְאֵל",
    significado: "Dios que castiga a los malvados",
    coro: "Dominaciones",
    regente: "Tsadkiel",
    elemento: "Aire",
    fecha_inicio: "08-02",
    fecha_fin: "08-06",
    don: "Tienes el don de la Luz que Distingue. El poder de propagar ideas elevadas y de distinguir el bien del mal sin caer en el fanatismo. Puedes usar tu don para ayudar a los demás a defenderse de la calumnia y a civilizar lo salvaje que llevan dentro.",
    virtudes: "Capacidad de propagar ideas elevadas, claridad para distinguir el bien del mal, civilización del salvaje interior.",
    sombras: "Calumnia activa, fanatismo, intolerancia religiosa, perseguir al que piensa distinto.",
    salmo: "Salmo 140:1 — «Líbrame, oh Señor, del hombre malo; guárdame de hombres violentos.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Yerathel, para que me ayude a distinguir el bien del mal sin condenar a quien piensa distinto. Para que mi voz propague verdad y no veneno, en el nombre de Dios, que así sea."
  },
  {
    n: 28,
    nombre: "Seheiah",
    hebreo: "שְׂהֲעיָה",
    significado: "Dios que cura a los enfermos",
    coro: "Dominaciones",
    regente: "Tsadkiel",
    elemento: "Aire",
    fecha_inicio: "08-07",
    fecha_fin: "08-12",
    don: "Tienes el don de la Longevidad y la Prudencia. El poder de prever peligros antes de que lleguen y de vivir una vida larga y útil. Puedes usar tu don para ayudar a los demás a evitar accidentes y a desarrollar salud robusta a través de la prudencia.",
    virtudes: "Salud robusta, prudencia, capacidad de prever peligros, vida larga y útil.",
    sombras: "Accidentes por imprudencia, enfermedades fulminantes, miedo paralizante, hipocondría.",
    salmo: "Salmo 71:8 — «Sea llena mi boca de tu alabanza, de tu gloria todo el día.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Seheiah, para que me ayude a proteger mis pasos de los accidentes y a vivir el tiempo justo con prudencia. Para cuidar también a quienes amo de los peligros inesperados, en el nombre de Dios, que así sea."
  },
  {
    n: 29,
    nombre: "Reiyel",
    hebreo: "רֵייאֵל",
    significado: "Dios pronto al socorro",
    coro: "Dominaciones",
    regente: "Tsadkiel",
    elemento: "Aire",
    fecha_inicio: "08-13",
    fecha_fin: "08-17",
    don: "Tienes el don de la Liberación Espiritual. El poder de combatir las sombras interiores que se disfrazan de verdad y de fortalecer la devoción auténtica. Puedes usar tu don para ayudar a los demás a liberarse de enemigos invisibles y a discernir las creencias verdaderas de las falsas.",
    virtudes: "Sentimientos religiosos auténticos, virtud probada, capacidad de combatir el mal espiritual, devoción.",
    sombras: "Fanatismo religioso, hipocresía piadosa, sectarismo, persecución de herejes imaginarios.",
    salmo: "Salmo 54:4 — «He aquí, Dios es el que me ayuda; el Señor está con los que sostienen mi vida.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Reiyel, para que me ayude a liberarme de los enemigos invisibles que llevo dentro. Para acompañar también a otros que combaten sombras que se disfrazan de verdad, en el nombre de Dios, que así sea."
  },
  {
    n: 30,
    nombre: "Omael",
    hebreo: "אוֹמָאֵל",
    significado: "Dios paciente",
    coro: "Dominaciones",
    regente: "Tsadkiel",
    elemento: "Aire",
    fecha_inicio: "08-18",
    fecha_fin: "08-22",
    don: "Tienes el don de la Fecundidad y la Multiplicación. El poder de hacer crecer lo bueno y de generar vida en lo que tocas. Puedes usar tu don para ayudar a los demás a desarrollar sus talentos hasta dar frutos y a cuidar lo vivo con compasión.",
    virtudes: "Fertilidad creativa y biológica, paciencia con los procesos lentos, amor por los animales y plantas, capacidad médica.",
    sombras: "Esterilidad simbólica, aborto del propio talento, crueldad con lo vivo, desesperación.",
    salmo: "Salmo 71:5 — «Porque tú, oh Señor, eres mi esperanza; mi confianza desde mi juventud.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Omael, para que me ayude a multiplicar lo bueno que hago y a generar vida en quienes me rodean. Para cuidar con compasión a los animales, las plantas y todo lo vivo, en el nombre de Dios, que así sea."
  },
  {
    n: 31,
    nombre: "Lecabel",
    hebreo: "לֶכַבְאֵל",
    significado: "Dios que inspira",
    coro: "Dominaciones",
    regente: "Tsadkiel",
    elemento: "Aire",
    fecha_inicio: "08-23",
    fecha_fin: "08-28",
    don: "Tienes el don de la Inteligencia Práctica. El poder de resolver problemas materiales con claridad y de hacer rendir lo que tienes con honradez. Puedes usar tu don para ayudar a los demás a ordenar sus cuentas, a prosperar con esfuerzo y a evitar el fraude.",
    virtudes: "Talento para la agricultura y la economía, inteligencia astronómica, capacidad de resolver problemas materiales, claridad de cálculo.",
    sombras: "Avaricia, traficar con lo sagrado, ambición desordenada, fraude.",
    salmo: "Salmo 71:16 — «Vendré a hablar de los hechos poderosos del Señor; haré memoria de tu sola justicia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Lecabel, para que me ayude a ser inteligente con lo concreto y a tener cuentas claras y corazón también. Para enseñar a otros a prosperar con esfuerzo honrado, en el nombre de Dios, que así sea."
  },
  {
    n: 32,
    nombre: "Vasariah",
    hebreo: "וַשַׁרְיָה",
    significado: "Dios justo",
    coro: "Dominaciones",
    regente: "Tsadkiel",
    elemento: "Aire",
    fecha_inicio: "08-29",
    fecha_fin: "09-02",
    don: "Tienes el don de la Justicia Misericordiosa. El poder de juzgar con piedad y de hablar con honor incluso en circunstancias duras. Puedes usar tu don para ayudar a los demás a recibir compasión cuando se equivocan y a defender la verdad en juicios injustos.",
    virtudes: "Don oratorio, sentido del honor, capacidad de juzgar con piedad, memoria privilegiada.",
    sombras: "Falsedad en juicios, injusticia con disfraz legal, dureza de corazón, calumnia.",
    salmo: "Salmo 33:4 — «Porque recta es la palabra del Señor, y toda su obra es hecha con fidelidad.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Vasariah, para que me ayude a juzgar con clemencia y a no perder la compasión por nadie. Para defender también a quienes son víctimas de juicios injustos, en el nombre de Dios, que así sea."
  },

  // ========== CORO 5: POTENCIAS (Equilibrio) ==========
  {
    n: 33,
    nombre: "Yehuiah",
    hebreo: "יְהֻוִיָה",
    significado: "Dios que conoce todas las cosas",
    coro: "Potencias",
    regente: "Camael",
    elemento: "Fuego",
    fecha_inicio: "09-03",
    fecha_fin: "09-07",
    don: "Tienes el don de la Disciplina Consciente. El poder de saber cuándo obedecer y cuándo desobedecer, sirviendo sin envilecerte. Puedes usar tu don para ayudar a los demás a encontrar su posición justa y a mantener el orden donde haya desorden.",
    virtudes: "Conocer la propia posición, lealtad a los superiores merecedores, capacidad de servir sin envilecerse, disciplina.",
    sombras: "Insubordinación destructiva, traición a la causa común, soberbia jerárquica, desorden.",
    salmo: "Salmo 33:10 — «El Señor hace nulo el consejo de las naciones, y frustra las maquinaciones de los pueblos.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Yehuiah, para que me ayude a obedecer cuando es justo y a desobedecer cuando es necesario, siempre con dignidad. Para orientar a quienes han perdido su lugar, en el nombre de Dios, que así sea."
  },
  {
    n: 34,
    nombre: "Lehahiah",
    hebreo: "לֶהַחְיָה",
    significado: "Dios clemente",
    coro: "Potencias",
    regente: "Camael",
    elemento: "Fuego",
    fecha_inicio: "09-08",
    fecha_fin: "09-12",
    don: "Tienes el don del Servicio Noble. El poder de mantenerte leal hasta el final y de aguantar tareas difíciles con dignidad. Puedes usar tu don para ayudar a los demás a servir con honor y a no caer en la deslealtad por interés propio.",
    virtudes: "Servicio noble, lealtad probada, disciplina interior, capacidad de aguantar tareas duras.",
    sombras: "Traición al que confía, deslealtad por interés, conspiración silenciosa, falsa modestia.",
    salmo: "Salmo 131:3 — «Espera, oh Israel, en el Señor, desde ahora y para siempre.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Lehahiah, para que me ayude a ser leal hasta el final y a que mi servicio sea honra y no humillación. Para acompañar a otros que sirven con dignidad en silencio, en el nombre de Dios, que así sea."
  },
  {
    n: 35,
    nombre: "Chevakiah",
    hebreo: "כְוַקְיָה",
    significado: "Dios que da alegría",
    coro: "Potencias",
    regente: "Camael",
    elemento: "Fuego",
    fecha_inicio: "09-13",
    fecha_fin: "09-17",
    don: "Tienes el don de la Reconciliación Familiar. El poder de reparar lazos rotos de sangre y de mantener la paz entre hermanos. Puedes usar tu don para ayudar a los demás a reconciliar enemistades familiares y a resolver herencias con justicia.",
    virtudes: "Capacidad de reconciliar enemistades familiares, justicia en herencias, paz entre hermanos, generosidad.",
    sombras: "Litigios familiares, herencias disputadas, pleitos eternos, codicia entre los propios.",
    salmo: "Salmo 116:1 — «Amo al Señor, pues ha oído mi voz y mis súplicas.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Chevakiah, para que me ayude a reparar los lazos rotos de mi familia antes de que sea demasiado tarde. Para mediar entre hermanos enfrentados y restaurar la paz en mi casa, en el nombre de Dios, que así sea."
  },
  {
    n: 36,
    nombre: "Menadel",
    hebreo: "מְנַדְאֵל",
    significado: "Dios honorable",
    coro: "Potencias",
    regente: "Camael",
    elemento: "Fuego",
    fecha_inicio: "09-18",
    fecha_fin: "09-23",
    don: "Tienes el don del Trabajo Digno. El poder de conservar lo que has conseguido y de poner amor en cada oficio que toques. Puedes usar tu don para ayudar a los demás a encontrar empleo digno y a valorar el trabajo manual como sagrado.",
    virtudes: "Amor por el oficio, capacidad de conservar lo conseguido, fidelidad al puesto, talento práctico.",
    sombras: "Despido injusto, pérdida del puesto por error propio, desprecio por el trabajo manual, holgazanería.",
    salmo: "Salmo 26:8 — «Señor, he amado la habitación de tu casa, y el lugar de la morada de tu gloria.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Menadel, para que me ayude a sostener mi trabajo con dignidad y a que mis manos produzcan algo que valga. Para acompañar también a quienes buscan empleo o lo han perdido, en el nombre de Dios, que así sea."
  },
  {
    n: 37,
    nombre: "Aniel",
    hebreo: "אַנִיאֵל",
    significado: "Dios de las virtudes",
    coro: "Potencias",
    regente: "Camael",
    elemento: "Fuego",
    fecha_inicio: "09-24",
    fecha_fin: "09-28",
    don: "Tienes el don de Romper Cadenas. El poder de salir de los hábitos que atan y de soltar lo que estanca tu vida. Puedes usar tu don para ayudar a los demás a vencer adicciones, a cambiar de rumbo y a no repetir los mismos errores.",
    virtudes: "Capacidad de romper hábitos negativos, fuerza para cambiar de vida, sabiduría para soltar lo que estanca.",
    sombras: "Adicciones, hábitos destructivos, aferrarse al pasado, repetir los mismos errores.",
    salmo: "Salmo 80:7 — «Oh Dios de los ejércitos, restáuranos; haz resplandecer tu rostro, y seremos salvos.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Aniel, para que me ayude a romper los círculos que me atan y a soltar lo que me hace daño. Para acompañar también a quienes luchan contra adicciones y hábitos que los destruyen, en el nombre de Dios, que así sea."
  },
  {
    n: 38,
    nombre: "Haamiah",
    hebreo: "חַעַמְיָה",
    significado: "Dios esperanza de todas las criaturas",
    coro: "Potencias",
    regente: "Camael",
    elemento: "Fuego",
    fecha_inicio: "09-29",
    fecha_fin: "10-03",
    don: "Tienes el don del Ritual Sagrado. El poder de entrar en lo sagrado con respeto profundo y de practicar la devoción auténtica. Puedes usar tu don para ayudar a los demás a vivir su fe sin caer en la idolatría y a proteger los espacios sagrados.",
    virtudes: "Capacidad ritual, conocimiento de lo sagrado, devoción auténtica, protección de los templos.",
    sombras: "Idolatría, religiosidad superficial, fanatismo ceremonial, error doctrinal.",
    salmo: "Salmo 91:9 — «Porque has puesto al Señor, que es mi refugio, al Altísimo, por tu habitación.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Haamiah, para que me ayude a entrar en lo sagrado con respeto y a que mi devoción sea profunda y no escenografía. Para guiar a quienes buscan a Dios sin saber dónde, en el nombre de Dios, que así sea."
  },
  {
    n: 39,
    nombre: "Rehael",
    hebreo: "רֶהֳעֵאל",
    significado: "Dios que acoge a los pecadores",
    coro: "Potencias",
    regente: "Camael",
    elemento: "Fuego",
    fecha_inicio: "10-04",
    fecha_fin: "10-08",
    don: "Tienes el don del Amor Filial. El poder de sanar lo pendiente con tus padres y de cuidar el niño interior. Puedes usar tu don para ayudar a los demás a reconciliarse con su familia y a fortalecer la salud mental cuando flaquea.",
    virtudes: "Buena relación con los padres, capacidad de ser padre/madre, salud mental, vida larga.",
    sombras: "Infanticidio simbólico (matar al niño interior), rebeldía destructiva, abandono de los padres ancianos.",
    salmo: "Salmo 30:10 — «Oye, oh Señor, y ten misericordia de mí; oh Señor, sé tú mi ayudador.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Rehael, para que me ayude a sanar lo que con mis padres quedó pendiente y a que el amor encuentre el camino de vuelta. Para acompañar también a quienes cuidan ancianos o niños, en el nombre de Dios, que así sea."
  },
  {
    n: 40,
    nombre: "Ieiazel",
    hebreo: "יְיָזאֵל",
    significado: "Dios que alegra",
    coro: "Potencias",
    regente: "Camael",
    elemento: "Fuego",
    fecha_inicio: "10-09",
    fecha_fin: "10-13",
    don: "Tienes el don del Consuelo en el Arte. El poder de transformar el dolor en obra creativa y de liberarte de las prisiones que tú mismo construyes. Puedes usar tu don para ayudar a los demás a consolarse a través de la belleza y a salir de la melancolía sin causa.",
    virtudes: "Don artístico y literario, capacidad de consolar, liberación interior, gracia en el sufrimiento.",
    sombras: "Cautiverio interior, melancolía sin causa, desesperación, encierro voluntario.",
    salmo: "Salmo 88:14 — «¿Por qué, oh Señor, desechas mi alma? ¿Por qué escondes de mí tu rostro?»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Ieiazel, para que me ayude a salir de las prisiones que yo mismo construí y a que el arte sea mi llave. Para consolar a quienes sufren melancolía sin causa, en el nombre de Dios, que así sea."
  },

  // ========== CORO 6: VIRTUDES (Milagros) ==========
  {
    n: 41,
    nombre: "Hahahel",
    hebreo: "הַחַהֵל",
    significado: "Dios en tres personas",
    coro: "Virtudes",
    regente: "Rafael",
    elemento: "Agua",
    fecha_inicio: "10-14",
    fecha_fin: "10-18",
    don: "Tienes el don de la Misión Trascendente. El poder de reconocer el llamado para el que naciste y de inspirar a otros con tu fe. Puedes usar tu don para ayudar a los demás a descubrir su vocación profunda y a no morir sin haber cumplido lo suyo.",
    virtudes: "Vocación trascendente, capacidad de inspirar a otros, fe contagiosa, palabra que mueve.",
    sombras: "Falsa misión, profecía vana, traición a la propia vocación, charlatanería espiritual.",
    salmo: "Salmo 120:1 — «A Jehová clamé estando en angustia, y él me respondió.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Hahahel, para que me ayude a descubrir la misión para la que nací y a no morir sin haberla cumplido. Para inspirar a otros a buscar su propia vocación sagrada, en el nombre de Dios, que así sea."
  },
  {
    n: 42,
    nombre: "Mikael",
    hebreo: "מִיכָאֵל",
    significado: "Quién como Dios",
    coro: "Virtudes",
    regente: "Rafael",
    elemento: "Agua",
    fecha_inicio: "10-19",
    fecha_fin: "10-23",
    don: "Tienes el don del Discernimiento del Poder. El poder de actuar con ética cuando tienes autoridad y de protegerte del poder ajeno. Puedes usar tu don para ayudar a los demás a manejar su influencia con orden y a defenderse de quienes los manipulan.",
    virtudes: "Sentido del orden, capacidad política con ética, intuición estratégica, defensa de los gobernados.",
    sombras: "Traición política, conspiración, tiranía suave, manipulación de masas.",
    salmo: "Salmo 121:7 — «El Señor te guardará de todo mal; él guardará tu alma.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Mikael, para que me ayude a tener discernimiento en el poder, el que ejerzo y el que sufro de otros. Para proteger a quienes son manipulados por gobernantes injustos, en el nombre de Dios, que así sea."
  },
  {
    n: 43,
    nombre: "Veuliah",
    hebreo: "וְעוּלִיָה",
    significado: "Dios rey dominador",
    coro: "Virtudes",
    regente: "Rafael",
    elemento: "Agua",
    fecha_inicio: "10-24",
    fecha_fin: "10-28",
    don: "Tienes el don de la Prosperidad Compartida. El poder de generar abundancia sin aplastar a nadie y de alcanzar la paz tras el conflicto. Puedes usar tu don para ayudar a los demás a prosperar honradamente y a repartir lo que les sobra.",
    virtudes: "Capacidad de prosperar, valor militar bien usado, paz lograda con firmeza, abundancia compartida.",
    sombras: "Tiranía, guerra por ambición, esclavitud de los débiles, ruina por avaricia.",
    salmo: "Salmo 88:13 — «Mas yo a ti he clamado, oh Señor, y de mañana mi oración se presentará delante de ti.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Veuliah, para que me ayude a alcanzar prosperidad que no aplaste a nadie y a compartir lo que sobra. Para acompañar a quienes buscan paz tras largos conflictos, en el nombre de Dios, que así sea."
  },
  {
    n: 44,
    nombre: "Yelahiah",
    hebreo: "יְלָהיָה",
    significado: "Dios eterno",
    coro: "Virtudes",
    regente: "Rafael",
    elemento: "Agua",
    fecha_inicio: "10-29",
    fecha_fin: "11-02",
    don: "Tienes el don del Triunfo Honorable. El poder de vencer en batallas justas y de buscar la paz por encima del aplauso. Puedes usar tu don para ayudar a los demás a defender causas nobles y a no librar guerras inútiles.",
    virtudes: "Valor en la causa noble, capacidad militar o policíaca con ética, defensa del orden, victoria con honor.",
    sombras: "Guerra inútil, violencia gratuita, conflicto sin causa, derrota humillante.",
    salmo: "Salmo 119:108 — «Te ruego, oh Señor, que te sean agradables los sacrificios voluntarios de mi boca.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Yelahiah, para que mis batallas sean justas y mis victorias limpias. Para defender a quienes luchan por causas nobles y evitar la violencia gratuita, en el nombre de Dios, que así sea."
  },
  {
    n: 45,
    nombre: "Sealiah",
    hebreo: "סֵאלִיָה",
    significado: "Motor de todas las cosas",
    coro: "Virtudes",
    regente: "Rafael",
    elemento: "Agua",
    fecha_inicio: "11-03",
    fecha_fin: "11-07",
    don: "Tienes el don del Impulso Vital. El poder de devolver el movimiento donde había detención y de reanimar el espíritu cuando se aletarga. Puedes usar tu don para ayudar a los demás a salir de la depresión y a recuperar el contacto con la naturaleza.",
    virtudes: "Capacidad de reanimar lo aletargado, energía vital, amor por la naturaleza, talento agrícola.",
    sombras: "Pereza profunda, depresión inmóvil, aplanamiento del espíritu, falta de iniciativa.",
    salmo: "Salmo 94:18 — «Cuando yo decía: Mi pie resbala, tu misericordia, oh Señor, me sustentaba.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Sealiah, para que me ayude a recuperar el impulso vital y a que mi alma se vuelva a mover. Para acompañar a quienes han caído en la inmovilidad y la tristeza, en el nombre de Dios, que así sea."
  },
  {
    n: 46,
    nombre: "Ariel",
    hebreo: "עַרִיאֵל",
    significado: "Dios revelador",
    coro: "Virtudes",
    regente: "Rafael",
    elemento: "Agua",
    fecha_inicio: "11-08",
    fecha_fin: "11-12",
    don: "Tienes el don de la Revelación Interior. El poder de descubrir tesoros ocultos en lo profundo y de recibir sueños premonitorios. Puedes usar tu don para ayudar a los demás a ver lo que está escondido y a comprender lo que la vida les revela.",
    virtudes: "Don de revelación, fortaleza interior, capacidad de descubrir lo escondido, sueños premonitorios.",
    sombras: "Avaricia oculta, secretos malsanos, fanatismo discreto, esconderse de la verdad.",
    salmo: "Salmo 145:9 — «Bueno es el Señor para con todos, y sus misericordias sobre todas sus obras.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Ariel, para que me ayude a ver lo que necesito comprender y a recibir las revelaciones con corazón limpio. Para acompañar a quienes buscan respuestas en lo profundo, en el nombre de Dios, que así sea."
  },
  {
    n: 47,
    nombre: "Asaliah",
    hebreo: "עַשַלִיָה",
    significado: "Dios justo que indica la verdad",
    coro: "Virtudes",
    regente: "Rafael",
    elemento: "Agua",
    fecha_inicio: "11-13",
    fecha_fin: "11-17",
    don: "Tienes el don de la Contemplación. El poder de gozar en la verdad y de ver lo bello incluso en lo que duele. Puedes usar tu don para ayudar a los demás a abrir los ojos del alma y a no caer en la mentira sostenida.",
    virtudes: "Capacidad contemplativa, gusto por lo bello, justicia clara, gozo en la verdad.",
    sombras: "Mentira sostenida, falsedad sistemática, hipocresía intelectual, distorsión de los hechos.",
    salmo: "Salmo 105:1 — «Alabad al Señor, invocad su nombre; dad a conocer sus obras entre los pueblos.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Asaliah, para que me ayude a ver lo bello y a abrazar la verdad aunque duela. Para acompañar a quienes han sido engañados y necesitan despertar, en el nombre de Dios, que así sea."
  },
  {
    n: 48,
    nombre: "Mihael",
    hebreo: "מִיהָאֵל",
    significado: "Dios padre socorredor",
    coro: "Virtudes",
    regente: "Rafael",
    elemento: "Agua",
    fecha_inicio: "11-18",
    fecha_fin: "11-22",
    don: "Tienes el don de la Fidelidad Conyugal. El poder de sostener amores duraderos y de crear hogares en paz. Puedes usar tu don para ayudar a los demás a bendecir sus uniones, a tener fertilidad y a echar raíces profundas en el amor.",
    virtudes: "Amor conyugal duradero, fertilidad, paz en el hogar, capacidad de procrear con amor.",
    sombras: "Esterilidad simbólica, infidelidad, lujuria sin amor, ruptura del lazo sagrado.",
    salmo: "Salmo 98:2 — «El Señor ha hecho notoria su salvación; a vista de las naciones ha descubierto su justicia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Mihael, para que mis amores tengan permanencia y mi hogar esté lleno de paz. Para bendecir a las parejas que buscan construir uniones duraderas, en el nombre de Dios, que así sea."
  },

  // ========== CORO 7: PRINCIPADOS (Belleza) ==========
  {
    n: 49,
    nombre: "Vehuel",
    hebreo: "וְהוּאֵל",
    significado: "Dios grande y elevado",
    coro: "Principados",
    regente: "Haniel",
    elemento: "Tierra",
    fecha_inicio: "11-23",
    fecha_fin: "11-27",
    don: "Tienes el don de la Elevación del Alma. El poder de reconocer la grandeza interior y de elevar la mirada cuando el polvo te tape el cielo. Puedes usar tu don para ayudar a los demás a salir de la tristeza inmotivada y a descubrir su propia magnanimidad.",
    virtudes: "Sensibilidad fina, magnanimidad, capacidad literaria, amor a Dios sentido.",
    sombras: "Tristeza inmotivada, hipocondría espiritual, vanidad oculta, melancolía estéril.",
    salmo: "Salmo 145:3 — «Grande es el Señor y digno de suprema alabanza; y su grandeza es inescrutable.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Vehuel, para que me ayude a elevar mi mirada cuando el polvo me tape el cielo y a reconocer la grandeza dentro de mí. Para acompañar a quienes están atrapados en tristezas sin causa, en el nombre de Dios, que así sea."
  },
  {
    n: 50,
    nombre: "Daniel",
    hebreo: "דָנִיאֵל",
    significado: "Dios juez de los hombres",
    coro: "Principados",
    regente: "Haniel",
    elemento: "Tierra",
    fecha_inicio: "11-28",
    fecha_fin: "12-02",
    don: "Tienes el don de la Elocuencia. El poder de pronunciar palabras justas en momentos críticos y de consolar a quienes sufren. Puedes usar tu don para ayudar a los demás a decidirse cuando dudan y a no caer en la palabrería vacía.",
    virtudes: "Don oratorio, capacidad de consolar, palabra justa en momento justo, claridad mental.",
    sombras: "Palabrería vacía, mentira elocuente, manipulación retórica, indecisión.",
    salmo: "Salmo 103:8 — «Misericordioso y clemente es el Señor; lento para la ira y grande en misericordia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Daniel, para que me ayude a hablar palabras que sanen y aclaren en lugar de herir y confundir. Para consolar a quienes pasan por momentos críticos, en el nombre de Dios, que así sea."
  },
  {
    n: 51,
    nombre: "Hahasiah",
    hebreo: "חַחֲשִׁיָה",
    significado: "Dios oculto",
    coro: "Principados",
    regente: "Haniel",
    elemento: "Tierra",
    fecha_inicio: "12-03",
    fecha_fin: "12-07",
    don: "Tienes el don de la Medicina Universal. El poder de conocer la sabiduría que cura cuerpos y almas, sin profanar lo sagrado. Puedes usar tu don para ayudar a los demás a recuperar la salud y a transmitir el saber de los antiguos con devoción.",
    virtudes: "Conocimiento alquímico, capacidad curativa, sabiduría de los antiguos, devoción al saber.",
    sombras: "Magia negra, alquimia mal usada, curanderismo fraudulento, comercio con lo sagrado.",
    salmo: "Salmo 104:31 — «Sea la gloria del Señor para siempre; alégrese el Señor en sus obras.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Hahasiah, para que me ayude a ser instrumento de sanación para mi cuerpo, mi mente y los de quienes me rodean. Para que nunca use lo sagrado para fines impuros, en el nombre de Dios, que así sea."
  },
  {
    n: 52,
    nombre: "Imamiah",
    hebreo: "עִמַמְיָה",
    significado: "Dios elevado sobre todas las cosas",
    coro: "Principados",
    regente: "Haniel",
    elemento: "Tierra",
    fecha_inicio: "12-08",
    fecha_fin: "12-12",
    don: "Tienes el don de la Humildad Verdadera. El poder de reconocer tus propios errores con valentía y de pedir perdón cuando es justo. Puedes usar tu don para ayudar a los demás a soltar la soberbia y a transformar sus sombras en luz.",
    virtudes: "Fortaleza para reconocer errores, capacidad de pedir perdón, humildad activa, valor en la adversidad.",
    sombras: "Soberbia que no se reconoce, blasfemia, rebeldía sin propósito, arrogancia espiritual.",
    salmo: "Salmo 7:17 — «Alabaré al Señor conforme a su justicia, y cantaré al nombre del Señor altísimo.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Imamiah, para que me ayude a reconocer mis sombras con valentía y a pedir perdón cuando me equivoque. Para que solo lo que veo en mí pueda cambiar y servir a otros, en el nombre de Dios, que así sea."
  },
  {
    n: 53,
    nombre: "Nanael",
    hebreo: "נַנָאֵל",
    significado: "Dios que abate a los soberbios",
    coro: "Principados",
    regente: "Haniel",
    elemento: "Tierra",
    fecha_inicio: "12-13",
    fecha_fin: "12-16",
    don: "Tienes el don del Pensamiento Profundo. El poder de meditar serenamente y de comprender lo abstracto sin perderte en laberintos. Puedes usar tu don para ayudar a los demás a desarrollar pensamiento crítico y a no despreciar el estudio.",
    virtudes: "Don filosófico, capacidad meditativa, amor por las matemáticas y lo abstracto, sabiduría serena.",
    sombras: "Ignorancia presumida, desprecio del estudio, frivolidad intelectual, soberbia académica.",
    salmo: "Salmo 119:75 — «Conozco, oh Señor, que tus juicios son justos, y que conforme a tu fidelidad me afligiste.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Nanael, para que me ayude a pensar con profundidad y a que lo abstracto sea lámpara y no laberinto. Para enseñar a otros el valor del estudio serio, en el nombre de Dios, que así sea."
  },
  {
    n: 54,
    nombre: "Nithael",
    hebreo: "נִתָאֵל",
    significado: "Rey de los cielos",
    coro: "Principados",
    regente: "Haniel",
    elemento: "Tierra",
    fecha_inicio: "12-17",
    fecha_fin: "12-21",
    don: "Tienes el don de la Gracia Eterna del Alma. El poder de mantener joven el espíritu aunque el cuerpo cambie y de ganar fama con honor. Puedes usar tu don para ayudar a los demás a envejecer con dignidad y a brillar con belleza interior duradera.",
    virtudes: "Belleza interior, gracia natural, eternidad del nombre, fama bien ganada.",
    sombras: "Decadencia moral, mala fama merecida, vanidad estéril, envejecimiento amargo.",
    salmo: "Salmo 103:19 — «El Señor estableció en los cielos su trono, y su reino domina sobre todos.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Nithael, para que mi alma se mantenga joven aunque mi cuerpo cambie. Para acompañar a quienes envejecen con amargura y necesitan recuperar la gracia, en el nombre de Dios, que así sea."
  },
  {
    n: 55,
    nombre: "Mebahiah",
    hebreo: "מְבַהיָה",
    significado: "Dios eterno",
    coro: "Principados",
    regente: "Haniel",
    elemento: "Tierra",
    fecha_inicio: "12-22",
    fecha_fin: "12-26",
    don: "Tienes el don de la Transmisión de la Fe. El poder de educar con tu ejemplo y de transmitir principios verdaderos a quienes vienen detrás de ti. Puedes usar tu don para ayudar a los demás a formar a sus hijos con valores y a vivir en coherencia con lo que enseñan.",
    virtudes: "Capacidad de educar moralmente, fertilidad simbólica, amor por los hijos propios y ajenos, devoción.",
    sombras: "Esterilidad espiritual, mal ejemplo, traición a los principios enseñados, hipocresía moral.",
    salmo: "Salmo 102:12 — «Mas tú, oh Señor, permanecerás para siempre, y tu memoria de generación en generación.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Mebahiah, para que lo que enseñe con mi vida sea verdadero, porque los hijos aprenden lo que ven y no lo que oyen. Para inspirar a otros padres y maestros a formar con coherencia, en el nombre de Dios, que así sea."
  },
  {
    n: 56,
    nombre: "Poyel",
    hebreo: "פּוֹיאֵל",
    significado: "Dios que sostiene el universo",
    coro: "Principados",
    regente: "Haniel",
    elemento: "Tierra",
    fecha_inicio: "12-27",
    fecha_fin: "12-31",
    don: "Tienes el don de la Modesta Ambición. El poder de pedir solo lo justo y de prosperar sin codicia. Puedes usar tu don para ayudar a los demás a reconocer sus verdaderas necesidades y a compartir lo que les sobra con gratitud.",
    virtudes: "Modesta ambición, capacidad de pedir lo justo, fortuna con humildad, talento literario.",
    sombras: "Ambición desmedida, codicia, pedir más de lo que se necesita, ingratitud.",
    salmo: "Salmo 145:14 — «Sostiene el Señor a todos los que caen, y levanta a todos los oprimidos.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Poyel, para que me ayude a recibir lo justo, lo que necesito y lo que pueda compartir, ni más ni menos. Para enseñar a otros a vivir sin codicia, en el nombre de Dios, que así sea."
  },

  // ========== CORO 8: ARCÁNGELES (Mensajeros) ==========
  {
    n: 57,
    nombre: "Nemamiah",
    hebreo: "נְמַמְיָה",
    significado: "Dios loable",
    coro: "Arcángeles",
    regente: "Miguel",
    elemento: "Fuego",
    fecha_inicio: "01-01",
    fecha_fin: "01-05",
    don: "Tienes el don de la Estrategia Justa. El poder de pensar con inteligencia para vencer a tus sombras y de defender a los oprimidos con valor. Puedes usar tu don para ayudar a los demás a liberarse de cautiverios y a planear sus batallas con sabiduría.",
    virtudes: "Capacidad estratégica, valor en el combate justo, defensa de los oprimidos, lealtad militar.",
    sombras: "Traición política, conspiración, abandono del puesto, cobardía.",
    salmo: "Salmo 115:11 — «Los que teméis al Señor, esperad en el Señor; él es vuestra ayuda y vuestro escudo.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Nemamiah, para que me ayude a tener estrategia y coraje para vencer a mis sombras. Para defender también a los oprimidos que no pueden defenderse, en el nombre de Dios, que así sea."
  },
  {
    n: 58,
    nombre: "Yeialel",
    hebreo: "יֵיָלאֵל",
    significado: "Dios que escucha a las generaciones",
    coro: "Arcángeles",
    regente: "Miguel",
    elemento: "Fuego",
    fecha_inicio: "01-06",
    fecha_fin: "01-10",
    don: "Tienes el don de la Fuerza Mental. El poder de resistir presiones y de mantener la lógica clara incluso ante verdades duras. Puedes usar tu don para ayudar a los demás a curar la tristeza profunda y a no caer en calumnias ni falsos testimonios.",
    virtudes: "Coraje moral, capacidad de resistir presiones, lógica clara, valor para enfrentar verdades duras.",
    sombras: "Melancolía crónica, calumnia, falso testimonio, hipocondría persistente.",
    salmo: "Salmo 6:3 — «Y mi alma muy turbada; y tú, Señor, ¿hasta cuándo?»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Yeialel, para que sostenga mi mente cuando la tristeza la nuble, porque la luz siempre vuelve. Para acompañar a quienes sufren melancolía profunda, en el nombre de Dios, que así sea."
  },
  {
    n: 59,
    nombre: "Harahel",
    hebreo: "הָרַחְאֵל",
    significado: "Dios que conoce todas las cosas",
    coro: "Arcángeles",
    regente: "Miguel",
    elemento: "Fuego",
    fecha_inicio: "01-11",
    fecha_fin: "01-15",
    don: "Tienes el don de la Fecundidad Intelectual. El poder de aprender, enseñar y multiplicar ideas que sirvan a otros. Puedes usar tu don para ayudar a los demás a desarrollar su talento creativo y a usar el conocimiento con generosidad.",
    virtudes: "Capacidad de aprender y enseñar, amor por los libros, riqueza obtenida con inteligencia, fertilidad de ideas.",
    sombras: "Avaricia intelectual, esterilidad creativa, despilfarro, codicia.",
    salmo: "Salmo 113:3 — «Desde el nacimiento del sol hasta donde se pone, sea alabado el nombre del Señor.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Harahel, para que multiplique en mí las ideas que sirven y para que mis libros sean semillas para otros. Para acompañar a quienes enseñan o estudian con devoción, en el nombre de Dios, que así sea."
  },
  {
    n: 60,
    nombre: "Mitzrael",
    hebreo: "מִצְרָאֵל",
    significado: "Dios consuelo de los oprimidos",
    coro: "Arcángeles",
    regente: "Miguel",
    elemento: "Fuego",
    fecha_inicio: "01-16",
    fecha_fin: "01-20",
    don: "Tienes el don de la Reparación. El poder de arreglar lo que rompiste sin querer y de mantener la cordura cuando la mente flaquea. Puedes usar tu don para ayudar a los demás a sanar daños del pasado y a honrar a quienes les enseñaron.",
    virtudes: "Capacidad de reparar daños, virtud probada, talento médico-mental, honor de los padres.",
    sombras: "Persecución mental, locura, traición a los maestros, rebelión destructiva.",
    salmo: "Salmo 145:17 — «Justo es el Señor en todos sus caminos, y misericordioso en todas sus obras.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Mitzrael, para que me ayude a reparar lo que rompí sin querer y a mantener la cordura cuando la mente me traicione. Para acompañar a quienes sufren persecuciones mentales, en el nombre de Dios, que así sea."
  },
  {
    n: 61,
    nombre: "Umabel",
    hebreo: "אוּמַבְאֵל",
    significado: "Dios sobre todas las cosas",
    coro: "Arcángeles",
    regente: "Miguel",
    elemento: "Fuego",
    fecha_inicio: "01-21",
    fecha_fin: "01-25",
    don: "Tienes el don de la Amistad Verdadera. El poder de generar afinidades profundas entre almas hermanas y de ser amigo sincero. Puedes usar tu don para ayudar a los demás a encontrar lazos auténticos y a no traicionar a quienes confían en ellos.",
    virtudes: "Capacidad de amistad profunda, talento astronómico, sensibilidad humana, conexión auténtica.",
    sombras: "Disolución de las amistades, traición íntima, libertinaje afectivo, falsedad.",
    salmo: "Salmo 113:2 — «Sea el nombre del Señor bendito desde ahora y para siempre.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Umabel, para que me mande amigos verdaderos y para hacerme amigo verdadero. Para acompañar a quienes se sienten solos y necesitan conexiones auténticas, en el nombre de Dios, que así sea."
  },
  {
    n: 62,
    nombre: "Iah-Hel",
    hebreo: "יָה-הֵל",
    significado: "Dios ser supremo",
    coro: "Arcángeles",
    regente: "Miguel",
    elemento: "Fuego",
    fecha_inicio: "01-26",
    fecha_fin: "01-30",
    don: "Tienes el don de la Sabiduría en la Soledad. El poder de hacer del silencio compañía fecunda y de cultivar una vida interior rica. Puedes usar tu don para ayudar a los demás a no temer al retiro y a transformar el aislamiento en sabiduría.",
    virtudes: "Don filosófico, amor por el retiro fecundo, sabiduría serena, vida interior rica.",
    sombras: "Ignorancia presumida, desprecio del estudio, soledad amarga, aislamiento patológico.",
    salmo: "Salmo 119:159 — «Mira, oh Señor, que amo tus mandamientos; vivifícame conforme a tu misericordia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Iah-Hel, para que en la soledad sea compañía de mí mismo y el silencio me enseñe. Para acompañar a quienes están solos y temen su propio silencio, en el nombre de Dios, que así sea."
  },
  {
    n: 63,
    nombre: "Anauel",
    hebreo: "עֲנַוְאֵל",
    significado: "Dios infinitamente bueno",
    coro: "Arcángeles",
    regente: "Miguel",
    elemento: "Fuego",
    fecha_inicio: "01-31",
    fecha_fin: "02-04",
    don: "Tienes el don de la Visión Unificadora. El poder de ver el hilo invisible que une todo lo creado y de comerciar con ética. Puedes usar tu don para ayudar a los demás a superar la dispersión y a entender que nada está realmente separado.",
    virtudes: "Visión unificadora, capacidad para el comercio ético, salud, sabiduría práctica con sentido espiritual.",
    sombras: "División destructiva, accidentes graves, codicia comercial, dispersión.",
    salmo: "Salmo 100:2 — «Servid al Señor con alegría; venid ante su presencia con regocijo.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Anauel, para que me muestre el hilo invisible que une todo. Para enseñar a otros que nada está separado y que la unidad sostiene todo lo que existe, en el nombre de Dios, que así sea."
  },
  {
    n: 64,
    nombre: "Mehiel",
    hebreo: "מְהִיאֵל",
    significado: "Dios que vivifica todas las cosas",
    coro: "Arcángeles",
    regente: "Miguel",
    elemento: "Fuego",
    fecha_inicio: "02-05",
    fecha_fin: "02-09",
    don: "Tienes el don de la Inspiración Literaria. El poder de crear con la palabra escrita o hablada y de proteger lo que produces de la calumnia. Puedes usar tu don para ayudar a los demás a comunicar verdad y a defender la palabra pública del veneno.",
    virtudes: "Don literario y oratorio, capacidad creativa, memoria fértil, protección en lo intelectual.",
    sombras: "Mentira escrita, calumnia impresa, prensa amarillista, falsedad en la palabra pública.",
    salmo: "Salmo 33:18 — «He aquí el ojo del Señor sobre los que le temen, sobre los que esperan en su misericordia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Mehiel, para que inspire lo que escribo y lo que digo, y que mis palabras vivifiquen en lugar de envenenar. Para acompañar a escritores y comunicadores que buscan servir con la verdad, en el nombre de Dios, que así sea."
  },

  // ========== CORO 9: ÁNGELES (Materialización) ==========
  {
    n: 65,
    nombre: "Damabiah",
    hebreo: "דַמַבְיָה",
    significado: "Dios fuente de sabiduría",
    coro: "Ángeles",
    regente: "Gabriel",
    elemento: "Agua",
    fecha_inicio: "02-10",
    fecha_fin: "02-14",
    don: "Tienes el don de la Protección en los Viajes. El poder de navegar travesías inciertas y de proteger las empresas útiles. Puedes usar tu don para ayudar a los demás a llegar a buen puerto y a no naufragar cuando el alma no encuentra rumbo.",
    virtudes: "Sabiduría espiritual, capacidad de proteger expediciones, generosidad, talento marino.",
    sombras: "Naufragio real o simbólico, ruina por imprudencia, traición de socios, accidentes.",
    salmo: "Salmo 90:13 — «Vuélvete, oh Señor; ¿hasta cuándo? Y aplácate para con tus siervos.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Damabiah, para que proteja mis travesías, las del cuerpo y las del alma cuando navego sin rumbo claro. Para acompañar a quienes emprenden viajes inciertos, en el nombre de Dios, que así sea."
  },
  {
    n: 66,
    nombre: "Manakel",
    hebreo: "מַנַקְאֵל",
    significado: "Dios que sostiene todo",
    coro: "Ángeles",
    regente: "Gabriel",
    elemento: "Agua",
    fecha_inicio: "02-15",
    fecha_fin: "02-19",
    don: "Tienes el don del Discernimiento Moral. El poder de calmar la cólera antes de que te consuma y de recibir sueños lúcidos que orientan. Puedes usar tu don para ayudar a los demás a controlar su irascibilidad y a tomar decisiones desde la calma.",
    virtudes: "Discernimiento moral, capacidad de calmar la cólera, amistad con animales, sueños lúcidos.",
    sombras: "Cólera incontrolada, brutalidad, irascibilidad, falta de discernimiento.",
    salmo: "Salmo 38:21 — «No me desampares, oh Señor; Dios mío, no te alejes de mí.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Manakel, para que sosiegue mi cólera antes de que me consuma y para que mis sueños me orienten. Para acompañar a quienes luchan contra su propio temperamento, en el nombre de Dios, que así sea."
  },
  {
    n: 67,
    nombre: "Eyael",
    hebreo: "אֵיָעאֵל",
    significado: "Dios delicia de los hijos de los hombres",
    coro: "Ángeles",
    regente: "Gabriel",
    elemento: "Agua",
    fecha_inicio: "02-20",
    fecha_fin: "02-24",
    don: "Tienes el don de la Sublimación. El poder de transformar el sufrimiento en obra bella y de hallar consuelo en lo trascendente. Puedes usar tu don para ayudar a los demás a convertir sus dolores en arte y a encontrar sentido en lo que parece roto.",
    virtudes: "Capacidad de hallar consuelo en lo bello, talento para ciencias ocultas con disciplina, sublimación creativa.",
    sombras: "Ateísmo militante, error reiterado, ciencia sin ética, melancolía estética.",
    salmo: "Salmo 36:7 — «¡Cuán preciosa, oh Dios, es tu misericordia! Por eso los hijos de los hombres se amparan bajo la sombra de tus alas.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Eyael, para que transforme lo doloroso en obra. Para que mi sufrimiento sirva como materia prima de algo bello y pueda ayudar a otros a sublimar el suyo, en el nombre de Dios, que así sea."
  },
  {
    n: 68,
    nombre: "Habuhiah",
    hebreo: "חַבוּהיָה",
    significado: "Dios dador con liberalidad",
    coro: "Ángeles",
    regente: "Gabriel",
    elemento: "Agua",
    fecha_inicio: "02-25",
    fecha_fin: "02-29",
    don: "Tienes el don de la Curación y la Fertilidad. El poder de hacer florecer lo seco y de sanar enfermedades antiguas. Puedes usar tu don para ayudar a los demás a recuperar la salud, a multiplicar lo que cultivan y a generar abundancia con generosidad.",
    virtudes: "Don curativo poderoso, capacidad de hacer fructificar la tierra, fertilidad, generosidad.",
    sombras: "Esterilidad, enfermedades crónicas, peste, ruina agrícola, mezquindad.",
    salmo: "Salmo 106:1 — «Aleluya. Alabad al Señor, porque él es bueno; porque para siempre es su misericordia.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Habuhiah, para que cure lo enfermo en mí y haga fértil lo seco. Para acompañar a quienes sufren enfermedades crónicas y a quienes trabajan la tierra, en el nombre de Dios, que así sea."
  },
  {
    n: 69,
    nombre: "Rochel",
    hebreo: "רוֹחֵל",
    significado: "Dios que ve todo",
    coro: "Ángeles",
    regente: "Gabriel",
    elemento: "Agua",
    fecha_inicio: "03-01",
    fecha_fin: "03-05",
    don: "Tienes el don de la Restitución. El poder de recuperar lo que era tuyo y se perdió, sean cosas, personas o partes de ti mismo. Puedes usar tu don para ayudar a los demás a hallar lo extraviado y a obtener justicia cuando algo les fue arrebatado.",
    virtudes: "Memoria privilegiada, capacidad de recuperar objetos perdidos, justicia restitutiva, fama merecida.",
    sombras: "Robo, pérdida injusta, calumnia, error judicial.",
    salmo: "Salmo 16:5 — «El Señor es la porción de mi herencia y de mi copa; tú sustentas mi suerte.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Rochel, para que me devuelva lo que era mío y se perdió, sean cosas, personas o partes de mí mismo. Para acompañar a quienes han sido despojados injustamente, en el nombre de Dios, que así sea."
  },
  {
    n: 70,
    nombre: "Yabamiah",
    hebreo: "יַבַמְיָה",
    significado: "Verbo que produce todas las cosas",
    coro: "Ángeles",
    regente: "Gabriel",
    elemento: "Agua",
    fecha_inicio: "03-06",
    fecha_fin: "03-10",
    don: "Tienes el don del Verbo Creador. El poder de generar mundos con tus palabras y de regenerarte profundamente. Puedes usar tu don para ayudar a los demás a construir con la palabra en lugar de destruir y a alcanzar transformaciones profundas.",
    virtudes: "Don creador, capacidad alquímica, regeneración profunda, dominio del verbo.",
    sombras: "Magia negra, destrucción por la palabra, ateísmo militante, irreligiosidad cínica.",
    salmo: "Salmo 1:1 — «Bienaventurado el varón que no anduvo en consejo de malos, ni estuvo en camino de pecadores.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Yabamiah, para que me haga creador con mis palabras y que lo que diga construya en lugar de derribar. Para enseñar a otros el poder del verbo bien usado, en el nombre de Dios, que así sea."
  },
  {
    n: 71,
    nombre: "Haiayel",
    hebreo: "הַיָיאֵל",
    significado: "Dios señor del universo",
    coro: "Ángeles",
    regente: "Gabriel",
    elemento: "Agua",
    fecha_inicio: "03-11",
    fecha_fin: "03-15",
    don: "Tienes el don de la Victoria Interior. El poder de vencer al adversario que llevas dentro y de alcanzar la paz tras la batalla justa. Puedes usar tu don para ayudar a los demás a fortalecer su voluntad y a resistir cuando el espíritu flaquea.",
    virtudes: "Coraje en la batalla justa, capacidad de resistir, victoria moral, fuerza interior.",
    sombras: "Guerra inútil, conflictos sin propósito, brutalidad, derrota humillante.",
    salmo: "Salmo 109:30 — «Yo alabaré al Señor en gran manera con mi boca, y en medio de muchos le alabaré.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Haiayel, para que me dé la victoria sobre lo que en mí pelea contra mí, porque esa es la única guerra que vale. Para acompañar a quienes libran sus propias batallas internas, en el nombre de Dios, que así sea."
  },
  {
    n: 72,
    nombre: "Mumiah",
    hebreo: "מוּמיָה",
    significado: "Dios fin de todas las cosas",
    coro: "Ángeles",
    regente: "Gabriel",
    elemento: "Agua",
    fecha_inicio: "03-16",
    fecha_fin: "03-20",
    don: "Tienes el don de los Cierres con Dignidad. El poder de terminar ciclos cuando deben terminar para que pueda nacer lo nuevo. Puedes usar tu don para ayudar a los demás a no dejar las cosas a medias y a cerrar etapas con sabiduría y longevidad.",
    virtudes: "Capacidad de terminar ciclos, sabiduría médica, longevidad, dominio de la física y química, cierre con dignidad.",
    sombras: "Desesperación, dejar todo a medias, miedo a terminar, suicidio simbólico de proyectos.",
    salmo: "Salmo 116:7 — «Vuelve, oh alma mía, a tu reposo, porque el Señor te ha hecho bien.»",
    oracion: "Padre Dios, creador del universo y de todo lo visible e invisible, te pido que envíes al ángel Mumiah, para que me ayude a cerrar lo que debe terminar, porque solo así puede nacer lo nuevo. Para acompañar a quienes temen los finales y necesitan cerrar etapas con dignidad, en el nombre de Dios, que así sea."
  }
];

// ============================================================
// ÁNGEL CABALÍSTICO — LÓGICA
// Sistema de los 72 ángeles del Shem HaMephorash
// ============================================================

var angelState = { day: 0, month: 0, year: 0, name: '', lastResult: null };

function openAngelTool() {
  var modal = document.getElementById('angelModal');
  if (!modal) return;
  // Guardar scroll antes de abrir
  window.__scrollY_angel = window.scrollY || window.pageYOffset || 0;
  modal.classList.add('is-open');
  // Bloqueo robusto: clase en html y body
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
  document.body.style.top = '-' + window.__scrollY_angel + 'px';
  angelReset();
  // Resetear scroll interno del modal al inicio
  modal.scrollTop = 0;
  var inner = modal.querySelector('.oracle-modal-inner');
  if (inner) inner.scrollTop = 0;
}

function angelClose() {
  var modal = document.getElementById('angelModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  var y = window.__scrollY_angel || 0;
  window.scrollTo(0, y);
}

function angelReset() {
  angelState = { day: 0, month: 0, year: 0, name: '', lastResult: null };
  document.getElementById('angelDay').value = '';
  document.getElementById('angelMonth').value = '';
  document.getElementById('angelYear').value = '';
  document.getElementById('angelName').value = '';
  angelGoto(1);
}

function angelGoto(step) {
  var panes = document.querySelectorAll('#angelModal .oracle-pane');
  panes.forEach(function(p) { p.classList.remove('oracle-pane-active'); });

  var target;
  if (step === 'loading') target = document.getElementById('apaneLoading');
  else if (step === 'result') target = document.getElementById('apaneResult');
  else target = document.getElementById('apane' + step);

  if (target) target.classList.add('oracle-pane-active');

  var dots = document.querySelectorAll('#angelModal .oracle-dot');
  dots.forEach(function(d) {
    d.classList.remove('oracle-dot-active');
    var dotStep = parseInt(d.getAttribute('data-step'), 10);
    if (typeof step === 'number' && dotStep === step) {
      d.classList.add('oracle-dot-active');
    }
  });

  var inner = document.querySelector('#angelModal .oracle-modal-inner');
  if (inner) inner.scrollTop = 0;
}

function angelNext(step) {
  if (step === 1) {
    var day = parseInt(document.getElementById('angelDay').value, 10);
    var month = parseInt(document.getElementById('angelMonth').value, 10);
    var year = parseInt(document.getElementById('angelYear').value, 10);

    if (!day || day < 1 || day > 31 || !month || !year || year < 1900 || year > 2025) {
      showToast('Completa una fecha válida');
      return;
    }
    // Validación de día válido en el mes
    var diasMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var esBisiesto = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (month === 2 && esBisiesto) diasMes[1] = 29;
    if (day > diasMes[month - 1]) {
      showToast('Esa fecha no existe. Revisa el día.');
      return;
    }
    angelState.day = day;
    angelState.month = month;
    angelState.year = year;
    angelGoto(2);
  } else if (step === 2) {
    var name = document.getElementById('angelName').value.trim();
    if (!name || name.length < 2) {
      showToast('Escribe tu nombre');
      return;
    }
    // Capitalizar primera letra
    angelState.name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    angelGoto('loading');

    var mensajes = [
      'Consultando el Shem HaMephorash...',
      'Buscando tu nombre entre los 72 ángeles...',
      'El guardián se acerca...',
      'La revelación está cerca...'
    ];
    var idx = 0;
    var loadingEl = document.getElementById('angelLoadingText');
    if (loadingEl) loadingEl.textContent = mensajes[0];
    var interval = setInterval(function() {
      idx = (idx + 1) % mensajes.length;
      if (loadingEl) loadingEl.textContent = mensajes[idx];
    }, 850);

    setTimeout(function() {
      clearInterval(interval);
      angelReveal();
    }, 3400);
  }
}

// === ALGORITMO: encontrar ángel según fecha ===
function angelCalcular(day, month) {
  var mmdd = String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  for (var i = 0; i < ANGELES_72.length; i++) {
    var a = ANGELES_72[i];
    if (mmdd >= a.fecha_inicio && mmdd <= a.fecha_fin) return a;
  }
  return null;
}

function angelFormatearFechas(angel) {
  var meses = ['', 'enero','febrero','marzo','abril','mayo','junio',
               'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var ini = angel.fecha_inicio.split('-');
  var fin = angel.fecha_fin.split('-');
  var diaIni = parseInt(ini[1], 10);
  var mesIni = parseInt(ini[0], 10);
  var diaFin = parseInt(fin[1], 10);
  var mesFin = parseInt(fin[0], 10);

  if (mesIni === mesFin) {
    return diaIni + ' al ' + diaFin + ' de ' + meses[mesIni];
  }
  return diaIni + ' de ' + meses[mesIni] + ' al ' + diaFin + ' de ' + meses[mesFin];
}

function angelReveal() {
  var s = angelState;
  var angel = angelCalcular(s.day, s.month);
  if (!angel) {
    showToast('Error al calcular el ángel');
    angelGoto(1);
    return;
  }

  // Personalizar oración con el nombre del usuario
  // Patrón nuevo: "...te pido que..." → "...yo, [Nombre], te pido que..."
  var oracionPersonalizada = angel.oracion.replace(
    'te pido que envíes al ángel',
    'yo, ' + s.name + ', te pido que envíes al ángel'
  );

  // Llenar el resultado
  document.getElementById('angelNum').textContent = 'ÁNGEL · ' + String(angel.n).padStart(2, '0') + ' DE 72';
  document.getElementById('angelHebreo').textContent = angel.hebreo;
  document.getElementById('angelNombre').textContent = angel.nombre.toUpperCase();
  document.getElementById('angelSignificado').textContent = '«' + angel.significado + '»';
  document.getElementById('angelCoro').textContent = 'CORO DE ' + angel.coro.toUpperCase();
  document.getElementById('angelDon').textContent = angel.don;
  document.getElementById('angelVirtudes').textContent = angel.virtudes;
  document.getElementById('angelSombras').textContent = angel.sombras;
  document.getElementById('angelSalmo').textContent = angel.salmo;
  document.getElementById('angelOracion').textContent = oracionPersonalizada;

  var fechas = angelFormatearFechas(angel);
  var meta = s.name.toUpperCase() + ' · ' + fechas.toUpperCase() + ' · ELEMENTO ' + angel.elemento.toUpperCase();
  document.getElementById('angelMeta').textContent = meta;

  angelState.lastResult = {
    n: angel.n,
    nombre: angel.nombre,
    significado: angel.significado
  };

  angelGoto('result');
}

function angelShare() {
  if (!angelState.lastResult) return;
  var r = angelState.lastResult;
  var text = 'Mi ángel cabalístico de nacimiento es ' + r.nombre + ' (#' + r.n + ' de 72): ' + r.significado + '.\n\nDescubre el tuyo en el oráculo de El DoQmentalista:';
  var url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: 'Mi ángel cabalístico', text: text, url: url }).catch(function(){});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text + '\n' + url).then(function() {
      showToast('Copiado al portapapeles', 'success');
    });
  } else {
    showToast('Copia este texto: ' + text);
  }
}

// ESC cierra modal Ángel también
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var am = document.getElementById('angelModal');
    if (am && am.classList.contains('is-open')) angelClose();
  }
});

