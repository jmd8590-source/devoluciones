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
    btn.addEventListener('click', () => {
      updateAccepted = true;
      if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
      else window.location.reload();
    });
    bar.append(msg, btn);
    document.body.appendChild(bar);
  }

  let updateAccepted = false;
  let hadController = false;

  async function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    // Solo en HTTPS (o localhost)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    try {
      hadController = !!navigator.serviceWorker.controller;
      const reg = await navigator.serviceWorker.register('sw.js');
      // Comprobar si hay versión nueva cada vez que se vuelve a la app
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
      let reloading = false;
      // Cuando una versión nueva toma el control:
      //  - primera visita (no había service worker): no se recarga nada;
      //  - actualización: se recarga sola, salvo que el usuario esté escribiendo
      //    o tenga una ventana abierta; entonces se le ofrece «Actualizar».
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        if (!updateAccepted) {
          if (!hadController) return;
          const busy = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
          const modalOpen = !!document.querySelector('.modal-overlay:not([hidden]), .tour-pop');
          if (busy || modalOpen) { showUpdateBar(null); return; }
        }
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

