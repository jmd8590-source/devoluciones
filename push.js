/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Avisos push de plazos (cliente)
   Gestiona el interruptor "Avisos en tu móvil": pide permiso solo
   cuando el usuario lo activa, crea la suscripción del dispositivo
   y la guarda en su cuenta. El envío lo hace el servidor cada día.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

(function () {
  // Clave pública (es pública por diseño). La privada vive solo en el servidor.
  const VAPID_PUBLIC_KEY = 'BHDxQdDnKCO-OclULjwKhQKujUg5aQbnPfH_5gPcZJF2hQ9ILea81P4mwuWbp1fU_ZAGmcWA24e0wJdHM-BtBAQ';

  function lang() { return localStorage.getItem('gp_lang') || 'es'; }
  const TX = {
    es: {
      title: 'Avisos en tu móvil',
      desc: 'Recibe una notificación antes de que venza cada devolución o garantía, aunque no tengas la web abierta.',
      on: 'Activados en este dispositivo',
      off: 'Desactivados',
      denied: 'Has bloqueado las notificaciones. Actívalas desde los ajustes del navegador para este sitio.',
      unsupported: 'Este navegador no admite notificaciones push.',
      iosInstall: 'En iPhone, instala primero la app en la pantalla de inicio para poder recibir avisos.',
      demo: 'Crea tu cuenta gratis para activar los avisos.',
      working: 'Un momento…',
      test: 'Enviar aviso de prueba',
      testSent: 'Aviso de prueba enviado. Debería llegarte en unos segundos.',
      testFail: 'No se pudo enviar el aviso de prueba. Inténtalo de nuevo.',
      enabledToast: 'Avisos activados en este dispositivo',
      disabledToast: 'Avisos desactivados',
      enableFail: 'No se pudieron activar los avisos. Inténtalo de nuevo.',
      install: 'Instalar app',
      installed: 'App instalada',
      iosTitle: 'Instalar en iPhone',
      iosSteps: ['Abre esta web en Safari', 'Pulsa el botón Compartir', 'Elige «Añadir a pantalla de inicio»'],
    },
    en: {
      title: 'Alerts on your phone',
      desc: 'Get a notification before each return or warranty expires, even when the site is closed.',
      on: 'Enabled on this device',
      off: 'Disabled',
      denied: 'Notifications are blocked. Enable them from your browser settings for this site.',
      unsupported: 'This browser does not support push notifications.',
      iosInstall: 'On iPhone, install the app to your home screen first to receive alerts.',
      demo: 'Create your free account to enable alerts.',
      working: 'One moment…',
      test: 'Send test alert',
      testSent: 'Test alert sent. It should arrive in a few seconds.',
      testFail: 'Could not send the test alert. Please try again.',
      enabledToast: 'Alerts enabled on this device',
      disabledToast: 'Alerts disabled',
      enableFail: 'Could not enable alerts. Please try again.',
      install: 'Install app',
      installed: 'App installed',
      iosTitle: 'Install on iPhone',
      iosSteps: ['Open this site in Safari', 'Tap the Share button', 'Choose "Add to Home Screen"'],
    },
  };
  const tx = () => TX[lang()] || TX.es;

  const hasPushApi = () =>
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  function urlBase64ToUint8Array(b64) {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
  }

  function toast(msg, type) {
    if (typeof window.showToast === 'function') window.showToast(msg, type || 'ok');
  }

  async function getSession() {
    try { return await window.GPSession.resolve(); } catch { return null; }
  }

  async function getRegistration() {
    if (!('serviceWorker' in navigator)) return null;
    try { return await navigator.serviceWorker.ready; } catch { return null; }
  }

  async function currentSubscription() {
    const reg = await getRegistration();
    return reg ? reg.pushManager.getSubscription() : null;
  }

  /* Estado: unsupported | ios-install | demo | denied | off | on */
  async function getStatus() {
    const session = await getSession();
    if (session && session.isDemo) return 'demo';
    if (window.GPPwa && window.GPPwa.isIos() && !window.GPPwa.isStandalone()) return 'ios-install';
    if (!hasPushApi()) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    const sub = await currentSubscription();
    return sub && Notification.permission === 'granted' ? 'on' : 'off';
  }

  async function saveSubscription(sub) {
    const session = await getSession();
    if (!session || session.isDemo || !session.user) throw new Error('sin sesión');
    const json = sub.toJSON();
    const { error } = await sb.from('push_subscriptions').upsert({
      user_id: session.user.id,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: (navigator.userAgent || '').slice(0, 200),
    }, { onConflict: 'endpoint' });
    if (error) throw error;
  }

  async function enable() {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return false;
    const reg = await getRegistration();
    if (!reg) throw new Error('sin service worker');
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    await saveSubscription(sub);
    return true;
  }

  async function disable() {
    const sub = await currentSubscription();
    if (!sub) return;
    const endpoint = sub.endpoint;
    try { await sb.from('push_subscriptions').delete().eq('endpoint', endpoint); } catch { /* ignorar */ }
    await sub.unsubscribe().catch(() => {});
  }

  /* Al cerrar sesión: este dispositivo deja de recibir avisos de esa cuenta */
  async function cleanup() {
    try { if (hasPushApi()) await disable(); } catch { /* ignorar */ }
  }

  async function sendTest() {
    const sub = await currentSubscription();
    if (!sub) return false;
    const { data, error } = await sb.functions.invoke('send-test-push', {
      body: { endpoint: sub.endpoint },
    });
    if (error) throw error;
    return Boolean(data && data.sent > 0);
  }

  /* ── Interfaz ─────────────────────────────────────────────── */
  let busy = false;

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  async function render() {
    const card = document.getElementById('push-card');
    if (!card) return;
    const t = tx();
    const status = await getStatus();

    setText('push-title', t.title);
    setText('push-desc', t.desc);
    setText('push-test-text', t.test);
    document.querySelectorAll('[data-install-label]').forEach((el) => { el.textContent = t.install; });
    document.querySelectorAll('[data-install-done-label]').forEach((el) => { el.textContent = t.installed; });
    setText('push-ios-title', t.iosTitle);
    const steps = document.getElementById('push-ios-steps');
    if (steps) {
      steps.innerHTML = '';
      t.iosSteps.forEach((s) => { const li = document.createElement('li'); li.textContent = s; steps.appendChild(li); });
    }

    const toggle = document.getElementById('push-toggle');
    const testBtn = document.getElementById('push-test-btn');
    const statusEl = document.getElementById('push-status');
    const msg = {
      on: t.on, off: t.off, denied: t.denied, unsupported: t.unsupported,
      'ios-install': t.iosInstall, demo: t.demo,
    }[status];

    if (statusEl) {
      statusEl.textContent = busy ? t.working : msg;
      statusEl.className = 'push-status' +
        (status === 'on' ? ' is-on' : (status === 'denied' ? ' is-warn' : ''));
    }
    if (toggle) {
      toggle.checked = status === 'on';
      toggle.disabled = busy || !(status === 'on' || status === 'off');
    }
    if (testBtn) testBtn.hidden = status !== 'on';
    if (window.GPPwa) window.GPPwa.refreshInstallUI();
  }

  async function onToggle() {
    const toggle = document.getElementById('push-toggle');
    if (!toggle || busy) return;
    const wantOn = toggle.checked;
    busy = true;
    await render();
    try {
      if (wantOn) {
        const ok = await enable();
        toast(ok ? tx().enabledToast : tx().denied, ok ? 'ok' : 'warn');
      } else {
        await disable();
        toast(tx().disabledToast, 'ok');
      }
    } catch (err) {
      console.error('Push:', err);
      toast(tx().enableFail, 'error');
    } finally {
      busy = false;
      await render();
    }
  }

  async function onTest() {
    const btn = document.getElementById('push-test-btn');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    try {
      const ok = await sendTest();
      toast(ok ? tx().testSent : tx().testFail, ok ? 'ok' : 'warn');
    } catch (err) {
      console.error('Push test:', err);
      toast(tx().testFail, 'error');
    } finally {
      btn.disabled = false;
    }
  }

  function init() {
    document.getElementById('push-toggle')?.addEventListener('change', onToggle);
    document.getElementById('push-test-btn')?.addEventListener('click', onTest);
    document.getElementById('lang-toggle')?.addEventListener('click', () => setTimeout(render, 0));
    render();
  }

  window.GPPush = { getStatus, enable, disable, cleanup, render };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

