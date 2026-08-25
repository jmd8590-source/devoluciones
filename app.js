/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Main Application Logic
   Stack: Vanilla JS (ES2021) + LocalStorage
   Security: DOMPurify-like escaping, CSP-compatible, no eval
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. INTERNATIONALISATION (i18n)
══════════════════════════════════════════════════════════════ */
const TRANSLATIONS = {
  es: {
    'nav.dashboard':  'Inicio',
    'nav.products':   'Productos',
    'nav.alerts':     'Alertas',
    'btn.addProduct': 'Nuevo producto',
    'btn.cancel':     'Cancelar',
    'btn.save':       'Guardar producto',
    'btn.save.edit':  'Guardar cambios',
    'dashboard.title':  'Tu resumen',
    'dashboard.urgent': '⚡ Urgentes',
    'dashboard.recent': '🕓 Recientes',
    'stat.total':    'Productos',
    'stat.return':   'En periodo devolución',
    'stat.warranty': 'Garantías activas',
    'stat.expired':  'Próximas a vencer',
    'products.title':    'Mis productos',
    'products.subtitle': 'Gestiona tus garantías y devoluciones',
    'alerts.title':       'Alertas',
    'alerts.subtitle':    'Productos que requieren tu atención',
    'alerts.empty.title': '¡Todo en orden!',
    'alerts.empty.sub':   'No tienes alertas pendientes',
    'search.placeholder': 'Buscar producto…',
    'filter.all':      'Todos',
    'filter.return':   'Devolución',
    'filter.warranty': 'Garantía',
    'filter.expired':  'Vencido',
    'empty.title': 'Sin productos aún',
    'empty.sub':   'Pulsa "Nuevo producto" para empezar',
    'modal.title.add':  'Nuevo producto',
    'modal.title.edit': 'Editar producto',
    'form.ticket.section': '🎟️ Ticket de compra',
    'form.ticket.drag':    'Arrastra la foto o pulsa aquí',
    'form.ticket.formats': 'JPG, PNG, WEBP — máx. 5 MB',
    'form.ticket.remove':  '✕ Eliminar foto',
    'form.info.section':   '📦 Información del producto',
    'form.name.label':       'Nombre del producto',
    'form.name.placeholder': 'Ej: iPhone 15 Pro',
    'form.brand.label':       'Marca',
    'form.brand.placeholder': 'Ej: Apple',
    'form.price.label':  'Precio (€)',
    'form.store.label':       'Tienda / Vendedor',
    'form.store.placeholder': 'Ej: El Corte Inglés',
    'form.purchase.label': 'Fecha de compra',
    'form.notes.label':       'Notas adicionales',
    'form.notes.placeholder': 'Número de serie, color, etc.',
    'form.return.section':              '↩️ Periodo de devolución',
    'form.ret.days.label':              'Días para devolver',
    'form.ret.start.label':             'Fecha inicio',
    'form.ret.conditions.label':        'Condiciones de devolución',
    'form.ret.conditions.placeholder':  'Debe estar sin abrir, con ticket original…',
    'form.warranty.section':            '🛡️ Garantía',
    'form.war.start.label':             'Inicio garantía',
    'form.war.years.label':             'Años de garantía',
    'form.war.covers.label':            '✅ Qué cubre',
    'form.war.covers.placeholder':      'Defectos de fabricación, fallos de hardware…',
    'form.war.nocovers.label':          '❌ Qué NO cubre',
    'form.war.nocovers.placeholder':    'Daños por agua, roturas accidentales, mal uso…',
    'confirm.title':  '¿Eliminar producto?',
    'confirm.text':   'Esta acción no se puede deshacer.',
    'confirm.delete': 'Eliminar',
    'toast.saved':    '✅ Producto guardado',
    'toast.updated':  '✏️ Producto actualizado',
    'toast.deleted':  '🗑️ Producto eliminado',
    'toast.error':    '⚠️ Completa los campos obligatorios',
    'toast.photo.big':'⚠️ La foto supera los 5 MB',
    'toast.photo.err':'⚠️ Formato no permitido',
    'detail.purchaseDate':   'Fecha de compra',
    'detail.store':          'Tienda',
    'detail.brand':          'Marca',
    'detail.price':          'Precio',
    'detail.notes':          'Notas',
    'detail.return.title':   'Periodo de devolución',
    'detail.return.start':   'Inicio',
    'detail.return.end':     'Fin',
    'detail.return.left':    'Días restantes',
    'detail.return.cond':    'Condiciones',
    'detail.warranty.title': 'Garantía',
    'detail.warranty.start': 'Inicio',
    'detail.warranty.end':   'Fin',
    'detail.warranty.years': 'Años cubiertos',
    'detail.warranty.covers':'Cubre',
    'detail.warranty.nocovers':'No cubre',
    'label.days.left':  'días restantes',
    'label.days.left.singular': 'día restante',
    'label.expired.return':   'Devolución expirada',
    'label.expired.warranty': 'Garantía expirada',
    'label.return.active':    'Devolución activa',
    'label.warranty.active':  'Garantía activa',
    'label.no.return':        'Sin devolución',
    'label.no.warranty':      'Sin garantía',
    'label.no.data':          'No indicado',
    'label.of':               'de',
    'label.years':            'años',
    'label.days':             'días',
    'label.day':              'día',
    'alert.return.urgent':   'Devolución: quedan {d} día(s)',
    'alert.warranty.urgent': 'Garantía: quedan {d} día(s)',
    'alert.return.expiring': 'Devolución vence pronto',
    'alert.warranty.expiring':'Garantía vence pronto',
    'no.ticket': 'Sin foto de ticket',
  },
  en: {
    'nav.dashboard':  'Home',
    'nav.products':   'Products',
    'nav.alerts':     'Alerts',
    'btn.addProduct': 'New product',
    'btn.cancel':     'Cancel',
    'btn.save':       'Save product',
    'btn.save.edit':  'Save changes',
    'dashboard.title':  'Your summary',
    'dashboard.urgent': '⚡ Urgent',
    'dashboard.recent': '🕓 Recent',
    'stat.total':    'Products',
    'stat.return':   'In return period',
    'stat.warranty': 'Active warranties',
    'stat.expired':  'Expiring soon',
    'products.title':    'My products',
    'products.subtitle': 'Manage your warranties and returns',
    'alerts.title':       'Alerts',
    'alerts.subtitle':    'Products that need your attention',
    'alerts.empty.title': 'All clear!',
    'alerts.empty.sub':   'No pending alerts',
    'search.placeholder': 'Search product…',
    'filter.all':      'All',
    'filter.return':   'Return',
    'filter.warranty': 'Warranty',
    'filter.expired':  'Expired',
    'empty.title': 'No products yet',
    'empty.sub':   'Press "New product" to get started',
    'modal.title.add':  'New product',
    'modal.title.edit': 'Edit product',
    'form.ticket.section': '🎟️ Purchase receipt',
    'form.ticket.drag':    'Drag photo or click here',
    'form.ticket.formats': 'JPG, PNG, WEBP — max 5 MB',
    'form.ticket.remove':  '✕ Remove photo',
    'form.info.section':   '📦 Product information',
    'form.name.label':       'Product name',
    'form.name.placeholder': 'e.g. iPhone 15 Pro',
    'form.brand.label':       'Brand',
    'form.brand.placeholder': 'e.g. Apple',
    'form.price.label':  'Price (€)',
    'form.store.label':       'Store / Seller',
    'form.store.placeholder': 'e.g. Amazon',
    'form.purchase.label': 'Purchase date',
    'form.notes.label':       'Additional notes',
    'form.notes.placeholder': 'Serial number, colour, etc.',
    'form.return.section':              '↩️ Return period',
    'form.ret.days.label':              'Days to return',
    'form.ret.start.label':             'Start date',
    'form.ret.conditions.label':        'Return conditions',
    'form.ret.conditions.placeholder':  'Must be unopened, with original receipt…',
    'form.warranty.section':            '🛡️ Warranty',
    'form.war.start.label':             'Warranty start',
    'form.war.years.label':             'Years of warranty',
    'form.war.covers.label':            '✅ What it covers',
    'form.war.covers.placeholder':      'Manufacturing defects, hardware failures…',
    'form.war.nocovers.label':          '❌ What it does NOT cover',
    'form.war.nocovers.placeholder':    'Water damage, accidental breakage, misuse…',
    'confirm.title':  'Delete product?',
    'confirm.text':   'This action cannot be undone.',
    'confirm.delete': 'Delete',
    'toast.saved':    '✅ Product saved',
    'toast.updated':  '✏️ Product updated',
    'toast.deleted':  '🗑️ Product deleted',
    'toast.error':    '⚠️ Fill in required fields',
    'toast.photo.big':'⚠️ Photo exceeds 5 MB',
    'toast.photo.err':'⚠️ Format not allowed',
    'detail.purchaseDate':   'Purchase date',
    'detail.store':          'Store',
    'detail.brand':          'Brand',
    'detail.price':          'Price',
    'detail.notes':          'Notes',
    'detail.return.title':   'Return period',
    'detail.return.start':   'Start',
    'detail.return.end':     'End',
    'detail.return.left':    'Days remaining',
    'detail.return.cond':    'Conditions',
    'detail.warranty.title': 'Warranty',
    'detail.warranty.start': 'Start',
    'detail.warranty.end':   'End',
    'detail.warranty.years': 'Years covered',
    'detail.warranty.covers':'Covers',
    'detail.warranty.nocovers':'Does not cover',
    'label.days.left':  'days remaining',
    'label.days.left.singular': 'day remaining',
    'label.expired.return':   'Return expired',
    'label.expired.warranty': 'Warranty expired',
    'label.return.active':    'Return active',
    'label.warranty.active':  'Warranty active',
    'label.no.return':        'No return',
    'label.no.warranty':      'No warranty',
    'label.no.data':          'Not specified',
    'label.of':               'of',
    'label.years':            'years',
    'label.days':             'days',
    'label.day':              'day',
    'alert.return.urgent':   'Return: {d} day(s) left',
    'alert.warranty.urgent': 'Warranty: {d} day(s) left',
    'alert.return.expiring': 'Return expiring soon',
    'alert.warranty.expiring':'Warranty expiring soon',
    'no.ticket': 'No receipt photo',
  }
};

