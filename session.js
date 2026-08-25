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
    // Show first name only, escaped safely via textContent
    nameEl.textContent = (session.name || session.email || '').split(' ')[0];
  }
  if (avatarEl) {
    // Use first letter as avatar
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

  // ── Logout ────────────────────────────────────────────────────
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.replace('auth.html');
  });

  // ── Add logout key to i18n (extend TRANSLATIONS if available) ─
  if (typeof TRANSLATIONS !== 'undefined') {
    if (TRANSLATIONS.es) TRANSLATIONS.es['btn.logout'] = 'Salir';
    if (TRANSLATIONS.en) TRANSLATIONS.en['btn.logout'] = 'Sign out';
  }
  // Also update the span directly to be safe
  const logoutSpan = document.querySelector('#btn-logout span[data-i18n]');
  if (logoutSpan) {
    const lang = localStorage.getItem('gp_lang') || 'es';
    logoutSpan.textContent = lang === 'en' ? 'Sign out' : 'Salir';
  }

  // ── Update logout label on language change ────────────────────
  // (app.js lang toggle calls applyTranslations; we hook into it via MutationObserver)
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      setTimeout(() => {
        const lang = localStorage.getItem('gp_lang') || 'es';
        if (logoutSpan) logoutSpan.textContent = lang === 'en' ? 'Sign out' : 'Salir';
      }, 50);
    });
  }

})();
