/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Session Guard
   Se carga primero en <head>: redirige a auth.html si no hay sesión
   guardada. La validación real del token la hace session.js contra
   el servidor de Supabase.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var DEMO_KEY = 'gp_session_v1';
  var SB_KEY   = 'sb-ynmqlzpqsyvhzlspzfkd-auth-token';
  try {
    var demoRaw = sessionStorage.getItem(DEMO_KEY);
    if (demoRaw) {
      var d = JSON.parse(demoRaw);
      if (d && d.isDemo && Date.now() < d.expiresAt) return;
      sessionStorage.removeItem(DEMO_KEY);
    }
    if (localStorage.getItem(SB_KEY)) return;
    window.location.replace('auth.html');
  } catch (e) {
    window.location.replace('auth.html');
  }
})();
