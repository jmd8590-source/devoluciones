/**
 * GarantíasPro — Gestor de Consentimiento de Cookies (AEPD / RGPD / LSSI-CE 22.2)
 * Proporciona información en dos capas, rechazo al mismo nivel y revocación en cualquier momento.
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'gp_cookie_consent';

  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveConsent(consent) {
    try {
      const data = {
        technical: true, // Siempre necesarias
        preferences: !!consent.preferences,
        analytics: !!consent.analytics,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: data }));
    } catch (e) {
      console.warn('No se pudo guardar el consentimiento de cookies', e);
    }
  }

  function removeBanner() {
    const el = document.getElementById('gp-cookie-banner');
    if (el) el.remove();
  }

  function closeSettingsModal() {
    const modal = document.getElementById('gp-cookie-modal');
    if (modal) modal.remove();
  }

  // ── Capa 1: Banner inferior ──────────────────────────────────────
  function showBanner() {
    if (document.getElementById('gp-cookie-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'gp-cookie-banner';
    banner.className = 'cookie-banner-wrap';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Aviso de cookies');

    banner.innerHTML = `
      <div class="cookie-banner-header">
        <div class="cookie-banner-icon" aria-hidden="true">🍪</div>
        <div>
          <h2 class="cookie-banner-title">Control de Privacidad y Cookies</h2>
        </div>
      </div>
      <p class="cookie-banner-text">
        En <strong>GarantíasPro</strong> utilizamos cookies técnicas esenciales para mantener tu sesión segura y permitir la gestión de tus garantías. No vendemos tus datos ni usamos cookies de rastreo publicitario. Puedes aceptar todas, rechazarlas o configurar tus preferencias conforme al RGPD y la LSSI-CE. Más información en nuestra <a href="cookies.html" target="_blank" rel="noopener">Política de cookies</a>.
      </p>
      <div class="cookie-banner-actions">
        <button type="button" class="btn-cookie btn-cookie-settings" id="gp-cookie-btn-settings">
          ⚙️ Configurar
        </button>
        <button type="button" class="btn-cookie btn-cookie-reject" id="gp-cookie-btn-reject">
          Rechazar no esenciales
        </button>
        <button type="button" class="btn-cookie btn-cookie-accept" id="gp-cookie-btn-accept">
          Aceptar todas
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    // Eventos
    document.getElementById('gp-cookie-btn-accept')?.addEventListener('click', () => {
      saveConsent({ preferences: true, analytics: true });
      removeBanner();
      ensureReopenButton();
    });

    document.getElementById('gp-cookie-btn-reject')?.addEventListener('click', () => {
      saveConsent({ preferences: false, analytics: false });
      removeBanner();
      ensureReopenButton();
    });

    document.getElementById('gp-cookie-btn-settings')?.addEventListener('click', () => {
      openSettingsModal();
    });
  }

  // ── Modal de Configuración (Segunda Capa interactiva) ─────────────
  function openSettingsModal() {
    closeSettingsModal();
    const current = getConsent() || { technical: true, preferences: false, analytics: false };

    const modal = document.createElement('div');
    modal.id = 'gp-cookie-modal';
    modal.className = 'cookie-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'gp-cookie-modal-title');

    modal.innerHTML = `
      <div class="cookie-modal-card">
        <div class="cookie-modal-header">
          <h3 id="gp-cookie-modal-title">Configuración de Privacidad y Cookies</h3>
          <button type="button" class="cookie-modal-close" id="gp-cookie-modal-close" aria-label="Cerrar">&times;</button>
        </div>
        <div class="cookie-modal-body">
          <p style="margin:0 0 4px 0;">
            Puedes activar o desactivar cada categoría de cookies. La legislación española (AEPD) exige que el consentimiento sea informado y granular. Para más detalles, consulta nuestra <a href="cookies.html" target="_blank" rel="noopener" style="color:#4f8cff;text-decoration:underline;">Política de cookies</a>.
          </p>

          <!-- Categoría 1: Técnicas y Obligatorias -->
          <div class="cookie-category-item">
            <div class="cookie-category-top">
              <span class="cookie-category-title">
                <span>🛡️ Cookies Técnicas y de Seguridad</span>
                <span class="cookie-badge-req">Obligatorias</span>
              </span>
              <label class="cookie-switch">
                <input type="checkbox" checked disabled />
                <span class="cookie-slider"></span>
              </label>
            </div>
            <p style="margin:0;font-size:12.5px;color:var(--t-muted,#8899bb);">
              Imprescindibles para que la aplicación funcione. Permiten la autenticación segura mediante tokens cifrados (sesión en la nube), la custodia digital de tickets y la protección contra ataques informáticos. No se pueden desactivar.
            </p>
          </div>

          <!-- Categoría 2: Preferencias y Personalización -->
          <div class="cookie-category-item">
            <div class="cookie-category-top">
              <span class="cookie-category-title">
                <span>🌐 Preferencias de Usuario</span>
              </span>
              <label class="cookie-switch">
                <input type="checkbox" id="gp-pref-cookies" ${current.preferences ? 'checked' : ''} />
                <span class="cookie-slider"></span>
              </label>
            </div>
            <p style="margin:0;font-size:12.5px;color:var(--t-muted,#8899bb);">
              Permiten recordar tu idioma preferido (español o inglés) y la configuración de vista del panel entre sesiones.
            </p>
          </div>

          <!-- Categoría 3: Métricas y Analíticas -->
          <div class="cookie-category-item">
            <div class="cookie-category-top">
              <span class="cookie-category-title">
                <span>📊 Métricas de Rendimiento Anónimas</span>
              </span>
              <label class="cookie-switch">
                <input type="checkbox" id="gp-pref-analytics" ${current.analytics ? 'checked' : ''} />
                <span class="cookie-slider"></span>
              </label>
            </div>
            <p style="margin:0;font-size:12.5px;color:var(--t-muted,#8899bb);">
              Nos ayudan a conocer el rendimiento y tiempos de carga de la web de forma 100% agregada y sin identificar a ningún usuario. No se utilizan con fines publicitarios.
            </p>
          </div>
        </div>

        <div class="cookie-modal-footer">
          <button type="button" class="btn-cookie btn-cookie-reject" id="gp-modal-reject">
            Rechazar opcionales
          </button>
          <button type="button" class="btn-cookie btn-cookie-accept" id="gp-modal-save">
            Guardar preferencias
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('gp-cookie-modal-close')?.addEventListener('click', closeSettingsModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSettingsModal();
    });

    document.getElementById('gp-modal-save')?.addEventListener('click', () => {
      const pref = !!document.getElementById('gp-pref-cookies')?.checked;
      const ana = !!document.getElementById('gp-pref-analytics')?.checked;
      saveConsent({ preferences: pref, analytics: ana });
      closeSettingsModal();
      removeBanner();
      ensureReopenButton();
    });

    document.getElementById('gp-modal-reject')?.addEventListener('click', () => {
      saveConsent({ preferences: false, analytics: false });
      closeSettingsModal();
      removeBanner();
      ensureReopenButton();
    });
  }

  // ── Botón persistente para revocar / reabrir en cualquier momento ──
  function ensureReopenButton() {
    if (document.getElementById('gp-reopen-cookies')) return;

    const btn = document.createElement('button');
    btn.id = 'gp-reopen-cookies';
    btn.type = 'button';
    btn.className = 'cookie-reopen-trigger';
    btn.title = 'Configuración y preferencias de cookies';
    btn.setAttribute('aria-label', 'Abrir panel de configuración de cookies');
    btn.innerHTML = `
      <span class="cookie-trigger-icon-wrap" aria-hidden="true">
        <span class="cookie-trigger-icon">🍪</span>
        <span class="cookie-status-dot" title="Privacidad activa"></span>
      </span>
      <span class="cookie-trigger-label">Cookies</span>
    `;

    btn.addEventListener('click', openSettingsModal);
    document.body.appendChild(btn);
  }

  // Exponer API global
  window.openCookieSettings = openSettingsModal;
  window.getCookieConsent = getConsent;

  // Inicialización cuando el DOM esté listo
  function init() {
    const consent = getConsent();
    if (!consent) {
      showBanner();
    } else {
      ensureReopenButton();
    }

    // Enlazar botones del footer si existen
    document.querySelectorAll('[data-open-cookies]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openSettingsModal();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
