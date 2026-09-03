/* =============================================================================
   MARCADORES DE POSICIÓN (PLACEHOLDERS)
   -----------------------------------------------------------------------------
   Si una foto no existe dentro de /assets/images, dibuja en su hueco un
   marcador dorado con el NOMBRE EXACTO del archivo que falta, para que el
   diseño no se rompa y sepas qué foto tienes que poner.

   Se carga SIN "defer" desde el <head>, a propósito: tiene que registrar el
   escuchador de errores antes de que el navegador empiece a pedir las imágenes.
   Va en un archivo aparte (y no dentro del HTML) para que la política de
   seguridad de _headers pueda ser estricta: script-src 'self', sin permitir
   scripts en línea.
   ========================================================================== */

(function () {
  'use strict';

  // Marca que hay JavaScript: sin él, el CSS muestra todo sin animaciones de entrada.
  document.documentElement.classList.add('js');

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function marcador(archivo, etiqueta) {
    var svg =
      // width/height explícitos: sin ellos el marcador no tiene tamaño propio
      // y sale diminuto al abrirlo en el visor a pantalla completa.
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="800" height="600" fill="#EDE6D6"/>' +
      '<rect x="20" y="20" width="760" height="560" rx="10" fill="none" stroke="#D4AF37" stroke-width="4" stroke-dasharray="16 12"/>' +
      '<g transform="translate(400,238)" opacity="0.3">' +
      '<rect x="-96" y="-68" width="192" height="136" rx="14" fill="none" stroke="#1A2B3C" stroke-width="8"/>' +
      '<circle cx="-42" cy="-24" r="18" fill="#1A2B3C"/>' +
      '<path d="M-88 50 L-16 -14 L30 32 L58 8 L90 50 Z" fill="#1A2B3C"/>' +
      '</g>' +
      '<text x="400" y="392" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#1A2B3C" opacity="0.78">' + esc(etiqueta) + '</text>' +
      '<text x="400" y="444" text-anchor="middle" font-family="monospace" font-size="21" fill="#1A2B3C" opacity="0.5">' + esc(archivo) + '</text>' +
      '<text x="400" y="492" text-anchor="middle" font-family="monospace" font-size="18" fill="#8A7A4E">coloca esta foto en /assets/images/</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // Fase de captura: los errores de carga de <img> no burbujean.
  window.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'IMG' || el.dataset.phDone) return;
    el.dataset.phDone = '1';
    var archivo = (el.getAttribute('src') || '').split('/').pop();
    el.src = marcador(archivo, el.dataset.ph || el.alt || 'FOTO');
    el.classList.add('es-marcador');
  }, true);
})();
