/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Urgent Alert System (JS)
   Muestra aviso dramático cuando un plazo vence en ≤3 días
   ═══════════════════════════════════════════════════════════════ */

'use strict';

(function () {

  /* ── Config ─────────────────────────────────────────────────── */
  const WARN_DAYS      = 3;
  const STORAGE_KEY    = 'gp_products_v2';
  const SESSION_KEY    = 'gp_session_v1';
  const DISMISSED_KEY  = 'gp_alerts_dismissed_v1'; // sessionStorage key

  /* ── i18n ───────────────────────────────────────────────────── */
  function lang() { return localStorage.getItem('gp_lang') || 'es'; }
  const T = {
    es: {
      title:      '⚠️ ¡Plazos a punto de vencer!',
      subtitle:   'Los siguientes productos requieren tu atención inmediata. Tienes 3 días o menos.',
      return:     'Devolución',
      warranty:   'Garantía',
      days:       (n) => n === 0 ? '¡HOY!' : n === 1 ? '1 día' : `${n} días`,
      unit:       'días',
      today:      '¡HOY!',
      btnGo:      '🚀 Ver productos urgentes',
      btnDismiss: 'Lo he visto, gracias',
      notifTitle: '⚠️ GarantíasPro — Plazos urgentes',
      notifBody:  (n) => `Tienes ${n} producto${n > 1 ? 's' : ''} con plazo a punto de vencer.`,
    },
    en: {
      title:      '⚠️ Deadlines expiring soon!',
      subtitle:   'The following products need your immediate attention. You have 3 days or less.',
      return:     'Return',
      warranty:   'Warranty',
      days:       (n) => n === 0 ? 'TODAY!' : n === 1 ? '1 day' : `${n} days`,
      unit:       'days',
      today:      'TODAY!',
      btnGo:      '🚀 View urgent products',
      btnDismiss: 'Got it, thanks',
      notifTitle: '⚠️ GarantíasPro — Urgent deadlines',
      notifBody:  (n) => `You have ${n} product${n > 1 ? 's' : ''} with a deadline expiring soon.`,
    }
  };
  function t() { return T[lang()] || T.es; }

  /* ── Date helpers ───────────────────────────────────────────── */
  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const a = new Date(new Date().toISOString().slice(0,10) + 'T00:00:00');
    const b = new Date(dateStr + 'T00:00:00');
    if (isNaN(a) || isNaN(b)) return null;
    return Math.round((b - a) / 86400000);
  }
  function addDays(dateStr, days) {
    if (!dateStr || days == null) return null;
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0,10);
  }
  function addYears(dateStr, years) {
    if (!dateStr || years == null) return null;
    const d = new Date(dateStr + 'T00:00:00');
    d.setFullYear(d.getFullYear() + Math.floor(years));
    const extra = years - Math.floor(years);
    if (extra > 0) d.setDate(d.getDate() + Math.round(extra * 365));
    return d.toISOString().slice(0,10);
  }

  /* ── Load products & find urgent ────────────────────────────── */
  function loadProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch { return []; }
  }

  function findUrgentItems() {
    const products = loadProducts();
    const items = [];
    products.forEach(p => {
      if (!p || !p.id) return;

      // Return deadline
      if (p.retStart && p.retDays) {
        const dl  = addDays(p.retStart, p.retDays);
        const days = daysUntil(dl);
        if (days !== null && days >= 0 && days <= WARN_DAYS) {
          items.push({ product: p, kind: 'return', days, deadline: dl });
        }
      }

      // Warranty deadline
      if (p.warStart && p.warYears) {
        const dl  = addYears(p.warStart, p.warYears);
        const days = daysUntil(dl);
        if (days !== null && days >= 0 && days <= WARN_DAYS) {
          // Avoid duplicate if same product already added with same deadline
          const alreadyHave = items.some(i => i.product.id === p.id && i.deadline === dl);
          if (!alreadyHave) {
            items.push({ product: p, kind: 'warranty', days, deadline: dl });
          }
        }
      }
    });
    // Sort: most urgent first
    items.sort((a, b) => a.days - b.days);
    return items;
  }

  /* ── Was already dismissed this session? ────────────────────── */
  function wasDismissedThisSession(items) {
    try {
      const raw = sessionStorage.getItem(DISMISSED_KEY);
      if (!raw) return false;
      const dismissed = JSON.parse(raw);
      // Build signature of current urgent items
      const sig = items.map(i => i.product.id + ':' + i.kind + ':' + i.days).sort().join('|');
      return dismissed.sig === sig;
    } catch { return false; }
  }
  function saveDismissed(items) {
    try {
      const sig = items.map(i => i.product.id + ':' + i.kind + ':' + i.days).sort().join('|');
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify({ sig, ts: Date.now() }));
    } catch {}
  }

  /* ── Browser Notification ───────────────────────────────────── */
  function tryBrowserNotification(items) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'denied') return;

    const send = () => {
      try {
        new Notification(t().notifTitle, {
          body: t().notifBody(items.length),
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="26" font-size="26">⚠️</text></svg>',
          tag: 'garantias-urgent',
          requireInteraction: false,
        });
      } catch {}
    };

    if (Notification.permission === 'granted') {
      send();
    } else {
      // Request permission non-intrusively (only works on user gesture context)
      // We'll request it when user clicks the "View products" button instead
    }
  }

  /* ── Build DOM ──────────────────────────────────────────────── */
  function buildOverlay(items, onGo, onDismiss) {
    const tr = t();

    /* Overlay */
    const overlay = document.createElement('div');
    overlay.className = 'urgent-overlay';
    overlay.id = 'urgent-overlay';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'urgent-title');

    /* Panel */
    const panel = document.createElement('div');
    panel.className = 'urgent-panel';

    /* Icon zone */
    const iconZone = document.createElement('div');
    iconZone.className = 'urgent-icon-zone';
    const rings = document.createElement('div');
    rings.className = 'urgent-icon-rings';
    const inner = document.createElement('div');
    inner.className = 'urgent-icon-inner';
    inner.textContent = '🚨';
    inner.setAttribute('role', 'img');
    inner.setAttribute('aria-label', 'Alerta urgente');
    rings.appendChild(inner);
    iconZone.appendChild(rings);

    /* Header */
    const header = document.createElement('div');
    header.className = 'urgent-header';
    const title = document.createElement('h2');
    title.className = 'urgent-title';
    title.id = 'urgent-title';
    title.textContent = tr.title;
    const subtitle = document.createElement('p');
    subtitle.className = 'urgent-subtitle';
    subtitle.textContent = tr.subtitle;
    header.appendChild(title);
    header.appendChild(subtitle);

    /* Products list */
    const list = document.createElement('div');
    list.className = 'urgent-products';
    list.setAttribute('role', 'list');

    items.forEach(({ product, kind, days }) => {
      const row = document.createElement('div');
      row.className = 'urgent-product-row';
      row.setAttribute('role', 'listitem');
      row.setAttribute('tabindex', '0');

      const kindIcon = document.createElement('div');
      kindIcon.className = 'urgent-kind-icon';
      kindIcon.textContent = kind === 'return' ? '↩️' : '🛡️';
      kindIcon.setAttribute('aria-hidden', 'true');

      const info = document.createElement('div');
      info.className = 'urgent-prod-info';

      const name = document.createElement('div');
      name.className = 'urgent-prod-name';
      name.textContent = product.name; // safe: textContent

      const type = document.createElement('div');
      type.className = 'urgent-prod-type';
      type.textContent = kind === 'return' ? tr.return : tr.warranty;

      info.appendChild(name);
      info.appendChild(type);

      /* Countdown badge */
      const cd = document.createElement('div');
      const cdClass = days === 0 ? 'days-0' : days === 1 ? 'days-1' : days === 2 ? 'days-2' : 'days-3';
      cd.className = 'urgent-countdown ' + cdClass;
      cd.setAttribute('aria-label', days + ' días restantes');

      const cdNum = document.createElement('div');
      cdNum.className = 'countdown-num';
      cdNum.textContent = days === 0 ? '!' : days;

      const cdUnit = document.createElement('div');
      cdUnit.className = 'countdown-unit';
      cdUnit.textContent = days === 0 ? tr.today : tr.unit;

      cd.appendChild(cdNum);
      cd.appendChild(cdUnit);

      row.appendChild(kindIcon);
      row.appendChild(info);
      row.appendChild(cd);

      // Click a row → open that product detail
      row.addEventListener('click', () => {
        onDismiss();
        // Trigger detail view if app.js is loaded
        if (typeof openDetail === 'function') {
          openDetail(product.id);
        } else {
          // Navigate to products view
          if (typeof switchView === 'function') switchView('alerts');
        }
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); }
      });

      list.appendChild(row);
    });

    /* Footer */
    const footer = document.createElement('div');
    footer.className = 'urgent-footer';

    const btnGo = document.createElement('button');
    btnGo.className = 'btn-urgent-primary';
    btnGo.textContent = tr.btnGo;
    btnGo.addEventListener('click', () => {
      // Request notification permission on user gesture
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') tryBrowserNotification(items);
        });
      }
      onGo();
    });

    const btnDismiss = document.createElement('button');
    btnDismiss.className = 'btn-urgent-secondary';
    btnDismiss.textContent = tr.btnDismiss;
    btnDismiss.addEventListener('click', onDismiss);

    footer.appendChild(btnGo);
    footer.appendChild(btnDismiss);

    /* Assemble */
    panel.appendChild(iconZone);
    panel.appendChild(header);
    panel.appendChild(list);
    panel.appendChild(footer);
    overlay.appendChild(panel);

    return overlay;
  }

  /* ── Particle burst (visual effect on show) ─────────────────── */
  function burstParticles() {
    const colors = ['#ff4f6e','#ff8c42','#ffbe3d','#ff6ca8','#fff'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      const size = 4 + Math.random() * 6;
      const angle = (Math.PI * 2 * i) / 18;
      const dist  = 80 + Math.random() * 60;
      const color = colors[Math.floor(Math.random() * colors.length)];
      Object.assign(p.style, {
        position: 'fixed',
        top: '50%', left: '50%',
        width: size + 'px', height: size + 'px',
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
        zIndex: '3000',
        opacity: '1',
        transform: 'translate(-50%,-50%)',
        transition: `transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease`,
        willChange: 'transform, opacity',
      });
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        p.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 800);
    }
  }

  /* ── Shake the badge on header ──────────────────────────────── */
  function shakeHeader() {
    const badge = document.getElementById('alerts-badge');
    if (!badge) return;
    badge.style.animation = 'none';
    requestAnimationFrame(() => {
      badge.style.animation = '';
      badge.style.transform = 'scale(1.5)';
      setTimeout(() => { badge.style.transform = ''; }, 300);
    });
  }

  /* ── Add urgent dot to nav bell ─────────────────────────────── */
  function addUrgentDotToNav(count) {
    const alertsBtn = document.getElementById('nav-alerts');
    if (!alertsBtn) return;

    // Update badge count
    const badge = document.getElementById('alerts-badge');
    if (badge) {
      badge.textContent = count;
      badge.hidden = false;
    }

    // Add red dot to button
    if (!alertsBtn.querySelector('.urgent-header-dot')) {
      alertsBtn.style.position = 'relative';
      const dot = document.createElement('span');
      dot.className = 'urgent-header-dot';
      dot.setAttribute('aria-hidden', 'true');
      alertsBtn.appendChild(dot);
    }

    // Make the header nav button flash
    alertsBtn.style.color = '#ff8fa8';
    alertsBtn.style.animation = 'none';
    setTimeout(() => alertsBtn.style.animation = '', 0);
  }

  /* ── Main: show alert ───────────────────────────────────────── */
  function showUrgentAlert() {
    // Only run if there is a valid session
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s || !s.token || Date.now() > s.expiresAt) return;
    } catch { return; }

    const items = findUrgentItems();
    if (items.length === 0) return;

    // Always update badge/nav indicator
    addUrgentDotToNav(items.length);

    // Don't show modal again if dismissed this session for same items
    if (wasDismissedThisSession(items)) return;

    function close() {
      saveDismissed(items);
      const ov = document.getElementById('urgent-overlay');
      if (ov) {
        ov.style.animation = 'urgentFadeIn 0.25s ease reverse forwards';
        setTimeout(() => ov.remove(), 260);
        document.body.style.overflow = '';
      }
    }

    function goToAlerts() {
      close();
      if (typeof switchView === 'function') {
        switchView('alerts');
      }
    }

    const overlay = buildOverlay(items, goToAlerts, close);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Visual effects
    setTimeout(burstParticles, 300);
    setTimeout(shakeHeader, 500);

    // Browser notification (silent attempt)
    tryBrowserNotification(items);

    // Close on overlay background click (but not panel)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);

    // Focus first button for accessibility
    setTimeout(() => {
      const first = overlay.querySelector('.btn-urgent-primary');
      if (first) first.focus();
    }, 400);
  }

  /* ── Boot ───────────────────────────────────────────────────── */
  // Wait for app.js to finish rendering (slight delay)
  function boot() {
    // Delay to let app.js render first
    setTimeout(showUrgentAlert, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
