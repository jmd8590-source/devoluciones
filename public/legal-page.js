/* GarantíasPro — enlaces de contacto y botones de cookies en páginas legales
   (antes era un script en línea; así la CSP puede prohibir 'unsafe-inline') */
'use strict';
  (function() {
  const emailParts = ['jemendo90', 'gmail.com'];
  const email = emailParts.join('@');
  document.querySelectorAll('.js-contact-target').forEach(el => {
    const a = document.createElement('a');
    a.href = 'mailto:' + email + '?subject=' + encodeURIComponent('[GarantíasPro] Consulta Legal / Privacidad');
    a.textContent = email;
    el.replaceWith(a);
  });
  document.querySelectorAll('.js-contact-link').forEach(el => {
    el.href = 'mailto:' + email + '?subject=' + encodeURIComponent('[GarantíasPro] Contacto');
  });
})();

document.querySelectorAll('[data-open-cookies]').forEach(btn => {
  btn.addEventListener('click', () => { if (typeof window.openCookieSettings === 'function') window.openCookieSettings(); });
});
