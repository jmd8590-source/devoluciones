/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — PWA: registro del service worker, botón de
   instalación y guía para iPhone.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

(function () {
  function lang() { return localStorage.getItem('gp_lang') || 'es'; }
  const TX = {
    es: { update: 'Hay una nueva versión disponible.', reload: 'Actualizar', installed: 'App instalada correctamente' },
    en: { update: 'A new version is available.', reload: 'Update', installed: 'App installed successfully' },
  };
  const tx = () => TX[lang()] || TX.es;

  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIos = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  /* ── Service worker ─────────────────────────────────────────── */
  function showUpdateBar(worker) {
    if (document.getElementById('pwa-update-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'pwa-update-bar';
    bar.className = 'pwa-update-bar';
    bar.setAttribute('role', 'status');
    const msg = document.createElement('span');
    msg.textContent = tx().update;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = tx().reload;
    btn.addEventListener('click', () => { updateAccepted = true; worker.postMessage({ type: 'SKIP_WAITING' }); });
    bar.append(msg, btn);
    document.body.appendChild(bar);
  }

  let updateAccepted = false;

  async function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    // Solo en HTTPS (o localhost)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBar(nw);
        });
      });
      let reloading = false;
      // Solo se recarga cuando el usuario pulsa «Actualizar». Antes, la primera
      // visita recargaba la página al activarse el service worker y borraba
      // lo que el usuario estuviera escribiendo (p. ej. el formulario de registro).
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading || !updateAccepted) return;
        reloading = true;
        window.location.reload();
      });
      // Abrir la vista Alertas al pulsar una notificación con la app ya abierta
      navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'OPEN_VIEW' && typeof window.gpOpenView === 'function') {
          window.gpOpenView(e.data.view);
        }
      });
    } catch (err) {
      console.warn('Service worker no disponible:', err);
    }
  }

  /* ── Instalación ────────────────────────────────────────────── */
  function refreshInstallUI() {
    document.querySelectorAll('[data-install-btn]').forEach((btn) => {
      btn.hidden = !(deferredPrompt && !isStandalone());
    });
    document.querySelectorAll('[data-install-ios]').forEach((el) => {
      el.hidden = !(isIos() && !isStandalone());
    });
    document.querySelectorAll('[data-install-done]').forEach((el) => {
      el.hidden = !isStandalone();
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    refreshInstallUI();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    refreshInstallUI();
    if (typeof window.showToast === 'function') window.showToast(tx().installed, 'ok');
  });

  async function promptInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch { /* ignorar */ }
    deferredPrompt = null;
    refreshInstallUI();
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('[data-install-btn]');
    if (btn) promptInstall();
  });

  window.GPPwa = { isStandalone, isIos, refreshInstallUI };

  registerSW();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshInstallUI);
  } else {
    refreshInstallUI();
  }
})();

