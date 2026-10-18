/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Session helper
   Valida la sesión contra Supabase, rellena el saludo del usuario,
   muestra el aviso de modo demo y gestiona el cierre de sesión.
   Expone window.GPSession.resolve() para que app.js espere.
   ═══════════════════════════════════════════════════════════════ */

'use strict';

(function () {
  function lang() { return localStorage.getItem('gp_lang') || 'es'; }

  function goToAuth() { window.location.replace('auth.html'); }

  let resolved = null;

  async function resolve() {
    if (resolved) return resolved;

    // ── Modo demo ──────────────────────────────────────────────
    const demo = getDemoSession();
    if (demo) {
      resolved = { isDemo: true, user: null, name: demo.name || '', email: '' };
      return resolved;
    }

    // ── Sesión real: validación en servidor ────────────────────
    try {
      const { data, error } = await sb.auth.getUser();
      if (error || !data || !data.user) {
        await sb.auth.signOut({ scope: 'local' }).catch(() => {});
        goToAuth();
        return new Promise(() => {}); // detiene la carga mientras redirige
      }
      const user = data.user;
      const name = (user.user_metadata && user.user_metadata.name) || '';
      resolved = { isDemo: false, user, name, email: user.email || '' };

      // Si cierra sesión en otra pestaña, salir también aquí
      sb.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') goToAuth();
      });
      return resolved;
    } catch {
      goToAuth();
      return new Promise(() => {});
    }
  }

  // ── UI ──────────────────────────────────────────────────────
  function renderUser(info) {
    const nameEl   = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');
    const display  = info.name || info.email || '';
    if (nameEl) nameEl.textContent = display.split(' ')[0];
    if (avatarEl) avatarEl.textContent = (display[0] || '?').toUpperCase();
    const greeting = document.getElementById('user-greeting');
    if (greeting && info.email) greeting.title = info.email;
  }

  function demoTexts() {
    return lang() === 'en'
      ? { text: 'Demo mode — data is deleted when you close the tab.', link: 'Create a free account' }
      : { text: 'Modo demo — los datos se borran al cerrar la pestaña.', link: 'Crear cuenta gratis' };
  }

  function renderDemoBanner() {
    const main = document.querySelector('.app-main');
    if (!main || document.getElementById('demo-banner')) return;
    const tx = demoTexts();

    const banner = document.createElement('div');
    banner.className = 'demo-banner';
    banner.id = 'demo-banner';
    banner.setAttribute('role', 'status');

    banner.appendChild(iconEl('info', 16));
    const textSpan = document.createElement('span');
    textSpan.className = 'demo-banner-text';
    textSpan.textContent = tx.text;

    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'demo-banner-link';
    link.textContent = tx.link;
    link.addEventListener('click', () => {
      clearDemoSession();
      goToAuth();
    });

    banner.appendChild(textSpan);
    banner.appendChild(link);
    main.insertBefore(banner, main.firstChild);
  }

  function refreshTexts() {
    const text = lang() === 'en' ? 'Sign out' : 'Salir';
    document.querySelectorAll('[data-i18n="btn.logout"]').forEach(el => { el.textContent = text; });
    const tx = demoTexts();
    const bt = document.querySelector('#demo-banner .demo-banner-text');
    if (bt) bt.textContent = tx.text;
    const bl = document.querySelector('#demo-banner .demo-banner-link');
    if (bl) bl.textContent = tx.link;
  }

  // ── Logout ──────────────────────────────────────────────────
  async function doLogout() {
    if (resolved && resolved.isDemo) {
      clearDemoSession();
      goToAuth();
      return;
    }
    try { await sb.auth.signOut(); } catch { /* ignorar */ }
    goToAuth();
  }

  async function initSessionUI() {
    document.getElementById('btn-logout')?.addEventListener('click', doLogout);
    document.getElementById('nav-logout')?.addEventListener('click', doLogout);
    document.getElementById('lang-toggle')?.addEventListener('click', () => setTimeout(refreshTexts, 0));

    const info = await resolve();
    renderUser(info);
    if (info.isDemo) renderDemoBanner();
    refreshTexts();
  }

  window.GPSession = { resolve, logout: doLogout };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSessionUI);
  } else {
    initSessionUI();
  }
})();
