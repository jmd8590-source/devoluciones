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
  if (name === 'alerts')    renderAlerts();
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

  pendingTicketFile = file;

  const reader = new FileReader();
  reader.onload = (ev) => {
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
    noTicket.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${iconSvg('receipt', 18)} ${t('no.ticket')}</span>`;
    body.appendChild(noTicket);
  }

  // Info sección
  const infoSection = makeDetailSection(t('form.info.section'));
  addDetailRow(infoSection, t('detail.brand'), p.brand);
  addDetailRow(infoSection, t('detail.store'), p.store);
  addDetailRow(infoSection, t('detail.purchaseDate'), fmtDate(p.purchaseDate));
  if (p.price !== null && p.price !== undefined) {
    addDetailRow(infoSection, t('detail.price'), fmtPrice(p.price));
  }
  if (p.notes) addDetailRow(infoSection, t('detail.notes'), p.notes);
  body.appendChild(infoSection);

  // Devolución
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

  // Garantía
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
    if (p.warYears) addDetailRow(warSection, t('detail.warranty.years'), `${p.warYears} ${t('label.years')}`);

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

  // Avisos y Alarmas Externas (Calendario / WhatsApp)
  const alarmDl = retDl || warDl;
  if (alarmDl) {
    const extSection = makeDetailSection(currentLang === 'en' ? 'External Alarms & Reminders' : 'Avisos y Alarmas Externas');
    const actionsRow = document.createElement('div');
    actionsRow.className = 'detail-external-actions';

    const btnCal = document.createElement('button');
    btnCal.type = 'button';
    btnCal.className = 'btn-detail-action btn-detail-cal';
    btnCal.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${currentLang === 'en' ? 'Add alarm to Calendar (.ics)' : 'Añadir alarma a Calendario (.ics)'}`;
    btnCal.addEventListener('click', () => {
      const isRet = Boolean(retDl);
      const title = isRet ? `Devolución: ${p.name}` : `Garantía: ${p.name}`;
      const desc = `Recordatorio GarantíasPro: Plazo ${isRet ? 'de devolución' : 'de garantía'} para ${p.name}. Tienda: ${p.store || 'N/A'}. Alarma programada 3 días antes.`;
      downloadIcsFile({ title, description: desc, dateStr: isRet ? retDl : warDl, filename: `garantia_${p.name.replace(/\s+/g, '_')}` });
      showToast(currentLang === 'en' ? 'Calendar file (.ics) downloaded with 3-day alarm' : 'Alarma descargada en archivo .ics con aviso a 3 días');
    });

    const btnWa = document.createElement('button');
    btnWa.type = 'button';
    btnWa.className = 'btn-detail-action btn-detail-wa';
    btnWa.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> ${currentLang === 'en' ? 'Send to WhatsApp' : 'Recordar por WhatsApp'}`;
    btnWa.addEventListener('click', () => {
      const isRet = Boolean(retDl);
      shareWhatsAppReminder({
        title: isRet ? `Plazo de devolución: ${p.name}` : `Garantía de compra: ${p.name}`,
        dateStr: isRet ? retDl : warDl,
        store: p.store
      });
    });

    actionsRow.appendChild(btnCal);
    actionsRow.appendChild(btnWa);
    extSection.appendChild(actionsRow);
    body.appendChild(extSection);
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
  ['modal-overlay', 'detail-overlay', 'confirm-overlay'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('click', (e) => {
      if (e.target === el) closeModal(id);
    });
  });

  // ── Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
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
  document.getElementById('btn-hero-add')?.addEventListener('click', openAddModal);
  document.getElementById('btn-hero-sample')?.addEventListener('click', async () => {
    const sampleProducts = [
      {
        name: 'iPhone 16 Pro', brand: 'Apple', price: 1199, store: 'Apple Store',
        purchaseDate: new Date().toISOString().slice(0,10), notes: 'Titanio natural, 256 GB',
        retDays: 14, retStart: new Date().toISOString().slice(0,10),
        retConditions: 'Caja original sin abrir, con todos los accesorios.',
        warStart: new Date().toISOString().slice(0,10), warYears: 2,
        warCovers: 'Defectos de fabricación\nFallos de hardware\nDefectos de batería (>80% capacidad)',
        warNoCovers: 'Daños accidentales\nDaños por agua\nReparaciones no autorizadas',
      },
      {
        name: 'Sony WH-1000XM5', brand: 'Sony', price: 279, store: 'Amazon',
        purchaseDate: (() => { const d = new Date(); d.setDate(d.getDate() - 27); return d.toISOString().slice(0,10); })(),
        notes: 'Negro, cancelación de ruido',
        retDays: 29,
        retStart: (() => { const d = new Date(); d.setDate(d.getDate() - 27); return d.toISOString().slice(0,10); })(),
        retConditions: 'Embalaje original y ticket de compra.',
        warStart: (() => { const d = new Date(); d.setDate(d.getDate() - 27); return d.toISOString().slice(0,10); })(),
        warYears: 1,
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
  document.getElementById('btn-toggle-push')?.addEventListener('click', () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(() => {
        updatePushStatusLabel();
        if (Notification.permission === 'granted') {
          showToast('Notificaciones push activadas con éxito');
        }
      });
    }
  });

  // ── Calendar Demo Button
  document.getElementById('btn-demo-calendar')?.addEventListener('click', () => {
    const sampleDate = new Date();
    sampleDate.setDate(sampleDate.getDate() + 3);
    const dStr = sampleDate.toISOString().slice(0,10);
    downloadIcsFile({
      title: 'Aviso de prueba: Vence plazo devolución',
      description: 'Recordatorio de GarantíasPro. Alarma a 3 días programada.',
      dateStr: dStr,
      filename: 'alarma_ejemplo_garantiaspro'
    });
    showToast('Alarma de prueba descargada en .ics (se abre en tu app de Calendario)');
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
}

// ── CALENDAR & BACKUP HELPERS ─────────────────────────────────
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
    showToast(currentLang === 'en' ? 'No products to export' : 'No hay productos para exportar');
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
        showToast(currentLang === 'en' ? 'Invalid backup file or 0 products found' : 'Archivo no válido o sin productos');
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
      showToast(currentLang === 'en' ? 'Error reading JSON backup' : 'Error al procesar el archivo JSON');
    }
  };
  reader.readAsText(file);
}

function updatePushStatusLabel() {
  const lbl = document.getElementById('push-status-label');
  const btn = document.getElementById('btn-toggle-push');
  if (!lbl) return;
  if (!('Notification' in window)) {
    lbl.textContent = 'Navegador no compatible con Web Notifications';
    if (btn) btn.disabled = true;
    return;
  }
  if (Notification.permission === 'granted') {
    lbl.textContent = '✅ Notificaciones activas en este navegador';
    lbl.classList.add('status-granted');
    if (btn) {
      btn.textContent = 'Avisos activados';
      btn.disabled = true;
    }
  } else if (Notification.permission === 'denied') {
    lbl.textContent = '⚠️ Permiso bloqueado en ajustes del navegador';
    if (btn) btn.disabled = true;
  } else {
    lbl.textContent = '🔔 Permiso pendiente (desactivado)';
    if (btn) {
      btn.textContent = 'Activar notificaciones';
      btn.disabled = false;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
