/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Session helper (runs after app.js)
   Loads user info from session and wires up logout button
   ═══════════════════════════════════════════════════════════════ */

'use strict';

(function () {
  const SESSION_KEY = 'gp_session_v1';

  // ── Load session ──────────────────────────────────────────────
  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.token || Date.now() > s.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch { return null; }
  }

  // ── Populate user greeting ────────────────────────────────────
  const session = getSession();
  if (!session) {
    window.location.replace('auth.html');
    return;
  }

  const nameEl   = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar');
  if (nameEl) {
    nameEl.textContent = (session.name || session.email || '').split(' ')[0];
  }
  if (avatarEl) {
    const letter = (session.name || session.email || '?')[0].toUpperCase();
    avatarEl.textContent = letter;
    avatarEl.style.cssText = `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:24px;height:24px;
      border-radius:50%;
      background:linear-gradient(135deg,#4f8cff,#a259ff);
      color:#fff;
      font-size:12px;
      font-weight:700;
    `;
  }

  // ── Demo banner ───────────────────────────────────────────────
  if (session.isDemo) {
    const lang = localStorage.getItem('gp_lang') || 'es';
    const bannerText = lang === 'en'
      ? '🎮 Demo mode — data is not saved. '
      : '🎮 Modo demo — los datos no se guardan. ';
    const linkText = lang === 'en' ? 'Create a free account →' : 'Crear cuenta gratis →';

    const banner = document.createElement('div');
    banner.className = 'demo-banner';
    banner.id = 'demo-banner';

    const textSpan = document.createElement('span');
    textSpan.textContent = bannerText;

    const link = document.createElement('button');
    link.className = 'link';
    link.textContent = linkText;
    link.addEventListener('click', () => {
      sessionStorage.removeItem('gp_session_v1');
      window.location.replace('auth.html');
    });

    banner.appendChild(textSpan);
    banner.appendChild(link);

    // Insert after header
    const header = document.querySelector('.app-header');
    if (header) {
      header.insertAdjacentElement('afterend', banner);
      // Adjust main padding to account for banner
      const main = document.querySelector('.app-main');
      if (main) {
        const bannerH = banner.offsetHeight || 40;
        const current = getComputedStyle(main).paddingTop;
        main.style.paddingTop = (parseFloat(current) + bannerH) + 'px';
      }
    }
  }


  // ── Logout ────────────────────────────────────────────────────
  function doLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.replace('auth.html');
  }

  document.getElementById('btn-logout')?.addEventListener('click', doLogout);
  document.getElementById('nav-logout')?.addEventListener('click', doLogout);

  // ── Add logout key to i18n (extend TRANSLATIONS if available) ─
  if (typeof TRANSLATIONS !== 'undefined') {
    if (TRANSLATIONS.es) TRANSLATIONS.es['btn.logout'] = 'Salir';
    if (TRANSLATIONS.en) TRANSLATIONS.en['btn.logout'] = 'Sign out';
  }

  function refreshLogoutLabels() {
    const lang = localStorage.getItem('gp_lang') || 'es';
    const text = lang === 'en' ? 'Sign out' : 'Salir';
    document.querySelectorAll('[data-i18n="btn.logout"]').forEach(el => {
      el.textContent = text;
    });
  }
  refreshLogoutLabels();

  // ── Update logout label on language change ────────────────────
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      setTimeout(refreshLogoutLabels, 50);
    });
  }

})();