let currentLang = localStorage.getItem('gp_lang') || 'es';

function t(key, vars) {
  let str = (TRANSLATIONS[currentLang] || TRANSLATIONS.es)[key] || key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replaceAll('{' + k + '}', v);
    });
  }
  return str;
}

function applyTranslations() {
  // text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  // lang toggle
  const flagEl = document.getElementById('lang-flag');
  const codeEl = document.getElementById('lang-code');
  if (flagEl) flagEl.textContent = currentLang === 'es' ? '🇪🇸' : '🇬🇧';
  if (codeEl) codeEl.textContent = currentLang === 'es' ? 'ES' : 'EN';
  document.documentElement.lang = currentLang;
}

/* ══════════════════════════════════════════════════════════════
   2. SECURITY UTILITIES
══════════════════════════════════════════════════════════════ */

// HTML entity escaping — prevents XSS when inserting into DOM via innerHTML
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Sanitize storage keys
const STORAGE_KEY = 'gp_products_v2';

// Validate and clamp numbers
function safeInt(val, min, max, fallback) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}
function safeFloat(val, min, max, fallback) {
  const n = parseFloat(val);
  if (isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}
// Validate date strings
function safeDate(str) {
  if (!str || typeof str !== 'string') return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return '';
  const d = new Date(str + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return str;
}
// Sanitize text (strip control chars, limit length)
function safeText(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLen);
}

/* ══════════════════════════════════════════════════════════════
   3. DATA LAYER (LocalStorage)
══════════════════════════════════════════════════════════════ */
function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(p => p && typeof p === 'object' && p.id);
  } catch {
    return [];
  }
}

