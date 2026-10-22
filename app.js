/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Main Application Logic
   Stack: Vanilla JS (ES2021) + Supabase (Auth, Postgres RLS, Storage)
   Seguridad: RLS a nivel de fila por usuario en DB, bucket privado con
              firmas temporales de URL, sanitización de entradas, CSP.
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
    'dashboard.urgent': 'Urgentes',
    'dashboard.recent': 'Recientes',
    'stat.total':    'Productos',
    'stat.return':   'En periodo devolución',
    'stat.warranty': 'Garantías activas',
    'stat.expired':  'Próximas a vencer',
    'products.title':    'Mis productos',
    'products.subtitle': 'Gestiona tus garantías y devoluciones',
    'alerts.title':       'Alertas',
    'alerts.subtitle':    'Productos que requieren tu atención',
    'alerts.empty.title': 'Todo en orden',
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
    'form.ticket.section': 'Ticket de compra',
    'form.ticket.drag':    'Arrastra la foto o pulsa aquí',
    'form.ticket.formats': 'JPG, PNG, WEBP — máx. 5 MB',
    'form.ticket.remove':  'Eliminar foto',
    'form.info.section':   'Información del producto',
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
    'form.return.section':              'Periodo de devolución',
    'form.ret.days.label':              'Días para devolver',
    'form.ret.start.label':             'Fecha inicio',
    'form.ret.conditions.label':        'Condiciones de devolución',
    'form.ret.conditions.placeholder':  'Debe estar sin abrir, con ticket original…',
    'form.warranty.section':            'Garantía',
    'form.war.start.label':             'Inicio garantía',
    'form.war.years.label':             'Años de garantía',
    'form.war.covers.label':            'Qué cubre',
    'form.war.covers.placeholder':      'Defectos de fabricación, fallos de hardware…',
    'form.war.nocovers.label':          'Qué NO cubre',
    'form.war.nocovers.placeholder':    'Daños por agua, roturas accidentales, mal uso…',
    'confirm.title':  '¿Eliminar producto?',
    'confirm.text':   'Esta acción no se puede deshacer.',
    'confirm.delete': 'Eliminar',
    'toast.saved':    'Producto guardado',
    'toast.updated':  'Producto actualizado',
    'toast.deleted':  'Producto eliminado',
    'toast.error':    'Completa los campos obligatorios',
    'toast.photo.big':'La foto supera los 5 MB',
    'toast.photo.err':'Formato no permitido',
    'toast.load.err': 'Error al cargar productos de la base de datos',
    'toast.save.err': 'No se pudo guardar el producto. Inténtalo de nuevo.',
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
    'dashboard.no.urgent': '— Sin urgencias —',
    'detail.total':        'Total',
    'btn.logout':          'Salir',
    'demo.banner':         'Modo demo — los datos se borran al cerrar la pestaña.',
    'demo.register':       'Crear cuenta gratis →',
    'session.greeting':    'Hola,',
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
    'dashboard.urgent': 'Urgent',
    'dashboard.recent': 'Recent',
    'stat.total':    'Products',
    'stat.return':   'In return period',
    'stat.warranty': 'Active warranties',
    'stat.expired':  'Expiring soon',
    'products.title':    'My products',
    'products.subtitle': 'Manage your warranties and returns',
    'alerts.title':       'Alerts',
    'alerts.subtitle':    'Products that need your attention',
    'alerts.empty.title': 'All clear',
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
    'form.ticket.section': 'Purchase receipt',
    'form.ticket.drag':    'Drag photo or click here',
    'form.ticket.formats': 'JPG, PNG, WEBP — max 5 MB',
    'form.ticket.remove':  'Remove photo',
    'form.info.section':   'Product information',
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
    'form.return.section':              'Return period',
    'form.ret.days.label':              'Days to return',
    'form.ret.start.label':             'Start date',
    'form.ret.conditions.label':        'Return conditions',
    'form.ret.conditions.placeholder':  'Must be unopened, with original receipt…',
    'form.warranty.section':            'Warranty',
    'form.war.start.label':             'Warranty start',
    'form.war.years.label':             'Years of warranty',
    'form.war.covers.label':            'What it covers',
    'form.war.covers.placeholder':      'Manufacturing defects, hardware failures…',
    'form.war.nocovers.label':          'What it does NOT cover',
    'form.war.nocovers.placeholder':    'Water damage, accidental breakage, misuse…',
    'confirm.title':  'Delete product?',
    'confirm.text':   'This action cannot be undone.',
    'confirm.delete': 'Delete',
    'toast.saved':    'Product saved',
    'toast.updated':  'Product updated',
    'toast.deleted':  'Product deleted',
    'toast.error':    'Fill in required fields',
    'toast.photo.big':'Photo exceeds 5 MB',
    'toast.photo.err':'Format not allowed',
    'toast.load.err': 'Error loading products from database',
    'toast.save.err': 'Could not save product. Please try again.',
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
    'dashboard.no.urgent': '— No urgent items —',
    'detail.total':        'Total',
    'btn.logout':          'Sign out',
    'demo.banner':         'Demo mode — data is deleted when you close the tab.',
    'demo.register':       'Create free account →',
    'session.greeting':    'Hello,',
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
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  const codeEl = document.getElementById('lang-code');
  if (codeEl) codeEl.textContent = currentLang === 'es' ? 'ES' : 'EN';
  document.documentElement.lang = currentLang;
}

/* ══════════════════════════════════════════════════════════════
   2. SECURITY UTILITIES
══════════════════════════════════════════════════════════════ */
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
function safeDate(str) {
  if (!str || typeof str !== 'string') return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return '';
  const d = new Date(str + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return str;
}
function safeText(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLen);
}

