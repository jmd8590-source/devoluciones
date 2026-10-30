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
        syncPill.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> <span>' + (lang() === 'en' ? 'Cloud Sync (EU)' : 'Nube segura (UE)') + '</span>';
        syncPill.title = lang() === 'en'
          ? 'Connected to EU Cloud. Cross-device safe.'
          : 'Sincronizado en la nube (UE). Seguro entre todos tus dispositivos.';
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
    const accText = lang() === 'en' ? 'My account' : 'Mi cuenta';
    document.querySelectorAll('[data-i18n="btn.account"]').forEach(el => { el.textContent = accText; });
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

  // ── MI CUENTA / AJUSTES ──────────────────────────────────────
  function initAccountModal(info) {
    const modalEl = document.getElementById('modal-account');
    const btnOpen = document.getElementById('btn-account');
    const greetingEl = document.getElementById('user-greeting');
    const btnClose = document.getElementById('account-modal-close');

    if (!modalEl) return;

    function openModal() {
      const avatarEl = document.getElementById('account-user-avatar');
      const nameEl = document.getElementById('account-user-name');
      const emailEl = document.getElementById('account-user-email');
      const statusBadge = document.getElementById('account-status-badge');
      const syncText = document.getElementById('account-sync-text');
      const demoNotice = document.getElementById('account-demo-notice');
      const securitySection = document.getElementById('account-security-section');

      const isEnglish = lang() === 'en';
      const displayName = info.name || (info.email ? info.email.split('@')[0] : (isEnglish ? 'User' : 'Usuario'));

      if (avatarEl) avatarEl.textContent = (displayName[0] || 'U').toUpperCase();
      if (nameEl) nameEl.textContent = displayName;

      if (info.isDemo) {
        if (emailEl) emailEl.textContent = isEnglish ? 'Demo mode (temporary)' : 'Modo Demo local (temporal)';
        if (statusBadge) {
          statusBadge.textContent = 'Demo';
          statusBadge.className = 'account-plan-badge badge-demo';
        }
        if (syncText) syncText.textContent = isEnglish ? 'Data stored only on this browser' : 'Datos guardados solo en este navegador';
        if (demoNotice) demoNotice.hidden = false;
        if (securitySection) securitySection.style.opacity = '0.45';
        const submitBtn = document.getElementById('btn-submit-change-pwd');
        if (submitBtn) submitBtn.disabled = true;
      } else {
        if (emailEl) emailEl.textContent = info.email || 'usuario@correo.com';
        if (statusBadge) {
          statusBadge.textContent = isEnglish ? 'Active Account' : 'Cuenta Activa';
          statusBadge.className = 'account-plan-badge';
        }
        if (syncText) syncText.textContent = isEnglish ? 'Secure cloud synchronization active' : 'Sincronización segura activa en la nube';
        if (demoNotice) demoNotice.hidden = true;
        if (securitySection) securitySection.style.opacity = '1';
        const submitBtn = document.getElementById('btn-submit-change-pwd');
        if (submitBtn) submitBtn.disabled = false;
      }

      clearPasswordForm();
      modalEl.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modalEl.hidden = true;
      document.body.style.overflow = '';
      clearPasswordForm();
    }

    function clearPasswordForm() {
      const form = document.getElementById('form-change-password');
      if (form) form.reset();
      const errEl = document.getElementById('acc-pwd-error');
      const succEl = document.getElementById('acc-pwd-success');
      if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
      if (succEl) { succEl.hidden = true; succEl.textContent = ''; }
      const meter = document.getElementById('acc-pwd-strength');
      if (meter) meter.style.display = 'none';
    }

    btnOpen?.addEventListener('click', openModal);
    greetingEl?.addEventListener('click', openModal);
    btnClose?.addEventListener('click', closeModal);

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalEl.hidden) closeModal();
    });

    // Toggle ver/ocultar contraseñas
    setupPasswordToggle('acc-new-pwd', 'acc-toggle-new-pwd');
    setupPasswordToggle('acc-confirm-pwd', 'acc-toggle-confirm-pwd');

    // Medidor de fortaleza interactivo
    setupPasswordStrength();

    // Formulario de cambio de contraseña sincronizado con backend
    const form = document.getElementById('form-change-password');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (info.isDemo) return;

      const newPwd = document.getElementById('acc-new-pwd')?.value || '';
      const confirmPwd = document.getElementById('acc-confirm-pwd')?.value || '';
      const errEl = document.getElementById('acc-pwd-error');
      const succEl = document.getElementById('acc-pwd-success');
      const submitBtn = document.getElementById('btn-submit-change-pwd');
      const btnText = document.getElementById('btn-change-pwd-text');
      const spinner = document.getElementById('btn-change-pwd-spinner');

      if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
      if (succEl) { succEl.hidden = true; succEl.textContent = ''; }

      const isEnglish = lang() === 'en';

      if (!newPwd || !confirmPwd) {
        errEl.textContent = isEnglish ? 'Please fill in both fields.' : 'Por favor, completa ambos campos.';
        errEl.hidden = false;
        return;
      }
      if (newPwd.length < 8) {
        errEl.textContent = isEnglish ? 'Password must be at least 8 characters.' : 'La contraseña debe tener al menos 8 caracteres.';
        errEl.hidden = false;
        return;
      }
      if (!(/[a-zA-Z]/.test(newPwd) && /[0-9]/.test(newPwd))) {
        errEl.textContent = isEnglish ? 'Password must contain both letters and numbers.' : 'La contraseña debe contener letras y números.';
        errEl.hidden = false;
        return;
      }
      if (newPwd !== confirmPwd) {
        errEl.textContent = isEnglish ? 'Passwords do not match.' : 'Las contraseñas no coinciden.';
        errEl.hidden = false;
        return;
      }

      submitBtn.disabled = true;
      if (spinner) spinner.hidden = false;
      if (btnText) btnText.textContent = isEnglish ? 'Updating...' : 'Actualizando...';

      try {
        const { data, error } = await sb.auth.updateUser({ password: newPwd });

        if (error) {
          errEl.textContent = error.message || (isEnglish ? 'Could not update password. Please try again.' : 'No se pudo actualizar la contraseña. Inténtalo de nuevo.');
          errEl.hidden = false;
        } else {
          succEl.textContent = isEnglish ? 'Password updated and synchronized successfully!' : '¡Contraseña actualizada y sincronizada con éxito en la nube!';
          succEl.hidden = false;
          form.reset();
          const meter = document.getElementById('acc-pwd-strength');
          if (meter) meter.style.display = 'none';

          if (typeof window.showToast === 'function') {
            window.showToast(isEnglish ? 'Password updated successfully' : 'Contraseña actualizada con éxito');
          }
        }
      } catch (err) {
        errEl.textContent = isEnglish ? 'Connection error. Please try again.' : 'Error de conexión. Inténtalo de nuevo más tarde.';
        errEl.hidden = false;
      } finally {
        submitBtn.disabled = false;
        if (spinner) spinner.hidden = true;
        if (btnText) btnText.textContent = isEnglish ? 'Update password' : 'Actualizar contraseña';
      }
    });
  }

  function setupPasswordToggle(inputId, toggleBtnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(toggleBtnId);
    if (!input || !btn) return;

    btn.addEventListener('click', () => {
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      btn.style.color = isPwd ? 'var(--c-primary)' : 'var(--t-muted)';
    });
  }

  function setupPasswordStrength() {
    const input = document.getElementById('acc-new-pwd');
    const wrap = document.getElementById('acc-pwd-strength');
    const bars = [
      document.getElementById('acc-sb1'),
      document.getElementById('acc-sb2'),
      document.getElementById('acc-sb3'),
      document.getElementById('acc-sb4')
    ];
    const label = document.getElementById('acc-strength-label');
    if (!input || !wrap) return;

    const colors = ['#ff4f6e', '#ff8c42', '#ffbe3d', '#31e08f'];
    const names = {
      es: ['Débil', 'Regular', 'Buena', 'Muy segura'],
      en: ['Weak', 'Fair', 'Good', 'Strong']
    };

    input.addEventListener('input', () => {
      const val = input.value;
      if (!val) {
        wrap.style.display = 'none';
        return;
      }
      wrap.style.display = 'flex';

      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val) || val.length >= 12) score++;

      const isEnglish = (localStorage.getItem('gp_lang') || 'es') === 'en';
      const langNames = isEnglish ? names.en : names.es;

      bars.forEach((bar, idx) => {
        if (!bar) return;
        if (idx < score) {
          bar.style.background = colors[Math.max(0, score - 1)];
        } else {
          bar.style.background = 'rgba(255, 255, 255, 0.1)';
        }
      });

      if (label) {
        const textIdx = Math.max(0, Math.min(score - 1, 3));
        label.textContent = score > 0 ? langNames[textIdx] : '';
        label.style.color = score > 0 ? colors[Math.max(0, score - 1)] : 'var(--t-muted)';
      }
    });
  }

  async function initSessionUI() {
    document.getElementById('btn-logout')?.addEventListener('click', doLogout);
    document.getElementById('nav-logout')?.addEventListener('click', doLogout);
    document.getElementById('lang-toggle')?.addEventListener('click', () => setTimeout(refreshTexts, 0));

    const info = await resolve();
    renderUser(info);
    initAccountModal(info);
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
