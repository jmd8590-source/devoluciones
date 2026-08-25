/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Session Guard
   Loaded first in <head>: redirects to auth.html if no valid session
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SESSION_KEY = 'gp_session_v1';
  try {
    var raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) { window.location.replace('auth.html'); return; }
    var s = JSON.parse(raw);
    if (!s || !s.token || !s.expiresAt || Date.now() > s.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.replace('auth.html');
    }
  } catch (e) {
    window.location.replace('auth.html');
  }
})();
