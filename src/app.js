// Reproductor ligero + buscador sobre el indice completo del archivo.
(function () {
  // --- Reproductor: el iframe de YouTube solo se carga al hacer clic ---
  var player = document.querySelector('.player');
  if (player) {
    player.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + player.dataset.id + '?autoplay=1&rel=0&modestbranding=1';
      f.title = player.dataset.title || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      player.innerHTML = '';
      player.appendChild(f);
    });
  }

  // --- Buscador (solo en /buscar/) ---
  var q = document.getElementById('q');
  var caja = document.getElementById('resultados');
  var estado = document.getElementById('estado');
  if (!q || !caja) return;

  var indice = null;
  var MAX = 60;

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]', 'g'), '');
  }

  function dur(s) {
    if (!s) return '';
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return h ? h + ':' + p(m) + ':' + p(x) : m + ':' + p(x);
  }

  function fecha(d) {
    if (!d) return '';
    try {
      return new Date(d + 'T12:00:00Z').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return d; }
  }

  function escapar(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function pintar(lista, total) {
    caja.innerHTML = lista.map(function (v) {
      return '<article class="card"><a class="card-link" href="/v/' + v.s + '/">' +
        '<span class="thumb"><img src="https://i.ytimg.com/vi/' + v.i + '/hqdefault.jpg" alt="Miniatura: ' + escapar(v.t) + '" width="480" height="270" loading="lazy" decoding="async">' +
        '<span class="play" aria-hidden="true"></span>' + (v.u ? '<span class="dur">' + dur(v.u) + '</span>' : '') + '</span>' +
        '<h3 class="card-title">' + escapar(v.t) + '</h3></a>' +
        '<p class="card-meta">' + fecha(v.d) + '</p></article>';
    }).join('');
    estado.textContent = total === 0
      ? 'No encontre ningun video con esas palabras. Prueba con menos palabras o con un sinonimo.'
      : total + (total === 1 ? ' video encontrado' : ' videos encontrados') + (total > MAX ? ' — mostrando los ' + MAX + ' mas recientes' : '');
  }

  function buscar() {
    var texto = norm(q.value.trim());
    if (!indice) return;
    if (!texto) {
      caja.innerHTML = '';
      estado.textContent = 'Escribe algo para buscar entre ' + indice.length + ' videos.';
      return;
    }
    var palabras = texto.split(/\s+/).filter(Boolean);
    var hits = indice.filter(function (v) {
      var t = v._n || (v._n = norm(v.t));
      for (var i = 0; i < palabras.length; i++) if (t.indexOf(palabras[i]) === -1) return false;
      return true;
    });
    pintar(hits.slice(0, MAX), hits.length);
    try {
      var u = new URL(location.href);
      u.searchParams.set('q', q.value.trim());
      history.replaceState(null, '', u);
    } catch (e) {}
  }

  var t = null;
  q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(buscar, 120); });

  fetch('/assets/search.json')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      indice = d;
      var pre = '';
      try { pre = new URL(location.href).searchParams.get('q') || ''; } catch (e) {}
      if (pre) { q.value = pre; buscar(); }
      else estado.textContent = 'Escribe algo para buscar entre ' + indice.length + ' videos.';
    })
    .catch(function () { estado.textContent = 'No pude cargar el indice de busqueda. Recarga la pagina.'; });
})();