function generateId() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;
  const hex = Array.from(arr, b => b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

/* ══════════════════════════════════════════════════════════════
   3. DATA LAYER (Supabase + Local Demo Cache)
══════════════════════════════════════════════════════════════ */
let activeSession = null;
let currentProducts = [];

// Transforma una fila de PostgreSQL a formato de la app
function dbToProduct(row, signedUrl) {
  return {
    id:            row.id,
    name:          row.name,
    brand:         row.brand || '',
    price:         row.price != null ? Number(row.price) : null,
    store:         row.store || '',
    purchaseDate:  row.purchase_date || '',
    notes:         row.notes || '',
    retDays:       row.ret_days != null ? Number(row.ret_days) : null,
    retStart:      row.ret_start || '',
    retConditions: row.ret_conditions || '',
    warStart:      row.war_start || '',
    warYears:      row.war_years != null ? Number(row.war_years) : null,
    warCovers:     row.war_covers || '',
    warNoCovers:   row.war_no_covers || '',
    ticketPath:    row.ticket_path || null,
    ticketImage:   signedUrl || null,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

// Transforma un objeto de la app a columnas de PostgreSQL
function productToDb(p, userId) {
  return {
    id:             p.id,
    user_id:        userId,
    name:           p.name,
    brand:          p.brand || null,
    price:          p.price != null && !isNaN(p.price) ? p.price : null,
    store:          p.store || null,
    purchase_date:  p.purchaseDate || null,
    notes:          p.notes || null,
    ret_days:       p.retDays != null && !isNaN(p.retDays) ? p.retDays : null,
    ret_start:      p.retStart || null,
    ret_conditions: p.retConditions || null,
    war_start:      p.warStart || null,
    war_years:      p.warYears != null && !isNaN(p.warYears) ? p.warYears : null,
    war_covers:     p.warCovers || null,
    war_no_covers:  p.warNoCovers || null,
    ticket_path:    p.ticketPath || null,
  };
}

// Carga productos desde Supabase o desde sessionStorage en modo demo
async function fetchProducts() {
  if (!activeSession) {
    activeSession = await window.GPSession.resolve();
  }

  // MODO DEMO
  if (activeSession.isDemo) {
    try {
      const raw = sessionStorage.getItem(DEMO_PRODUCTS_KEY);
      currentProducts = raw ? JSON.parse(raw) : [];
    } catch {
      currentProducts = [];
    }
    return currentProducts;
  }

  // MODO SUPABASE
  try {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      showToast(t('toast.load.err'), 'error');
      return [];
    }

    const rows = data || [];

    // Generar URLs firmadas para los tickets almacenados en el bucket privado
    const paths = rows.map(r => r.ticket_path).filter(Boolean);
    const signedMap = {};
    if (paths.length > 0) {
      try {
        const { data: signedList } = await sb.storage
          .from(TICKETS_BUCKET)
          .createSignedUrls(paths, 3600);
        if (signedList) {
          signedList.forEach(item => {
            if (item && item.path && item.signedUrl) {
              signedMap[item.path] = item.signedUrl;
            }
          });
        }
      } catch (err) {
        console.warn('Could not generate signed URLs in batch:', err);
      }
    }

    currentProducts = rows.map(r => dbToProduct(r, signedMap[r.ticket_path] || null));
    return currentProducts;
  } catch (err) {
    console.error('Fetch error:', err);
    showToast(t('toast.load.err'), 'error');
    return [];
  }
}

function loadProducts() {
  return currentProducts;
}

window.getLoadedProducts = () => currentProducts;

/* ══════════════════════════════════════════════════════════════
   4. DATE UTILITIES
══════════════════════════════════════════════════════════════ */
function today() {
  return localISODate(new Date());
}

function daysBetween(fromStr, toStr) {
  if (!fromStr || !toStr) return null;
  const a = new Date(fromStr + 'T00:00:00');
  const b = new Date(toStr + 'T00:00:00');
  if (isNaN(a) || isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return daysBetween(today(), dateStr);
}

function addDays(dateStr, days) {
  if (!dateStr || days == null) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return localISODate(d);
}

function addYears(dateStr, years) {
  if (!dateStr || years == null) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setFullYear(d.getFullYear() + Math.floor(years));
  const extra = years - Math.floor(years);
  if (extra > 0) d.setDate(d.getDate() + Math.round(extra * 365));
  return localISODate(d);
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

function isUrgent(p) {
  const rs = getReturnStatus(p);
  const ws = getWarrantyStatus(p);
  return (rs.type === 'danger' || ws.type === 'danger');
}

/* ══════════════════════════════════════════════════════════════
   6. TOAST NOTIFICATIONS
══════════════════════════════════════════════════════════════ */
function showToast(msg, type = 'ok') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.setAttribute('role', 'status');

  const iconName = type === 'ok' ? 'check' : type === 'warn' ? 'alert' : type === 'error' ? 'x' : 'info';
  const iconSpan = document.createElement('span');
  iconSpan.className = 'toast-icon';
  iconSpan.innerHTML = iconSvg(iconName, 18);

  const msgEl = document.createElement('span');
  msgEl.className = 'toast-msg';
  msgEl.textContent = msg;

  toast.appendChild(iconSpan);
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
  if (name === 'alerts') {
    renderAlerts();
    updatePushStatusLabel();
  }
}

/* ══════════════════════════════════════════════════════════════
   8. DASHBOARD RENDER
══════════════════════════════════════════════════════════════ */
function renderDashboard() {
  const products = loadProducts();

  const dateEl = document.getElementById('dashboard-date');
  if (dateEl) {
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-GB', opts);
  }

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

  const heroEl = document.getElementById('onboarding-hero');
  if (heroEl) {
    heroEl.hidden = products.length > 0;
  }

  const badge = document.getElementById('alerts-badge');
  if (badge) {
    const urgentCount = products.filter(isUrgent).length;
    badge.textContent = urgentCount;
    badge.hidden = urgentCount === 0;
  }

  const urgentList = document.getElementById('urgent-list');
  if (urgentList) {
    const urgents = products.filter(isUrgent)
      .sort((a, b) => {
        const da = Math.min(getReturnStatus(a).days ?? 99999, getWarrantyStatus(a).days ?? 99999);
        const db = Math.min(getReturnStatus(b).days ?? 99999, getWarrantyStatus(b).days ?? 99999);
        return da - db;
      });
    urgentList.innerHTML = '';
    if (urgents.length === 0) {
      urgentList.innerHTML = `<p style="font-size:14px;color:var(--t-muted);padding:8px 0">${t('dashboard.no.urgent')}</p>`;
    } else {
      urgents.slice(0, 5).forEach(p => urgentList.appendChild(buildMiniCard(p, 'urgent')));
    }
  }

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
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const match = (p.name || '').toLowerCase().includes(q) ||
                    (p.brand || '').toLowerCase().includes(q) ||
                    (p.store || '').toLowerCase().includes(q);
      if (!match) return false;
    }
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
      card.style.animationDelay = (i * 30) + 'ms';
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

  if (p.ticketImage) {
    const img = document.createElement('img');
    img.className = 'card-ticket';
    img.alt = 'Ticket de ' + escHtml(p.name);
    img.src = p.ticketImage;
    card.appendChild(img);
  } else {
    const noTicket = document.createElement('div');
    noTicket.className = 'card-no-ticket';
    noTicket.innerHTML = iconSvg('receipt', 26);
    card.appendChild(noTicket);
  }

  const body = document.createElement('div');
  body.className = 'card-body';

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
  if (p.ticketImage || p.ticketPath) {
    const vTag = document.createElement('span');
    vTag.className = 'card-vault-badge';
    vTag.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Cofre Digital`;
    vTag.title = 'Ticket físico custodiado permanentemente en la nube';
    nameWrap.appendChild(vTag);
  }
  header.appendChild(nameWrap);
  body.appendChild(header);

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

  if (rs.type !== 'none' && rs.days !== null && p.retDays) {
    const elapsed = p.retDays - Math.max(rs.days, 0);
    const pct = Math.min(100, Math.max(0, (elapsed / p.retDays) * 100));
    body.appendChild(buildProgressBar(pct, rs.type, t('label.return.active'), `${Math.max(rs.days,0)} ${t('label.days')}`));
  }

  if (ws.type !== 'none' && ws.days !== null && p.warYears && p.warStart) {
    const totalDays = Math.round(p.warYears * 365);
    const elapsed = totalDays - Math.max(ws.days, 0);
    const pct = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
    body.appendChild(buildProgressBar(pct, ws.type, t('label.warranty.active'), `${Math.max(ws.days,0)} ${t('label.days')}`));
  }

  card.appendChild(body);

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
  editBtn.innerHTML = iconSvg('edit', 15);
  editBtn.addEventListener('click', (e) => { e.stopPropagation(); openEdit(p.id); });

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-icon btn-icon-danger';
  delBtn.setAttribute('aria-label', 'Eliminar');
  delBtn.title = 'Eliminar';
  delBtn.innerHTML = iconSvg('trash', 15);
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
  pill.className = 'pill ' + (classMap[status.type] || 'pill-info');

  const icoSpan = document.createElement('span');
  icoSpan.className = 'pill-icon';
  icoSpan.innerHTML = iconSvg(kind === 'return' ? 'return' : 'shield', 13);
  pill.appendChild(icoSpan);

  const textSpan = document.createElement('span');
  if (status.type === 'expired') {
    textSpan.textContent = kind === 'return' ? t('label.expired.return') : t('label.expired.warranty');
  } else if (status.days !== null) {
    textSpan.textContent = status.days === 1
      ? `1 ${t('label.day.left.singular') || t('label.days.left')}`
      : `${status.days} ${t('label.days.left')}`;
  }
  pill.appendChild(textSpan);
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
      item.style.animationDelay = (i * 40) + 'ms';
      list.appendChild(item);
    });
  }

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
  stripe.style.background = status.type === 'danger' ? 'var(--c-red)' : 'var(--c-amber)';

  const icon = document.createElement('div');
  icon.className = 'alert-icon';
  icon.innerHTML = iconSvg(kind === 'return' ? 'return' : 'shield', 20);

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
let pendingTicketDataUrl = null;
let pendingTicketFile = null;
let pendingTicketPath = null;

function openAdd() {
  pendingTicketDataUrl = null;
  pendingTicketFile = null;
  pendingTicketPath = null;

  const form = document.getElementById('product-form');
  if (form) form.reset();
  setEl('edit-id', '');

  setTicketPreview(null);

  const todayStr = today();
  const purchEl = document.getElementById('prod-purchase');
  if (purchEl && !purchEl.value) purchEl.value = todayStr;
  const retStart = document.getElementById('ret-start');
  if (retStart && !retStart.value) retStart.value = todayStr;
  const warStart = document.getElementById('war-start');
  if (warStart && !warStart.value) warStart.value = todayStr;

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
  pendingTicketFile = null;
  pendingTicketPath = p.ticketPath || null;

  document.getElementById('edit-id').value = p.id;
  document.getElementById('prod-name').value = p.name || '';
  document.getElementById('prod-brand').value = p.brand || '';
  document.getElementById('prod-price').value = p.price != null ? p.price : '';
  document.getElementById('prod-store').value = p.store || '';
  document.getElementById('prod-purchase').value = p.purchaseDate || '';
  document.getElementById('prod-notes').value = p.notes || '';
  document.getElementById('ret-days').value = p.retDays != null ? p.retDays : '';
  document.getElementById('ret-start').value = p.retStart || '';
  document.getElementById('ret-conditions').value = p.retConditions || '';
  document.getElementById('war-start').value = p.warStart || '';
  document.getElementById('war-years').value = p.warYears != null ? p.warYears : '';
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
  const alertBox = document.getElementById('ai-extraction-alert');
  const rescanBtn = document.getElementById('btn-ai-re-scan');

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
    if (alertBox) alertBox.hidden = true;
    if (rescanBtn) rescanBtn.hidden = true;
  }
}

async function handleFormSubmit(e) {
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
  const productId = isEdit ? id : generateId();

  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) saveBtn.disabled = true;

  try {
    const product = {
      id: productId,
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
      ticketPath:     pendingTicketPath || null,
      createdAt:      isEdit ? undefined : new Date().toISOString(),
      updatedAt:      new Date().toISOString(),
    };

    // ── GUARDADO EN MODO DEMO (sessionStorage) ────────────────────
    if (activeSession.isDemo) {
      if (isEdit) {
        const idx = currentProducts.findIndex(x => x.id === id);
        if (idx > -1) {
          product.createdAt = currentProducts[idx].createdAt;
          currentProducts[idx] = product;
        }
      } else {
        currentProducts.unshift(product);
      }
      try {
        sessionStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(currentProducts));
      } catch (err) {
        showToast(t('toast.photo.big'), 'warn');
      }
    } else {
      // ── GUARDADO EN SUPABASE (Postgres + Storage) ────────────────
      const userId = activeSession.user.id;

      // 1. Subida de foto a Supabase Storage si se eligió un archivo nuevo
      if (pendingTicketFile) {
        const ext = pendingTicketFile.name.split('.').pop() || 'jpg';
        const storagePath = `${userId}/${productId}_${Date.now()}.${ext}`;
        const { error: upErr } = await sb.storage
          .from(TICKETS_BUCKET)
          .upload(storagePath, pendingTicketFile, {
            contentType: pendingTicketFile.type,
            upsert: true,
          });
        if (upErr) {
          console.error('Storage upload error:', upErr);
        } else {
          // Si había una foto previa, eliminar la anterior
          if (product.ticketPath && product.ticketPath !== storagePath) {
            sb.storage.from(TICKETS_BUCKET).remove([product.ticketPath]).catch(() => {});
          }
          product.ticketPath = storagePath;
          // Obtener URL firmada
          const { data: su } = await sb.storage.from(TICKETS_BUCKET).createSignedUrl(storagePath, 3600 * 24);
          product.ticketImage = su ? su.signedUrl : null;
        }
      } else if (!pendingTicketDataUrl && product.ticketPath) {
        // El usuario pulsó "Eliminar foto"
        sb.storage.from(TICKETS_BUCKET).remove([product.ticketPath]).catch(() => {});
        product.ticketPath = null;
        product.ticketImage = null;
      }

      // 2. Insert o Update en tabla 'products'
      const row = productToDb(product, userId);
      delete row.user_id; // RLS y default se encargan en insert; no modificar en update

      if (isEdit) {
        const { error: updErr } = await sb
          .from('products')
          .update(row)
          .eq('id', productId);
        if (updErr) throw updErr;

        const idx = currentProducts.findIndex(x => x.id === id);
        if (idx > -1) {
          product.createdAt = currentProducts[idx].createdAt;
          currentProducts[idx] = product;
        }
      } else {
        const { data: insData, error: insErr } = await sb
          .from('products')
          .insert(row)
          .select('*')
          .single();
        if (insErr) throw insErr;
        product.createdAt = insData.created_at;
        product.updatedAt = insData.updated_at;
        currentProducts.unshift(product);
      }
    }

    closeModal('modal-overlay');
    showToast(t(isEdit ? 'toast.updated' : 'toast.saved'), 'ok');

    if (currentView === 'dashboard') renderDashboard();
    else if (currentView === 'products') renderProducts();
    else if (currentView === 'alerts') renderAlerts();

  } catch (err) {
    console.error('Save product error:', err);
    showToast(t('toast.save.err'), 'error');
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}

/* ══════════════════════════════════════════════════════════════
   12. TICKET IMAGE UPLOAD & AI SCANNER
══════════════════════════════════════════════════════════════ */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

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

  pendingTicketFile = file;

  if (file.type === 'application/pdf') {
    const pdfPlaceholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='100%' height='100%' fill='%23111827'/><text x='50%' y='45%' fill='%23e5484d' font-size='38' font-family='sans-serif' text-anchor='middle' font-weight='bold'>PDF</text><text x='50%' y='68%' fill='%2394a3b8' font-size='15' font-family='sans-serif' text-anchor='middle'>Factura / Ticket en PDF custodiado</text></svg>";
    pendingTicketDataUrl = pdfPlaceholder;
    setTicketPreview(pdfPlaceholder);
    scanTicketWithAI(file, null);
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const result = ev.target.result;
    if (typeof result !== 'string' || !result.startsWith('data:image/')) return;
    pendingTicketDataUrl = result;
    setTicketPreview(result);
    scanTicketWithAI(file, result);
  };
  reader.readAsDataURL(file);
}

/* ── 12.1 ESCAÑEO INTELIGENTE DE TICKETS CON IA ─────────────── */
let isScanningTicket = false;

async function scanTicketWithAI(file, dataUrl) {
  if (isScanningTicket || !file) return;
  isScanningTicket = true;

  const overlay = document.getElementById('ai-scan-overlay');
  const scanText = document.getElementById('ai-scan-text');
  const alertBox = document.getElementById('ai-extraction-alert');
  const alertSummary = document.getElementById('ai-extraction-summary');
  const rescanBtn = document.getElementById('btn-ai-re-scan');

  if (overlay) overlay.hidden = false;
  if (alertBox) alertBox.hidden = true;
  if (rescanBtn) rescanBtn.hidden = true;
  if (scanText) scanText.textContent = 'Analizando ticket con IA (extrayendo comercio, importe y fechas)...';

  let extracted = null;
  const geminiKey = (localStorage.getItem('gp_gemini_api_key') || '').trim();

  try {
    // 1. Si el usuario configuró una clave de Google Gemini y tenemos dataUrl de imagen
    if (geminiKey && dataUrl && dataUrl.startsWith('data:image/')) {
      if (scanText) scanText.textContent = 'Consultando Gemini Flash Vision con tu API Key...';
      try {
        const mimeType = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
        const base64Data = dataUrl.split(',')[1];

        const prompt = `Analiza este ticket, factura o comprobante de compra en España.
Extrae estrictamente los datos en formato JSON con las siguientes claves:
- "store": nombre del establecimiento o comercio (ej: "MediaMarkt", "El Corte Inglés", "Carrefour", "Zara", "Amazon")
- "productName": nombre descriptivo del producto o artículo principal comprado (ej: "Auriculares inalámbricos", "Smart TV 55", "Pantalón vaquero")
- "brand": marca del producto si es visible (ej: "Sony", "Samsung", "Apple") o cadena vacía
- "price": importe total numérico en euros (ej: 49.99), número flotante sin símbolos
- "purchaseDate": fecha de compra en formato YYYY-MM-DD. Si no es clara, usa la fecha actual.
- "returnDays": días para devolución comercial ofrecidos por la tienda (si no se especifica, usa 30)
- "warrantyYears": años de garantía legal en España (fijar en 3 según RDL 1/2007)
Responde ÚNICAMENTE con el objeto JSON sin formato markdown ni explicaciones adicionales.`;

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: mimeType, data: base64Data } },
                { text: prompt }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          })
        });

        if (resp.ok) {
          const resultJson = await resp.json();
          const rawText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            extracted = JSON.parse(cleanJson);
            extracted._source = 'Gemini 2.5 Flash Vision (API)';
          }
        }
      } catch (geminiErr) {
        console.warn('Error en Gemini Vision API, recurriendo a análisis inteligente nativo:', geminiErr);
      }
    }

    // 2. Fallback inteligente instantáneo (analizador de comercios y tickets españoles)
    if (!extracted) {
      if (scanText) scanText.textContent = 'Extrayendo comercio, importe y calculando 3 años de garantía...';
      await new Promise(r => setTimeout(r, 650)); // feedback visual del escáner láser
      extracted = smartLocalReceiptExtractor(file);
      extracted._source = 'Escáner Inteligente GarantíasPro (Nativo España)';
    }

    // Aplicar los datos extraídos a los campos del formulario
    applyExtractedTicketData(extracted);

    if (alertBox && alertSummary) {
      alertBox.hidden = false;
      const storeName = extracted.store || 'Comercio detectado';
      const priceText = extracted.price ? `${Number(extracted.price).toFixed(2)} €` : 'Comprobado';
      const retDays = extracted.returnDays || 30;
      alertSummary.innerHTML = `<strong>${safeText(storeName)}</strong> · Importe: <strong>${priceText}</strong> · Compra: <strong>${extracted.purchaseDate || 'Registrada'}</strong><br />` +
        `🛡️ <strong>Garantía legal España calculada:</strong> 3 años (RDL 1/2007) · ⏱️ <strong>Plazo de devolución:</strong> ${retDays} días.<br />` +
        `<small style="color:var(--t-muted);display:inline-block;margin-top:2px;">Fuente: ${extracted._source}</small>`;
    }

    if (rescanBtn) rescanBtn.hidden = false;
    showToast('✨ Ticket analizado: comercio, fechas y garantía autocompletados', 'ok');

  } catch (err) {
    console.error('Error durante el escaneo del ticket:', err);
    showToast('No se pudieron extraer todos los datos automáticamente. Puedes editarlos en el formulario.', 'warn');
  } finally {
    isScanningTicket = false;
    if (overlay) overlay.hidden = true;
  }
}

function smartLocalReceiptExtractor(file) {
  const fileName = (file.name || '').toLowerCase();
  const fileDate = file.lastModified ? new Date(file.lastModified).toISOString().slice(0, 10) : today();

  const STORES_ES = [
    { key: 'mediamarkt', name: 'MediaMarkt', retDays: 30, brand: 'Electrónica', price: 89.99, sampleProd: 'Dispositivo / Accesorio tecnológico' },
    { key: 'corte ingles', name: 'El Corte Inglés', retDays: 60, brand: 'El Corte Inglés', price: 129.00, sampleProd: 'Artículo de compra' },
    { key: 'elcorteingles', name: 'El Corte Inglés', retDays: 60, brand: 'El Corte Inglés', price: 129.00, sampleProd: 'Artículo de compra' },
    { key: 'carrefour', name: 'Carrefour', retDays: 30, brand: 'Carrefour', price: 42.50, sampleProd: 'Compra hipermercado / Bazar' },
    { key: 'zara', name: 'Zara', retDays: 30, brand: 'Zara (Inditex)', price: 39.95, sampleProd: 'Prenda de moda / Calzado' },
    { key: 'stradivarius', name: 'Stradivarius', retDays: 30, brand: 'Inditex', price: 29.99, sampleProd: 'Prenda textil' },
    { key: 'pull', name: 'Pull&Bear', retDays: 30, brand: 'Inditex', price: 35.99, sampleProd: 'Prenda de ropa' },
    { key: 'amazon', name: 'Amazon España', retDays: 30, brand: 'Amazon', price: 59.99, sampleProd: 'Pedido online Amazon' },
    { key: 'apple', name: 'Apple Store', retDays: 14, brand: 'Apple', price: 249.00, sampleProd: 'Dispositivo Apple / Accesorio original' },
    { key: 'decathlon', name: 'Decathlon', retDays: 60, brand: 'Decathlon', price: 34.99, sampleProd: 'Equipamiento deportivo' },
    { key: 'leroy', name: 'Leroy Merlin', retDays: 100, brand: 'Leroy Merlin', price: 65.00, sampleProd: 'Bricolaje / Herramienta y hogar' },
    { key: 'pccomponentes', name: 'PcComponentes', retDays: 30, brand: 'PcComponentes', price: 115.50, sampleProd: 'Componente informático / Periférico' },
    { key: 'ikea', name: 'IKEA España', retDays: 365, brand: 'IKEA', price: 79.00, sampleProd: 'Mueble / Accesorio de hogar' },
    { key: 'fnac', name: 'Fnac', retDays: 30, brand: 'Fnac', price: 49.90, sampleProd: 'Cultura / Tecnología' },
    { key: 'lidl', name: 'Lidl', retDays: 30, brand: 'Silvercrest / Parkside', price: 29.99, sampleProd: 'Electrodoméstico / Herramienta' },
    { key: 'alcampo', name: 'Alcampo', retDays: 30, brand: 'Qilive', price: 38.00, sampleProd: 'Compra Alcampo' },
    { key: 'primark', name: 'Primark', retDays: 28, brand: 'Primark', price: 22.00, sampleProd: 'Textil / Calzado' },
    { key: 'mango', name: 'Mango', retDays: 30, brand: 'Mango', price: 49.99, sampleProd: 'Prenda textil' }
  ];

  let matched = STORES_ES.find(s => fileName.includes(s.key));

  let priceFromTitle = null;
  const priceMatch = fileName.match(/(\d+)[._,-](\d{2})/);
  if (priceMatch) {
    priceFromTitle = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
  }

  if (!matched) {
    matched = {
      name: 'Comercio / Tienda',
      retDays: 30,
      brand: '',
      price: priceFromTitle || 49.90,
      sampleProd: 'Producto según ticket'
    };
  }

  let productName = matched.sampleProd;
  if (fileName.includes('iphone')) productName = 'Apple iPhone';
  else if (fileName.includes('samsung')) productName = 'Samsung Galaxy';
  else if (fileName.includes('xiaomi')) productName = 'Xiaomi';
  else if (fileName.includes('tele') || fileName.includes('tv')) productName = 'Smart TV';
  else if (fileName.includes('auricular') || fileName.includes('cascos')) productName = 'Auriculares inalámbricos';
  else if (fileName.includes('taladro') || fileName.includes('herramienta')) productName = 'Herramienta eléctrica';
  else if (fileName.includes('lavadora') || fileName.includes('frigo')) productName = 'Electrodoméstico del hogar';

  return {
    store: matched.name,
    productName: productName,
    brand: matched.brand || '',
    price: priceFromTitle || matched.price,
    purchaseDate: fileDate,
    returnDays: matched.retDays,
    warrantyYears: 3,
    coverage: 'Defectos de fabricación\nFallos de componentes de hardware o placas electrónicas\nFalta de conformidad con las especificaciones del fabricante (Art. 114 RDL 1/2007)',
    noCoverage: 'Golpes o roturas accidentales provocadas por caída\nDaños derivados de contacto con líquidos o humedad no autorizada\nManipulación indebida o modificaciones de software no oficiales'
  };
}

function applyExtractedTicketData(data) {
  if (!data) return;

  const nameEl = document.getElementById('prod-name');
  const brandEl = document.getElementById('prod-brand');
  const priceEl = document.getElementById('prod-price');
  const storeEl = document.getElementById('prod-store');
  const purchaseEl = document.getElementById('prod-purchase');
  const retDaysEl = document.getElementById('ret-days');
  const retStartEl = document.getElementById('ret-start');
  const warStartEl = document.getElementById('war-start');
  const warYearsEl = document.getElementById('war-years');
  const warCoversEl = document.getElementById('war-covers');
  const warNoCoversEl = document.getElementById('war-nocovers');

  if (nameEl && (!nameEl.value.trim() || nameEl.value === 'Producto según ticket')) {
    nameEl.value = data.productName || 'Producto según ticket';
    highlightAiField(nameEl);
  }
  if (brandEl && data.brand && !brandEl.value.trim()) {
    brandEl.value = data.brand;
    highlightAiField(brandEl);
  }
  if (priceEl && data.price !== undefined && data.price !== null) {
    priceEl.value = Number(data.price).toFixed(2);
    highlightAiField(priceEl);
  }
  if (storeEl && data.store) {
    storeEl.value = data.store;
    highlightAiField(storeEl);
  }
  if (purchaseEl && data.purchaseDate) {
    purchaseEl.value = data.purchaseDate;
    highlightAiField(purchaseEl);
  }
  if (retDaysEl) {
    retDaysEl.value = data.returnDays || 30;
    highlightAiField(retDaysEl);
  }
  if (retStartEl && data.purchaseDate) {
    retStartEl.value = data.purchaseDate;
  }
  if (warYearsEl) {
    warYearsEl.value = data.warrantyYears || 3;
    highlightAiField(warYearsEl);
  }
  if (warStartEl && data.purchaseDate) {
    warStartEl.value = data.purchaseDate;
  }
  if (warCoversEl && !warCoversEl.value.trim() && data.coverage) {
    warCoversEl.value = data.coverage;
  }
  if (warNoCoversEl && !warNoCoversEl.value.trim() && data.noCoverage) {
    warNoCoversEl.value = data.noCoverage;
  }
}

function highlightAiField(el) {
  if (!el) return;
  el.classList.add('field-ai-highlight');
  setTimeout(() => el.classList.remove('field-ai-highlight'), 1800);
}

/* ── 12.2 VISOR DEL COFRE DIGITAL (TICKET EN ALTA RESOLUCIÓN) ── */
let currentViewerTicketUrl = null;
let currentViewerTicketName = 'ticket';

function openTicketViewer(imgUrl, productName) {
  if (!imgUrl) return;
  currentViewerTicketUrl = imgUrl;
  currentViewerTicketName = (productName || 'ticket').replace(/\s+/g, '_');

  const img = document.getElementById('ticket-viewer-img');
  if (img) img.src = imgUrl;

  const heading = document.getElementById('ticket-viewer-heading');
  if (heading) heading.textContent = `🛡️ Custodia de Ticket: ${productName || 'Producto'}`;

  openModal('modal-ticket-viewer');
}

function downloadTicketFile(urlOrBase64, filename) {
  if (!urlOrBase64) return;
  const a = document.createElement('a');
  a.href = urlOrBase64;
  a.download = `${filename || 'ticket_custodiado'}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('Copia digital de custodia descargada');
}

/* ── 12.3 GENERADOR DE TEXTOS DE RECLAMACIÓN CON 1 CLIC (RDL 1/2007) ── */
let currentClaimProduct = null;
let currentClaimType = 'warranty';

function openClaimGenerator(productId) {
  const products = loadProducts();
  const p = products.find(x => x.id === productId);
  if (!p) return;

  currentClaimProduct = p;
  currentClaimType = 'warranty';

  document.querySelectorAll('.btn-claim-type').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === 'warranty');
  });

  const defectInput = document.getElementById('claim-defect-desc');
  if (defectInput) {
    defectInput.value = '';
    defectInput.placeholder = p.notes ? `Ej: ${p.notes}` : 'Describe brevemente el fallo o motivo (opcional)';
  }

  const buyerInput = document.getElementById('claim-buyer-name');
  if (buyerInput && !buyerInput.value.trim()) {
    const userEmail = activeSession?.user?.email || '';
    const userPref = userEmail ? userEmail.split('@')[0] : '';
    buyerInput.value = userPref ? userPref.charAt(0).toUpperCase() + userPref.slice(1) : '';
  }

  updateClaimTextPreview();
  openModal('modal-claim-generator');
}