function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    showToast('⚠️ No se pudo guardar (almacenamiento lleno)', 'warn');
  }
}

function generateId() {
  // Secure random ID
  const arr = new Uint32Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr, n => n.toString(16).padStart(8, '0')).join('-');
}

/* ══════════════════════════════════════════════════════════════
   4. DATE UTILITIES
══════════════════════════════════════════════════════════════ */
function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(fromStr, toStr) {
  if (!fromStr || !toStr) return null;
  const a = new Date(fromStr + 'T00:00:00');
  const b = new Date(toStr + 'T00:00:00');
  if (isNaN(a) || isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

// Returns days remaining until a deadline. Negative = past.
function daysUntil(dateStr) {
  if (!dateStr) return null;
  return daysBetween(today(), dateStr);
}

function addDays(dateStr, days) {
  if (!dateStr || days == null) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addYears(dateStr, years) {
  if (!dateStr || years == null) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setFullYear(d.getFullYear() + Math.floor(years));
  const extra = years - Math.floor(years);
  if (extra > 0) d.setDate(d.getDate() + Math.round(extra * 365));
  return d.toISOString().slice(0, 10);
}

function fmtDate(str) {
  if (!str) return t('label.no.data');
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function fmtPrice(val) {
  if (!val && val !== 0) return '';
  return new Intl.NumberFormat(currentLang === 'es' ? 'es-ES' : 'en-GB', {
    style: 'currency', currency: 'EUR'
  }).format(val);
}

/* ══════════════════════════════════════════════════════════════
   5. PRODUCT STATUS COMPUTATION
══════════════════════════════════════════════════════════════ */
function getReturnDeadline(p) {
  if (!p.retStart || !p.retDays) return null;
  return addDays(p.retStart, p.retDays);
}

function getWarrantyDeadline(p) {
  if (!p.warStart || !p.warYears) return null;
  return addYears(p.warStart, p.warYears);
}

function getReturnStatus(p) {
  const dl = getReturnDeadline(p);
  if (!dl) return { type: 'none', days: null };
  const days = daysUntil(dl);
  if (days === null) return { type: 'none', days: null };
  if (days < 0)  return { type: 'expired', days };
  if (days <= 3) return { type: 'danger', days };
  if (days <= 7) return { type: 'warn', days };
  return { type: 'ok', days };
}

function getWarrantyStatus(p) {
  const dl = getWarrantyDeadline(p);
  if (!dl) return { type: 'none', days: null };
  const days = daysUntil(dl);
  if (days === null) return { type: 'none', days: null };
  if (days < 0)   return { type: 'expired', days };
  if (days <= 30) return { type: 'danger', days };
  if (days <= 90) return { type: 'warn', days };
  return { type: 'ok', days };
}

// Returns true if product needs attention (urgent)
function isUrgent(p) {
  const rs = getReturnStatus(p);
  const ws = getWarrantyStatus(p);
  return (rs.type === 'danger' || ws.type === 'danger');
}

function isExpired(p) {
  const rs = getReturnStatus(p);
  const ws = getWarrantyStatus(p);
  return (rs.type === 'expired' && ws.type !== 'ok' && ws.type !== 'warn' && ws.type !== 'danger');
}

/* ══════════════════════════════════════════════════════════════
   6. TOAST NOTIFICATIONS
══════════════════════════════════════════════════════════════ */
function showToast(msg, type = 'ok') {
  const icons = { ok: '✅', warn: '⚠️', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');

  const iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.textContent = icons[type] || icons.info;

  const msgEl = document.createElement('span');
  msgEl.className = 'toast-msg';
  msgEl.textContent = msg; // safe: no html

  toast.appendChild(iconEl);
  toast.appendChild(msgEl);
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3000);
}

/* ══════════════════════════════════════════════════════════════
   7. VIEW NAVIGATION
══════════════════════════════════════════════════════════════ */
let currentView = 'dashboard';

function switchView(name) {
  currentView = name;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const view = document.getElementById('view-' + name);
  if (view) view.classList.add('active');
  const btn = document.getElementById('nav-' + name);
  if (btn) btn.classList.add('active');

  if (name === 'dashboard') renderDashboard();
  if (name === 'products')  renderProducts();
  if (name === 'alerts')    renderAlerts();
}

/* ══════════════════════════════════════════════════════════════
   8. DASHBOARD RENDER
══════════════════════════════════════════════════════════════ */
function renderDashboard() {
  const products = loadProducts();

  // Date
  const dateEl = document.getElementById('dashboard-date');
  if (dateEl) {
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-GB', opts);
  }

  // Stats
  const returnActive = products.filter(p => {
    const s = getReturnStatus(p); return s.type === 'ok' || s.type === 'warn' || s.type === 'danger';
  });
  const warActive = products.filter(p => {
    const s = getWarrantyStatus(p); return s.type === 'ok' || s.type === 'warn' || s.type === 'danger';
  });
  const expiring = products.filter(p => {
    return getReturnStatus(p).type === 'warn' || getWarrantyStatus(p).type === 'warn' ||
           getReturnStatus(p).type === 'danger' || getWarrantyStatus(p).type === 'danger';
  });

  setEl('stat-total',   products.length);
  setEl('stat-return',  returnActive.length);
  setEl('stat-warranty', warActive.length);
  setEl('stat-expired', expiring.length);

  // Alert badge
  const badge = document.getElementById('alerts-badge');
  if (badge) {
    const urgentCount = products.filter(isUrgent).length;
    badge.textContent = urgentCount;
    badge.hidden = urgentCount === 0;
  }

  // Urgent list
  const urgentList = document.getElementById('urgent-list');
  if (urgentList) {
    const urgents = products.filter(isUrgent)
      .sort((a, b) => {
        const da = Math.min(
          getReturnStatus(a).days ?? 99999,
          getWarrantyStatus(a).days ?? 99999
        );
        const db = Math.min(
          getReturnStatus(b).days ?? 99999,
          getWarrantyStatus(b).days ?? 99999
        );
        return da - db;
      });
    urgentList.innerHTML = '';
    if (urgents.length === 0) {
      urgentList.innerHTML = '<p style="font-size:14px;color:var(--t-muted);padding:8px 0">— Sin urgencias —</p>';
    } else {
      urgents.slice(0, 5).forEach(p => urgentList.appendChild(buildMiniCard(p, 'urgent')));
    }
  }

  // Recent list
  const recentList = document.getElementById('recent-list');
  if (recentList) {
    const recent = [...products]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 5);
    recentList.innerHTML = '';
    recent.forEach(p => recentList.appendChild(buildMiniCard(p, 'recent')));
  }
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function buildMiniCard(p, mode) {
  const rs = getReturnStatus(p);
  const ws = getWarrantyStatus(p);

  // Determine dominant status
  let statusType = 'ok';
  let statusDays = null;
  let statusLabel = '';

  if (rs.type === 'danger' || (rs.type !== 'none' && rs.type !== 'expired' && (ws.type === 'none' || ws.type === 'expired'))) {
    statusType = rs.type;
    statusDays = rs.days;
    statusLabel = t('label.return.active');
  } else if (ws.type !== 'none') {
    statusType = ws.type;
    statusDays = ws.days;
    statusLabel = t('label.warranty.active');
  }

  const dotColor = { ok: 'var(--c-green)', warn: 'var(--c-amber)', danger: 'var(--c-red)', expired: 'var(--t-muted)', none: 'var(--t-muted)' };
  const badgeStyle = { ok: 'pill-ok', warn: 'pill-warn', danger: 'pill-danger', expired: 'pill-expired', none: '' };

  const card = document.createElement('div');
  card.className = 'mini-card';
  card.setAttribute('role', 'listitem');

  const dot = document.createElement('div');
  dot.className = 'mini-card-dot';
  dot.style.background = dotColor[statusType] || 'var(--t-muted)';

  const info = document.createElement('div');
  info.className = 'mini-card-info';
  const name = document.createElement('div');
  name.className = 'mini-card-name';
  name.textContent = p.name;
  const sub = document.createElement('div');
  sub.className = 'mini-card-sub';
  sub.textContent = statusLabel || (p.store ? p.store : '');
  info.appendChild(name);
  info.appendChild(sub);

  const badge = document.createElement('span');
  badge.className = 'mini-card-badge pill ' + (badgeStyle[statusType] || '');
  if (statusDays !== null && statusDays >= 0) {
    badge.textContent = statusDays === 1
      ? `1 ${t('label.day')}`
      : `${statusDays} ${t('label.days')}`;
  } else if (statusType === 'expired') {
    badge.textContent = '✕';
  }

  card.appendChild(dot);
  card.appendChild(info);
  if (badge.textContent) card.appendChild(badge);

  card.addEventListener('click', () => openDetail(p.id));
  return card;
}

/* ══════════════════════════════════════════════════════════════
   9. PRODUCTS RENDER
══════════════════════════════════════════════════════════════ */
let currentFilter = 'all';
let currentSearch = '';

function renderProducts() {
  const products = loadProducts();
  const grid = document.getElementById('products-grid');
  const emptyState = document.getElementById('empty-state');
  if (!grid) return;

  let filtered = products.filter(p => {
    // Search
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const match = (p.name || '').toLowerCase().includes(q) ||
                    (p.brand || '').toLowerCase().includes(q) ||
                    (p.store || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    // Filter
    if (currentFilter === 'return') {
      const rs = getReturnStatus(p);
      return rs.type !== 'none';
    }
    if (currentFilter === 'warranty') {
      const ws = getWarrantyStatus(p);
      return ws.type !== 'none';
    }
    if (currentFilter === 'expired') {
      const rs = getReturnStatus(p);
      const ws = getWarrantyStatus(p);
      return rs.type === 'expired' || ws.type === 'expired';
    }
    return true;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState && (emptyState.hidden = false);
    return;
  }
  emptyState && (emptyState.hidden = true);

  filtered
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .forEach((p, i) => {
      const card = buildProductCard(p);
      card.style.animationDelay = (i * 40) + 'ms';
      grid.appendChild(card);
    });
}

function buildProductCard(p) {
  const rs = getReturnStatus(p);
  const ws = getWarrantyStatus(p);
  const retDl = getReturnDeadline(p);
  const warDl = getWarrantyDeadline(p);

  const card = document.createElement('article');
  card.className = 'prod-card';
  card.setAttribute('role', 'listitem');
  card.dataset.id = p.id;
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', p.name);

  // ── Ticket image
  if (p.ticketImage) {
    const img = document.createElement('img');
    img.className = 'card-ticket';
    img.alt = 'Ticket de ' + escHtml(p.name);
    img.src = p.ticketImage; // already validated data URL
    card.appendChild(img);
  } else {
    const noTicket = document.createElement('div');
    noTicket.className = 'card-no-ticket';
    noTicket.textContent = '🛍️';
    card.appendChild(noTicket);
  }

  // ── Body
  const body = document.createElement('div');
  body.className = 'card-body';

  // Header
  const header = document.createElement('div');
  header.className = 'card-header';
  const nameWrap = document.createElement('div');
  const nameEl = document.createElement('div');
  nameEl.className = 'card-name';
  nameEl.textContent = p.name;
  nameWrap.appendChild(nameEl);
  if (p.brand) {
    const brandEl = document.createElement('div');
    brandEl.className = 'card-brand';
    brandEl.textContent = p.brand;
    nameWrap.appendChild(brandEl);
  }
  header.appendChild(nameWrap);
  body.appendChild(header);

  // Pills
  const pills = document.createElement('div');
  pills.className = 'card-pills';

  if (rs.type !== 'none') {
    pills.appendChild(buildPill(rs, 'return', retDl));
  }
  if (ws.type !== 'none') {
    pills.appendChild(buildPill(ws, 'warranty', warDl));
  }
  if (rs.type === 'none' && ws.type === 'none') {
    const p2 = document.createElement('span');
    p2.className = 'pill pill-info';
    p2.textContent = t('label.no.data');
    pills.appendChild(p2);
  }
  body.appendChild(pills);

  // Return progress bar
  if (rs.type !== 'none' && rs.days !== null && p.retDays) {
    const elapsed = p.retDays - Math.max(rs.days, 0);
    const pct = Math.min(100, Math.max(0, (elapsed / p.retDays) * 100));
    body.appendChild(buildProgressBar(pct, rs.type, t('label.return.active'), `${Math.max(rs.days,0)} ${t('label.days')}`));
  }

  // Warranty progress bar
  if (ws.type !== 'none' && ws.days !== null && p.warYears && p.warStart) {
    const totalDays = Math.round(p.warYears * 365);
    const elapsed = totalDays - Math.max(ws.days, 0);
    const pct = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
    body.appendChild(buildProgressBar(pct, ws.type, t('label.warranty.active'), `${Math.max(ws.days,0)} ${t('label.days')}`));
  }

  card.appendChild(body);

  // ── Footer
  const footer = document.createElement('div');
  footer.className = 'card-footer';
  const dateEl = document.createElement('span');
  dateEl.className = 'card-date';
  dateEl.textContent = p.purchaseDate ? fmtDate(p.purchaseDate) : '';
  footer.appendChild(dateEl);

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-icon';
  editBtn.setAttribute('aria-label', 'Editar');
  editBtn.title = 'Editar';
  editBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  editBtn.addEventListener('click', (e) => { e.stopPropagation(); openEdit(p.id); });

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-icon btn-icon-danger';
  delBtn.setAttribute('aria-label', 'Eliminar');
  delBtn.title = 'Eliminar';
  delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
  delBtn.addEventListener('click', (e) => { e.stopPropagation(); confirmDelete(p.id); });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  footer.appendChild(actions);
  card.appendChild(footer);

  card.addEventListener('click', () => openDetail(p.id));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(p.id); } });

  return card;
}

function buildPill(status, kind, deadline) {
  const pill = document.createElement('span');
  const classMap = { ok: 'pill-ok', warn: 'pill-warn', danger: 'pill-danger', expired: 'pill-expired', none: '' };
  const iconMap = { return: '↩️', warranty: '🛡️' };
  pill.className = 'pill ' + (classMap[status.type] || 'pill-info');

  let text = '';
  if (status.type === 'expired') {
    text = kind === 'return' ? t('label.expired.return') : t('label.expired.warranty');
  } else if (status.days !== null) {
    text = iconMap[kind] + ' ' + (status.days === 1
      ? `1 ${t('label.day.left.singular') || t('label.days.left')}`
      : `${status.days} ${t('label.days.left')}`);
  }
  pill.textContent = text;
  return pill;
}

function buildProgressBar(pct, statusType, label, rightLabel) {
  const wrap = document.createElement('div');
  wrap.className = 'card-progress';
  const lbl = document.createElement('div');
  lbl.className = 'progress-label';

  const l = document.createElement('span');
  l.textContent = label;
  const r = document.createElement('span');
  r.textContent = rightLabel;
  lbl.appendChild(l); lbl.appendChild(r);

  const track = document.createElement('div');
  track.className = 'progress-track';
  const fill = document.createElement('div');
  fill.className = 'progress-fill ' + (statusType === 'ok' ? 'ok' : statusType === 'warn' ? 'warn' : 'danger');
  fill.style.width = pct + '%';
  track.appendChild(fill);

  wrap.appendChild(lbl);
  wrap.appendChild(track);
  return wrap;
}

/* ══════════════════════════════════════════════════════════════
   10. ALERTS RENDER
══════════════════════════════════════════════════════════════ */
function renderAlerts() {
  const products = loadProducts();
  const list = document.getElementById('alerts-list');
  const emptyAlerts = document.getElementById('alerts-empty');
  if (!list) return;

  list.innerHTML = '';

  const alertItems = [];
  products.forEach(p => {
    const rs = getReturnStatus(p);
    const ws = getWarrantyStatus(p);
    if (rs.type === 'danger' || rs.type === 'warn') {
      alertItems.push({ p, status: rs, kind: 'return' });
    }
    if (ws.type === 'danger' || ws.type === 'warn') {
      alertItems.push({ p, status: ws, kind: 'warranty' });
    }
  });

  alertItems.sort((a, b) => (a.status.days ?? 99999) - (b.status.days ?? 99999));

  if (alertItems.length === 0) {
    emptyAlerts && (emptyAlerts.hidden = false);
  } else {
    emptyAlerts && (emptyAlerts.hidden = true);
    alertItems.forEach(({ p, status, kind }, i) => {
      const item = buildAlertItem(p, status, kind);
      item.style.animationDelay = (i * 50) + 'ms';
      list.appendChild(item);
    });
  }

  // Update badge
  const badge = document.getElementById('alerts-badge');
  if (badge) {
    const count = alertItems.length;
    badge.textContent = count;
    badge.hidden = count === 0;
  }
}

function buildAlertItem(p, status, kind) {
  const item = document.createElement('div');
  item.className = 'alert-item';

  const stripe = document.createElement('div');
  stripe.className = 'alert-stripe';
  stripe.style.background = status.type === 'danger' ? 'var(--g-urgent)' : 'linear-gradient(180deg,var(--c-amber),var(--c-orange))';

  const icon = document.createElement('div');
  icon.className = 'alert-icon';
  icon.textContent = kind === 'return' ? '↩️' : '🛡️';

  const info = document.createElement('div');
  info.className = 'alert-info';
  const name = document.createElement('div');
  name.className = 'alert-name';
  name.textContent = p.name;
  const msg = document.createElement('div');
  msg.className = 'alert-msg';
  msg.textContent = kind === 'return'
    ? t('alert.return.urgent', { d: status.days })
    : t('alert.warranty.urgent', { d: status.days });
  info.appendChild(name);
  info.appendChild(msg);

  const daysEl = document.createElement('div');
  daysEl.className = 'alert-days pill ' + (status.type === 'danger' ? 'pill-danger' : 'pill-warn');
  daysEl.textContent = `${status.days} ${t('label.days')}`;

  item.appendChild(stripe);
  item.appendChild(icon);
  item.appendChild(info);
  item.appendChild(daysEl);

  item.addEventListener('click', () => openDetail(p.id));
  return item;
}

/* ══════════════════════════════════════════════════════════════
   11. PRODUCT FORM (ADD / EDIT)
══════════════════════════════════════════════════════════════ */
let pendingTicketDataUrl = null; // temporary while modal is open

function openAdd() {
  pendingTicketDataUrl = null;
  const form = document.getElementById('product-form');
  if (form) form.reset();
  setEl('edit-id', '');

  // Reset ticket UI
  setTicketPreview(null);

  // Set default dates
  const today = new Date().toISOString().slice(0, 10);
  const purchEl = document.getElementById('prod-purchase');
  if (purchEl && !purchEl.value) purchEl.value = today;
  const retStart = document.getElementById('ret-start');
  if (retStart && !retStart.value) retStart.value = today;
  const warStart = document.getElementById('war-start');
  if (warStart && !warStart.value) warStart.value = today;

  // Modal title
  const title = document.getElementById('modal-heading');
  if (title) title.textContent = t('modal.title.add');
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) saveBtn.textContent = t('btn.save');

  openModal('modal-overlay');
}

function openEdit(id) {
  const products = loadProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;

  pendingTicketDataUrl = p.ticketImage || null;

  document.getElementById('edit-id').value = p.id;
  document.getElementById('prod-name').value = p.name || '';
  document.getElementById('prod-brand').value = p.brand || '';
  document.getElementById('prod-price').value = p.price || '';
  document.getElementById('prod-store').value = p.store || '';
  document.getElementById('prod-purchase').value = p.purchaseDate || '';
  document.getElementById('prod-notes').value = p.notes || '';
  document.getElementById('ret-days').value = p.retDays || '';
  document.getElementById('ret-start').value = p.retStart || '';
  document.getElementById('ret-conditions').value = p.retConditions || '';
  document.getElementById('war-start').value = p.warStart || '';
  document.getElementById('war-years').value = p.warYears || '';
  document.getElementById('war-covers').value = p.warCovers || '';
  document.getElementById('war-nocovers').value = p.warNoCovers || '';

  setTicketPreview(p.ticketImage || null);

  const title = document.getElementById('modal-heading');
  if (title) title.textContent = t('modal.title.edit');
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) saveBtn.textContent = t('btn.save.edit');

  openModal('modal-overlay');
}

function setTicketPreview(dataUrl) {
  const preview = document.getElementById('ticket-preview');
  const placeholder = document.getElementById('ticket-placeholder');
  const removeBtn = document.getElementById('btn-remove-ticket');

  if (dataUrl) {
    preview.src = dataUrl;
    preview.hidden = false;
    placeholder.hidden = true;
    removeBtn.hidden = false;
  } else {
    preview.src = '';
    preview.hidden = true;
    placeholder.hidden = false;
    removeBtn.hidden = true;
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  const name = safeText(document.getElementById('prod-name').value.trim(), 100);
  if (!name) {
    document.getElementById('prod-name').classList.add('error');
    showToast(t('toast.error'), 'warn');
    return;
  }
  document.getElementById('prod-name').classList.remove('error');

  const id = document.getElementById('edit-id').value;
  const isEdit = !!id;

  const product = {
    id: isEdit ? id : generateId(),
    name,
    brand:          safeText(document.getElementById('prod-brand').value.trim(), 60),
    price:          safeFloat(document.getElementById('prod-price').value, 0, 999999, null),
    store:          safeText(document.getElementById('prod-store').value.trim(), 100),
    purchaseDate:   safeDate(document.getElementById('prod-purchase').value),
    notes:          safeText(document.getElementById('prod-notes').value.trim(), 500),
    retDays:        safeInt(document.getElementById('ret-days').value, 0, 3650, null),
    retStart:       safeDate(document.getElementById('ret-start').value),
    retConditions:  safeText(document.getElementById('ret-conditions').value.trim(), 400),
    warStart:       safeDate(document.getElementById('war-start').value),
    warYears:       safeFloat(document.getElementById('war-years').value, 0, 50, null),
    warCovers:      safeText(document.getElementById('war-covers').value.trim(), 600),
    warNoCovers:    safeText(document.getElementById('war-nocovers').value.trim(), 600),
    ticketImage:    pendingTicketDataUrl || null,
    createdAt:      isEdit ? undefined : new Date().toISOString(),
    updatedAt:      new Date().toISOString(),
  };

  let products = loadProducts();
  if (isEdit) {
    const idx = products.findIndex(x => x.id === id);
    if (idx > -1) {
      product.createdAt = products[idx].createdAt;
      products[idx] = product;
    }
  } else {
    products.unshift(product);
  }

  saveProducts(products);
  closeModal('modal-overlay');
  showToast(t(isEdit ? 'toast.updated' : 'toast.saved'), 'ok');

  // Re-render current view
  if (currentView === 'dashboard') renderDashboard();
  else if (currentView === 'products') renderProducts();
  else if (currentView === 'alerts') renderAlerts();
}

/* ══════════════════════════════════════════════════════════════
   12. TICKET IMAGE UPLOAD
══════════════════════════════════════════════════════════════ */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

function handleFileSelect(file) {
  if (!file) return;
  if (!ALLOWED_TYPES.includes(file.type)) {
    showToast(t('toast.photo.err'), 'warn');
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    showToast(t('toast.photo.big'), 'warn');
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    // Validate result is a data URL of expected type
    const result = ev.target.result;
    if (typeof result !== 'string' || !result.startsWith('data:image/')) return;
    pendingTicketDataUrl = result;
    setTicketPreview(result);
  };
  reader.readAsDataURL(file);
}

/* ══════════════════════════════════════════════════════════════
   13. DETAIL MODAL
══════════════════════════════════════════════════════════════ */
let detailProductId = null;

function openDetail(id) {
  const products = loadProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;
  detailProductId = id;

  const heading = document.getElementById('detail-heading');
  if (heading) heading.textContent = p.name;

  const body = document.getElementById('detail-body');
  if (!body) return;
  body.innerHTML = '';

  const rs = getReturnStatus(p);
  const ws = getWarrantyStatus(p);
  const retDl = getReturnDeadline(p);
  const warDl = getWarrantyDeadline(p);

  // Ticket image
  if (p.ticketImage) {
    const img = document.createElement('img');
    img.className = 'detail-ticket-img';
    img.src = p.ticketImage;
    img.alt = 'Ticket de compra';
    body.appendChild(img);
  } else {
    const noTicket = document.createElement('div');
    noTicket.className = 'detail-no-ticket';
    noTicket.textContent = t('no.ticket');
    body.appendChild(noTicket);
  }

  // ── Product info section
  const infoSection = makeDetailSection(t('form.info.section'));
  addDetailRow(infoSection, t('detail.brand'), p.brand);
  addDetailRow(infoSection, t('detail.store'), p.store);
  addDetailRow(infoSection, t('detail.purchaseDate'), fmtDate(p.purchaseDate));
  if (p.price !== null && p.price !== undefined) {
    addDetailRow(infoSection, t('detail.price'), fmtPrice(p.price));
  }
  if (p.notes) addDetailRow(infoSection, t('detail.notes'), p.notes);
  body.appendChild(infoSection);

  // ── Return section
  if (rs.type !== 'none' || p.retDays) {
    const retSection = makeDetailSection(t('detail.return.title'));

    // Countdown ring
    if (rs.days !== null) {
      const totalDays = p.retDays || 1;
      const remainPct = Math.max(0, Math.min(100, (rs.days / totalDays) * 100));
      const ringColor = rs.type === 'ok' ? '#31e08f' : rs.type === 'warn' ? '#ffbe3d' : '#ff4f6e';
      retSection.appendChild(buildCountdownRing(
        Math.max(rs.days, 0), t('label.days'), t('label.return.active'), remainPct, ringColor
      ));
    }

    addDetailRow(retSection, t('detail.return.start'), fmtDate(p.retStart));
    if (retDl) addDetailRow(retSection, t('detail.return.end'), fmtDate(retDl));
    if (p.retDays) addDetailRow(retSection, 'Total', `${p.retDays} ${t('label.days')}`);
    if (p.retConditions) addDetailRow(retSection, t('detail.return.cond'), p.retConditions);
    body.appendChild(retSection);
  }

  // ── Warranty section
  if (ws.type !== 'none' || p.warYears) {
    const warSection = makeDetailSection(t('detail.warranty.title'));

    if (ws.days !== null) {
      const totalDays = Math.round((p.warYears || 1) * 365);
      const remainPct = Math.max(0, Math.min(100, (ws.days / totalDays) * 100));
      const ringColor = ws.type === 'ok' ? '#7c6aff' : ws.type === 'warn' ? '#ffbe3d' : '#ff4f6e';
      warSection.appendChild(buildCountdownRing(
        Math.max(ws.days, 0), t('label.days'), t('label.warranty.active'), remainPct, ringColor
      ));
    }

    addDetailRow(warSection, t('detail.warranty.start'), fmtDate(p.warStart));
    if (warDl) addDetailRow(warSection, t('detail.warranty.end'), fmtDate(warDl));
    if (p.warYears) addDetailRow(warSection, t('detail.warranty.years'), `${p.warYears} ${t('label.years')}`);

    if (p.warCovers) {
      const coversTitle = document.createElement('div');
      coversTitle.className = 'detail-key';
      coversTitle.textContent = t('detail.warranty.covers');
      coversTitle.style.marginTop = '12px';
      warSection.appendChild(coversTitle);
      const list = buildCoverageList(p.warCovers, true);
      warSection.appendChild(list);
    }
    if (p.warNoCovers) {
      const nocoversTitle = document.createElement('div');
      nocoversTitle.className = 'detail-key';
      nocoversTitle.textContent = t('detail.warranty.nocovers');
      nocoversTitle.style.marginTop = '12px';
      warSection.appendChild(nocoversTitle);
      const list = buildCoverageList(p.warNoCovers, false);
      warSection.appendChild(list);
    }
    body.appendChild(warSection);
  }

  openModal('detail-overlay');
}

function makeDetailSection(title) {
  const sec = document.createElement('div');
  sec.className = 'detail-section';
  const ttl = document.createElement('div');
  ttl.className = 'detail-section-title';
  ttl.textContent = title;
  sec.appendChild(ttl);
  return sec;
}

function addDetailRow(parent, key, val) {
  if (!val) return;
  const row = document.createElement('div');
  row.className = 'detail-row';
  const k = document.createElement('span');
  k.className = 'detail-key';
  k.textContent = key;
  const v = document.createElement('span');
  v.className = 'detail-val';
  v.textContent = val;
  row.appendChild(k);
  row.appendChild(v);
  parent.appendChild(row);
}

function buildCountdownRing(days, unit, label, pct, color) {
  const R = 48;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - pct / 100);

  const wrap = document.createElement('div');
  wrap.className = 'countdown-block';

  const ringWrap = document.createElement('div');
  ringWrap.className = 'countdown-ring-wrap';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '120');
  svg.setAttribute('height', '120');
  svg.setAttribute('viewBox', '0 0 120 120');
  svg.classList.add('countdown-ring');

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bg.setAttribute('cx', '60'); bg.setAttribute('cy', '60'); bg.setAttribute('r', String(R));
  bg.classList.add('ring-bg');

  const fill = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  fill.setAttribute('cx', '60'); fill.setAttribute('cy', '60'); fill.setAttribute('r', String(R));
  fill.classList.add('ring-fill');
  fill.setAttribute('stroke', color);
  fill.setAttribute('stroke-dasharray', circ.toFixed(2));
  fill.setAttribute('stroke-dashoffset', offset.toFixed(2));

  svg.appendChild(bg);
  svg.appendChild(fill);
  ringWrap.appendChild(svg);

  const center = document.createElement('div');
  center.className = 'countdown-center';
  const daysEl = document.createElement('div');
  daysEl.className = 'countdown-days';
  daysEl.style.color = color;
  daysEl.textContent = days;
  const unitEl = document.createElement('div');
  unitEl.className = 'countdown-unit';
  unitEl.textContent = unit;
  center.appendChild(daysEl);
  center.appendChild(unitEl);
  ringWrap.appendChild(center);
  wrap.appendChild(ringWrap);

  const lbl = document.createElement('div');
  lbl.className = 'countdown-label';
  lbl.textContent = label;
  wrap.appendChild(lbl);

  return wrap;
}

