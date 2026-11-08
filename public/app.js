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
    'tour.btn': 'Guía', 'a11y.skip': 'Saltar al contenido',
    'next.eyebrow': 'Lo próximo que vence', 'next.ret.sub': 'Devolución en {store}', 'next.war.sub': 'Garantía · {store}',
    'next.unit.ret': 'para devolver', 'next.unit.war': 'de garantía', 'next.today': 'Hoy', 'next.today.unit': 'último día para devolver',
    'next.today.war': 'último día de garantía', 'next.btn.ret': 'Preparar devolución', 'next.btn.war': 'Ver garantía', 'next.cal': 'Añadir al calendario',
    'unit.day': 'día', 'unit.days': 'días', 'unit.month': 'mes', 'unit.months': 'meses', 'unit.year': 'año', 'unit.years': 'años',
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
    'btn.account':         'Mi cuenta',
    'btn.logout':          'Salir',
    'demo.banner':         'Modo demo — los datos se borran al cerrar la pestaña.',
    'demo.register':       'Crear cuenta gratis →',
    'session.greeting':    'Hola,',
    'hero.eyebrow':        'GarantíasPro · Tu gestor de compras, devoluciones y garantías',
    'hero.title':          'No vuelvas a perder el dinero de una devolución ni una garantía',
    'hero.desc':           'Guarda tus compras y tickets con total seguridad en la nube. Te avisamos con tiempo antes de que caduquen tus <strong>14 o 30 días de devolución</strong> y los <strong>3 años de garantía legal</strong> en España.',
    'hero.feat1.title':    'Avisos a 3 días y Calendario',
    'hero.feat1.desc':     'Notificaciones push en navegador o móvil y alarmas automáticas directas a tu Google Calendar, Apple Calendar o WhatsApp.',
    'hero.feat2.title':    'Sincronización en la Nube (UE)',
    'hero.feat2.desc':     'Tus facturas y tickets se guardan en servidores seguros en la Unión Europea con cifrado avanzado. No se pierden si cambias de móvil o limpias caché.',
    'hero.feat3.title':    'Adaptado a la Ley Española',
    'hero.feat3.desc':     'Cálculo automático de plazos de desistimiento de comercios y los 3 años de garantía obligatorios en España.',
    'hero.btn.add':        'Añadir mi primer producto',
    'hero.btn.sample':     'Probar con datos de muestra',
    'hero.btn.cloud':      'Crear cuenta en la nube',
    'tools.export':        'Exportar copia de seguridad (JSON)',
    'tools.import':        'Importar',
    'alerts.cal.title':         'Alarmas en tu Calendario Móvil',
    'alerts.cal.desc':          'No necesitas entrar a la web todos los días. Guarda alarmas automáticas en Google Calendar, Apple Calendar o WhatsApp 3 días antes de que venza cualquier plazo de devolución o garantía.',
    'alerts.cal.channel.title': 'Alarmas Automáticas (.ics / Google / Apple)',
    'alerts.cal.channel.sub':   'Genera avisos con alarma a 3 días en cada producto con 1 solo clic',
    'alerts.cal.btn':           'Ver cómo funciona',
    'footer.owner':             'GarantíasPro · Responsable: Jesús Mendoza Domínguez',
    'ticket.vault.tag':         'Custodia permanente',
    'ticket.thermal.tip':       '<strong>El papel térmico se borra a los 6 meses:</strong> Sube una foto o factura en PDF. El lector extraerá todos los datos del ticket automáticamente y tu copia quedará custodiada para siempre.',
    'ticket.scanning':          'Analizando todos los detalles del ticket (cabecera, productos y letra pequeña)...',
    'ticket.analyzed.title':    '¡Ticket analizado con éxito!',
    'ticket.raw.show':          'Ver texto leído en el ticket',
    'ticket.raw.hide':          'Ocultar texto leído en el ticket',
    'ticket.btn.camera':        'Foto con cámara',
    'ticket.btn.file':          'Subir archivo / PDF',
    'ticket.btn.rescan':        'Re-escanear ticket',
    'ticket.btn.settings':      'Ajustes IA / OCR',
    'claim.modal.title':        'Reclamación Formal con 1 Clic',
    'claim.modal.sub':          'Redacción legal conforme al RDL 1/2007 (Ley de Consumidores y Usuarios y 3 años de garantía en España).',
    'viewer.title':             'Ticket Custodiado en el Cofre Digital',
    'viewer.subtitle':          'Copia Digital Permanente · Válida para Reclamaciones Legales en España',
    'acc.modal.title':          'Mi Cuenta y Ajustes',
    'acc.modal.sub':            'Gestiona tu perfil, seguridad y preferencias',
    'acc.pwd.title':            'Cambiar contraseña',
    'acc.pwd.desc':             'Actualiza tu contraseña para mantener tu cuenta protegida en la nube.',
    'acc.pwd.current.label':    'Contraseña actual (para verificar tu identidad)',
    'acc.pwd.current.ph':       'Introduce tu contraseña actual',
    'acc.pwd.new.label':        'Nueva contraseña',
    'acc.pwd.new.ph':           'Mínimo 8 caracteres',
    'acc.pwd.confirm.label':    'Confirmar nueva contraseña',
    'acc.pwd.confirm.ph':       'Repite la nueva contraseña',
    'acc.pwd.btn':              'Actualizar contraseña',
    'acc.install.desc':         'Ábrela desde el icono de tu móvil u ordenador, como una app.',
    'acc.sec.label1':           'Seguridad de cuenta',
    'acc.sec.val1':             'Cifrado de extremo a extremo (TLS / AES-256)',
    'acc.sec.label2':           'Protección de tickets',
    'acc.sec.val2':             'Aislamiento por usuario y custodia antiborrado',
  },
  en: {
    'nav.dashboard':  'Home',
    'tour.btn': 'Guide', 'a11y.skip': 'Skip to content',
    'next.eyebrow': 'Next deadline', 'next.ret.sub': 'Return at {store}', 'next.war.sub': 'Warranty · {store}',
    'next.unit.ret': 'left to return', 'next.unit.war': 'of warranty left', 'next.today': 'Today', 'next.today.unit': 'last day to return',
    'next.today.war': 'last day of warranty', 'next.btn.ret': 'Prepare return', 'next.btn.war': 'View warranty', 'next.cal': 'Add to calendar',
    'unit.day': 'day', 'unit.days': 'days', 'unit.month': 'month', 'unit.months': 'months', 'unit.year': 'year', 'unit.years': 'years',
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
    'btn.account':         'My account',
    'btn.logout':          'Sign out',
    'demo.banner':         'Demo mode — data is deleted when you close the tab.',
    'demo.register':       'Create free account →',
    'session.greeting':    'Hello,',
    'hero.eyebrow':        'GarantíasPro · Your purchase, return & warranty manager',
    'hero.title':          'Never lose money on an expired return or warranty again',
    'hero.desc':           'Store your purchases and receipts safely in the cloud. We alert you ahead of time before your <strong>14 or 30-day return period</strong> and <strong>3-year legal warranty</strong> expire.',
    'hero.feat1.title':    '3-Day Alerts & Calendar',
    'hero.feat1.desc':     'Browser or phone push notifications and direct alarms for Google Calendar, Apple Calendar, or WhatsApp.',
    'hero.feat2.title':    'EU Cloud Sync',
    'hero.feat2.desc':     'Your invoices and receipts are stored on encrypted European Union servers. Never lose them if you switch phones or clear cache.',
    'hero.feat3.title':    'Adapted to Consumer Law',
    'hero.feat3.desc':     'Automatic calculation of store return deadlines and mandatory 3-year legal warranties.',
    'hero.btn.add':        'Add my first product',
    'hero.btn.sample':     'Try with sample data',
    'hero.btn.cloud':      'Create cloud account',
    'tools.export':        'Export backup copy (JSON)',
    'tools.import':        'Import',
    'alerts.cal.title':         'Alarms on your Mobile Calendar',
    'alerts.cal.desc':          'No need to check the app every day. Save automatic alarms in Google Calendar, Apple Calendar, or WhatsApp 3 days before any return or warranty deadline expires.',
    'alerts.cal.channel.title': 'Automatic Alarms (.ics / Google / Apple)',
    'alerts.cal.channel.sub':   'Generate 3-day advance alerts for each product with 1 click',
    'alerts.cal.btn':           'See how it works',
    'footer.owner':             'GarantíasPro · Owner: Jesús Mendoza Domínguez',
    'ticket.vault.tag':         'Permanent vault',
    'ticket.thermal.tip':       '<strong>Thermal paper fades in 6 months:</strong> Upload a receipt photo or PDF invoice. The scanner extracts all details automatically and keeps your receipt safe forever.',
    'ticket.scanning':          'Analyzing all receipt details (header, items, and fine print)...',
    'ticket.analyzed.title':    'Receipt analyzed successfully!',
    'ticket.raw.show':          'View text read from receipt',
    'ticket.raw.hide':          'Hide text read from receipt',
    'ticket.btn.camera':        'Take photo',
    'ticket.btn.file':          'Upload file / PDF',
    'ticket.btn.rescan':        'Re-scan receipt',
    'ticket.btn.settings':      'AI / OCR Settings',
    'claim.modal.title':        '1-Click Formal Legal Claim',
    'claim.modal.sub':          'Formal legal notice drafted under Consumer Law (RDL 1/2007 and 3-year legal warranty).',
    'viewer.title':             'Receipt Stored in Digital Vault',
    'viewer.subtitle':          'Permanent Digital Copy · Valid for Legal Warranty Claims',
    'acc.modal.title':          'My Account & Settings',
    'acc.modal.sub':            'Manage your profile, security, and preferences',
    'acc.pwd.title':            'Change password',
    'acc.pwd.desc':             'Update your password to keep your cloud account protected.',
    'acc.pwd.current.label':    'Current password (to verify your identity)',
    'acc.pwd.current.ph':       'Enter your current password',
    'acc.pwd.new.label':        'New password',
    'acc.pwd.new.ph':           'Minimum 8 characters',
    'acc.pwd.confirm.label':    'Confirm new password',
    'acc.pwd.confirm.ph':       'Repeat your new password',
    'acc.pwd.btn':              'Update password',
    'acc.install.desc':         'Open it from your phone or computer home screen like a native app.',
    'acc.sec.label1':           'Account security',
    'acc.sec.val1':             'End-to-end encryption (TLS / AES-256)',
    'acc.sec.label2':           'Receipt protection',
    'acc.sec.val2':             'Per-user isolation and anti-fade digital vault',
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
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  const codeEl = document.getElementById('lang-code');
  if (codeEl) codeEl.textContent = currentLang === 'es' ? 'ES' : 'EN';
  document.documentElement.lang = currentLang;
  try { document.dispatchEvent(new CustomEvent('gp:langchange', { detail: { lang: currentLang } })); } catch (e) { /* navegadores antiguos */ }
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
window.showToast = showToast;
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
  }
}

// Permite abrir una vista desde fuera (notificación push, acceso directo)
window.gpOpenView = (name) => switchView(name);

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

  renderNextUp(products);

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

/* ── «Lo próximo que vence»: el plazo vivo más cercano, con cuenta atrás ── */
function pickNextDeadline(products) {
  let best = null;
  products.forEach(p => {
    const rs = getReturnStatus(p);
    const ws = getWarrantyStatus(p);
    if (rs.days !== null && rs.days >= 0 && (!best || rs.days < best.days)) best = { p, kind: 'ret', days: rs.days, date: getReturnDeadline(p) };
    if (ws.days !== null && ws.days >= 0 && (!best || ws.days < best.days)) best = { p, kind: 'war', days: ws.days, date: getWarrantyDeadline(p) };
  });
  return best;
}

function humanCount(days) {
  if (days < 100) return { num: String(days), unit: t(days === 1 ? 'unit.day' : 'unit.days') };
  const months = Math.floor(days / 30.44);
  if (months < 24) return { num: String(months), unit: t(months === 1 ? 'unit.month' : 'unit.months') };
  const years = Math.floor(days / 365.25);
  return { num: String(years), unit: t(years === 1 ? 'unit.year' : 'unit.years') };
}

let nextUpCurrent = null;

