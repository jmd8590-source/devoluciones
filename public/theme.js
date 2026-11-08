/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Tema claro / oscuro
   Se carga en <head> antes que los estilos para evitar el parpadeo.
   Preferencia guardada en localStorage ('gp_theme'); si no hay,
   se respeta la del sistema (prefers-color-scheme).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var KEY = 'gp_theme';
  var root = document.documentElement;

  function systemTheme() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch (e) { return 'dark'; }
  }
  function saved() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; }
  }
  function current() { return root.getAttribute('data-theme') || 'dark'; }

  function labels(theme) {
    var en = false;
    try { en = (localStorage.getItem('gp_lang') || 'es') === 'en'; } catch (e) {}
    var toLight = en ? 'Switch to light mode' : 'Cambiar a modo claro';
    var toDark  = en ? 'Switch to dark mode'  : 'Cambiar a modo oscuro';
    return theme === 'dark' ? toLight : toDark;
  }

  function paintButtons() {
    var theme = current();
    var buttons = document.querySelectorAll('.js-theme-toggle');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      b.setAttribute('aria-label', labels(theme));
      b.setAttribute('title', labels(theme));
      b.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      var ico = b.querySelector('.js-theme-icon');
      if (ico && typeof window.iconSvg === 'function') {
        // Icono estático (no procede del usuario)
        ico.innerHTML = window.iconSvg(theme === 'dark' ? 'sun' : 'moon', parseInt(ico.dataset.iconSize || '16', 10));
        ico.dataset.iconDone = '1';
      }
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f4ef' : '#0b1120');
  }

  function apply(theme, persist) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    if (persist) { try { localStorage.setItem(KEY, theme); } catch (e) {} }
    paintButtons();
    try { document.dispatchEvent(new CustomEvent('gp:themechange', { detail: { theme: theme } })); } catch (e) {}
  }

  apply(saved() || systemTheme(), false);

  // Si el usuario no ha elegido, seguir los cambios del sistema
  try {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
      if (!saved()) apply(systemTheme(), false);
    });
  } catch (e) {}

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.js-theme-toggle') : null;
    if (!btn) return;
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (err) {}
    if (!reduce) {
      root.classList.add('theme-anim');
      setTimeout(function () { root.classList.remove('theme-anim'); }, 320);
    }
    apply(current() === 'dark' ? 'light' : 'dark', true);
  });

  document.addEventListener('DOMContentLoaded', paintButtons);
  window.addEventListener('load', paintButtons);
  // Al cambiar el idioma, actualizar las etiquetas accesibles
  document.addEventListener('gp:langchange', paintButtons);

  window.GPTheme = { apply: apply, current: current, refresh: paintButtons };
})();
