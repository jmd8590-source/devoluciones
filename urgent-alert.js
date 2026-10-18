/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Urgent Alert System (JS)
   Muestra aviso cuando un plazo vence en ≤3 días
   ═══════════════════════════════════════════════════════════════ */

'use strict';

(function () {

  /* ── Config ─────────────────────────────────────────────────── */
  const WARN_DAYS      = 3;
  const DISMISSED_KEY  = 'gp_alerts_dismissed_v1';

  /* ── i18n ───────────────────────────────────────────────────── */
  function lang() { return localStorage.getItem('gp_lang') || 'es'; }
  const T = {
    es: {
      title:      'Plazos a punto de vencer',
      subtitle:   'Los siguientes productos requieren tu atención. Tienes 3 días o menos.',
      return:     'Devolución',
      warranty:   'Garantía',
      days:       (n) => n === 0 ? 'Hoy' : n === 1 ? '1 día' : `${n} días`,
      unit:       'días',
      today:      'HOY',
      btnGo:      'Ver productos urgentes',
      btnDismiss: 'Entendido',
      notifTitle: 'GarantíasPro — Plazos urgentes',
      notifBody:  (n) => `Tienes ${n} producto${n > 1 ? 's' : ''} con plazo a punto de vencer.`,
    },
    en: {
      title:      'Deadlines expiring soon',
      subtitle:   'The following products need your attention. You have 3 days or less.',
      return:     'Return',
      warranty:   'Warranty',
      days:       (n) => n === 0 ? 'Today' : n === 1 ? '1 day' : `${n} days`,
      unit:       'days',
      today:      'TODAY',
      btnGo:      'View urgent products',
      btnDismiss: 'Dismiss',
      notifTitle: 'GarantíasPro — Urgent deadlines',
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
  function getActiveProducts() {
    if (typeof window.getLoadedProducts === 'function') {
      return window.getLoadedProducts();
    }
    return [];
  }

  function findUrgentItems() {
    const products = getActiveProducts();
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
          const alreadyHave = items.some(i => i.product.id === p.id && i.deadline === dl);
          if (!alreadyHave) {
            items.push({ product: p, kind: 'warranty', days, deadline: dl });
          }
        }
      }
    });
    items.sort((a, b) => a.days - b.days);
    return items;
  }

  /* ── Was already dismissed this session? ────────────────────── */
  function wasDismissedThisSession(items) {
    try {
      const raw = sessionStorage.getItem(DISMISSED_KEY);
      if (!raw) return false;
      const dismissed = JSON.parse(raw);
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
    if (Notification.permission === 'granted') {
      try {
        new Notification(t().notifTitle, {
          body: t().notifBody(items.length),
          tag: 'garantias-urgent',
        });
      } catch {}
    }
  }

  /* ── Build DOM ──────────────────────────────────────────────── */
  function buildOverlay(items, onGo, onDismiss) {
    const tr = t();

    const overlay = document.createElement('div');
    overlay.className = 'urgent-overlay';
    overlay.id = 'urgent-overlay';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'urgent-title');

    const panel = document.createElement('div');
    panel.className = 'urgent-panel';

    /* Icon zone */
    const iconZone = document.createElement('div');
    iconZone.className = 'urgent-icon-zone';
    const inner = document.createElement('div');
    inner.className = 'urgent-icon-inner';
    inner.innerHTML = iconSvg('urgent', 32, 2);
    iconZone.appendChild(inner);

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
      kindIcon.innerHTML = iconSvg(kind === 'return' ? 'return' : 'shield', 18);

      const info = document.createElement('div');
      info.className = 'urgent-prod-info';

      const name = document.createElement('div');
      name.className = 'urgent-prod-name';
      name.textContent = product.name;

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

      row.addEventListener('click', () => {
        onDismiss();
        if (typeof openDetail === 'function') {
          openDetail(product.id);
        } else if (typeof switchView === 'function') {
          switchView('alerts');
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

    panel.appendChild(iconZone);
    panel.appendChild(header);
    panel.appendChild(list);
    panel.appendChild(footer);
    overlay.appendChild(panel);

    return overlay;
  }

  /* ── Add urgent dot to nav bell ─────────────────────────────── */
  function addUrgentDotToNav(count) {
    const alertsBtn = document.getElementById('nav-alerts');
    if (!alertsBtn) return;

    const badge = document.getElementById('alerts-badge');
    if (badge) {
      badge.textContent = count;
      badge.hidden = false;
    }

    if (!alertsBtn.querySelector('.urgent-header-dot')) {
      alertsBtn.style.position = 'relative';
      const dot = document.createElement('span');
      dot.className = 'urgent-header-dot';
      dot.setAttribute('aria-hidden', 'true');
      alertsBtn.appendChild(dot);
    }
  }

  /* ── Main: show alert ───────────────────────────────────────── */
  function checkAndShowUrgentAlert() {
    const items = findUrgentItems();
    if (items.length === 0) return;

    addUrgentDotToNav(items.length);

    if (wasDismissedThisSession(items)) return;

    function close() {
      saveDismissed(items);
      const ov = document.getElementById('urgent-overlay');
      if (ov) {
        ov.remove();
        document.body.style.overflow = '';
      }
    }

    function goToAlerts() {
      close();
      if (typeof switchView === 'function') switchView('alerts');
    }

    const overlay = buildOverlay(items, goToAlerts, close);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    tryBrowserNotification(items);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    const escHandler = (e) => {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);

    setTimeout(() => {
      const first = overlay.querySelector('.btn-urgent-primary');
      if (first) first.focus();
    }, 200);
  }

  window.checkUrgentAlerts = checkAndShowUrgentAlert;

  function boot() {
    // Escucha el evento 'productsReady' emitido por app.js cuando los productos han cargado
    window.addEventListener('productsReady', () => {
      setTimeout(checkAndShowUrgentAlert, 400);
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