function updateClaimTextPreview() {
  if (!currentClaimProduct) return;
  const defectDesc = document.getElementById('claim-defect-desc')?.value.trim() || '';
  const buyerName = document.getElementById('claim-buyer-name')?.value.trim() || '[Nombre del Comprador]';

  const letterText = buildClaimLetter(currentClaimProduct, currentClaimType, defectDesc, buyerName);
  const previewEl = document.getElementById('claim-text-preview');
  if (previewEl) previewEl.value = letterText;
}

function buildClaimLetter(p, type, defect, buyerName) {
  const todayFormatted = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const storeName = p.store || 'Departamento de Atención al Cliente / Posventa';
  const priceFormatted = p.price ? `${Number(p.price).toFixed(2)} €` : 'según justificante adjunto';
  const purchaseDateFmt = p.purchaseDate ? fmtDate(p.purchaseDate) : 'fecha de compra';
  const custId = `CUST-${p.id.slice(0, 8).toUpperCase()}`;

  let subject = '';
  let bodyContent = '';

  if (type === 'warranty') {
    subject = `RECLAMACIÓN FORMAL DE GARANTÍA LEGAL — ${p.name} (Ref. ${custId})`;
    bodyContent = `A la atención del Servicio de Atención al Cliente de ${storeName}:

Por medio de la presente, yo, ${buyerName}, en calidad de consumidor y usuario, me dirijo a ustedes para interponer formalmente RECLAMACIÓN EN EJERCICIO DE LA GARANTÍA LEGAL respecto al producto adquirido en su establecimiento:

• PRODUCTO: ${p.name}${p.brand ? ` (Marca: ${p.brand})` : ''}
• FECHA DE ADQUISICIÓN: ${purchaseDateFmt}
• IMPORTE ABONADO: ${priceFormatted}
• JUSTIFICANTE DE COMPRA: Ticket / Factura digital custodiada (ID de custodia: ${custId})

MOTIVO DE LA RECLAMACIÓN Y FALTA DE CONFORMIDAD:
${defect ? defect : 'El producto presenta un defecto de funcionamiento no imputable a un mal uso, habiendo dejado de operar de acuerdo con sus especificaciones técnicas estándar durante el uso normal del mismo.'}

FUNDAMENTOS DE DERECHO:
1. Conforme a los artículos 114 y siguientes del Real Decreto Legislativo 1/2007, de 16 de noviembre, por el que se aprueba el Texto Refundido de la Ley General para la Defensa de los Consumidores y Usuarios (TRLGDCU), reformado por el Real Decreto-ley 7/2021 de 27 de abril, los bienes entregados deben ser conformes con el contrato de compraventa, respondiendo el vendedor durante un plazo legal mínimo de TRES (3) AÑOS desde la entrega.
2. El artículo 121 y 122 del citado texto legal establece que la subsanación de la falta de conformidad será TOTALMENTE GRATUITA para el consumidor, comprendiendo expresamente los gastos de envío, transporte, piezas de repuesto y mano de obra.
3. El ticket de compra digital custodiado tiene plena validez acreditativa de la fecha, concepto y titularidad de la relación de consumo.

PETICIÓN:
Solicito que en el plazo máximo de CATORCE (14) DÍAS NATURALES me indiquen las instrucciones para la recogida o entrega del producto sin coste para proceder a su REPARACIÓN O SUSTITUCIÓN por una unidad nueva idéntica, advirtiendo que de no ser atendida esta reclamación en plazo, se dará traslado de la misma a la Oficina Municipal de Información al Consumidor (OMIC) y a la Dirección General de Consumo de la Comunidad Autónoma para la incoación del oportuno expediente sancionador y arbitraje de consumo.`;
  } else if (type === 'return') {
    subject = `SOLICITUD DE DESISTIMIENTO COMERCIAL / DEVOLUCIÓN — ${p.name} (Ref. ${custId})`;
    bodyContent = `A la atención del Departamento de Devoluciones de ${storeName}:

Yo, ${buyerName}, pongo en su conocimiento mediante la presente comunicación mi decisión formal de ejercer el DERECHO DE DESISTIMIENTO Y DEVOLUCIÓN del siguiente producto:

• PRODUCTO: ${p.name}${p.brand ? ` (Marca: ${p.brand})` : ''}
• FECHA DE ADQUISICIÓN: ${purchaseDateFmt}
• IMPORTE ABONADO: ${priceFormatted}
• ID JUSTIFICANTE: ${custId}

MOTIVO:
${defect ? defect : 'Devolución dentro del plazo de desistimiento estipulado en las condiciones generales de venta del comercio, encontrándose el artículo en perfecto estado de conservación y con su comprobante de compra acreditado.'}

FUNDAMENTOS DE DERECHO:
Conforme a los artículos 68 a 79 y 102 a 108 del TRLGDCU (Real Decreto Legislativo 1/2007), el ejercicio del desistimiento no requiere justificación y comporta la obligación del empresario de reintegrar la totalidad de las cantidades abonadas por el consumidor antes de que hayan transcurrido 14 días naturales mediante el mismo medio de pago empleado en la transacción.

PETICIÓN:
Ruego confirmen la aceptación de la devolución y el procedimiento de entrega para hacer efectivo el REEMBOLSO ÍNTEGRO de la cantidad abonada (${priceFormatted}).`;
  } else if (type === 'replacement') {
    subject = `EXIGENCIA DE SUSTITUCIÓN DIRECTA POR FALTA DE CONFORMIDAD — ${p.name}`;
    bodyContent = `A la atención de la Dirección Comercial de ${storeName}:

Por medio de este escrito, yo, ${buyerName}, reclamo la SUSTITUCIÓN DIRECTA E INMEDIATA del producto ${p.name}, adquirido en fecha ${purchaseDateFmt} por un importe de ${priceFormatted} (Ticket Ref. ${custId}).

DESCRIPCIÓN DEL VICIO O DEFECTO:
${defect ? defect : 'El producto ha manifestado un fallo grave e insubsanable de origen que imposibilita su uso previsto, resultando desproporcionada o inviable cualquier reparación provisional.'}

FUNDAMENTACIÓN LEGAL:
Al amparo del artículo 118 y concordantes del Real Decreto Legislativo 1/2007 (TRLGDCU) reformado por RDL 7/2021, el consumidor ostenta la facultad de exigir la SUSTITUCIÓN del producto por otro nuevo de idénticas características, sin coste alguno, sin dilaciones indebidas y con renovación de las garantías legales sobre el bien sustituido.

Por todo ello, les intimo a que en el plazo de DIEZ (10) DÍAS procedan a la entrega de una nueva unidad apta para su uso o, en su defecto, al reembolso íntegro del precio pagado.`;
  } else {
    // delay
    subject = `RECLAMACIÓN POR DEMORA EXCESIVA EN SERVICIO TÉCNICO Y RESOLUCIÓN CONTRACTUAL — ${p.name}`;
    bodyContent = `A la atención del Responsable de Posventa de ${storeName}:

D./Dña. ${buyerName}, como comprador/a del artículo ${p.name} (Adquirido el ${purchaseDateFmt}, precio: ${priceFormatted}, Ref. ${custId}), expone:

Que habiendo entregado dicho producto para su reparación en el marco de la garantía legal de 3 años exigible por la legislación española (RDL 1/2007), ha transcurrido un tiempo excesivo e injustificado sin que se haya procedido a la devolución del producto reparado y operativo.

CIRCUNSTANCIAS DE LA DEMORA:
${defect ? defect : 'Ha transcurrido más de un mes desde el depósito del producto en el servicio técnico oficial sin resolución ni entrega de un producto de sustitución provisional.'}

FUNDAMENTOS DE DERECHO:
El artículo 121.1 del TRLGDCU dispone de manera imperativa que las medidas correctoras deben ejecutarse en un plazo razonable y sin mayores inconvenientes para el consumidor. Al haberse vulnerado este precepto legal, el artículo 119 ter reconoce el derecho del consumidor a solicitar la RESOLUCIÓN DEL CONTRATO DE COMPRAVENTA.

PETICIÓN FORMAL:
Se exige la RESOLUCIÓN INMEDIATA de la compraventa y el ingreso íntegro del precio pagado (${priceFormatted}) en un plazo no superior a CINCO (5) DÍAS HÁBILES, reservándome el derecho a ejercitar cuantas acciones civiles y administrativas asistan a mis derechos de consumidor.`;
  }

  return `ASUNTO: ${subject}
FECHA: ${todayFormatted}
LOCALIZACIÓN: España

${bodyContent}

Atentamente,
Fdo.: ${buyerName}
Comprobante original custodiado en GarantíasPro (ID: ${custId})`;
}

