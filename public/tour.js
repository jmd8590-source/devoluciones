/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Tour guiado
   - Botón «Guía» arriba a la derecha (#btn-tour) y arranque automático
     la primera vez que se entra en la app.
   - Accesible: diálogo con foco atrapado, Esc para salir, flechas para
     avanzar/retroceder, textos en ES/EN.
   - Sin dependencias y sin innerHTML con datos del usuario.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DONE_KEY = 'gp_tour_done_v1';

  var STEPS = [
    { target: null,
      es: ['Bienvenido a GarantíasPro', 'En un minuto te enseñamos dónde está cada cosa. Puedes salir cuando quieras con Esc.'],
      en: ['Welcome to GarantíasPro', "In one minute we'll show you where everything is. Press Esc to leave at any time."] },
    { target: ['#btn-add-main', '#btn-fab'],
      es: ['Añade una compra', 'Haz una foto al ticket y la app rellena los datos por ti, o escríbelos a mano.'],
      en: ['Add a purchase', 'Take a photo of the receipt and the app fills in the details, or type them yourself.'] },
    { target: ['#stats-grid'],
      es: ['Tu resumen', 'Cuántas compras tienes, cuántas siguen en plazo de devolución, cuántas en garantía y cuáles han caducado.'],
      en: ['Your summary', 'How many purchases you have, how many can still be returned, which are under warranty and which have expired.'] },
    { target: ['#urgent-block'],
      es: ['Lo urgente primero', 'Aquí aparecen las compras cuyo plazo está a punto de terminar.'],
      en: ['Urgent first', 'Purchases whose deadline is about to end appear here.'] },
    { target: ['#nav-products'],
      es: ['Todas tus compras', 'Búscalas, fíltralas por estado y abre cada una para ver el ticket, la garantía o generar una reclamación.'],
      en: ['All your purchases', 'Search, filter by status and open each one to see the receipt, the warranty or create a claim.'] },
    { target: ['#nav-alerts'],
      es: ['Avisos', 'Activa las notificaciones y añade los vencimientos a tu calendario para que no se te pase ninguno.'],
      en: ['Alerts', 'Turn on notifications and add deadlines to your calendar so you never miss one.'] },
    { target: ['#btn-account', '#nav-account'],
      es: ['Tu cuenta', 'Cambia tu contraseña, descarga una copia de tus datos o elimina tu cuenta.'],
      en: ['Your account', 'Change your password, download a copy of your data or delete your account.'] },
    { target: ['#lang-toggle'],
      es: ['Idioma', 'Cambia entre español e inglés al instante.'],
      en: ['Language', 'Switch between Spanish and English instantly.'] },
    { target: ['#theme-toggle'],
      es: ['Modo claro u oscuro', 'Elige el que te resulte más cómodo. Por defecto usamos el de tu dispositivo.'],
      en: ['Light or dark mode', 'Pick whichever is more comfortable. By default we follow your device.'] },
    { target: ['#btn-tour'],
      es: ['¡Listo!', 'Puedes volver a ver esta guía cuando quieras desde este botón.'],
      en: ['All set!', 'You can see this guide again at any time from this button.'] }
  ];

  var UI = {
    es: { next: 'Siguiente', prev: 'Anterior', skip: 'Saltar guía', done: 'Empezar', of: 'de' },
    en: { next: 'Next', prev: 'Back', skip: 'Skip guide', done: 'Get started', of: 'of' }
  };

  function lang() {
    try { return (localStorage.getItem('gp_lang') || 'es') === 'en' ? 'en' : 'es'; } catch (e) { return 'es'; }
  }

  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    var cs = window.getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden]');
  }

  function resolveTarget(step) {
    if (!step.target) return null;
    for (var i = 0; i < step.target.length; i++) {
      var el = document.querySelector(step.target[i]);
      if (visible(el)) return el;
    }
    return undefined; // no visible: se omite el paso
  }

  var state = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function build() {
    var overlay = el('div', 'tour-overlay');
    overlay.setAttribute('aria-hidden', 'true');
    var spot = el('div', 'tour-spot');
    spot.setAttribute('aria-hidden', 'true');

    var pop = el('div', 'tour-pop');
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.setAttribute('aria-labelledby', 'tour-title');
    pop.setAttribute('aria-describedby', 'tour-text');

    var count = el('p', 'tour-count');
    count.setAttribute('aria-live', 'polite');
    var title = el('h2', 'tour-title'); title.id = 'tour-title';
    var text = el('p', 'tour-text'); text.id = 'tour-text';
    var bar = el('div', 'tour-progress'); var fill = el('span'); bar.appendChild(fill);

    var actions = el('div', 'tour-actions');
    var skip = el('button', 'tour-btn tour-skip'); skip.type = 'button';
    var right = el('div', 'tour-actions-right');
    var prev = el('button', 'tour-btn tour-prev'); prev.type = 'button';
    var next = el('button', 'tour-btn tour-next'); next.type = 'button';
    right.appendChild(prev); right.appendChild(next);
    actions.appendChild(skip); actions.appendChild(right);

    pop.appendChild(count); pop.appendChild(title); pop.appendChild(text); pop.appendChild(bar); pop.appendChild(actions);
    document.body.appendChild(overlay);
    document.body.appendChild(spot);
    document.body.appendChild(pop);

    skip.addEventListener('click', function () { stop(true); });
    prev.addEventListener('click', function () { go(state.i - 1, -1); });
    next.addEventListener('click', function () { go(state.i + 1, 1); });
    overlay.addEventListener('click', function () { stop(true); });

    return { overlay: overlay, spot: spot, pop: pop, count: count, title: title, text: text, fill: fill, skip: skip, prev: prev, next: next };
  }

  function position() {
    if (!state) return;
    var n = state.nodes, target = state.target;
    var vw = window.innerWidth, vh = window.innerHeight, pad = 8, gap = 14;
    var pw = Math.min(360, vw - 24);
    n.pop.style.width = pw + 'px';
    var ph = n.pop.offsetHeight;

    if (!target) {
      n.spot.style.display = 'none';
      n.overlay.classList.add('is-dim');
      n.pop.style.left = Math.round((vw - pw) / 2) + 'px';
      n.pop.style.top = Math.round(Math.max(12, (vh - ph) / 2)) + 'px';
      n.pop.removeAttribute('data-side');
      return;
    }
    n.overlay.classList.remove('is-dim');
    var r = target.getBoundingClientRect();
    n.spot.style.display = 'block';
    n.spot.style.left = (r.left - pad) + 'px';
    n.spot.style.top = (r.top - pad) + 'px';
    n.spot.style.width = (r.width + pad * 2) + 'px';
    n.spot.style.height = (r.height + pad * 2) + 'px';

    var below = r.bottom + gap + ph <= vh - 8;
    var top = below ? r.bottom + gap : r.top - gap - ph;
    if (top < 8) top = Math.max(8, Math.min(vh - ph - 8, r.bottom + gap));
    var left = r.left + r.width / 2 - pw / 2;
    left = Math.max(12, Math.min(vw - pw - 12, left));
    n.pop.style.left = Math.round(left) + 'px';
    n.pop.style.top = Math.round(top) + 'px';
    n.pop.setAttribute('data-side', below ? 'bottom' : 'top');
  }

  function render() {
    var L = lang(), ui = UI[L], step = STEPS[state.i], n = state.nodes;
    var total = state.order.length, pos = state.order.indexOf(state.i) + 1;
    n.count.textContent = pos + ' ' + ui.of + ' ' + total;
    n.title.textContent = step[L][0];
    n.text.textContent = step[L][1];
    n.fill.style.width = Math.round(pos / total * 100) + '%';
    n.skip.textContent = ui.skip;
    n.prev.textContent = ui.prev;
    n.prev.hidden = pos === 1;
    n.next.textContent = pos === total ? ui.done : ui.next;
    n.skip.hidden = pos === total;
    position();
    n.next.focus({ preventScroll: true });
  }

  function go(i, dir) {
    dir = dir || 1;
    while (i >= 0 && i < STEPS.length) {
      var t = resolveTarget(STEPS[i]);
      if (t !== undefined) {
        state.i = i;
        state.target = t;
        if (t) {
          var r = t.getBoundingClientRect();
          if (r.top < 70 || r.bottom > window.innerHeight - 80) {
            t.scrollIntoView({ block: 'center', behavior: 'auto' });
          }
        }
        render();
        return;
      }
      i += dir;
    }
    stop(true);
  }

  function onKey(e) {
    if (!state) return;
    if (e.key === 'Escape') { e.preventDefault(); stop(true); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(state.i + 1, 1); return; }
    if (e.key === 'ArrowLeft' && state.order.indexOf(state.i) > 0) { e.preventDefault(); go(state.i - 1, -1); return; }
    if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(state.nodes.pop.querySelectorAll('button'), function (b) { return !b.hidden; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function onMove() { position(); }

  function start() {
    if (state) return;
    var order = [];
    for (var i = 0; i < STEPS.length; i++) if (resolveTarget(STEPS[i]) !== undefined) order.push(i);
    if (!order.length) return;
    state = { i: order[0], order: order, target: null, opener: document.activeElement, nodes: build() };
    document.documentElement.classList.add('tour-open');
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    go(order[0], 1);
  }

  function stop(markDone) {
    if (!state) return;
    var n = state.nodes, opener = state.opener;
    [n.overlay, n.spot, n.pop].forEach(function (x) { if (x && x.parentNode) x.parentNode.removeChild(x); });
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onMove);
    window.removeEventListener('scroll', onMove, true);
    document.documentElement.classList.remove('tour-open');
    state = null;
    if (markDone) { try { localStorage.setItem(DONE_KEY, '1'); } catch (e) {} }
    var btn = document.getElementById('btn-tour');
    if (btn) btn.focus({ preventScroll: true }); else if (opener && opener.focus) opener.focus();
  }

  function anyModalOpen() {
    var list = document.querySelectorAll('[aria-modal="true"]');
    for (var i = 0; i < list.length; i++) if (visible(list[i])) return true;
    return visible(document.getElementById('gp-cookie-banner'));
  }

  function init() {
    var btn = document.getElementById('btn-tour');
    if (btn) btn.addEventListener('click', function () { start(); });
    document.addEventListener('gp:langchange', function () { if (state) render(); });

    var done = false;
    try { done = localStorage.getItem(DONE_KEY) === '1'; } catch (e) {}
    if (done) return;
    // Arranque automático la primera vez, cuando no haya otro diálogo abierto
    var tries = 0;
    (function wait() {
      tries++;
      if (anyModalOpen()) { if (tries < 40) setTimeout(wait, 1500); return; }
      start();
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 1200); });
  else setTimeout(init, 1200);

  window.GPTour = { start: start, stop: stop };
})();
