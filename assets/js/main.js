/* =============================================================================
   Web de cumpleaños de Yuri  ·  Interacciones
   -----------------------------------------------------------------------------
   1. Año automático en el pie
   2. Aparición progresiva al hacer scroll (incluido el árbol animado)
   3. Navegación: enlace activo + barra de progreso
   4. Visor de fotos a pantalla completa
   ========================================================================== */

(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };


  /* ── 1. Año automático ─────────────────────────────────────────────────── */
  var anio = $('#anioActual');
  if (anio) anio.textContent = new Date().getFullYear();


  /* ── 2. Aparición progresiva al hacer scroll ───────────────────────────── */

  // Índice para escalonar la entrada de las polaroids del mural.
  // Se limita a 24 para que las últimas fotos no tarden una eternidad en aparecer.
  $$('.collage .reveal').forEach(function (el, i) { el.style.setProperty('--r', Math.min(i, 24)); });

  var reveals = $$('.reveal');
  var arbol   = $('#arbol');

  if (!('IntersectionObserver' in window)) {
    // Navegador antiguo: se muestra todo directamente.
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    if (arbol) arbol.classList.add('is-visible');
  } else {
    var observador = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('is-visible');
        obs.unobserve(entrada.target);       // se anima una sola vez
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    reveals.forEach(function (el) { observador.observe(el); });

    // El árbol arranca su dibujado cuando ya se ve una quinta parte.
    if (arbol) {
      new IntersectionObserver(function (entradas, obs) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target);
        });
      }, { threshold: 0.2 }).observe(arbol);
    }
  }


  /* ── 3. Navegación ─────────────────────────────────────────────────────── */
  var enlaces  = $$('.nav__link');
  var progreso = $('#navProgreso');
  var secciones = enlaces
    .map(function (a) { return $(a.getAttribute('href')); })
    .filter(Boolean);

  function actualizarNav() {
    // Barra de progreso de lectura
    if (progreso) {
      var alcance = document.documentElement.scrollHeight - window.innerHeight;
      var pct = alcance > 0 ? (window.scrollY / alcance) * 100 : 0;
      progreso.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    // Enlace activo: la última sección cuyo inicio ya pasó la línea de referencia
    if (!secciones.length) return;
    var referencia = window.scrollY + window.innerHeight * 0.35;
    var activa = secciones[0];
    secciones.forEach(function (sec) {
      if (sec.offsetTop <= referencia) activa = sec;
    });
    enlaces.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + activa.id);
    });
  }

  var pendiente = false;
  window.addEventListener('scroll', function () {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(function () { actualizarNav(); pendiente = false; });
  }, { passive: true });
  window.addEventListener('resize', actualizarNav, { passive: true });
  actualizarNav();


  /* ── 4. Visor de fotos a pantalla completa ─────────────────────────────── */
  var visor    = $('#visor');
  var visorImg = $('#visorImg');
  var visorPie = $('#visorPie');
  var ultimoFoco = null;

  function abrirVisor(img, pieTexto) {
    if (!visor) return;
    ultimoFoco = document.activeElement;
    // Si la miniatura ya se sustituyó por un marcador, se reutiliza tal cual.
    // Se limpia la marca para que el marcador pueda volver a dibujarse aquí.
    delete visorImg.dataset.phDone;
    visorImg.src = img.currentSrc || img.src;
    visorImg.alt = img.alt || '';
    visorPie.textContent = pieTexto || '';
    visorPie.hidden = !pieTexto;
    visor.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.visor__cerrar', visor).focus();
  }

  function cerrarVisor() {
    if (!visor || visor.hidden) return;
    visor.hidden = true;
    visorImg.src = '';
    document.body.style.overflow = '';
    if (ultimoFoco) ultimoFoco.focus();
  }

  // Fotos ampliables: mural, árbol y foto principal
  $$('.polaroid, .nodo__aro, .hero__foto').forEach(function (caja) {
    var img = $('img', caja);
    if (!img) return;

    var contenedor = caja.closest('.nodo') || caja;
    var pieEl = $('figcaption', caja) || $('.nodo__nombre', contenedor);
    var pieTexto = pieEl ? pieEl.textContent.trim() : (img.alt || '');

    caja.style.cursor = 'zoom-in';
    caja.setAttribute('tabindex', '0');
    caja.setAttribute('role', 'button');
    caja.setAttribute('aria-label', 'Ampliar: ' + (img.alt || 'foto'));

    caja.addEventListener('click', function () { abrirVisor(img, pieTexto); });
    caja.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirVisor(img, pieTexto); }
    });
  });

  if (visor) {
    visor.addEventListener('click', function (e) {
      if (e.target === visor || e.target.closest('.visor__cerrar')) cerrarVisor();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cerrarVisor();
    });
  }

})();
