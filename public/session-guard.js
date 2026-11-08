/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Session Guard
   Se carga primero en <head>: redirige a auth.html si no hay sesión guardada.
   Si la URL trae tokens de confirmación (#access_token= o ?code=), permite
   que Supabase los procese en el body antes de decidir.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var DEMO_KEY = 'gp_session_v1';
  var SB_KEY   = 'sb-ynmqlzpqsyvhzlspzfkd-auth-token';
  try {
    // Si viene desde un enlace de confirmación o reseteo de Supabase,
    // NO redirigir: dejar que Supabase procese el token en el body
    var h = window.location.hash || '';
    var q = window.location.search || '';
    // Enlace de «¿Has olvidado la contraseña?»: si Supabase devuelve al usuario
    // a la página principal (URL por defecto del proyecto), se le lleva a la
    // pantalla de nueva contraseña conservando el token.
    if (h.indexOf('type=recovery') !== -1 || q.indexOf('type=recovery') !== -1) {
      window.location.replace('auth.html' + (q.indexOf('reset=1') === -1 ? (q ? q + '&reset=1' : '?reset=1') : q) + h);
      return;
    }
    if (h.indexOf('access_token=') !== -1 ||
        h.indexOf('refresh_token=') !== -1 ||
        h.indexOf('error=') !== -1 ||
        q.indexOf('code=') !== -1) {
      return;
    }

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