function renderNextUp(products) {
  const box = document.getElementById('next-up');
  if (!box) return;
  const next = pickNextDeadline(products);
  nextUpCurrent = next;
  if (!next) { box.hidden = true; return; }
  box.hidden = false;
  const { p, kind, days } = next;
  box.dataset.kind = kind;
  box.dataset.level = days <= 3 ? 'danger' : days <= (kind === 'ret' ? 7 : 90) ? 'warn' : 'ok';
  setEl('next-up-name', p.name);
  const store = p.store || (currentLang === 'en' ? 'the store' : 'la tienda');
  const price = p.price ? ' · ' + Number(p.price).toLocaleString(currentLang === 'en' ? 'en-GB' : 'es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €' : '';
  setEl('next-up-sub', t(kind === 'ret' ? 'next.ret.sub' : 'next.war.sub', { store }) + price);
  if (days === 0) {
    setEl('next-up-num', t('next.today'));
    setEl('next-up-unit', t(kind === 'ret' ? 'next.today.unit' : 'next.today.war'));
  } else {
    const c = humanCount(days);
    setEl('next-up-num', c.num);
    setEl('next-up-unit', c.unit + ' ' + t(kind === 'ret' ? 'next.unit.ret' : 'next.unit.war'));
  }
  setEl('next-up-open', t(kind === 'ret' ? 'next.btn.ret' : 'next.btn.war'));
  const cal = document.getElementById('next-up-cal');
  if (cal) { cal.setAttribute('aria-label', t('next.cal')); cal.title = t('next.cal'); }
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
  card.className = 'mini-card is-' + statusType;
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
      ? `1 ${t('label.days.left.singular') || t('label.days.left')}`
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


  const title = document.getElementById('modal-heading');
  if (title) title.textContent = t('modal.title.add');
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) saveBtn.textContent = t('btn.save');

  refreshAiQuotaBadge();
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

  refreshAiQuotaBadge();
  openModal('modal-overlay');
}

function setTicketPreview(dataUrl) {
  const preview = document.getElementById('ticket-preview');
  const placeholder = document.getElementById('ticket-placeholder');
  const removeBtn = document.getElementById('btn-remove-ticket');
  const alertBox = document.getElementById('ai-extraction-alert');
  const rescanBtn = document.getElementById('btn-ai-re-scan');
  const rawToggleWrap = document.getElementById('ai-raw-toggle-wrap');
  const rawTextBox = document.getElementById('ai-raw-text');

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
    if (rawToggleWrap) rawToggleWrap.hidden = true;
    if (rawTextBox) { rawTextBox.textContent = ''; rawTextBox.hidden = true; }
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
    const pdfReader = new FileReader();
    pdfReader.onload = (ev) => {
      const pdfDataUrl = typeof ev.target.result === 'string' ? ev.target.result : null;
      scanTicketWithAI(file, pdfDataUrl);
    };
    pdfReader.onerror = () => scanTicketWithAI(file, null);
    pdfReader.readAsDataURL(file);
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

/* ── 12.1 MOTOR DE EXTRACCIÓN EXACTA DE TICKETS Y FACTURAS (SIN INVENTAR DATOS) ── */
let isScanningTicket = false;

/* Normalización suave de contraste (estiramiento de histograma en escala de grises sin romper trazos finos) */
async function preprocessTicketImage(imageSource, cropFooterOnly = false) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        const srcY = cropFooterOnly ? Math.floor(origH * 0.60) : 0;
        const srcH = cropFooterOnly ? Math.max(1, origH - srcY) : origH;
        const srcW = origW;

        const maxDim = 2200;
        const minDim = 1200;
        let w = srcW;
        let h = srcH;

        if (w > maxDim || h > maxDim) {
          const scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        } else if (Math.max(w, h) < minDim && w > 0 && h > 0) {
          const scale = Math.min(2.2, minDim / Math.max(w, h));
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        canvas.width = w;
        canvas.height = h;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, srcY, srcW, srcH, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        const totalPixels = w * h;
        const hist = new Uint32Array(256);

        for (let i = 0; i < d.length; i += 4) {
          const lum = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
          d[i] = lum;
          hist[lum]++;
        }

        // Percentiles 3% (tinta) y 90% (papel de fondo)
        let low = 0, high = 255, acc = 0;
        const lowTarget = totalPixels * 0.03;
        const highTarget = totalPixels * 0.90;
        for (let v = 0; v < 256; v++) {
          acc += hist[v];
          if (acc < lowTarget) low = v;
          if (acc < highTarget) high = v;
        }
        const range = Math.max(40, high - low);

        for (let i = 0; i < d.length; i += 4) {
          const lum = d[i];
          let norm = (lum - low) / range;
          norm = Math.max(0, Math.min(1, norm));
          // Empujar el fondo claro a blanco limpio y oscurecer los caracteres del ticket
          const val = norm > 0.78
            ? Math.min(255, Math.round(200 + (norm - 0.78) * 250))
            : Math.round(Math.pow(norm, 1.18) * 255);
          d[i] = val;
          d[i + 1] = val;
          d[i + 2] = val;
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.94));
      } catch (err) {
        console.warn('Canvas preproc warning, using original:', err);
        resolve(imageSource);
      }
    };
    img.onerror = () => resolve(imageSource);
    img.src = imageSource;
  });
}

/* Ejecución real de Tesseract.js OCR en el navegador */
async function runOcrWithTesseract(imageSource, onProgress, psm = '6') {
  if (typeof window.Tesseract === 'undefined') {
    throw new Error('Tesseract OCR no cargado');
  }

  let worker = null;
  try {
    if (onProgress) onProgress('Iniciando motor OCR de alta precisión...', 10);
    worker = await window.Tesseract.createWorker('spa', 1, {
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5/tesseract-core.wasm.js',
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          const pct = Math.round((m.progress || 0) * 100);
          onProgress(`Leyendo texto del ticket... ${pct}%`, pct);
        }
      }
    });

    if (worker.setParameters) {
      await worker.setParameters({
        tessedit_pageseg_mode: psm,
        preserve_interword_spaces: '1'
      }).catch(() => {});
    }

    const { data: { text } } = await worker.recognize(imageSource);
    await worker.terminate();
    return text || '';
  } catch (err) {
    if (worker) {
      try { await worker.terminate(); } catch {}
    }
    throw err;
  }
}

/* Extracción de texto digital de facturas en PDF en el navegador */
async function extractTextFromPdfFile(file) {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder('latin1');
    const raw = decoder.decode(bytes);
    const chunks = [];
    const regex = /\(([^()\\]{2,120})\)\s*T[jJ]/g;
    let m;
    while ((m = regex.exec(raw)) !== null) {
      const clean = m[1].replace(/\\[nrt]/g, ' ').replace(/[\x00-\x1F]/g, '').trim();
      if (clean.length >= 2 && /[A-Za-z0-9]/.test(clean)) chunks.push(clean);
    }
    return chunks.join('\n');
  } catch {
    return '';
  }
}

