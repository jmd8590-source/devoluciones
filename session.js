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
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      if (search.includes('code=')) {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code && sb.auth.exchangeCodeForSession) {
          await sb.auth.exchangeCodeForSession(code).catch(() => {});
        }
      } else if (hash.includes('access_token=')) {
        await new Promise(r => setTimeout(r, 350));
      }

      let { data, error } = await sb.auth.getUser();
      if ((error || !data || !data.user) && hash.includes('access_token=')) {
        await new Promise(r => setTimeout(r, 500));
        const retry = await sb.auth.getUser().catch(() => ({ data: null }));
        if (retry && retry.data && retry.data.user) {
          data = retry.data;
          error = null;
        }
      }

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
    const syncPill = document.getElementById('session-sync-pill');
    const display  = info.name || info.email || '';

    if (info.isDemo) {
      if (nameEl) nameEl.textContent = lang() === 'en' ? 'Modo Demo' : 'Modo Demo';
      if (avatarEl) avatarEl.textContent = 'D';
      if (syncPill) {
        syncPill.className = 'session-sync-pill sync-pill-demo';
        syncPill.innerHTML = lang() === 'en'
          ? '<span class="pill-dot"></span> Local mode · <a href="auth.html#registro" class="pill-link">Save in Cloud</a>'
          : '<span class="pill-dot"></span> Modo local · <a href="auth.html#registro" class="pill-link">Guardar en nube</a>';
      }
    } else {
      const shortName = display.split(' ')[0] || display.split('@')[0] || 'Usuario';
      if (nameEl) nameEl.textContent = shortName;
      if (avatarEl) avatarEl.textContent = (display[0] || 'U').toUpperCase();
      if (syncPill) {
        syncPill.className = 'session-sync-pill sync-pill-cloud';
        syncPill.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> <span>' + (lang() === 'en' ? 'Cloud Sync (Supabase)' : 'Nube Supabase (UE)') + '</span>';
        syncPill.title = lang() === 'en'
          ? 'Connected to Supabase EU. Cross-device safe.'
          : 'Sincronizado con Supabase (UE). Seguro entre todos tus dispositivos.';
      }
    }

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