function buildCoverageList(text, isCovers) {
  const list = document.createElement('div');
  list.className = 'coverage-list';
  text.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const item = document.createElement('div');
    item.className = 'coverage-item ' + (isCovers ? 'covers' : 'no-covers');
    item.textContent = trimmed;
    list.appendChild(item);
  });
  return list;
}

/* ══════════════════════════════════════════════════════════════
   14. DELETE
══════════════════════════════════════════════════════════════ */
let pendingDeleteId = null;

function confirmDelete(id) {
  pendingDeleteId = id;
  openModal('confirm-overlay');
}

function executeDelete() {
  if (!pendingDeleteId) return;
  let products = loadProducts();
  products = products.filter(x => x.id !== pendingDeleteId);
  saveProducts(products);
  pendingDeleteId = null;

  closeModal('confirm-overlay');
  closeModal('detail-overlay');

  showToast(t('toast.deleted'), 'ok');
  if (currentView === 'dashboard') renderDashboard();
  else if (currentView === 'products') renderProducts();
  else if (currentView === 'alerts') renderAlerts();
}

/* ══════════════════════════════════════════════════════════════
   15. MODAL HELPERS
══════════════════════════════════════════════════════════════ */
const openModals = new Set();

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  openModals.add(id);
  document.body.style.overflow = 'hidden';
  // Focus first focusable element
  setTimeout(() => {
    const first = el.querySelector('input:not([type="file"]), textarea, button:not(.modal-close)');
    if (first) first.focus();
  }, 60);
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = true;
  openModals.delete(id);
  if (openModals.size === 0) document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════════════
   16. INIT & EVENT BINDING
