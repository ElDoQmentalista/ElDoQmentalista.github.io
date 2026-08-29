// Movimiento: lo minimo indispensable en JS. Todo lo que puede hacer el CSS,
// lo hace el CSS. Aqui solo queda lo que necesita saber donde esta el cursor,
// hacia donde vas o que tarjeta pulsaste.
(function () {
  var raiz = document.documentElement;
  var quietud = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (quietud.matches) return;

  var raton = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // --- Que motor de aparicion usamos ---
  var soportaTimeline = false;
  try { soportaTimeline = CSS.supports('animation-timeline', 'view()'); } catch (e) {}

  if (soportaTimeline) {
    raiz.classList.add('tl');
  } else if ('IntersectionObserver' in window) {
    raiz.classList.add('io');
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        observador.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    var candidatos = document.querySelectorAll('.aparece, .grid > *');
    // Lo que ya esta en pantalla al cargar se muestra sin animar: nadie
    // deberia ver aparecer lo que ya estaba mirando.
    Array.prototype.forEach.call(candidatos, function (el, i) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add('visible');
      else observador.observe(el);
      el.style.transitionDelay = (Math.min(i % 12, 8) * 35) + 'ms';
    });
  }

  // --- Barra de progreso (solo donde se lee algo largo) ---
  if (document.querySelector('.article') && soportaTimeline) {
    var barra = document.createElement('div');
    barra.className = 'progreso';
    document.body.appendChild(barra);
  }

  // --- Cabecera que se aparta al bajar ---
  var ultimo = window.scrollY, acumulado = 0, pendiente = false;
  window.addEventListener('scroll', function () {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      var delta = y - ultimo;
      // Un umbral evita que la cabecera parpadee con el rebote del movil
      acumulado = (delta > 0) === (acumulado > 0) ? acumulado + delta : delta;
      if (acumulado > 90 && y > 320) raiz.classList.add('bajando');
      else if (acumulado < -60 || y < 200) raiz.classList.remove('bajando');
      ultimo = y;
      pendiente = false;
    });
  }, { passive: true });

  // --- Transicion de la miniatura al reproductor ---
  // El nombre de la transicion tiene que ser unico en la pagina, asi que se
  // lo ponemos solo a la tarjeta pulsada, justo antes de navegar.
  if (document.startViewTransition) {
    document.addEventListener('click', function (e) {
      var enlace = e.target.closest && e.target.closest('.card-link, .featured-card');
      if (!enlace) return;
      var miniatura = enlace.querySelector('.thumb');
      if (miniatura) miniatura.style.viewTransitionName = 'pieza';
    }, true);
    // Al volver atras hay que soltarlo, o la siguiente navegacion choca
    window.addEventListener('pageshow', function () {
      var marcada = document.querySelector('[style*="view-transition-name"]');
      if (marcada) marcada.style.viewTransitionName = '';
    });
  }

  if (!raton) return;

  // --- Inclinacion de las tarjetas y resplandor bajo el cursor ---
  var tarjetas = document.querySelectorAll('.card, .witch-tool-card, .featured-card');
  Array.prototype.forEach.call(tarjetas, function (c) {
    c.addEventListener('pointermove', function (ev) {
      var r = c.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width;
      var y = (ev.clientY - r.top) / r.height;
      c.style.setProperty('--tx', (x - 0.5).toFixed(3));
      c.style.setProperty('--ty', (y - 0.5).toFixed(3));
      c.style.setProperty('--lift', '-6px');
      var t = c.querySelector('.thumb');
      if (t) {
        t.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        t.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      }
    });
    c.addEventListener('pointerleave', function () {
      c.style.setProperty('--tx', 0);
      c.style.setProperty('--ty', 0);
      c.style.setProperty('--lift', '0px');
    });
  });

  // --- Halo del cursor ---
  var halo = document.createElement('div');
  halo.className = 'halo';
  halo.setAttribute('aria-hidden', 'true');
  document.body.appendChild(halo);

  var hx = 0, hy = 0, dx = 0, dy = 0, animando = false;
  function seguir() {
    // Interpolacion: el halo llega con retraso, que es lo que lo hace
    // sentir como una linterna y no como un puntero pegado.
    dx += (hx - dx) * 0.12;
    dy += (hy - dy) * 0.12;
    halo.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
    if (Math.abs(hx - dx) > 0.5 || Math.abs(hy - dy) > 0.5) requestAnimationFrame(seguir);
    else animando = false;
  }
  window.addEventListener('pointermove', function (e) {
    hx = e.clientX; hy = e.clientY;
    halo.classList.add('encendido');
    if (!animando) { animando = true; requestAnimationFrame(seguir); }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { halo.classList.remove('encendido'); });
})();

// --- Menu en movil ---------------------------------------------------
(function () {
  var boton = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (!boton || !menu) return;
  var raiz = document.documentElement;

  function cerrar() {
    raiz.classList.remove('abierto');
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-label', 'Abrir menu');
  }
  function alternar() {
    var abierto = raiz.classList.toggle('abierto');
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    boton.setAttribute('aria-label', abierto ? 'Cerrar menu' : 'Abrir menu');
    if (abierto) {
      var primero = menu.querySelector('a');
      if (primero) setTimeout(function () { primero.focus(); }, 120);
    }
  }

  boton.addEventListener('click', alternar);
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) cerrar(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && raiz.classList.contains('abierto')) { cerrar(); boton.focus(); }
  });
  // Si se gira el movil o se pasa a escritorio, el panel sobra
  window.matchMedia('(min-width: 821px)').addEventListener('change', cerrar);
})();