/* Catálogo de comercios y cadenas en España */
const KNOWN_STORES = [
  { key: /\bmercadona\b/i, name: 'Mercadona' },
  { key: /\bcarrefour\b/i, name: 'Carrefour' },
  { key: /media\s*markt/i, name: 'MediaMarkt' },
  { key: /corte\s*ingl[eé]s/i, name: 'El Corte Inglés' },
  { key: /\bhipercor\b/i, name: 'Hipercor' },
  { key: /\bsupercor\b/i, name: 'Supercor' },
  { key: /\bsfera\b/i, name: 'Sfera' },
  { key: /\bzara\s*home\b/i, name: 'Zara Home' },
  { key: /\bzara\b/i, name: 'Zara' },
  { key: /stradivarius/i, name: 'Stradivarius' },
  { key: /pull\s*(?:&|and)?\s*bear/i, name: 'Pull&Bear' },
  { key: /\bbershka\b/i, name: 'Bershka' },
  { key: /massimo\s*dutti/i, name: 'Massimo Dutti' },
  { key: /\boysho\b/i, name: 'Oysho' },
  { key: /\blefties\b/i, name: 'Lefties' },
  { key: /\bdecathlon\b/i, name: 'Decathlon' },
  { key: /leroy\s*merlin/i, name: 'Leroy Merlin' },
  { key: /\bikea\b/i, name: 'IKEA' },
  { key: /\blidl\b/i, name: 'Lidl' },
  { key: /\baldi\b/i, name: 'Aldi' },
  { key: /\balcampo\b/i, name: 'Alcampo' },
  { key: /\bfnac\b/i, name: 'Fnac' },
  { key: /apple\s*(?:store|retail|distribution)/i, name: 'Apple Store' },
  { key: /\bamazon\b/i, name: 'Amazon' },
  { key: /pc\s*componentes/i, name: 'PcComponentes' },
  { key: /\b(?:bricomart|obramat)\b/i, name: 'Obramat' },
  { key: /\bbauhaus\b/i, name: 'Bauhaus' },
  { key: /brico\s*dep[oô]t/i, name: 'Brico Depôt' },
  { key: /\bprimark\b/i, name: 'Primark' },
  { key: /\bmango\b/i, name: 'Mango' },
  { key: /\bsprinter\b/i, name: 'Sprinter' },
  { key: /jd\s*sports/i, name: 'JD Sports' },
  { key: /foot\s*locker/i, name: 'Foot Locker' },
  { key: /\beroski\b/i, name: 'Eroski' },
  { key: /\bconsum\b/i, name: 'Consum' },
  { key: /supermercados\s*dia|\bdia\s*s\.?a\b/i, name: 'Supermercados Dia' },
  { key: /\bahorramas\b/i, name: 'Ahorramas' },
  { key: /\bbonpreu\b/i, name: 'Bonpreu' },
  { key: /\bcaprabo\b/i, name: 'Caprabo' },
  { key: /\bgadis\b/i, name: 'Gadis' },
  { key: /\bfroiz\b/i, name: 'Froiz' },
  { key: /\blupa\b/i, name: 'Lupa' },
  { key: /\bworten\b/i, name: 'Worten' },
  { key: /videojuegos\s*game|\bgame\s*stores\b/i, name: 'GAME' },
  { key: /phone\s*house/i, name: 'Phone House' },
  { key: /\bk-?tuin\b/i, name: 'K-tuin' },
  { key: /mi\s*electro/i, name: 'Mi Electro' },
  { key: /\btien\s*21\b/i, name: 'Tien21' },
  { key: /\beuronics\b/i, name: 'Euronics' },
  { key: /\bmilar\b/i, name: 'Milar' },
  { key: /\bcoolmod\b/i, name: 'Coolmod' },
  { key: /\bjysk\b/i, name: 'JYSK' },
  { key: /\bconforama\b/i, name: 'Conforama' },
  { key: /maisons\s*du\s*monde/i, name: 'Maisons du Monde' },
  { key: /\bpepco\b/i, name: 'Pepco' },
  { key: /\baction\b/i, name: 'Action' },
  { key: /\btedi\b/i, name: 'TEDi' },
  { key: /ale-?hop/i, name: 'Ale-Hop' },
  { key: /flying\s*tiger/i, name: 'Flying Tiger' },
  { key: /\bdruni\b/i, name: 'Druni' },
  { key: /\bprimor\b/i, name: 'Primor' },
  { key: /\bsephora\b/i, name: 'Sephora' },
  { key: /\bdouglas\b/i, name: 'Douglas' },
  { key: /\brituals\b/i, name: 'Rituals' },
  { key: /\bcortefiel\b/i, name: 'Cortefiel' },
  { key: /\bspringfield\b/i, name: 'Springfield' },
  { key: /women'?secret/i, name: "Women'secret" },
  { key: /pedro\s*del\s*hierro/i, name: 'Pedro del Hierro' },
  { key: /\bkiabi\b/i, name: 'Kiabi' },
  { key: /\bparfois\b/i, name: 'Parfois' },
  { key: /\btous\b/i, name: 'Tous' },
  { key: /\bdesigual\b/i, name: 'Desigual' },
  { key: /\bscalpers\b/i, name: 'Scalpers' },
  { key: /\buniqlo\b/i, name: 'Uniqlo' },
  { key: /\bh\s*&\s*m\b/i, name: 'H&M' },
  { key: /\bdeichmann\b/i, name: 'Deichmann' },
  { key: /\bmerkal\b/i, name: 'Merkal' },
  { key: /\bnorauto\b/i, name: 'Norauto' },
  { key: /feu\s*vert/i, name: 'Feu Vert' },
  { key: /\baurgi\b/i, name: 'Aurgi' },
  { key: /casa\s*del\s*libro/i, name: 'Casa del Libro' },
  { key: /\bjuguettos\b/i, name: 'Juguettos' },
  { key: /toys\s*r\s*us/i, name: 'ToysRUs' },
  { key: /\bcostco\b/i, name: 'Costco' },
  { key: /\bmakro\b/i, name: 'Makro' }
];

/* Catálogo de marcas reales de productos (distintas del nombre de la tienda) */
const KNOWN_PRODUCT_BRANDS = [
  { key: /\b(?:apple|iphone|ipad|macbook|airpods|imac)\b/i, name: 'Apple' },
  { key: /\b(?:samsung|galaxy)\b/i, name: 'Samsung' },
  { key: /\b(?:xiaomi|redmi|poco|mi\s*band)\b/i, name: 'Xiaomi' },
  { key: /\b(?:sony|playstation|ps5|ps4|bravia|wh-?1000|wf-?1000)\b/i, name: 'Sony' },
  { key: /\blg\b/i, name: 'LG' },
  { key: /\bphilips\b/i, name: 'Philips' },
  { key: /\bbosch\b/i, name: 'Bosch' },
  { key: /\bbalay\b/i, name: 'Balay' },
  { key: /\bsiemens\b/i, name: 'Siemens' },
  { key: /\bteka\b/i, name: 'Teka' },
  { key: /\bbeko\b/i, name: 'Beko' },
  { key: /\bwhirlpool\b/i, name: 'Whirlpool' },
  { key: /\belectrolux\b/i, name: 'Electrolux' },
  { key: /\baeg\b/i, name: 'AEG' },
  { key: /\bzanussi\b/i, name: 'Zanussi' },
  { key: /\bhisense\b/i, name: 'Hisense' },
  { key: /\btcl\b/i, name: 'TCL' },
  { key: /\bpanasonic\b/i, name: 'Panasonic' },
  { key: /\bcanon\b/i, name: 'Canon' },
  { key: /\bnikon\b/i, name: 'Nikon' },
  { key: /\bgopro\b/i, name: 'GoPro' },
  { key: /\bdji\b/i, name: 'DJI' },
  { key: /\bgarmin\b/i, name: 'Garmin' },
  { key: /\bhuawei\b/i, name: 'Huawei' },
  { key: /\bhonor\b/i, name: 'Honor' },
  { key: /\boppo\b/i, name: 'Oppo' },
  { key: /\brealme\b/i, name: 'Realme' },
  { key: /\bmotorola\b/i, name: 'Motorola' },
  { key: /\boneplus\b/i, name: 'OnePlus' },
  { key: /\b(?:hp|hewlett)\b/i, name: 'HP' },
  { key: /\blenovo\b/i, name: 'Lenovo' },
  { key: /\bdell\b/i, name: 'Dell' },
  { key: /\basus\b/i, name: 'Asus' },
  { key: /\bacer\b/i, name: 'Acer' },
  { key: /\bmsi\b/i, name: 'MSI' },
  { key: /\brazer\b/i, name: 'Razer' },
  { key: /\bcorsair\b/i, name: 'Corsair' },
  { key: /\blogitech\b/i, name: 'Logitech' },
  { key: /\btrust\b/i, name: 'Trust' },
  { key: /\bhyperx\b/i, name: 'HyperX' },
  { key: /\bjbl\b/i, name: 'JBL' },
  { key: /\bbose\b/i, name: 'Bose' },
  { key: /\bsennheiser\b/i, name: 'Sennheiser' },
  { key: /\bmarshall\b/i, name: 'Marshall' },
  { key: /\bsonos\b/i, name: 'Sonos' },
  { key: /\bdyson\b/i, name: 'Dyson' },
  { key: /\b(?:cecotec|conga|mambo|bamba)\b/i, name: 'Cecotec' },
  { key: /\browenta\b/i, name: 'Rowenta' },
  { key: /\bmoulinex\b/i, name: 'Moulinex' },
  { key: /\btefal\b/i, name: 'Tefal' },
  { key: /\bkrups\b/i, name: 'Krups' },
  { key: /\bdelonghi\b|de'longhi/i, name: "De'Longhi" },
  { key: /\bnespresso\b/i, name: 'Nespresso' },
  { key: /\bbraun\b/i, name: 'Braun' },
  { key: /\boral-?b\b/i, name: 'Oral-B' },
  { key: /\bremington\b/i, name: 'Remington' },
  { key: /\bbabyliss\b/i, name: 'BaByliss' },
  { key: /\bghd\b/i, name: 'ghd' },
  { key: /\bufesa\b/i, name: 'Ufesa' },
  { key: /\btaurus\b/i, name: 'Taurus' },
  { key: /\borbegozo\b/i, name: 'Orbegozo' },
  { key: /\bjata\b/i, name: 'Jata' },
  { key: /\bk[aä]rcher\b/i, name: 'Kärcher' },
  { key: /\b(?:irobot|roomba)\b/i, name: 'iRobot' },
  { key: /\broborock\b/i, name: 'Roborock' },
  { key: /\bdreame\b/i, name: 'Dreame' },
  { key: /\b(?:nintendo|switch)\b/i, name: 'Nintendo' },
  { key: /\bxbox\b/i, name: 'Xbox' },
  { key: /\blego\b/i, name: 'LEGO' },
  { key: /\bcasio\b/i, name: 'Casio' },
  { key: /\bseiko\b/i, name: 'Seiko' },
  { key: /\blotus\b/i, name: 'Lotus' },
  { key: /\bfestina\b/i, name: 'Festina' },
  { key: /\bpandora\b/i, name: 'Pandora' },
  { key: /\bray-?ban\b/i, name: 'Ray-Ban' },
  { key: /\bhawkers\b/i, name: 'Hawkers' },
  { key: /\bnike\b/i, name: 'Nike' },
  { key: /\badidas\b/i, name: 'Adidas' },
  { key: /\bpuma\b/i, name: 'Puma' },
  { key: /\basics\b/i, name: 'Asics' },
  { key: /\bnew\s*balance\b/i, name: 'New Balance' },
  { key: /\bsalomon\b/i, name: 'Salomon' },
  { key: /\bvans\b/i, name: 'Vans' },
  { key: /\bconverse\b/i, name: 'Converse' },
  { key: /\breebok\b/i, name: 'Reebok' },
  { key: /\bquechua\b/i, name: 'Quechua' },
  { key: /\bdomyos\b/i, name: 'Domyos' },
  { key: /\brockrider\b/i, name: 'Rockrider' },
  { key: /\bkipsta\b/i, name: 'Kipsta' },
  { key: /\bforclaz\b/i, name: 'Forclaz' },
  { key: /\bparkside\b/i, name: 'Parkside' },
  { key: /\bsilvercrest\b/i, name: 'Silvercrest' },
  { key: /\bcrivit\b/i, name: 'Crivit' },
  { key: /\bhacendado\b/i, name: 'Hacendado' },
  { key: /\bdeliplus\b/i, name: 'Deliplus' },
  { key: /\bbosque\s*verde\b/i, name: 'Bosque Verde' }
];

/* Extrae todos los importes monetarios válidos de una línea de texto */
function extractPricesFromLine(line) {
  if (!line) return [];
  const norm = line.replace(/(\d)\s*([,.])\s*(\d{2})(?!\d)/g, '$1$2$3');
  const results = [];
  const regex = /(?:^|[^\d.,/\-])((?:\d{1,3}(?:\.\d{3})+|\d{1,5})[,.]\d{2})(?!\s*%)(?!\s*(?:kg|g|l|ml|m|cm|mm|un|ud|uds)\b)(?=$|[^\d.,/\-])/gi;
  let m;
  while ((m = regex.exec(norm)) !== null) {
    const rawNum = m[1];
    const afterIdx = m.index + m[0].length;
    if (norm.slice(afterIdx).match(/^[./-]\d{2,4}/)) continue;

    let clean = rawNum;
    if (clean.includes('.') && clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    const val = parseFloat(clean);
    if (!isNaN(val) && val > 0 && val < 100000) {
      results.push({
        val,
        raw: rawNum,
        index: m.index
      });
    }
  }
  return results;
}

/* Convierte números escritos en texto o meses a número entero de días */
function parseSpanishDaysExpression(str) {
  if (!str) return null;
  const s = str.toLowerCase().trim();
  const numMatch = s.match(/\b(\d{1,3})\b/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    if (/mes(?:es)?\b/.test(s)) return n * 30;
    if (/semana[s]?\b/.test(s)) return n * 7;
    if (/a[ñn]o[s]?\b/.test(s)) return n * 365;
    return n;
  }
  const WORD_DAYS = [
    { re: /\b(?:un|uno)\s+mes\b/, days: 30 },
    { re: /\bdos\s+meses\b/, days: 60 },
    { re: /\btres\s+meses\b/, days: 90 },
    { re: /\bseis\s+meses\b/, days: 180 },
    { re: /\bun\s+a[ñn]o\b/, days: 365 },
    { re: /\buna\s+semana\b/, days: 7 },
    { re: /\bdos\s+semanas\b/, days: 14 },
    { re: /\bsiete\b/, days: 7 },
    { re: /\bdiez\b/, days: 10 },
    { re: /\bcatorce\b/, days: 14 },
    { re: /\bquince\b/, days: 15 },
    { re: /\bveinte\b/, days: 20 },
    { re: /\bveintiocho\b/, days: 28 },
    { re: /\btreinta\b/, days: 30 },
    { re: /\bcuarenta\s+y\s+cinco\b/, days: 45 },
    { re: /\bsesenta\b/, days: 60 },
    { re: /\bnoventa\b/, days: 90 },
    { re: /\bcien\b/, days: 100 }
  ];
  for (const w of WORD_DAYS) {
    if (w.re.test(s)) return w.days;
  }
  return null;
}

/* Extrae plazo de devolución, condiciones de devolución/reembolso/vale y garantía de un texto */
function extractPoliciesFromText(lines, fullText, purchaseDate) {
  let detectedReturnDays = null;
  let detectedReturnConditions = '';
  let detectedWarrantyYears = null;
  let detectedCoverage = '';
  let detectedNoCoverage = '';

  // Unir líneas con espacios para poder detectar frases que saltan de renglón en tickets estrechos (58mm / 80mm)
  const continuousText = lines.join(' ').replace(/\s+/g, ' ');

  // ── A. DÍAS DE DEVOLUCIÓN / CAMBIO ──
  // Buscar tanto en las condiciones extraídas como en el texto continuo completo
  const retPatterns = [
    // "el plazo para devolver es de 15 días", "plazo máximo de devolución: 15 días", "para cambios o devoluciones dispone de 15 días"
    /(?:plazo|periodo|per[ií]odo|tiempo|dispone(?:n)?|tienes?|m[aá]ximo|dentro)\s*(?:m[aá]ximo\s*)?(?:para\s+|de\s+)?(?:poder\s+)?(?:realizar\s+|efectuar\s+|hacer\s+)?(?:cambios?\s*(?:o|y|\/)?\s*)?(?:devolver|devoluci[oó]n(?:es)?|cambiar|cambios?|desistimiento|canje(?:ar)?)[^.!;\n]{0,65}?\b((?:\d{1,3}|siete|diez|catorce|quince|veinte|veintiocho|treinta|sesenta|noventa|un|dos|tres)\s*(?:d[ií1l!|]a[s5]?|d\.|mes(?:es)?|semana[s]?))\b/i,
    // "devoluciones o cambios en 15 días", "devolver el producto: 15 días", "cambios y devoluciones 15 días"
    /(?:devolver|devoluci[oó]n(?:es)?|cambiar|cambios?\s*(?:y|o|\/)\s*devoluciones|desistimiento|canje(?:ar)?)[^.!;\n]{0,65}?\b((?:\d{1,3}|siete|diez|catorce|quince|veinte|veintiocho|treinta|sesenta|noventa|un|dos|tres)\s*(?:d[ií1l!|]a[s5]?|d\.|mes(?:es)?|semana[s]?))\b/i,
    // "15 días para devolver", "15 días naturales para cambios o devoluciones", "15 días desde la fecha de compra"
    /\b((?:\d{1,3}|siete|diez|catorce|quince|veinte|veintiocho|treinta|sesenta|noventa|un|dos|tres)\s*(?:d[ií1l!|]a[s5]?|d\.|mes(?:es)?|semana[s]?))\s*(?:naturales\s*|h[aá]biles\s*)?(?:desde\s+la\s+(?:fecha\s+de\s+)?compra\s*)?(?:para\s+|de\s+|en\s+)(?:poder\s+)?(?:cambios?\s*(?:o|y|\/)?\s*)?(?:devolver|devoluci[oó]n(?:es)?|cambiar|cambios?|desistimiento|canje)/i,
    // "no se admiten devoluciones pasados 15 días", "pasados 15 días no se aceptan cambios"
    /(?:pasados|transcurridos|despu[eé]s\s+de)\s*\b((?:\d{1,3}|siete|diez|catorce|quince|veinte|veintiocho|treinta|sesenta|noventa|un|dos|tres)\s*(?:d[ií1l!|]a[s5]?|d\.|mes(?:es)?|semana[s]?))\b[^.!;\n]{0,50}?(?:devolver|devoluci[oó]n|cambio|admit|acept)/i,
    /(?:no\s+se\s+(?:admiten|aceptan|har[aá]n)\s+(?:cambios?\s*(?:ni|o)\s*)?(?:devoluciones|cambios))[^.!;\n]{0,45}?\b((?:\d{1,3}|siete|diez|catorce|quince|veinte|veintiocho|treinta|sesenta|noventa|un|dos|tres)\s*(?:d[ií1l!|]a[s5]?|d\.|mes(?:es)?|semana[s]?))\b/i,
    // "plazo: 15 días" o "plazo es de 15 días"
    /\bplazo\s*(?:m[aá]ximo)?\s*(?:para\s+\w+\s*)?(?:es\s*de|de|:)?\s*\b((?:\d{1,3}|siete|diez|catorce|quince|veinte|veintiocho|treinta|sesenta|noventa|un|dos|tres)\s*(?:d[ií1l!|]a[s5]?|d\.|mes(?:es)?|semana[s]?))\b/i
  ];

  for (const pat of retPatterns) {
    const m = continuousText.match(pat);
    if (m && m[1]) {
      const parsedDays = parseSpanishDaysExpression(m[1]);
      if (parsedDays && parsedDays >= 1 && parsedDays <= 365) {
        detectedReturnDays = parsedDays;
        break;
      }
    }
  }

  // Si el ticket indica una "fecha límite de devolución: DD/MM/YYYY" y tenemos fecha de compra, calcular los días exactos
  if (detectedReturnDays === null && purchaseDate) {
    const limitMatch = continuousText.match(/(?:fecha\s*l[ií]mite\s*(?:de\s*)?(?:devoluci[oó]n|cambio)|devoluci[oó]n\s*hasta(?:\s*el)?|cambiar\s*antes\s*del)\s*[:.-]?\s*([0-3]?\d)[/.-]([01]?\d)[/.-](20\d{2}|\d{2})/i);
    if (limitMatch) {
      let y = parseInt(limitMatch[3], 10);
      if (y < 100) y += 2000;
      const limitIso = `${y}-${ String(limitMatch[2]).padStart(2, '0') }-${ String(limitMatch[1]).padStart(2, '0') }`;
      const diff = daysBetween(purchaseDate, limitIso);
      if (diff !== null && diff >= 1 && diff <= 365) {
        detectedReturnDays = diff;
      }
    }
  }

  // ── B. CONDICIONES DE DEVOLUCIÓN / ABONO / VALE / TIENDA (EXTRACCIÓN MULTILÍNEA COMPLETA) ──
  // Detecta frases reales de política de devolución, reembolso, vales de tienda o requisitos de ticket/embalaje
  const policyLineTrigger = /(?:devolver|devoluci[oó]n|devoluciones|cambios?\s*(?:y|o|ni|\/)\s*devoluciones|plazo\s*(?:m[aá]ximo\s*)?(?:de|para)|no\s+se\s+(?:abona(?:r[aá])?|devuelve|devolver[aá]|reembolsa(?:r[aá])?|admiten|aceptan|cambian)|abonar[aá]?\s+(?:el\s+)?(?:dinero|efectivo|importe)|gastar\s+(?:el\s+dinero\s+)?en\s+(?:la\s+)?tienda|vale\s+(?:de\s+compra|canjeable|por\s+el\s+importe|sin\s+caducidad)|bono\s+de\s+compra|conserve\s+(?:este|el)\s+ticket|imprescindible\s+(?:presentar\s+)?(?:este\s+|el\s+)?ticket|presentar\s+(?:este|el)\s+ticket|embalaje\s+original|envase\s+original|precinto\s+original|sin\s+usar|sin\s+abrir|perfecto\s+estado|art[ií]culos\s+de\s+(?:fiesta|higiene|ba[ñn]o)|ropa\s+interior)/i;
  const nonPolicyNoise = /^(?:total|subtotal|base\s*imponible|cuota|iva\b|i\.v\.a|tarjeta|visa|mastercard|maestro|bizum|cambio\s+\d|entrega\s*efectivo|efectivo\s+\d|factura\s*simplificada|n[º°o]?\s*(?:de\s*)?(?:factura|ticket)|fecha\s*:|hora\s*:|atendido\s*por|vendedor|cajero|caja\s*[:\d]|tpv|terminal|operaci[oó]n|autorizaci[oó]n|nif\b|cif\b|tel[eé]fono|tfno|www\.|http|gracias\s+por\s+su\s+visita|\*+|\-+|=+)$/i;

  const matchedIndices = new Set();
  lines.forEach((line, idx) => {
    if (nonPolicyNoise.test(line)) return;
    // Ignorar líneas que son claramente un artículo con precio en la sección superior si no tienen verbos de política
    if (extractPricesFromLine(line).length > 0 && !/(?:abona|devuelv|dinero|efectivo|vale|tienda|plazo|d[ií]as|reembols)/i.test(line)) return;

    if (policyLineTrigger.test(line)) {
      matchedIndices.add(idx);
      // Incluir la línea anterior o siguientes si forman parte de la misma frase cortada por el ancho del ticket
      if (idx + 1 < lines.length && !nonPolicyNoise.test(lines[idx + 1]) && extractPricesFromLine(lines[idx + 1]).length === 0) {
        const nextL = lines[idx + 1];
        if (!/[.:!]$/.test(line) || /^(?:sino|si\s+no|que\s+|para\s+|en\s+|con\s+|sin\s+|el\s+|la\s+|los\s+|las\s+|un\s+|una\s+|de\s+|del\s+|por\s+|o\s+|y\s+|ni\s+|se\s+|deber[aá]|gastar|en\s+tienda|en\s+la\s+tienda|mediante|presentando)/i.test(nextL)) {
          matchedIndices.add(idx + 1);
          if (idx + 2 < lines.length && !nonPolicyNoise.test(lines[idx + 2]) && extractPricesFromLine(lines[idx + 2]).length === 0 && !/[.:!]$/.test(nextL)) {
            matchedIndices.add(idx + 2);
          }
        }
      }
    }
  });

  if (matchedIndices.size > 0) {
    const sortedIdxs = [...matchedIndices].sort((a, b) => a - b);
    const paragraphs = [];
    let currentPara = [];
    for (let k = 0; k < sortedIdxs.length; k++) {
      const idx = sortedIdxs[k];
      if (k > 0 && idx === sortedIdxs[k - 1] + 1) {
        currentPara.push(lines[idx]);
      } else {
        if (currentPara.length > 0) paragraphs.push(currentPara.join(' '));
        currentPara = [lines[idx]];
      }
    }
    if (currentPara.length > 0) paragraphs.push(currentPara.join(' '));

    detectedReturnConditions = paragraphs
      .join('. ')
      .replace(/\s+/g, ' ')
      .replace(/\.\s*\./g, '.')
      .trim()
      .slice(0, 390);
  }

  // ── C. AÑOS DE GARANTÍA Y COBERTURAS (SOLO SI APARECEN EN EL TICKET) ──
  const warYearsMatch = continuousText.match(/\b(\d{1,2}|un|uno|dos|tres|cuatro|cinco)\s*a[ñn]os?\s*(?:de\s*)?garant[ií]a\b/i) ||
                        continuousText.match(/\bgarant[ií]a\s*(?:legal\s*|comercial\s*|oficial\s*)?(?:de\s*|es\s*de\s*)?(\d{1,2}|un|uno|dos|tres|cuatro|cinco)\s*a[ñn]os?\b/i);
  if (warYearsMatch && warYearsMatch[1]) {
    const rawY = warYearsMatch[1].toLowerCase();
    const wordMap = { un: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5 };
    const y = wordMap[rawY] || parseInt(rawY, 10);
    if (y >= 1 && y <= 30) detectedWarrantyYears = y;
  } else {
    const warMonthsMatch = continuousText.match(/\b(6|12|24|36)\s*meses\s*(?:de\s*)?garant[ií]a\b/i) ||
                           continuousText.match(/\bgarant[ií]a\s*(?:de\s*)?(6|12|24|36)\s*meses\b/i);
    if (warMonthsMatch && warMonthsMatch[1]) {
      detectedWarrantyYears = Number((parseInt(warMonthsMatch[1], 10) / 12).toFixed(1));
    }
  }

  // Coberturas o exclusiones de garantía explícitas en el ticket
  const covLines = lines.filter(l => /(?:garant[ií]a\s+cubre|cubre\s+defectos|este\s+ticket\s+es\s+su\s+garant[ií]a|garant[ií]a\s+v[aá]lida)/i.test(l));
  if (covLines.length > 0) detectedCoverage = covLines.join('. ').slice(0, 400);

  const noCovLines = lines.filter(l => /(?:garant[ií]a\s+no\s+cubre|excluid[oa]s?\s+de\s+(?:la\s+)?garant[ií]a|no\s+cubre\s+(?:roturas|golpes|mal\s+uso|desgaste))/i.test(l));
  if (noCovLines.length > 0) detectedNoCoverage = noCovLines.join('. ').slice(0, 400);

  return {
    returnDays: detectedReturnDays,
    returnConditions: detectedReturnConditions,
    warrantyYears: detectedWarrantyYears,
    coverage: detectedCoverage,
    noCoverage: detectedNoCoverage
  };
}

/* Parser universal de tickets y facturas en España (CERO DATOS INVENTADOS, MÁXIMO DETALLE) */
function parseReceiptOcrText(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l.length > 1);

  if (!lines.length) return null;

  const headerSlice = lines.slice(0, 10).join('\n');

  // ── 1. TIENDA / VENDEDOR ───────────────────────────────────────
  let detectedStore = '';
  let matchedStore = KNOWN_STORES.find(s => s.key.test(headerSlice)) || KNOWN_STORES.find(s => s.key.test(rawText));
  if (matchedStore) {
    detectedStore = matchedStore.name;
  } else {
    const legalEntityRegex = /\b(?:S\.?\s*L\.?\s*U?\.?|S\.?\s*A\.?\s*U?\.?|S\.?\s*C\.?|C\.?\s*B\.?)\b/i;
    const nonStoreHeader = /^(?:factura|ticket|simplificada|simplificado|recibo|albaran|nota|copia|duplicado|original|caja|tpv|terminal|operacion|comercio|fecha|hora|cliente|atendido|vendedor|camarero|mesa|pedido|nif|cif|dni|iva|tel|tfno|telefono|movil|www\.|http|calle|c\/|avda|avenida|plaza|pza|pol\.|poligono|ctra|carretera|cp\b|\d{5}\b)/i;

    for (let i = 0; i < Math.min(8, lines.length); i++) {
      const l = lines[i];
      if (legalEntityRegex.test(l) && !/^(?:nif|cif|dir|calle|c\/|av)/i.test(l)) {
        const cleanEntity = l.replace(/\b(?:nif|cif)\s*[:.-]?\s*[A-Z0-9-]+/ig, '').trim();
        if (cleanEntity.length >= 3 && cleanEntity.length <= 65) {
          detectedStore = cleanEntity;
          break;
        }
      }
    }

    if (!detectedStore) {
      for (let i = 0; i < Math.min(4, lines.length); i++) {
        const l = lines[i].replace(/^[*#\-=~_+|\s]+|[*#\-=~_+|\s]+$/g, '').trim();
        if (l.length < 3 || l.length > 48) continue;
        if (nonStoreHeader.test(l)) continue;
        if (/\d{2}[/.-]\d{2}[/.-]\d{2,4}/.test(l) || /\b\d+[,.]\d{2}\b/.test(l)) continue;
        if (/\b[A-HJ-NP-SUVW]\d{7}[0-9A-J]\b/i.test(l)) continue;
        if (/\b\d{3}[\s.-]?\d{2,3}[\s.-]?\d{2,3}\b/.test(l)) continue;
        const letters = (l.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
        const vowels = (l.match(/[AEIOUÁÉÍÓÚÜaeiouáéíóúü]/g) || []).length;
        if (letters >= 3 && letters / l.length >= 0.72 && vowels >= 1 && vowels / letters >= 0.22) {
          detectedStore = l;
          break;
        }
      }
    }
  }

  // ── 2. FECHA DE COMPRA (SOLO SI APARECE EN EL TICKET) ─────────
  let detectedDate = '';
  const MONTH_MAP = {
    ene: '01', enero: '01', jan: '01',
    feb: '02', febrero: '02',
    mar: '03', marzo: '03',
    abr: '04', abril: '04', apr: '04',
    may: '05', mayo: '05',
    jun: '06', junio: '06',
    jul: '07', julio: '07',
    ago: '08', agosto: '08', aug: '08',
    sep: '09', sept: '09', set: '09', septiembre: '09',
    oct: '10', octubre: '10',
    nov: '11', noviembre: '11',
    dic: '12', diciembre: '12', dec: '12'
  };

  const currentYear = new Date().getFullYear();
  const dateCandidates = [];

  function addDateCandidate(y, m, d, lineIdx, lineText) {
    let year = parseInt(y, 10);
    if (year < 100) year += 2000;
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);
    if (year < 2000 || year > currentYear + 1) return;
    if (month < 1 || month > 12 || day < 1 || day > 31) return;
    const iso = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const parsedTime = new Date(iso + 'T00:00:00').getTime();
    if (isNaN(parsedTime)) return;
    if (parsedTime > Date.now() + 2 * 86400000) return;
    if (/(?:caduc|valido\s*hasta|v[aá]lido\s*hasta|vencimiento|fecha\s*l[ií]mite|devoluci[oó]n\s*hasta|antes\s*del)/i.test(lineText)) return;

    let score = 10;
    if (/(?:fecha|date|compra|emisi[oó]n|expedici[oó]n|factura|ticket|venta)/i.test(lineText)) score += 45;
    if (/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/.test(lineText)) score += 35;
    if (lineIdx < 12) score += 15;
    dateCandidates.push({ iso, score, lineIdx });
  }

  lines.forEach((line, idx) => {
    const dmyMatches = [...line.matchAll(/\b([0-3]?\d)\s*[/.-]\s*([01]?\d)\s*[/.-]\s*(20\d{2}|\d{2})\b/g)];
    dmyMatches.forEach(m => addDateCandidate(m[3], m[2], m[1], idx, line));

    const ymdMatches = [...line.matchAll(/\b(20\d{2})\s*[/.-]\s*([01]?\d)\s*[/.-]\s*([0-3]?\d)\b/g)];
    ymdMatches.forEach(m => addDateCandidate(m[1], m[2], m[3], idx, line));

    const txtMatches = [...line.matchAll(/\b([0-3]?\d)\s*(?:de\s+|[/.-]|\s+)([a-záéíóú]{3,10})\.?\s*(?:de\s+|,\s*|[/.-]|\s+)(20\d{2}|\d{2})\b/gi)];
    txtMatches.forEach(m => {
      const mKey = m[2].toLowerCase().slice(0, 4);
      const mKey3 = m[2].toLowerCase().slice(0, 3);
      const monthNum = MONTH_MAP[m[2].toLowerCase()] || MONTH_MAP[mKey] || MONTH_MAP[mKey3];
      if (monthNum) addDateCandidate(m[3], monthNum, m[1], idx, line);
    });
  });

  if (dateCandidates.length > 0) {
    dateCandidates.sort((a, b) => b.score - a.score || a.lineIdx - b.lineIdx);
    detectedDate = dateCandidates[0].iso;
  }

  // ── 3. IMPORTE TOTAL EXACTO ────────────────────────────────────
  let detectedPrice = null;
  const ignorePriceLine = /(?:cambio|devuelto|a\s*devolver|su\s*vuelta|entregado|entrega\s*efectivo|efectivo\s*entregado|base\s*imponible|cuota\s*iva|%\s*iva|iva\s*\d+\s*%|tipo\s*iva|ahorro|descuento|bonificaci|puntos|saldo\s*anterior|kg\s*x|eur\/kg|€\/kg)/i;
  const explicitTotalRegex = /(?:\btotal\s*(?:a\s*pagar|compra|ticket|factura|venta|general|eur|€|importe)?\b|\bimporte\s*total\b|\ba\s*pagar\b)/i;
  const excludeFakeTotalRegex = /(?:subtotal|sub-total|total\s*(?:base|iva|impuestos|dto|descuento|ahorro|art[ií]culos|unidades|uds|puntos|peso))/i;
  const cardPaymentRegex = /(?:\btarjeta\b|\bpago\s*tarjeta\b|\bventa\s*tarjeta\b|\bvisa\b|\bmastercard\b|\bmaestro\b|\bbizum\b)/i;

  const totalCandidates = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (ignorePriceLine.test(line)) continue;

    const linePrices = extractPricesFromLine(line);
    const isExplicitTotal = explicitTotalRegex.test(line) && !excludeFakeTotalRegex.test(line);
    const isCardLine = cardPaymentRegex.test(line);
    const isSubtotal = /\b(?:subtotal|suma)\b/i.test(line);

    if (isExplicitTotal) {
      if (linePrices.length > 0) {
        const p = linePrices[linePrices.length - 1];
        const priority = /total\s*(?:a\s*pagar|factura|compra|ticket|eur|€)/i.test(line) ? 100 : 90;
        totalCandidates.push({ val: p.val, priority, lineIdx: i });
      } else if (i + 1 < lines.length && !ignorePriceLine.test(lines[i + 1])) {
        const nextPrices = extractPricesFromLine(lines[i + 1]);
        if (nextPrices.length > 0) {
          totalCandidates.push({ val: nextPrices[nextPrices.length - 1].val, priority: 88, lineIdx: i + 1 });
        }
      }
    } else if (isCardLine && linePrices.length > 0) {
      totalCandidates.push({ val: linePrices[linePrices.length - 1].val, priority: 75, lineIdx: i });
    } else if (isSubtotal && linePrices.length > 0) {
      totalCandidates.push({ val: linePrices[linePrices.length - 1].val, priority: 50, lineIdx: i });
    }
  }

  if (totalCandidates.length > 0) {
    totalCandidates.sort((a, b) => b.priority - a.priority || b.lineIdx - a.lineIdx);
    detectedPrice = totalCandidates[0].val;
  }

  // ── 4. EXTRACCIÓN DE ARTÍCULOS / PRODUCTOS ────────────────────
  const nonItemLineRegex = /(?:\btotal\b|\bsubtotal\b|\ba\s*pagar\b|\bimporte\b|\bbase\s*imponible\b|\bcuota\b|\biva\b|\bi\.v\.a\b|\bigic\b|\bimpuesto|\befectivo\b|\btarjeta\b|\bvisa\b|\bmastercard\b|\bmaestro\b|\bbizum\b|\bcambio\b|\bentregado\b|\bentrega\b|\bahorro\b|\bdescuento\b|\bdto\b|\bpromoci[oó]n\b|\bcup[oó]n\b|\bpuntos\b|\bsaldo\b|\bfactura\b|\bticket\b|\bsimplificada\b|\brecibo\b|\balbar[aá]n\b|\bpedido\b|\boperaci[oó]n\b|\bautorizaci[oó]n\b|\bterminal\b|\btpv\b|\bcaja\b|\bcajero\b|\batendido\b|\bvendedor\b|\bcliente\b|\bsocio\b|\bfecha\b|\bhora\b|\bnif\b|\bcif\b|\bdni\b|\bgracias\b|\bvisita\b|\bdevoluci[oó]n\b|\bdevolver\b|\bgarant[ií]a\b|\bconserve\b|\bcondiciones\b|\btel[eé]fono\b|\btfno\b|\btel\b|\bwww\.|http|@|\bcalle\b|\bc\/|\bavda\b|\bavenida\b|\bplaza\b|\bpol[ií]gono\b|\bc\.p\.|\bdescripci[oó]n\b|\bconcepto\b|\bcantidad\b|\bunidades\b|\bp\.v\.p\b|\bunitario\b)/i;
  const qtyOnlyLineRegex = /^(?:\d+(?:[,.]\d+)?\s*(?:un|ud|uds|x|\*|kg|g|l)?\s*[x*]?\s*\d+[,.]\d{2}(?:\s*€|\s*eur)?(?:\s+\d+[,.]\d{2})?[\s€eurA-Z]*)$/i;

  function cleanItemDescription(rawDesc) {
    if (!rawDesc) return '';
    let s = rawDesc
      .replace(/\s+(?:\d{1,3}(?:\.\d{3})*|\d+)[,.]\d{2}\s*(?:€|eur)?\s*[ABC*]?$/i, '')
      .replace(/\s+\d+\s*[xX*]\s*\d+[,.]\d{2}.*$/, '')
      .replace(/^(?:ref\.?\s*|cod\.?\s*|art\.?\s*)?\d{5,14}\s+/i, '')
      .replace(/^\d{1,3}\s*(?:un|ud|uds)?\s*[xX*]?\s+/i, '')
      .replace(/^[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+|[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9)"']+$/g, '')
      .trim();

    const letters = (s.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
    const vowels = (s.match(/[AEIOUÁÉÍÓÚÜaeiouáéíóúü]/g) || []).length;
    if (letters < 3 || vowels < 1 || s.length < 3) return '';
    if (nonItemLineRegex.test(s)) return '';
    if (detectedStore && s.toLowerCase() === detectedStore.toLowerCase()) return '';
    return s.slice(0, 85);
  }

  let itemsEndIdx = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/(?:\bsubtotal\b|\btotal\s*(?:a\s*pagar|compra|ticket|factura|eur|€|\()?\b|\bbase\s*imponible\b|\bdesglose\s*iva\b)/i.test(lines[i])) {
      itemsEndIdx = i;
      break;
    }
  }

  const extractedItems = [];
  for (let i = 0; i < itemsEndIdx; i++) {
    const line = lines[i];
    if (nonItemLineRegex.test(line)) continue;

    const linePrices = extractPricesFromLine(line);
    if (linePrices.length > 0) {
      const itemPrice = linePrices[linePrices.length - 1].val;
      if (detectedPrice && itemPrice > detectedPrice * 1.05) continue;

      const firstPriceIdx = linePrices[0].index;
      const textBeforePrice = line.slice(0, firstPriceIdx).trim();

      let desc = '';
      if (!qtyOnlyLineRegex.test(line) && textBeforePrice.length >= 3) {
        desc = cleanItemDescription(textBeforePrice);
      }

      if (!desc && i > 0) {
        const prevLine = lines[i - 1];
        if (!nonItemLineRegex.test(prevLine) && extractPricesFromLine(prevLine).length === 0) {
          desc = cleanItemDescription(prevLine);
        }
      }

      if (desc) {
        extractedItems.push({ name: desc, price: itemPrice });
      }
    }
  }

  if (detectedPrice === null && extractedItems.length > 0) {
    if (extractedItems.length === 1) {
      detectedPrice = extractedItems[0].price;
    } else {
      const sum = extractedItems.reduce((acc, it) => acc + (it.price || 0), 0);
      if (sum > 0) detectedPrice = Number(sum.toFixed(2));
    }
  }

  let detectedProduct = '';
  if (extractedItems.length === 1) {
    detectedProduct = extractedItems[0].name;
  } else if (extractedItems.length > 1) {
    const sortedByPrice = [...extractedItems].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (extractedItems.length === 2) {
      detectedProduct = `${extractedItems[0].name} + ${extractedItems[1].name}`.slice(0, 95);
    } else {
      detectedProduct = `${sortedByPrice[0].name} (+${extractedItems.length - 1} art. más)`.slice(0, 95);
    }
  }

  // ── 5. MARCA DEL PRODUCTO (SOLO SI CONSTA EN EL TICKET) ───────
  let detectedBrand = '';
  for (const line of lines) {
    const explicitBrandMatch = line.match(/\b(?:marca|fabricante)\s*[:.-]\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s&-]{2,30})/i);
    if (explicitBrandMatch) {
      detectedBrand = explicitBrandMatch[1].trim();
      break;
    }
  }
  if (!detectedBrand) {
    const productSearchSpace = extractedItems.map(it => it.name).join(' ') || rawText;
    const foundBrand = KNOWN_PRODUCT_BRANDS.find(b => b.key.test(productSearchSpace));
    if (foundBrand) {
      detectedBrand = foundBrand.name;
    }
  }

  // ── 6 & 7. POLÍTICA DE DEVOLUCIÓN, CONDICIONES Y GARANTÍA ──────
  const policies = extractPoliciesFromText(lines, rawText, detectedDate);
  const detectedReturnDays = policies.returnDays;
  const detectedReturnConditions = policies.returnConditions;
  const detectedWarrantyYears = policies.warrantyYears;
  const detectedCoverage = policies.coverage;
  const detectedNoCoverage = policies.noCoverage;

  // ── 8. NOTAS ADICIONALES (MÁXIMO DETALLE DEL TICKET) ──────────
  const notesParts = [];

  // Número de factura / ticket / pedido / operación
  for (const line of lines) {
    const docMatch = line.match(/(?:factura\s*simplificada|n[º°o]?\s*(?:de\s*)?(?:factura|ticket|recibo|pedido|operaci[oó]n)|ticket\s*n[º°o]?|pedido\s*n[º°o]?|op\b)\s*[:.#-]?\s*([A-Z0-9][A-Z0-9\/-]{2,24})/i);
    if (docMatch && docMatch[1] && /\d/.test(docMatch[1])) {
      notesParts.push(`Nº ticket/factura: ${docMatch[1].trim()}`);
      break;
    }
  }

  // NIF / CIF del comercio si aparece en el ticket
  const cifMatch = rawText.match(/\b(?:nif|cif)\s*[:.-]?\s*([A-HJ-NP-SUVW]\d{7}[0-9A-J]|\d{8}[A-Z])\b/i);
  if (cifMatch && cifMatch[1]) {
    notesParts.push(`NIF/CIF: ${cifMatch[1].toUpperCase()}`);
  }

  // Número de serie / IMEI / Referencia
  for (const line of lines) {
    const snMatch = line.match(/\b(?:s\/n|imei|n[º°o]?\s*serie|serial|ref(?:erencia)?)\s*[:.#-]?\s*([A-Z0-9-]{5,28})/i);
    if (snMatch && snMatch[1] && /\d/.test(snMatch[1])) {
      notesParts.push(`Ref/Serie: ${snMatch[1].trim()}`);
      break;
    }
  }

  // Método de pago detectado en el ticket
  if (/\b(?:visa|mastercard|maestro|pago\s*tarjeta|venta\s*tarjeta|tarjeta)\b/i.test(rawText)) {
    notesParts.push('Pago: Tarjeta');
  } else if (/\bbizum\b/i.test(rawText)) {
    notesParts.push('Pago: Bizum');
  } else if (/\b(?:entrega\s*efectivo|efectivo)\b/i.test(rawText)) {
    notesParts.push('Pago: Efectivo');
  }

  // Desglose completo de artículos cuando hay varios productos
  if (extractedItems.length > 1) {
    const itemsSummary = extractedItems
      .slice(0, 10)
      .map(it => `${it.name} (${it.price.toFixed(2)} €)`)
      .join(' · ');
    notesParts.push(`Artículos (${extractedItems.length}): ${itemsSummary}`);
  }

  const detectedNotes = notesParts.join(' | ').slice(0, 490);

  const hasAnyData = Boolean(
    detectedProduct ||
    detectedStore ||
    detectedBrand ||
    detectedPrice !== null ||
    detectedDate ||
    detectedReturnDays !== null ||
    detectedReturnConditions ||
    detectedWarrantyYears !== null ||
    detectedNotes
  );

  if (!hasAnyData) return null;

  return {
    store: detectedStore,
    productName: detectedProduct,
    brand: detectedBrand,
    price: detectedPrice,
    purchaseDate: detectedDate,
    returnDays: detectedReturnDays,
    returnConditions: detectedReturnConditions,
    warrantyYears: detectedWarrantyYears,
    notes: detectedNotes,
    coverage: detectedCoverage,
    noCoverage: detectedNoCoverage,
    rawText: rawText.slice(0, 3000)
  };
}

/* Normaliza y sanea la respuesta JSON de Gemini Vision eliminando cualquier valor inventado o genérico */
function sanitizeAiExtractedData(rawObj) {
  if (!rawObj || typeof rawObj !== 'object') return null;

  const genericPlaceholders = /^(?:n\/a|na|null|undefined|none|desconocido|no\s*visible|no\s*consta|no\s*especificado|no\s*indicado|establecimiento\s*detectado|comercio\s*f[ií]sico|compra\s*seg[uú]n\s*ticket|producto\s*seg[uú]n\s*ticket|sin\s*datos|-+)$/i;

  function cleanStr(val, maxLen = 100) {
    if (typeof val !== 'string') return '';
    const t = val.trim();
    if (!t || genericPlaceholders.test(t)) return '';
    return t.slice(0, maxLen);
  }

  const store = cleanStr(rawObj.store, 80);
  const productName = cleanStr(rawObj.productName, 100);
  let brand = cleanStr(rawObj.brand, 60);
  if (brand && store && brand.toLowerCase() === store.toLowerCase() && !KNOWN_PRODUCT_BRANDS.some(b => b.key.test(brand))) {
    brand = '';
  }

  let price = null;
  if (rawObj.price !== null && rawObj.price !== undefined && rawObj.price !== '') {
    const pNum = typeof rawObj.price === 'string'
      ? parseFloat(rawObj.price.replace(/[^\d.,]/g, '').replace(',', '.'))
      : Number(rawObj.price);
    if (!isNaN(pNum) && pNum > 0 && pNum < 100000) {
      price = Number(pNum.toFixed(2));
    }
  }

  const purchaseDate = safeDate(cleanStr(rawObj.purchaseDate, 10));

  let returnDays = null;
  if (rawObj.returnDays !== null && rawObj.returnDays !== undefined && rawObj.returnDays !== '') {
    const rNum = typeof rawObj.returnDays === 'number' ? rawObj.returnDays : parseSpanishDaysExpression(String(rawObj.returnDays));
    if (rNum && !isNaN(rNum) && rNum > 0 && rNum <= 3650) returnDays = rNum;
  }

  let warrantyYears = null;
  if (rawObj.warrantyYears !== null && rawObj.warrantyYears !== undefined && rawObj.warrantyYears !== '') {
    const wNum = parseFloat(rawObj.warrantyYears);
    if (!isNaN(wNum) && wNum > 0 && wNum <= 50) warrantyYears = wNum;
  }

  const returnConditions = cleanStr(rawObj.returnConditions, 390);
  const notes = cleanStr(rawObj.notes, 490);
  const coverage = cleanStr(rawObj.coverage, 550);
  const noCoverage = cleanStr(rawObj.noCoverage, 550);

  // Si la IA dejó returnDays vacío pero puso los días dentro del texto de returnConditions, extraerlo de ahí también
  if (returnDays === null && returnConditions) {
    const pol = extractPoliciesFromText([returnConditions], returnConditions, purchaseDate);
    if (pol.returnDays !== null) returnDays = pol.returnDays;
  }

  return {
    store,
    productName,
    brand,
    price,
    purchaseDate,
    returnDays,
    returnConditions,
    warrantyYears,
    notes,
    coverage,
    noCoverage
  };
}

/* Optimiza imágenes grandes antes de enviarlas a Gemini Vision para respuesta en <1s manteniendo nitidez en letra pequeña */
async function prepareTicketPayloadForAi(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const header = dataUrl.split(';')[0] || '';
  const mimeType = header.split(':')[1] || 'image/jpeg';
  const base64Data = dataUrl.split(',')[1] || '';

  if (!dataUrl.startsWith('data:image/') || base64Data.length < 900_000) {
    return { mimeType, base64Data };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxSide = 2000;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxSide || h > maxSide) {
          const ratio = Math.min(maxSide / w, maxSide / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({
          mimeType: 'image/jpeg',
          base64Data: compressedUrl.split(',')[1] || base64Data
        });
      } catch {
        resolve({ mimeType, base64Data });
      }
    };
    img.onerror = () => resolve({ mimeType, base64Data });
    img.src = dataUrl;
  });
}

/* Estado de cuota mensual de escaneos IA (Freemium: 5/mes gratis · Pro/Clave propia: ilimitados) */
let aiQuotaCache = null;

function getLocalMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function updateAiQuotaBadgeDOM(usage) {
  const badge = document.getElementById('ai-quota-badge');
  const textEl = document.getElementById('ai-quota-text');
  if (!badge || !textEl) return;

  const isEn = currentLang === 'en';
  const personalKey = (localStorage.getItem('gp_gemini_api_key') || '').trim();
  if (personalKey) {
    badge.className = 'ai-quota-badge is-pro';
    textEl.textContent = isEn ? 'Gemini Flash AI · Unlimited key' : 'IA Gemini Flash · Clave propia ilimitada';
    return;
  }

  if (activeSession && activeSession.isDemo) {
    badge.className = 'ai-quota-badge';
    textEl.textContent = isEn ? 'Demo Mode · High-precision OCR' : 'Modo Demo · OCR de alta precisión';
    return;
  }

  if (usage && usage.isPro) {
    badge.className = 'ai-quota-badge is-pro';
    textEl.textContent = isEn ? 'Pro Plan · Unlimited AI scans' : 'Plan Pro · Escaneos IA ilimitados';
    return;
  }

  const limit = (usage && typeof usage.limit === 'number') ? usage.limit : 5;
  const remaining = (usage && typeof usage.remaining === 'number') ? usage.remaining : limit;

  if (remaining <= 0) {
    badge.className = 'ai-quota-badge is-empty';
    textEl.textContent = isEn ? `0/${limit} AI scans this month · OCR active` : `0/${limit} escaneos IA este mes · OCR activo`;
  } else {
    badge.className = 'ai-quota-badge';
    textEl.textContent = isEn ? `AI Vision · ${remaining}/${limit} free this month` : `IA Vision · ${remaining}/${limit} gratis este mes`;
  }
}

async function refreshAiQuotaBadge() {
  updateAiQuotaBadgeDOM(aiQuotaCache);
  if (!activeSession || activeSession.isDemo || typeof sb === 'undefined') return;
  if (localStorage.getItem('gp_server_ai_enabled') !== '1') return;
  try {
    const { data, error } = await sb.functions.invoke('scan-ticket', {
      body: { action: 'status' }
    });
    if (!error && data && data.usage) {
      aiQuotaCache = data.usage;
      updateAiQuotaBadgeDOM(aiQuotaCache);
    }
  } catch {
    // Si la función aún no está desplegada en el servidor, se mantiene el indicador por defecto
  }
}

const GEMINI_TICKET_PROMPT = `Analiza este ticket, factura o comprobante de compra de principio a fin, prestando especial atención tanto a los productos como a la LETRA PEQUEÑA de la parte inferior del ticket (plazos de devolución, si se devuelve el dinero o se entrega un vale para gastar en la tienda, condiciones y garantías).
REGLA CRÍTICA: NO inventes ningún dato que no esté en el ticket. Si un campo no aparece en absoluto, devuelve "" o null.

Devuelve ÚNICAMENTE un objeto JSON válido con estas claves exactas:
- "productName": nombre exacto del producto o productos comprados (si hay varios, pon los principales o resúmelos; si no se ve, "")
- "brand": marca del producto SOLO si aparece escrita en el ticket (NO pongas el nombre de la tienda como marca; si no consta, "")
- "price": importe total final pagado en euros como número decimal (ej: 49.99). Si no se ve, null
- "store": nombre del comercio o tienda emisora del ticket tal como aparece impreso (si no se ve, "")
- "purchaseDate": fecha de compra impresa en el ticket en formato YYYY-MM-DD (si no se ve, "")
- "returnDays": número entero de días para devolver o cambiar según el pie o texto del ticket (ej: si pone "plazo para devolver 15 días", pon 15; si pone "1 mes", pon 30; si no menciona plazo, null)
- "returnConditions": TODA la información de devolución escrita en el ticket, especialmente la letra pequeña inferior (ej: si dice que no se abonará dinero en efectivo sino que se deberá gastar el dinero en la tienda / vale de compra, requisito de presentar ticket, embalaje, etc.). Si no dice nada, ""
- "warrantyYears": años de garantía como número SOLO si el ticket lo menciona explícitamente (si no, null)
- "coverage": qué cubre la garantía si lo indica el ticket (si no, "")
- "noCoverage": qué no cubre la garantía si lo indica el ticket (si no, "")
- "notes": número de ticket/factura, NIF/CIF, método de pago y listado detallado de todos los artículos con su precio individual`;

const GEMINI_VISION_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

/* Función principal de escaneo con IA (1º Servidor Gemini Flash -> 2º Clave propia -> 3º PDF/Tesseract OCR con zoom en pie de ticket) */
async function scanTicketWithAI(file, dataUrl) {
  if (isScanningTicket || !file) return;
  isScanningTicket = true;

  const overlay = document.getElementById('ai-scan-overlay');
  const scanText = document.getElementById('ai-scan-text');
  const alertBox = document.getElementById('ai-extraction-alert');
  const alertSummary = document.getElementById('ai-extraction-summary');
  const rescanBtn = document.getElementById('btn-ai-re-scan');
  const rawToggleWrap = document.getElementById('ai-raw-toggle-wrap');
  const rawTextBox = document.getElementById('ai-raw-text');

  if (overlay) overlay.hidden = false;
  if (alertBox) alertBox.hidden = true;
  if (rescanBtn) rescanBtn.hidden = true;
  if (rawToggleWrap) rawToggleWrap.hidden = true;
  if (rawTextBox) { rawTextBox.textContent = ''; rawTextBox.hidden = true; }
  if (scanText) scanText.textContent = 'Analizando todos los detalles del ticket (cabecera, productos y letra pequeña)...';

  let extracted = null;
  const geminiKey = (localStorage.getItem('gp_gemini_api_key') || '').trim();
  const isSupportedAiMedia = Boolean(dataUrl && (dataUrl.startsWith('data:image/') || dataUrl.startsWith('data:application/pdf')));

  try {
    let aiPayload = null;
    if (isSupportedAiMedia) {
      aiPayload = await prepareTicketPayloadForAi(dataUrl);
    }

    // ── ESTRATEGIA 1A: ESCANEO CON IA EN SERVIDOR (OPCIONAL SI ESTÁ HABILITADO EN CLOUD) ──
    if (!extracted && aiPayload && activeSession && !activeSession.isDemo && typeof sb !== 'undefined' && localStorage.getItem('gp_server_ai_enabled') === '1') {
      if (scanText) scanText.textContent = 'Analizando ticket con IA Gemini Vision en la nube...';
      try {
        const { data: srvRes, error: srvErr } = await sb.functions.invoke('scan-ticket', {
          body: {
            action: 'scan',
            mimeType: aiPayload.mimeType,
            base64Data: aiPayload.base64Data
          }
        });

        if (!srvErr && srvRes) {
          if (srvRes.usage) {
            aiQuotaCache = srvRes.usage;
            updateAiQuotaBadgeDOM(aiQuotaCache);
          }
          if (srvRes.ok && srvRes.data) {
            extracted = sanitizeAiExtractedData(srvRes.data);
            if (extracted) {
              extracted._source = `IA Vision en Servidor (${srvRes.model || 'gemini-2.5-flash'})`;
              extracted._usage = srvRes.usage || null;
            }
          } else if (srvRes.error === 'quota_exceeded' && !geminiKey) {
            showToast('Has utilizado tus 5 escaneos IA gratis de este mes. Usando lector OCR...', 'info');
          }
        }
      } catch (srvInvokeErr) {
        console.warn('Escaneo IA en servidor no disponible, pasando a siguiente motor:', srvInvokeErr);
      }
    }

    // ── ESTRATEGIA 1B: GOOGLE GEMINI VISION CON CLAVE PROPIA DEL USUARIO (HASTA 1.500/DÍA GRATIS) ──
    if (!extracted && geminiKey && aiPayload) {
      if (scanText) scanText.textContent = 'Extrayendo todos los detalles del ticket con Gemini Vision...';
      try {
        for (const model of GEMINI_VISION_MODELS) {
          try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { inline_data: { mime_type: aiPayload.mimeType, data: aiPayload.base64Data } },
                    { text: GEMINI_TICKET_PROMPT }
                  ]
                }],
                generationConfig: {
                  temperature: 0.0,
                  responseMimeType: 'application/json'
                }
              })
            });

            if (resp.ok) {
              const resultJson = await resp.json();
              const rawText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsedJson = JSON.parse(cleanJson);
                extracted = sanitizeAiExtractedData(parsedJson);
                if (extracted) {
                  extracted._source = `Gemini Vision AI (${model})`;
                  break;
                }
              }
            }
          } catch (mErr) {
            console.warn(`Error con modelo ${model}:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn('Fallo en Gemini API, pasando a motor OCR local:', geminiErr);
      }
    }

    // ── ESTRATEGIA 2A: LECTURA DE TEXTO DIGITAL EN PDF ──
    if (!extracted && file.type === 'application/pdf') {
      if (scanText) scanText.textContent = 'Extrayendo texto de la factura PDF...';
      const pdfText = await extractTextFromPdfFile(file);
      if (pdfText && pdfText.trim().length > 5) {
        extracted = parseReceiptOcrText(pdfText);
        if (extracted) {
          extracted._source = 'Lector directo de factura PDF';
          extracted._rawText = pdfText;
        }
      }
    }

    // ── ESTRATEGIA 2B: MOTOR OCR LOCAL REAL EN NAVEGADOR + ZOOM EN PIE DE TICKET ──
    if (!extracted && dataUrl && dataUrl.startsWith('data:image/')) {
      if (scanText) scanText.textContent = 'Optimizando nitidez del ticket completo...';
      const enhancedImage = await preprocessTicketImage(dataUrl, false);

      if (scanText) scanText.textContent = 'Leyendo productos, importes y fechas del ticket...';
      try {
        let rawOcrText = await runOcrWithTesseract(enhancedImage, (msg) => {
          if (scanText) scanText.textContent = msg;
        }, '6');

        let parsed = rawOcrText && rawOcrText.trim().length > 3 ? parseReceiptOcrText(rawOcrText) : null;

        // Si en la primera pasada no se detectaron los días o condiciones de devolución del pie del ticket,
        // hacer un zoom de alta resolución al 45% inferior del ticket para capturar toda la letra pequeña
        if (!parsed || parsed.returnDays === null || !parsed.returnConditions) {
          if (scanText) scanText.textContent = 'Analizando letra pequeña y condiciones en la parte inferior del ticket...';
          const footerImage = await preprocessTicketImage(dataUrl, true);
          const footerOcrText = await runOcrWithTesseract(footerImage, null, '6');

          if (footerOcrText && footerOcrText.trim().length > 3) {
            const combinedText = (rawOcrText || '') + '\n' + footerOcrText;
            const footerLines = footerOcrText
              .replace(/\r\n/g, '\n')
              .split('\n')
              .map(l => l.replace(/\s+/g, ' ').trim())
              .filter(l => l.length > 1);

            const footerPolicies = extractPoliciesFromText(footerLines, footerOcrText, parsed?.purchaseDate || '');

            if (!parsed) {
              parsed = parseReceiptOcrText(combinedText);
            } else {
              if (parsed.returnDays === null && footerPolicies.returnDays !== null) {
                parsed.returnDays = footerPolicies.returnDays;
              }
              if (footerPolicies.returnConditions && footerPolicies.returnConditions.length > (parsed.returnConditions || '').length) {
                parsed.returnConditions = footerPolicies.returnConditions;
              }
              if (parsed.warrantyYears === null && footerPolicies.warrantyYears !== null) {
                parsed.warrantyYears = footerPolicies.warrantyYears;
              }
              if (!parsed.coverage && footerPolicies.coverage) {
                parsed.coverage = footerPolicies.coverage;
              }
              if (!parsed.noCoverage && footerPolicies.noCoverage) {
                parsed.noCoverage = footerPolicies.noCoverage;
              }
            }
            rawOcrText = combinedText;
          }
        }

        // Si aún faltan producto o precio, probar sobre la imagen original sin filtro
        if (!parsed || (!parsed.productName && parsed.price === null)) {
          const rawOriginalText = await runOcrWithTesseract(dataUrl, null, '6');
          const parsedOrig = rawOriginalText && rawOriginalText.trim().length > 3 ? parseReceiptOcrText(rawOriginalText) : null;
          if (parsedOrig) {
            if (!parsed) {
              parsed = parsedOrig;
              rawOcrText = rawOriginalText;
            } else {
              parsed.productName = parsed.productName || parsedOrig.productName;
              parsed.store = parsed.store || parsedOrig.store;
              parsed.brand = parsed.brand || parsedOrig.brand;
              parsed.price = parsed.price !== null ? parsed.price : parsedOrig.price;
              parsed.purchaseDate = parsed.purchaseDate || parsedOrig.purchaseDate;
              parsed.returnDays = parsed.returnDays !== null ? parsed.returnDays : parsedOrig.returnDays;
              parsed.returnConditions = parsed.returnConditions || parsedOrig.returnConditions;
              parsed.warrantyYears = parsed.warrantyYears !== null ? parsed.warrantyYears : parsedOrig.warrantyYears;
              parsed.notes = parsed.notes || parsedOrig.notes;
            }
          }
        }

        if (parsed) {
          extracted = parsed;
          extracted._source = 'Motor OCR de Alta Precisión (Cabecera + Pie de Ticket)';
          extracted._rawText = rawOcrText;
        } else if (rawOcrText && rawOcrText.trim().length > 0 && rawToggleWrap && rawTextBox) {
          rawTextBox.textContent = rawOcrText.trim();
          rawToggleWrap.hidden = false;
        }
      } catch (ocrErr) {
        console.warn('Error en Tesseract OCR local:', ocrErr);
      }
    }

    // ── APLICAR ÚNICAMENTE LOS DATOS REALES EXTRAÍDOS (DEJANDO EN BLANCO EL RESTO) ──
    applyExtractedTicketData(extracted);

    const alertTitleEl = alertBox?.querySelector('.ai-alert-text > strong');

    if (extracted) {
      const foundFields = [];
      if (extracted.productName) foundFields.push(`Producto: <strong>${escHtml(safeText(extracted.productName, 55))}</strong>`);
      if (extracted.brand) foundFields.push(`Marca: <strong>${escHtml(safeText(extracted.brand, 35))}</strong>`);
      if (extracted.store) foundFields.push(`Tienda: <strong>${escHtml(safeText(extracted.store, 45))}</strong>`);
      if (extracted.price !== null && extracted.price !== undefined) foundFields.push(`Importe: <strong>${Number(extracted.price).toFixed(2)} €</strong>`);
      if (extracted.purchaseDate) foundFields.push(`Fecha: <strong>${escHtml(fmtDate(extracted.purchaseDate))}</strong>`);
      if (extracted.returnDays !== null && extracted.returnDays !== undefined) foundFields.push(`Plazo devolución: <strong>${extracted.returnDays} días</strong>`);
      if (extracted.returnConditions) foundFields.push(`Condiciones: <strong>${escHtml(safeText(extracted.returnConditions, 90))}</strong>`);
      if (extracted.warrantyYears !== null && extracted.warrantyYears !== undefined) foundFields.push(`Garantía: <strong>${extracted.warrantyYears} años</strong>`);

      const usageNote = extracted._usage && !extracted._usage.isPro
        ? ` · <strong>Te quedan ${extracted._usage.remaining} de ${extracted._usage.limit} escaneos IA gratis este mes</strong>.`
        : '';

      if (alertBox && alertSummary) {
        alertBox.hidden = false;
        if (alertTitleEl) alertTitleEl.textContent = 'Datos extraídos del ticket';
        alertSummary.innerHTML =
          foundFields.join(' · ') +
          `<br /><span style="font-size:12px;color:var(--t-secondary);">Los campos que no aparecen en el ticket se han dejado en blanco para que los completes si lo deseas${usageNote}</span>`;

        if (extracted._rawText && rawToggleWrap && rawTextBox) {
          rawTextBox.textContent = extracted._rawText;
          rawToggleWrap.hidden = false;
        }
      }
      if (rescanBtn) rescanBtn.hidden = false;
      showToast('Datos y condiciones del ticket extraídos correctamente', 'ok');
    } else {
      if (alertBox && alertSummary) {
        alertBox.hidden = false;
        if (alertTitleEl) alertTitleEl.textContent = 'Ticket guardado en el Cofre Digital';
        alertSummary.innerHTML =
          'No se han podido distinguir los datos con suficiente nitidez en la imagen. <strong>No se ha inventado ningún dato:</strong> todos los campos se han dejado en blanco para que los rellenes manualmente o subas una foto más enfocada.';
      }
      if (rescanBtn) rescanBtn.hidden = false;
      showToast('Foto guardada. Completa los campos que no se ven en el ticket.', 'info');
    }

  } catch (err) {
    console.error('Error durante el escaneo del ticket:', err);
    showToast('No se pudo leer el ticket automáticamente. Rellena los campos manualmente.', 'warn');
  } finally {
    isScanningTicket = false;
    if (overlay) overlay.hidden = true;
  }
}

/* Comprobador de conectividad con Gemini API (prueba los modelos actuales de la familia Flash) */
async function testGeminiApiKey(key) {
  if (!key) return { ok: false, error: 'Introduce una clave antes de probar.' };
  let lastError = 'Error de conexión';
  for (const model of GEMINI_VISION_MODELS) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Responde solo la palabra OK' }] }]
        })
      });
      if (resp.ok) {
        return { ok: true, model };
      }
      const errData = await resp.json().catch(() => ({}));
      lastError = errData.error?.message || `Error HTTP ${resp.status}`;
    } catch (e) {
      lastError = e.message || 'Error de conexión';
    }
  }
  return { ok: false, error: lastError };
}

function applyExtractedTicketData(data) {
  const isNewProduct = !document.getElementById('edit-id')?.value;

  const nameEl = document.getElementById('prod-name');
  const brandEl = document.getElementById('prod-brand');
  const priceEl = document.getElementById('prod-price');
  const storeEl = document.getElementById('prod-store');
  const purchaseEl = document.getElementById('prod-purchase');
  const notesEl = document.getElementById('prod-notes');
  const retDaysEl = document.getElementById('ret-days');
  const retStartEl = document.getElementById('ret-start');
  const retCondEl = document.getElementById('ret-conditions');
  const warStartEl = document.getElementById('war-start');
  const warYearsEl = document.getElementById('war-years');
  const warCoversEl = document.getElementById('war-covers');
  const warNoCoversEl = document.getElementById('war-nocovers');

  // Si estamos creando un producto nuevo, limpiar primero cualquier valor previo para que lo no detectado quede en blanco
  if (isNewProduct) {
    [nameEl, brandEl, priceEl, storeEl, purchaseEl, notesEl, retDaysEl, retStartEl, retCondEl, warStartEl, warYearsEl, warCoversEl, warNoCoversEl].forEach(el => {
      if (el) el.value = '';
    });
  }

  if (!data) return;

  if (nameEl && data.productName) {
    nameEl.value = data.productName;
    highlightAiField(nameEl);
  }
  if (brandEl && data.brand) {
    brandEl.value = data.brand;
    highlightAiField(brandEl);
  }
  if (priceEl && data.price !== undefined && data.price !== null && !isNaN(data.price) && Number(data.price) > 0) {
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
  if (notesEl && data.notes) {
    notesEl.value = data.notes;
    highlightAiField(notesEl);
  }
  if (retDaysEl && data.returnDays !== undefined && data.returnDays !== null && !isNaN(data.returnDays) && Number(data.returnDays) > 0) {
    retDaysEl.value = Number(data.returnDays);
    highlightAiField(retDaysEl);
    if (retStartEl && data.purchaseDate) {
      retStartEl.value = data.purchaseDate;
    }
  }
  if (retCondEl && data.returnConditions) {
    retCondEl.value = data.returnConditions;
    highlightAiField(retCondEl);
  }
  if (warYearsEl && data.warrantyYears !== undefined && data.warrantyYears !== null && !isNaN(data.warrantyYears) && Number(data.warrantyYears) > 0) {
    warYearsEl.value = Number(data.warrantyYears);
    highlightAiField(warYearsEl);
    if (warStartEl && data.purchaseDate) {
      warStartEl.value = data.purchaseDate;
    }
  }
  if (warCoversEl && data.coverage) {
    warCoversEl.value = data.coverage;
    highlightAiField(warCoversEl);
  }
  if (warNoCoversEl && data.noCoverage) {
    warNoCoversEl.value = data.noCoverage;
    highlightAiField(warNoCoversEl);
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
  if (heading) heading.textContent = `Custodia de Ticket: ${productName || 'Producto'}`;

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
        <span class="vault-badge">${iconSvg('shield', 14)} COFRE DIGITAL ACTIVO</span>
        <span class="vault-id">ID CUSTODIA: CUST-${p.id.slice(0, 8).toUpperCase()}</span>
      </div>
      <p class="vault-desc">
        <strong>El papel térmico impreso en tienda se borra en pocos meses.</strong> Esta copia digital certificada preserva de forma permanente la fecha, NIF del comercio e importe para cualquier reclamación de garantía legal o peritaje en España.
      </p>
      <div class="vault-actions">
        <button type="button" class="btn-vault-action" id="btn-view-ticket-zoom">
          ${iconSvg('eye', 15)} Ver ticket a tamaño completo
        </button>
        <button type="button" class="btn-vault-action btn-vault-download" id="btn-download-vault-ticket">
          ${iconSvg('download', 15)} Descargar copia de custodia
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
        <strong>El papel térmico de las tiendas se desgasta y se vuelve blanco a los meses.</strong> Edita el producto para custodiar la foto de tu ticket aquí para siempre.
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
      const tgText = `*Recordatorio GarantíasPro*\n\n*Producto:* ${p.name}\n*Tienda:* ${p.store || 'Comercio'}\n*Fecha límite:* ${alarmDl}\nRevisa tu ticket antes de que expire el plazo.`;
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
  claimBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Reclamar garantía / Solicitar devolución (1 clic)`;
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

  // Abrir directamente Alertas si se llega desde una notificación o acceso directo
  if (window.location.hash === '#alerts') switchView('alerts');

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
  ['modal-overlay', 'detail-overlay', 'confirm-overlay', 'modal-privacy', 'modal-contact', 'modal-calendar-demo', 'modal-claim-generator', 'modal-ticket-viewer', 'modal-ai-settings'].forEach(id => {
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
        'modal-ai-settings', 'modal-calendar-demo',
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
  const uploadArea   = document.getElementById('ticket-upload-area');
  const fileInput    = document.getElementById('ticket-file');
  const cameraInput  = document.getElementById('ticket-camera');
  const cameraBtn    = document.getElementById('btn-camera-trigger');
  const uploadFileBtn = document.getElementById('btn-upload-file-trigger');

  uploadArea?.addEventListener('click', () => fileInput?.click());
  uploadArea?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput?.click(); }
  });

  fileInput?.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) { handleFileSelect(f); fileInput.value = ''; }
  });

  cameraBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    cameraInput?.click();
  });

  uploadFileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput?.click();
  });

  cameraInput?.addEventListener('change', () => {
    const f = cameraInput.files?.[0];
    if (f) { handleFileSelect(f); cameraInput.value = ''; }
  });

  // Toggle visor de texto OCR leído en el ticket
  const toggleRawBtn = document.getElementById('btn-toggle-raw-text');
  const rawBox = document.getElementById('ai-raw-text');
  toggleRawBtn?.addEventListener('click', () => {
    if (!rawBox) return;
    const isHidden = rawBox.hidden;
    rawBox.hidden = !isHidden;
    toggleRawBtn.innerHTML = iconSvg(isHidden ? 'eyeOff' : 'eye', 14) + ' <span data-i18n="' + (isHidden ? 'ticket.raw.hide' : 'ticket.raw.show') + '">' + t(isHidden ? 'ticket.raw.hide' : 'ticket.raw.show') + '</span>';
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
    const ci = document.getElementById('ticket-camera');
    if (ci) ci.value = '';
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

  // ── Language toggle (traducción simultánea de toda la interfaz)
  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('gp_lang', currentLang);
    applyTranslations();
    updateAiQuotaBadgeDOM(aiQuotaCache);
    renderDashboard();
    renderProducts();
    renderAlerts();
    if (openModals.has('detail-overlay') && detailProductId) {
      openDetail(detailProductId);
    }
    if (openModals.has('modal-claim-generator')) {
      updateClaimTextPreview();
    }
  });

  // ── Auto-sync purchase date → return/warranty start when days/years are filled
  document.getElementById('prod-purchase')?.addEventListener('change', (e) => {
    const retDays = document.getElementById('ret-days');
    const retStart = document.getElementById('ret-start');
    if (retStart && !retStart.value && retDays && retDays.value) retStart.value = e.target.value;
    const warYears = document.getElementById('war-years');
    const warStart = document.getElementById('war-start');
    if (warStart && !warStart.value && warYears && warYears.value) warStart.value = e.target.value;
  });
  document.getElementById('ret-days')?.addEventListener('input', (e) => {
    const purch = document.getElementById('prod-purchase');
    const retStart = document.getElementById('ret-start');
    if (e.target.value && retStart && !retStart.value && purch && purch.value) {
      retStart.value = purch.value;
    }
  });
  document.getElementById('war-years')?.addEventListener('input', (e) => {
    const purch = document.getElementById('prod-purchase');
    const warStart = document.getElementById('war-start');
    if (e.target.value && warStart && !warStart.value && purch && purch.value) {
      warStart.value = purch.value;
    }
  });

  // ── Onboarding hero actions
  document.getElementById('btn-hero-add')?.addEventListener('click', openAdd);
  document.getElementById('next-up-open')?.addEventListener('click', () => {
    if (nextUpCurrent) openDetail(nextUpCurrent.p.id);
  });
  document.getElementById('next-up-cal')?.addEventListener('click', () => {
    if (!nextUpCurrent) return;
    const { p, kind, date } = nextUpCurrent;
    const en = currentLang === 'en';
    const title = kind === 'ret' ? (en ? 'Return: ' : 'Devolución: ') + p.name : (en ? 'Warranty: ' : 'Garantía: ') + p.name;
    const desc = (en ? 'GarantíasPro reminder. Store: ' : 'Recordatorio de GarantíasPro. Tienda: ') + (p.store || '—');
    downloadIcsFile({ title, description: desc, dateStr: date, filename: (kind === 'ret' ? 'devolucion_' : 'garantia_') + p.name.replace(/[^\w-]+/g, '_') });
  });
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
    const resDiv = document.getElementById('gemini-test-result');
    if (resDiv) { resDiv.hidden = true; resDiv.innerHTML = ''; }
    openModal('modal-ai-settings');
  });
  document.getElementById('ai-settings-close')?.addEventListener('click', () => {
    updateAiQuotaBadgeDOM(aiQuotaCache);
    closeModal('modal-ai-settings');
  });

  const btnTestGemini = document.getElementById('btn-test-gemini-key');
  const testResultDiv = document.getElementById('gemini-test-result');
  btnTestGemini?.addEventListener('click', async () => {
    const key = document.getElementById('input-gemini-key')?.value.trim();
    if (!key) {
      if (testResultDiv) {
        testResultDiv.hidden = false;
        testResultDiv.innerHTML = '<span style="color:#f87171;">Por favor, introduce una clave de Gemini antes de probar.</span>';
      }
      return;
    }
    btnTestGemini.disabled = true;
    btnTestGemini.textContent = 'Probando...';
    if (testResultDiv) {
      testResultDiv.hidden = false;
      testResultDiv.innerHTML = '<span style="color:var(--t-muted);">Conectando con Google AI Studio...</span>';
    }
    const res = await testGeminiApiKey(key);
    btnTestGemini.disabled = false;
    btnTestGemini.innerHTML = iconSvg('flask', 14) + ' Probar clave';
    if (res.ok) {
      testResultDiv.innerHTML = '<span style="color:#34d399;font-weight:600;">Conexión con Gemini Vision correcta. Puedes guardar la clave.</span>';
    } else {
      testResultDiv.innerHTML = `<span style="color:#f87171;font-weight:600;">Error al conectar:</span> <span style="color:var(--t-muted);">${escHtml(res.error || 'Clave no válida')}</span>`;
    }
  });

  document.getElementById('btn-save-gemini-key')?.addEventListener('click', () => {
    const key = document.getElementById('input-gemini-key')?.value.trim();
    if (key) {
      localStorage.setItem('gp_gemini_api_key', key);
      showToast('Clave Gemini API guardada con éxito', 'ok');
    } else {
      localStorage.removeItem('gp_gemini_api_key');
      showToast('Clave eliminada. Modo OCR físico local activo', 'ok');
    }
    updateAiQuotaBadgeDOM(aiQuotaCache);
    closeModal('modal-ai-settings');
  });
  document.getElementById('btn-clear-gemini-key')?.addEventListener('click', () => {
    localStorage.removeItem('gp_gemini_api_key');
    const keyInput = document.getElementById('input-gemini-key');
    if (keyInput) keyInput.value = '';
    const resDiv = document.getElementById('gemini-test-result');
    if (resDiv) { resDiv.hidden = true; resDiv.innerHTML = ''; }
    showToast('Clave restablecida. Motor OCR local activo', 'ok');
    updateAiQuotaBadgeDOM(aiQuotaCache);
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
      showToast('Escrito legal copiado al portapapeles', 'ok');
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
          <div id="print-container"></div>
        </body>
        </html>
      `);
      printWin.document.close();
      const container = printWin.document.getElementById('print-container');
      if (container) {
        const printImg = printWin.document.createElement('img');
        printImg.src = currentViewerTicketUrl;
        printImg.alt = 'Ticket de compra';
        printImg.onload = () => {
          try { printWin.print(); } catch {}
        };
        container.appendChild(printImg);
      }
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