══════════════════════════════════════════════════════════════ */
function init() {
  applyTranslations();
  renderDashboard();

  // ── Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) switchView(view);
    });
  });

  // ── Add button (header)
  document.getElementById('btn-add-main')?.addEventListener('click', openAdd);

  // ── Form submit
  document.getElementById('product-form')?.addEventListener('submit', handleFormSubmit);

  // ── Modal close buttons
  document.getElementById('modal-close')?.addEventListener('click', () => closeModal('modal-overlay'));
  document.getElementById('btn-cancel')?.addEventListener('click', () => closeModal('modal-overlay'));
  document.getElementById('detail-close')?.addEventListener('click', () => closeModal('detail-overlay'));
  document.getElementById('btn-edit-detail')?.addEventListener('click', () => {
    closeModal('detail-overlay');
    if (detailProductId) openEdit(detailProductId);
  });
  document.getElementById('btn-delete-detail')?.addEventListener('click', () => {
    if (detailProductId) confirmDelete(detailProductId);
  });

  // ── Confirm dialog
  document.getElementById('confirm-cancel')?.addEventListener('click', () => closeModal('confirm-overlay'));
  document.getElementById('confirm-ok')?.addEventListener('click', executeDelete);

  // ── Close modals on overlay click
  ['modal-overlay', 'detail-overlay', 'confirm-overlay'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('click', (e) => {
      if (e.target === el) closeModal(id);
    });
  });

  // ── Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close topmost modal
      if (openModals.has('confirm-overlay')) { closeModal('confirm-overlay'); return; }
      if (openModals.has('detail-overlay'))  { closeModal('detail-overlay'); return; }
      if (openModals.has('modal-overlay'))   { closeModal('modal-overlay'); return; }
    }
  });

  // ── Ticket upload area
  const uploadArea = document.getElementById('ticket-upload-area');
  const fileInput  = document.getElementById('ticket-file');

  uploadArea?.addEventListener('click', () => fileInput?.click());
  uploadArea?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput?.click(); }
  });

  fileInput?.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) { handleFileSelect(f); fileInput.value = ''; }
  });

  // Drag & drop
  uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFileSelect(f);
  });

  // Remove ticket
  document.getElementById('btn-remove-ticket')?.addEventListener('click', () => {
    pendingTicketDataUrl = null;
    setTicketPreview(null);
    const fi = document.getElementById('ticket-file');
    if (fi) fi.value = '';
  });

  // ── Search
  const searchInput = document.getElementById('search-input');
  let searchDebounce;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      currentSearch = searchInput.value.trim();
      renderProducts();
    }, 250);
  });

  // ── Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      renderProducts();
    });
  });

  // ── Language toggle
  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('gp_lang', currentLang);
    applyTranslations();
    // Re-render to update all dynamic text
    if (currentView === 'dashboard') renderDashboard();
    else if (currentView === 'products') renderProducts();
    else if (currentView === 'alerts') renderAlerts();
  });

  // ── Auto-sync purchase date → return start if empty
  document.getElementById('prod-purchase')?.addEventListener('change', (e) => {
    const retStart = document.getElementById('ret-start');
    if (retStart && !retStart.value) retStart.value = e.target.value;
    const warStart = document.getElementById('war-start');
    if (warStart && !warStart.value) warStart.value = e.target.value;
  });
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