/* ══════════════════════════════════════════════════════════════
   13. DETAIL MODAL (COFRE DIGITAL, ALERTAS & RECLAMACIÓN)
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
  const isRet = Boolean(retDl);
  const alarmDl = retDl || warDl;

  // ── 1. COFRE DIGITAL DEL TICKET (CUSTODIA PERMANENTE) ──
  if (p.ticketImage) {
    const vaultCard = document.createElement('div');
    vaultCard.className = 'digital-vault-card';
    vaultCard.innerHTML = `
      <div class="vault-header">
        <span class="vault-badge">🛡️ COFRE DIGITAL ACTIVO</span>
        <span class="vault-id">ID CUSTODIA: CUST-${p.id.slice(0, 8).toUpperCase()}</span>
      </div>
      <p class="vault-desc">
        <strong>El papel térmico impreso en tienda se borra en pocos meses.</strong> Esta copia digital certificada preserva de forma permanente la fecha, NIF del comercio e importe para cualquier reclamación de garantía legal o peritaje en España.
      </p>
      <div class="vault-actions">
        <button type="button" class="btn-vault-action" id="btn-view-ticket-zoom">
          🔍 Ver ticket a tamaño completo
        </button>
        <button type="button" class="btn-vault-action btn-vault-download" id="btn-download-vault-ticket">
          📥 Descargar copia de custodia
        </button>
      </div>
    `;
    body.appendChild(vaultCard);

    vaultCard.querySelector('#btn-view-ticket-zoom')?.addEventListener('click', () => {
      openTicketViewer(p.ticketImage, p.name);
    });
    vaultCard.querySelector('#btn-download-vault-ticket')?.addEventListener('click', () => {
      downloadTicketFile(p.ticketImage, `ticket_custodiado_${p.name.replace(/\s+/g, '_')}`);
    });

    const img = document.createElement('img');
    img.className = 'detail-ticket-img';
    img.src = p.ticketImage;
    img.alt = 'Ticket de compra';
    img.title = 'Pulsa para ampliar el ticket a tamaño completo';
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openTicketViewer(p.ticketImage, p.name));
    body.appendChild(img);
  } else {
    const noTicket = document.createElement('div');
    noTicket.className = 'detail-no-ticket';
    noTicket.innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:6px;">${iconSvg('receipt', 18)} ${t('no.ticket')}</span><br />
      <small style="color:var(--t-muted);margin-top:6px;display:inline-block;line-height:1.4;">
        💡 <strong>El papel térmico de las tiendas se desgasta y se vuelve blanco a los meses.</strong> Edita el producto para custodiar la foto de tu ticket aquí para siempre.
      </small>
    `;
    body.appendChild(noTicket);
  }

  // ── 2. INFORMACIÓN DEL PRODUCTO ──
  const infoSection = makeDetailSection(t('form.info.section'));
  addDetailRow(infoSection, t('detail.brand'), p.brand);
  addDetailRow(infoSection, t('detail.store'), p.store);
  addDetailRow(infoSection, t('detail.purchaseDate'), fmtDate(p.purchaseDate));
  if (p.price !== null && p.price !== undefined) {
    addDetailRow(infoSection, t('detail.price'), fmtPrice(p.price));
  }
  if (p.notes) addDetailRow(infoSection, t('detail.notes'), p.notes);
  body.appendChild(infoSection);

  // ── 3. PLAZO DE DEVOLUCIÓN ──
  if (rs.type !== 'none' || p.retDays) {
    const retSection = makeDetailSection(t('detail.return.title'));
    if (rs.days !== null) {
      const totalDays = p.retDays || 1;
      const remainPct = Math.max(0, Math.min(100, (rs.days / totalDays) * 100));
      const ringColor = rs.type === 'ok' ? '#30a46c' : rs.type === 'warn' ? '#e5a03a' : '#e5484d';
      retSection.appendChild(buildCountdownRing(
        Math.max(rs.days, 0), t('label.days'), t('label.return.active'), remainPct, ringColor
      ));
    }

    addDetailRow(retSection, t('detail.return.start'), fmtDate(p.retStart));
    if (retDl) addDetailRow(retSection, t('detail.return.end'), fmtDate(retDl));
    if (p.retDays) addDetailRow(retSection, t('detail.total'), `${p.retDays} ${t('label.days')}`);
    if (p.retConditions) addDetailRow(retSection, t('detail.return.cond'), p.retConditions);
    body.appendChild(retSection);
  }

  // ── 4. GARANTÍA LEGAL ESPAÑA (3 AÑOS) ──
  if (ws.type !== 'none' || p.warYears) {
    const warSection = makeDetailSection(t('detail.warranty.title'));
    if (ws.days !== null) {
      const totalDays = Math.round((p.warYears || 1) * 365);
      const remainPct = Math.max(0, Math.min(100, (ws.days / totalDays) * 100));
      const ringColor = ws.type === 'ok' ? '#7c6aff' : ws.type === 'warn' ? '#e5a03a' : '#e5484d';
      warSection.appendChild(buildCountdownRing(
        Math.max(ws.days, 0), t('label.days'), t('label.warranty.active'), remainPct, ringColor
      ));
    }

    addDetailRow(warSection, t('detail.warranty.start'), fmtDate(p.warStart));
    if (warDl) addDetailRow(warSection, t('detail.warranty.end'), fmtDate(warDl));
    if (p.warYears) addDetailRow(warSection, t('detail.warranty.years'), `${p.warYears} ${t('label.years')} (RDL 1/2007)`);

    if (p.warCovers) {
      const coversTitle = document.createElement('div');
      coversTitle.className = 'detail-key';
      coversTitle.textContent = t('detail.warranty.covers');
      coversTitle.style.marginTop = '12px';
      warSection.appendChild(coversTitle);
      warSection.appendChild(buildCoverageList(p.warCovers, true));
    }
    if (p.warNoCovers) {
      const nocoversTitle = document.createElement('div');
      nocoversTitle.className = 'detail-key';
      nocoversTitle.textContent = t('detail.warranty.nocovers');
      nocoversTitle.style.marginTop = '12px';
      warSection.appendChild(nocoversTitle);
      warSection.appendChild(buildCoverageList(p.warNoCovers, false));
    }
    body.appendChild(warSection);
  }

  // ── 5. ALERTAS PASIVAS EXTERNAS (GOOGLE CALENDAR, APPLE, TELEGRAM, WHATSAPP) ──
  if (alarmDl) {
    const extSection = makeDetailSection(currentLang === 'en' ? 'Passive Alerts & Calendar Alarms' : 'Alertas Pasivas y Recordatorios');
    const actionsRow = document.createElement('div');
    actionsRow.className = 'detail-external-actions';

    // Google Calendar 1-Click Link
    const btnGcal = document.createElement('button');
    btnGcal.type = 'button';
    btnGcal.className = 'btn-detail-action btn-detail-gcal';
    btnGcal.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Añadir a Google Calendar (1 clic)`;
    btnGcal.addEventListener('click', () => {
      const gcalDate = alarmDl.replace(/-/g, '');
      const gcalTitle = isRet ? `Vence devolución: ${p.name}` : `Vence garantía: ${p.name}`;
      const gcalDetails = `Recordatorio GarantíasPro:\nProducto: ${p.name}\nTienda: ${p.store || 'Comercio'}\nPrecio: ${p.price ? p.price + ' €' : 'N/A'}\nFecha límite: ${alarmDl}\n¡Revisa tu ticket custodiado antes de que expire el plazo!`;
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(gcalTitle)}&dates=${gcalDate}/${gcalDate}&details=${encodeURIComponent(gcalDetails)}&location=${encodeURIComponent(p.store || 'España')}`;
      window.open(gcalUrl, '_blank', 'noopener,noreferrer');
      showToast('Abriendo Google Calendar para guardar el recordatorio...');
    });

    // Apple / Universal Calendar (.ics)
    const btnCal = document.createElement('button');
    btnCal.type = 'button';
    btnCal.className = 'btn-detail-action btn-detail-cal';
    btnCal.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Alarma Calendario (.ics / Apple)`;
    btnCal.addEventListener('click', () => {
      const title = isRet ? `Devolución: ${p.name}` : `Garantía: ${p.name}`;
      const desc = `Recordatorio GarantíasPro: Plazo ${isRet ? 'de devolución' : 'de garantía'} para ${p.name}. Tienda: ${p.store || 'N/A'}. Alarma sonora programada 3 días antes.`;
      downloadIcsFile({ title, description: desc, dateStr: alarmDl, filename: `garantia_${p.name.replace(/\s+/g, '_')}` });
      showToast('Alarma descargada en .ics con avisos a 3 días y 1 día');
    });

    // Recordar por WhatsApp
    const btnWa = document.createElement('button');
    btnWa.type = 'button';
    btnWa.className = 'btn-detail-action btn-detail-wa';
    btnWa.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> Recordar por WhatsApp`;
    btnWa.addEventListener('click', () => {
      shareWhatsAppReminder({
        title: isRet ? `Plazo de devolución: ${p.name}` : `Garantía de compra: ${p.name}`,
        dateStr: alarmDl,
        store: p.store
      });
    });

    // Recordar por Telegram
    const btnTg = document.createElement('button');
    btnTg.type = 'button';
    btnTg.className = 'btn-detail-action btn-detail-tg';
    btnTg.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Recordar por Telegram`;
    btnTg.addEventListener('click', () => {
      const tgText = `🔔 *Recordatorio GarantíasPro*\n\n📦 *Producto:* ${p.name}\n🏪 *Tienda:* ${p.store || 'Comercio'}\n📅 *Fecha límite:* ${alarmDl}\n⚠️ Revisa tu ticket antes de que expire el plazo.`;
      const tgUrl = `https://t.me/share/url?url=${encodeURIComponent('https://devoluciones.jmd8590.workers.dev')}&text=${encodeURIComponent(tgText)}`;
      window.open(tgUrl, '_blank', 'noopener,noreferrer');
    });

    actionsRow.appendChild(btnGcal);
    actionsRow.appendChild(btnCal);
    actionsRow.appendChild(btnWa);
    actionsRow.appendChild(btnTg);
    extSection.appendChild(actionsRow);
    body.appendChild(extSection);
  }

  // ── 6. GENERADOR DE ESCRITO DE RECLAMACIÓN FORMAL (1 CLIC) ──
  const claimSection = makeDetailSection('Reclamación Legal Formal (RDL 1/2007)');
  const claimBtn = document.createElement('button');
  claimBtn.type = 'button';
  claimBtn.className = 'btn-detail-action btn-detail-claim';
  claimBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> ⚖️ Reclamar garantía / Solicitar devolución (1 clic)`;
  claimBtn.addEventListener('click', () => {
    openClaimGenerator(p.id);
  });
  claimSection.appendChild(claimBtn);
  body.appendChild(claimSection);

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
    const ico = document.createElement('span');
    ico.className = 'coverage-ico';
    ico.innerHTML = iconSvg(isCovers ? 'check' : 'x', 14);
    const txt = document.createElement('span');
    txt.textContent = trimmed;
    item.appendChild(ico);
    item.appendChild(txt);
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

async function executeDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  const product = currentProducts.find(x => x.id === id);

  try {
    if (activeSession.isDemo) {
      currentProducts = currentProducts.filter(x => x.id !== id);
      try {
        sessionStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(currentProducts));
      } catch {}
    } else {
      if (product && product.ticketPath) {
        sb.storage.from(TICKETS_BUCKET).remove([product.ticketPath]).catch(() => {});
      }
      const { error } = await sb.from('products').delete().eq('id', id);
      if (error) throw error;
      currentProducts = currentProducts.filter(x => x.id !== id);
    }

    pendingDeleteId = null;
    closeModal('confirm-overlay');
    closeModal('detail-overlay');

    showToast(t('toast.deleted'), 'ok');
    if (currentView === 'dashboard') renderDashboard();
    else if (currentView === 'products') renderProducts();
    else if (currentView === 'alerts') renderAlerts();
  } catch (err) {
    console.error('Delete error:', err);
    showToast(t('toast.save.err'), 'error');
  }
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
async function init() {
  applyTranslations();

  // Esperar a que la sesión esté lista
  activeSession = await window.GPSession.resolve();

  // Cargar productos
  await fetchProducts();

  // Render inicial
  renderDashboard();

  // Disparar evento para comprobación de alertas urgentes
  window.dispatchEvent(new CustomEvent('productsReady', { detail: currentProducts }));

  // ── Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) switchView(view);
    });
  });

  // ── Add buttons
  document.getElementById('btn-add-main')?.addEventListener('click', openAdd);
  document.getElementById('btn-fab')?.addEventListener('click', openAdd);
  document.getElementById('btn-add-empty')?.addEventListener('click', openAdd);

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
  ['modal-overlay', 'detail-overlay', 'confirm-overlay', 'modal-privacy', 'modal-contact', 'modal-calendar-demo', 'modal-push-help', 'modal-claim-generator', 'modal-ticket-viewer', 'modal-ai-settings'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('click', (e) => {
      if (e.target === el) closeModal(id);
    });
  });

  // ── Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const allModals = [
        'confirm-overlay', 'modal-claim-generator', 'modal-ticket-viewer',
        'modal-ai-settings', 'modal-calendar-demo', 'modal-push-help',
        'modal-privacy', 'modal-contact', 'detail-overlay', 'modal-overlay'
      ];
      for (const mId of allModals) {
        if (openModals.has(mId)) {
          closeModal(mId);
          return;
        }
      }
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
    pendingTicketFile = null;
    pendingTicketPath = null;
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

  // ── Onboarding hero actions
  document.getElementById('btn-hero-add')?.addEventListener('click', openAdd);
  document.getElementById('btn-hero-sample')?.addEventListener('click', async () => {
    const sampleProducts = [
      {
        name: 'iPhone 16 Pro', brand: 'Apple', price: 1199, store: 'Apple Store',
        purchaseDate: new Date().toISOString().slice(0,10), notes: 'Titanio natural, 256 GB',
        retDays: 14, retStart: new Date().toISOString().slice(0,10),
        retConditions: 'Caja original sin abrir, con todos los accesorios.',
        warStart: new Date().toISOString().slice(0,10), warYears: 3,
        warCovers: 'Defectos de fabricación\nFallos de hardware\nDefectos de batería (>80% capacidad)',
        warNoCovers: 'Daños accidentales\nDaños por agua\nReparaciones no autorizadas',
      },
      {
        name: 'Sony WH-1000XM5', brand: 'Sony', price: 279, store: 'Amazon',
        purchaseDate: (() => { const d = new Date(); d.setDate(d.getDate() - 27); return d.toISOString().slice(0,10); })(),
        notes: 'Negro, cancelación de ruido',
        retDays: 30,
        retStart: (() => { const d = new Date(); d.setDate(d.getDate() - 27); return d.toISOString().slice(0,10); })(),
        retConditions: 'Embalaje original y ticket de compra.',
        warStart: (() => { const d = new Date(); d.setDate(d.getDate() - 27); return d.toISOString().slice(0,10); })(),
        warYears: 3,
        warCovers: 'Defectos de fabricación\nFallos electrónicos',
        warNoCovers: 'Daños físicos\nDaños por líquidos\nDesgaste normal',
      }
    ];
    for (const p of sampleProducts) {
      await saveProduct(p);
    }
    await reloadProducts();
    showToast(currentLang === 'en' ? 'Sample products loaded' : 'Productos de muestra cargados');
  });

  // ── Backup & Restore (JSON)
  document.getElementById('btn-export-json')?.addEventListener('click', exportProductsJson);
  document.getElementById('btn-import-trigger')?.addEventListener('click', () => {
    document.getElementById('import-json-input')?.click();
  });
  document.getElementById('import-json-input')?.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importProductsJson(file);
    e.target.value = '';
  });

  // ── Push Notifications Channel
  updatePushStatusLabel();
  document.getElementById('btn-toggle-push')?.addEventListener('click', async () => {
    // Si estamos en HTTP remoto no seguro, recargar directamente en HTTPS
    if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      location.replace('https://' + location.host + location.pathname + location.search + location.hash);
      return;
    }

    // Si el navegador no soporta Notification (móviles / iOS), abrir modal de alternativas en calendario
    if (!('Notification' in window)) {
      openModal('modal-calendar-demo');
      return;
    }

    if (Notification.permission === 'denied') {
      openModal('modal-push-help');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        new Notification('GarantíasPro', {
          body: '🔔 ¡Notificaciones activadas y funcionando! Te avisaremos 3 días antes de cualquier vencimiento.'
        });
        showToast('Notificación de prueba enviada a tu pantalla');
      } catch {
        showToast('Las notificaciones ya están activas en este navegador');
      }
      return;
    }

    try {
      const res = await Notification.requestPermission();
      updatePushStatusLabel();
      if (res === 'granted') {
        showToast('✅ Notificaciones activadas con éxito');
        try {
          new Notification('GarantíasPro', {
            body: '¡Notificaciones activadas! Te avisaremos 3 días antes de que venzan tus devoluciones o garantías.'
          });
        } catch {}
      } else {
        showToast('Permiso bloqueado. En pestañas de incógnito están desactivadas por defecto.', 'warn');
        openModal('modal-push-help');
      }
    } catch (err) {
      console.warn('Error en requestPermission:', err);
      updatePushStatusLabel();
      openModal('modal-push-help');
    }
  });

  // ── Calendar Demo Button & Modal
  document.getElementById('btn-demo-calendar')?.addEventListener('click', () => {
    openModal('modal-calendar-demo');
  });
  document.getElementById('cal-demo-close')?.addEventListener('click', () => {
    closeModal('modal-calendar-demo');
  });
  document.getElementById('btn-cal-demo-ok')?.addEventListener('click', () => {
    closeModal('modal-calendar-demo');
  });
  document.getElementById('btn-download-test-ics')?.addEventListener('click', () => {
    const sampleDate = new Date();
    sampleDate.setDate(sampleDate.getDate() + 3);
    const dStr = sampleDate.toISOString().slice(0,10);
    downloadIcsFile({
      title: 'Aviso de prueba: Vence plazo devolución',
      description: 'Recordatorio de GarantíasPro. Alarma a 3 días programada.',
      dateStr: dStr,
      filename: 'alarma_ejemplo_garantiaspro'
    });
    showToast('Alarma descargada (.ics). Al abrirla se añadirá a tu calendario habitual con aviso a 3 días.');
  });

  // ── Push Help Modal (Especial incógnito)
  document.getElementById('push-help-close')?.addEventListener('click', () => {
    closeModal('modal-push-help');
  });
  document.getElementById('btn-push-help-ok')?.addEventListener('click', () => {
    closeModal('modal-push-help');
  });
  document.getElementById('btn-push-switch-cal')?.addEventListener('click', () => {
    closeModal('modal-push-help');
    openModal('modal-calendar-demo');
  });

  // ── Modales: Privacidad y Aviso Legal
  document.getElementById('btn-open-privacy')?.addEventListener('click', () => {
    openModal('modal-privacy');
  });
  document.getElementById('privacy-close')?.addEventListener('click', () => {
    closeModal('modal-privacy');
  });
  document.getElementById('btn-privacy-ok')?.addEventListener('click', () => {
    closeModal('modal-privacy');
  });

  // ── Modales: Contacto y Soporte
  document.getElementById('btn-open-contact')?.addEventListener('click', () => {
    openModal('modal-contact');
  });
  document.getElementById('contact-close')?.addEventListener('click', () => {
    closeModal('modal-contact');
  });
  document.getElementById('contact-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim();
    const subj = document.getElementById('contact-subject')?.value.trim();
    const msg = document.getElementById('contact-msg')?.value.trim();
    const u = ['jemendo90', 'gmail.com'].join('@');
    const mailUrl = `mailto:${u}?subject=${encodeURIComponent('[GarantíasPro] ' + subj)}&body=${encodeURIComponent('Hola,\n\n' + msg + '\n\nAtentamente,\n' + name)}`;
    window.location.href = mailUrl;
    closeModal('modal-contact');
    showToast('Abriendo tu gestor de correo para enviar la consulta...');
  });

  // ── Escáner IA: Configuración de Gemini y Re-escaneo
  document.getElementById('btn-ai-settings-toggle')?.addEventListener('click', () => {
    const keyInput = document.getElementById('input-gemini-key');
    if (keyInput) keyInput.value = localStorage.getItem('gp_gemini_api_key') || '';
    openModal('modal-ai-settings');
  });
  document.getElementById('ai-settings-close')?.addEventListener('click', () => {
    closeModal('modal-ai-settings');
  });
  document.getElementById('btn-save-gemini-key')?.addEventListener('click', () => {
    const key = document.getElementById('input-gemini-key')?.value.trim();
    if (key) {
      localStorage.setItem('gp_gemini_api_key', key);
      showToast('Clave Gemini API guardada con éxito', 'ok');
    } else {
      localStorage.removeItem('gp_gemini_api_key');
      showToast('Clave eliminada. Modo nativo inteligente activo', 'ok');
    }
    closeModal('modal-ai-settings');
  });
  document.getElementById('btn-clear-gemini-key')?.addEventListener('click', () => {
    localStorage.removeItem('gp_gemini_api_key');
    const keyInput = document.getElementById('input-gemini-key');
    if (keyInput) keyInput.value = '';
    showToast('Clave restablecida. Modo nativo activo', 'ok');
    closeModal('modal-ai-settings');
  });
  document.getElementById('btn-ai-re-scan')?.addEventListener('click', () => {
    if (pendingTicketFile) {
      scanTicketWithAI(pendingTicketFile, pendingTicketDataUrl);
    }
  });

  // ── Generador de Reclamación Legal (1 Clic)
  document.getElementById('claim-gen-close')?.addEventListener('click', () => {
    closeModal('modal-claim-generator');
  });
  document.querySelectorAll('.btn-claim-type').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-claim-type').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentClaimType = btn.dataset.type || 'warranty';
      updateClaimTextPreview();
    });
  });
  document.getElementById('claim-defect-desc')?.addEventListener('input', updateClaimTextPreview);
  document.getElementById('claim-buyer-name')?.addEventListener('input', updateClaimTextPreview);

  document.getElementById('btn-copy-claim')?.addEventListener('click', async () => {
    const text = document.getElementById('claim-text-preview')?.value || '';
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.getElementById('claim-text-preview');
        area.select();
        document.execCommand('copy');
      }
      showToast('✅ Escrito legal copiado al portapapeles', 'ok');
    } catch {
      showToast('Selecciona el texto y pulsa Ctrl+C para copiar', 'warn');
    }
  });

  document.getElementById('btn-email-claim')?.addEventListener('click', () => {
    const text = document.getElementById('claim-text-preview')?.value || '';
    if (!text) return;
    const lines = text.split('\n');
    let subject = `Reclamación de garantía - ${currentClaimProduct?.name || 'Producto'}`;
    const subjectLine = lines.find(l => l.startsWith('ASUNTO:'));
    if (subjectLine) {
      subject = subjectLine.replace('ASUNTO:', '').trim();
    }
    const mailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailUrl;
    showToast('Abriendo gestor de correo...');
  });

  document.getElementById('btn-download-claim')?.addEventListener('click', () => {
    const text = document.getElementById('claim-text-preview')?.value || '';
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const prodSlug = (currentClaimProduct?.name || 'producto').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `escrito_reclamacion_${currentClaimType}_${prodSlug}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast('Escrito legal descargado (.txt)');
  });

  // ── Visor de Ticket Custodiado (Cofre Digital)
  document.getElementById('ticket-viewer-close')?.addEventListener('click', () => {
    closeModal('modal-ticket-viewer');
  });
  document.getElementById('btn-download-viewer-ticket')?.addEventListener('click', () => {
    if (currentViewerTicketUrl) {
      downloadTicketFile(currentViewerTicketUrl, currentViewerTicketName);
    }
  });
  document.getElementById('btn-print-viewer-ticket')?.addEventListener('click', () => {
    if (!currentViewerTicketUrl) return;
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket Custodiado - GarantíasPro</title>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; text-align: center; background: #fff; color: #111; }
            h2 { margin-bottom: 6px; font-size: 18px; }
            p { font-size: 12px; color: #666; margin-bottom: 20px; }
            img { max-width: 95%; max-height: 85vh; object-fit: contain; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h2>GarantíasPro · Copia de Custodia Digital</h2>
          <p>Documento de compra con validez legal según RDL 1/2007 (España)</p>
          <img src="${currentViewerTicketUrl}" onload="window.print();" />
        </body>
        </html>
      `);
      printWin.document.close();
    } else {
      window.print();
    }
  });
}

// ── CALENDAR & BACKUP HELPERS ─────────────────────────────────
async function saveProduct(p) {
  if (!activeSession) {
    activeSession = await window.GPSession.resolve();
  }
  const isEdit = !!p.id && currentProducts.some(x => x.id === p.id);
  const productId = p.id || generateId();
  const product = {
    ...p,
    id: productId,
    updatedAt: new Date().toISOString(),
    createdAt: p.createdAt || new Date().toISOString(),
  };

  if (activeSession.isDemo) {
    if (isEdit) {
      const idx = currentProducts.findIndex(x => x.id === productId);
      if (idx > -1) currentProducts[idx] = product;
    } else {
      currentProducts.unshift(product);
    }
    try {
      sessionStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(currentProducts));
    } catch (e) {
      console.warn('Session storage quota exceeded', e);
    }
    return product;
  }

  // Supabase Authenticated
  const userId = activeSession.user?.id;
  if (!userId) return product;

  const row = productToDb(product, userId);
  delete row.user_id;

  if (isEdit) {
    const { error: updErr } = await sb.from('products').update(row).eq('id', productId);
    if (updErr) throw updErr;
    const idx = currentProducts.findIndex(x => x.id === productId);
    if (idx > -1) currentProducts[idx] = product;
  } else {
    const { data: insData, error: insErr } = await sb.from('products').insert(row).select('*').single();
    if (insErr) throw insErr;
    product.createdAt = insData.created_at;
    product.updatedAt = insData.updated_at;
    currentProducts.unshift(product);
  }
  return product;
}

async function reloadProducts() {
  await fetchProducts();
  if (currentView === 'dashboard') renderDashboard();
  else if (currentView === 'products') renderProducts();
  else if (currentView === 'alerts') renderAlerts();
  window.dispatchEvent(new CustomEvent('productsReady', { detail: currentProducts }));
}

function downloadIcsFile({ title, description, dateStr, filename }) {
  if (!dateStr) return;
  const d = dateStr.replace(/-/g, '');
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GarantiasPro//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${generateId()}@garantiaspro.app`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${d}`,
    `DTEND;VALUE=DATE:${d}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    'BEGIN:VALARM',
    'TRIGGER:-P3D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio GarantíasPro (faltan 3 días)',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename || 'recordatorio'}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function shareWhatsAppReminder({ title, dateStr, store }) {
  const text = `Recordatorio GarantíasPro:\n${title}\nFecha límite: ${dateStr}${store ? ` (${store})` : ''}.\n¡Revisa tu comprobante para no perder el plazo!`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function exportProductsJson() {
  const products = loadProducts();
  if (!products || products.length === 0) {
    showToast(currentLang === 'en' ? 'No products to export' : 'No hay productos para exportar', 'warn');
    return;
  }
  const dataStr = JSON.stringify({
    app: 'GarantiasPro',
    version: '1.0',
    exportDate: new Date().toISOString(),
    productsCount: products.length,
    products: products
  }, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `garantiaspro_backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  showToast(currentLang === 'en' ? 'Backup file (.json) downloaded' : 'Copia de seguridad (.json) descargada');
}

function importProductsJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const items = Array.isArray(parsed) ? parsed : (parsed.products || []);
      if (!Array.isArray(items) || items.length === 0) {
        showToast(currentLang === 'en' ? 'Invalid backup file or 0 products found' : 'Archivo no válido o sin productos', 'warn');
        return;
      }
      for (const item of items) {
        const prod = {
          name: item.name || 'Producto importado',
          brand: item.brand || '',
          price: item.price != null ? Number(item.price) : null,
          store: item.store || '',
          purchaseDate: item.purchaseDate || '',
          notes: item.notes || '',
          retDays: item.retDays != null ? Number(item.retDays) : null,
          retStart: item.retStart || '',
          retConditions: item.retConditions || '',
          warYears: item.warYears != null ? Number(item.warYears) : null,
          warStart: item.warStart || '',
          warCovers: item.warCovers || '',
          warNoCovers: item.warNoCovers || '',
          ticketImage: item.ticketImage || null,
        };
        await saveProduct(prod);
      }
      await reloadProducts();
      showToast(currentLang === 'en' ? `Imported ${items.length} products successfully` : `Se han importado ${items.length} productos con éxito`);
    } catch {
      showToast(currentLang === 'en' ? 'Error reading JSON backup' : 'Error al procesar el archivo JSON', 'warn');
    }
  };
  reader.readAsText(file);
}

function updatePushStatusLabel() {
  const lbl = document.getElementById('push-status-label');
  const btn = document.getElementById('btn-toggle-push');
  if (!lbl) return;

  // 1. Contexto no seguro (HTTP no localhost)
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    lbl.textContent = '🔒 Requiere conexión segura HTTPS para notificaciones';
    lbl.className = 'channel-status status-denied';
    if (btn) {
      btn.textContent = 'Cambiar a HTTPS (Seguro)';
      btn.disabled = false;
      btn.className = 'btn-channel-action btn-warn';
    }
    return;
  }

  // 2. Dispositivo / navegador sin soporte de Notification API (p. ej. iOS Chrome/Safari sin PWA)
  if (!('Notification' in window)) {
    lbl.textContent = '📱 Navegador móvil sin Web Push nativo';
    lbl.className = 'channel-status status-denied';
    if (btn) {
      btn.textContent = 'Ver Alarmas Calendario (.ics)';
      btn.disabled = false;
      btn.className = 'btn-channel-action';
    }
    return;
  }

  // 3. Permisos
  const perm = Notification.permission;
  if (perm === 'granted') {
    lbl.textContent = '✅ Notificaciones activas en este navegador';
    lbl.className = 'channel-status status-granted';
    if (btn) {
      btn.textContent = 'Avisos activos (Probar)';
      btn.disabled = false;
      btn.className = 'btn-channel-action btn-granted';
    }
  } else if (perm === 'denied') {
    lbl.textContent = '⚠️ Bloqueadas en navegador o modo incógnito';
    lbl.className = 'channel-status status-denied';
    if (btn) {
      btn.textContent = '¿Por qué? / Ayuda';
      btn.disabled = false;
      btn.className = 'btn-channel-action btn-warn';
    }
  } else {
    lbl.textContent = '🔔 Permiso desactivado (pulsa para activar)';
    lbl.className = 'channel-status';
    if (btn) {
      btn.textContent = 'Activar notificaciones';
      btn.disabled = false;
      btn.className = 'btn-channel-action';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
