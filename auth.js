/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Auth Logic
   Security: SHA-256 + PBKDF2 password hashing via Web Crypto API
             Rate limiting, session tokens, XSS-safe DOM ops
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. CONSTANTS & CONFIG
══════════════════════════════════════════════════════════════ */
const USERS_KEY      = 'gp_users_v1';
const SESSION_KEY    = 'gp_session_v1';
const RATE_KEY       = 'gp_rate_v1';
const MAX_ATTEMPTS   = 5;          // max failed logins before lockout
const LOCKOUT_MS     = 5 * 60000;  // 5 minutes lockout
const SESSION_MINS   = 120;        // session lifetime in minutes
const MIN_PWD_LEN    = 8;

/* ══════════════════════════════════════════════════════════════
   2. i18n (Auth strings only)
══════════════════════════════════════════════════════════════ */
const AUTH_STRINGS = {
  es: {
    'login.title':      'Bienvenido de nuevo',
    'login.sub':        'Inicia sesión en tu cuenta',
    'register.title':   'Crear cuenta',
    'register.sub':     'Empieza a controlar tus garantías',
    'label.name':       'Nombre',
    'label.email':      'Correo electrónico',
    'label.pwd':        'Contraseña',
    'label.pwd2':       'Confirmar contraseña',
    'btn.login':        'Iniciar sesión',
    'btn.register':     'Crear cuenta',
    'no.account':       '¿No tienes cuenta?',
    'go.register':      'Regístrate',
    'have.account':     '¿Ya tienes cuenta?',
    'go.login':         'Iniciar sesión',
    'err.required':     'Rellena todos los campos obligatorios.',
    'err.email':        'Introduce un correo electrónico válido.',
    'err.pwd.short':    `La contraseña debe tener al menos ${MIN_PWD_LEN} caracteres.`,
    'err.pwd.match':    'Las contraseñas no coinciden.',
    'err.email.taken':  'Ya existe una cuenta con ese correo.',
    'err.credentials':  'Correo o contraseña incorrectos.',
    'err.locked':       'Demasiados intentos. Espera 5 minutos.',
    'pwd.weak':         'Débil',
    'pwd.fair':         'Regular',
    'pwd.good':         'Buena',
    'pwd.strong':       'Muy segura',
    'demo.or':          'o continúa sin cuenta',
    'demo.btn':         'Ver demo',
    'demo.banner':      '🎮 Modo demo — los datos no se guardan.',
  },
  en: {
    'login.title':      'Welcome back',
    'login.sub':        'Sign in to your account',
    'register.title':   'Create account',
    'register.sub':     'Start tracking your warranties',
    'label.name':       'Name',
    'label.email':      'Email address',
    'label.pwd':        'Password',
    'label.pwd2':       'Confirm password',
    'btn.login':        'Sign in',
    'btn.register':     'Create account',
    'no.account':       "Don't have an account?",
    'go.register':      'Sign up',
    'have.account':     'Already have an account?',
    'go.login':         'Sign in',
    'err.required':     'Please fill in all required fields.',
    'err.email':        'Please enter a valid email address.',
    'err.pwd.short':    `Password must be at least ${MIN_PWD_LEN} characters.`,
    'err.pwd.match':    'Passwords do not match.',
    'err.email.taken':  'An account with that email already exists.',
    'err.credentials':  'Incorrect email or password.',
    'err.locked':       'Too many attempts. Please wait 5 minutes.',
    'pwd.weak':         'Weak',
    'pwd.fair':         'Fair',
    'pwd.good':         'Good',
    'pwd.strong':       'Strong',
    'demo.or':          'or continue without an account',
    'demo.btn':         'Try demo',
    'demo.banner':      '🎮 Demo mode — data is not saved.',
  }
};

let currentLang = localStorage.getItem('gp_lang') || 'es';

function at(key) {
  return (AUTH_STRINGS[currentLang] || AUTH_STRINGS.es)[key] || key;
}

function applyAuthLang() {
  setText('login-title',       at('login.title'));
  setText('login-sub',         at('login.sub'));
  setText('register-title',    at('register.title'));
  setText('register-sub',      at('register.sub'));
  setText('label-name',        at('label.name'));
  setText('label-email-login', at('label.email'));
  setText('label-email-reg',   at('label.email'));
  setText('label-pwd-login',   at('label.pwd'));
  setText('label-pwd-reg',     at('label.pwd'));
  setText('label-pwd2',        at('label.pwd2'));
  setText('btn-login-text',    at('btn.login'));
  setText('btn-register-text', at('btn.register'));
  setText('no-account-text',   at('no.account'));
  setText('go-register',       at('go.register'));
  setText('have-account-text', at('have.account'));
  setText('go-login',          at('go.login'));

  const flag = currentLang === 'es' ? '🇪🇸' : '🇬🇧';
  const code = currentLang === 'es' ? 'ES' : 'EN';
  setText('auth-lang-flag',  flag);
  setText('auth-lang-code',  code);
  setText('auth-lang-flag2', flag);
  setText('auth-lang-code2', code);
  setText('demo-or-text',    at('demo.or'));
  setText('btn-demo-text',   at('demo.btn'));

  document.documentElement.lang = currentLang;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ══════════════════════════════════════════════════════════════
   3. SECURITY — CRYPTO UTILS
══════════════════════════════════════════════════════════════ */

// Generate a cryptographically secure random salt (hex string)
function generateSalt() {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf, b => b.toString(16).padStart(2,'0')).join('');
}

// Hash password using PBKDF2 (Web Crypto API)
async function hashPassword(password, salt) {
  const enc  = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name:'PBKDF2', salt: enc.encode(salt), iterations: 200000, hash:'SHA-256' },
    keyMaterial, 256
  );
  return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2,'0')).join('');
}

// Constant-time string comparison to avoid timing attacks
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Generate secure session token
function generateToken() {
  const buf = new Uint8Array(48);
  crypto.getRandomValues(buf);
  return Array.from(buf, b => b.toString(16).padStart(2,'0')).join('');
}

// Sanitize / validate email (basic RFC-safe)
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

// Strip dangerous chars from name field
function sanitizeName(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x1F\x7F<>&"']/g, '').trim().slice(0, 60);
}

/* ══════════════════════════════════════════════════════════════
   4. RATE LIMITING
══════════════════════════════════════════════════════════════ */
function getRateData() {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveRateData(data) {
  try { localStorage.setItem(RATE_KEY, JSON.stringify(data)); } catch {}
}

function isLockedOut(email) {
  const data = getRateData();
  const entry = data[email.toLowerCase()];
  if (!entry) return false;
  if (entry.count >= MAX_ATTEMPTS) {
    const elapsed = Date.now() - entry.lastAttempt;
    if (elapsed < LOCKOUT_MS) return true;
    // Reset after lockout period
    delete data[email.toLowerCase()];
    saveRateData(data);
    return false;
  }
  return false;
}

function recordFailedAttempt(email) {
  const data = getRateData();
  const key  = email.toLowerCase();
  data[key] = {
    count: ((data[key]?.count) || 0) + 1,
    lastAttempt: Date.now()
  };
  saveRateData(data);
}

function clearAttempts(email) {
  const data = getRateData();
  delete data[email.toLowerCase()];
  saveRateData(data);
}

/* ══════════════════════════════════════════════════════════════
   5. USER STORAGE
══════════════════════════════════════════════════════════════ */
function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
}

function findUser(email) {
  return loadUsers().find(u => u.email === email.trim().toLowerCase());
}

/* ══════════════════════════════════════════════════════════════
   6. SESSION MANAGEMENT
══════════════════════════════════════════════════════════════ */
function createSession(userId, name, email) {
  const session = {
    token:     generateToken(),
    userId,
    name,
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_MINS * 60 * 1000,
  };
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {}
  return session;
}

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.token || !s.expiresAt) return null;
    if (Date.now() > s.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/* ══════════════════════════════════════════════════════════════
   7. REDIRECT IF ALREADY LOGGED IN
══════════════════════════════════════════════════════════════ */
if (getSession()) {
  window.location.replace('index.html');
}

/* ══════════════════════════════════════════════════════════════
   8. UI HELPERS
══════════════════════════════════════════════════════════════ */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;  // safe: textContent, not innerHTML
  el.hidden = false;
}
function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

function setLoading(formId, btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const txt = btn.querySelector('.btn-text');
  const spin = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  if (txt)  txt.hidden = loading;
  if (spin) spin.hidden = !loading;
}

function markFieldError(wrapId, hasError) {
  const el = document.getElementById(wrapId);
  if (!el) return;
  const wrap = el.closest('.field-wrap');
  if (wrap) wrap.classList.toggle('error', hasError);
}

/* ══════════════════════════════════════════════════════════════
   9. PASSWORD STRENGTH METER
══════════════════════════════════════════════════════════════ */
function calcStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  // cap at 4
  return Math.min(4, Math.max(0, Math.ceil(score * 4 / 5)));
}

function updateStrengthMeter(pwd) {
  const bars   = [document.getElementById('sb1'),document.getElementById('sb2'),document.getElementById('sb3'),document.getElementById('sb4')];
  const label  = document.getElementById('strength-label');
  const score  = calcStrength(pwd);
  const colors = ['', '#ff4f6e', '#ffbe3d', '#4f8cff', '#31e08f'];
  const labels = ['', at('pwd.weak'), at('pwd.fair'), at('pwd.good'), at('pwd.strong')];

  bars.forEach((b, i) => {
    if (!b) return;
    b.style.background = i < score ? (colors[score] || '#4f8cff') : 'rgba(255,255,255,0.08)';
  });
  if (label) {
    label.textContent = pwd.length > 0 ? (labels[score] || '') : '';
    label.style.color = colors[score] || 'var(--t-muted)';
  }
}

/* ══════════════════════════════════════════════════════════════
   10. PANEL SWITCHING
══════════════════════════════════════════════════════════════ */
function showLogin() {
  const lCard = document.getElementById('card-login');
  const rCard = document.getElementById('card-register');
  lCard.classList.remove('auth-card-hidden');
  lCard.setAttribute('aria-hidden', 'false');
  rCard.classList.add('auth-card-hidden');
  rCard.setAttribute('aria-hidden', 'true');
  hideError('login-error');
  document.getElementById('login-email')?.focus();
}

function showRegister() {
  const lCard = document.getElementById('card-login');
  const rCard = document.getElementById('card-register');
  rCard.classList.remove('auth-card-hidden');
  rCard.setAttribute('aria-hidden', 'false');
  lCard.classList.add('auth-card-hidden');
  lCard.setAttribute('aria-hidden', 'true');
  hideError('register-error');
  document.getElementById('reg-name')?.focus();
}

/* ══════════════════════════════════════════════════════════════
   11. LOGIN HANDLER
══════════════════════════════════════════════════════════════ */
async function handleLogin(e) {
  e.preventDefault();
  hideError('login-error');

  const email = document.getElementById('login-email')?.value.trim() || '';
  const pwd   = document.getElementById('login-password')?.value || '';

  if (!email || !pwd) {
    showError('login-error', at('err.required'));
    return;
  }
  if (!isValidEmail(email)) {
    showError('login-error', at('err.email'));
    return;
  }
  if (isLockedOut(email)) {
    showError('login-error', at('err.locked'));
    return;
  }

  setLoading('login-form', 'btn-login', true);

  try {
    await simulateDelay(300); // UX delay, also slightly hardens timing attacks

    const user = findUser(email);
    if (!user) {
      recordFailedAttempt(email);
      showError('login-error', at('err.credentials'));
      return;
    }

    const hash = await hashPassword(pwd, user.salt);
    if (!safeEqual(hash, user.passwordHash)) {
      recordFailedAttempt(email);
      showError('login-error', at('err.credentials'));
      return;
    }

    // Success
    clearAttempts(email);
    createSession(user.id, user.name, user.email);
    window.location.replace('index.html');

  } finally {
    setLoading('login-form', 'btn-login', false);
  }
}

/* ══════════════════════════════════════════════════════════════
   12. REGISTER HANDLER
══════════════════════════════════════════════════════════════ */
async function handleRegister(e) {
  e.preventDefault();
  hideError('register-error');

  const name   = sanitizeName(document.getElementById('reg-name')?.value || '');
  const email  = (document.getElementById('reg-email')?.value || '').trim().toLowerCase();
  const pwd    = document.getElementById('reg-password')?.value || '';
  const pwd2   = document.getElementById('reg-password2')?.value || '';

  if (!name || !email || !pwd || !pwd2) {
    showError('register-error', at('err.required'));
    return;
  }
  if (!isValidEmail(email)) {
    showError('register-error', at('err.email'));
    return;
  }
  if (pwd.length < MIN_PWD_LEN) {
    showError('register-error', at('err.pwd.short'));
    return;
  }
  if (pwd !== pwd2) {
    showError('register-error', at('err.pwd.match'));
    return;
  }
  if (findUser(email)) {
    showError('register-error', at('err.email.taken'));
    return;
  }

  setLoading('register-form', 'btn-register', true);

  try {
    const salt         = generateSalt();
    const passwordHash = await hashPassword(pwd, salt);
    const id           = generateSecureId();

    const users = loadUsers();
    users.push({ id, name, email, salt, passwordHash, createdAt: Date.now() });
    saveUsers(users);

    // Auto-login
    createSession(id, name, email);
    window.location.replace('index.html');

  } finally {
    setLoading('register-form', 'btn-register', false);
  }
}

/* ══════════════════════════════════════════════════════════════
   13. UTILS
══════════════════════════════════════════════════════════════ */
function generateSecureId() {
  const arr = new Uint32Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr, n => n.toString(16).padStart(8,'0')).join('-');
}

function simulateDelay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ══════════════════════════════════════════════════════════════
   15. DEMO MODE
══════════════════════════════════════════════════════════════ */
const DEMO_PRODUCTS_KEY = 'gp_products_v2';

function loadDemoProducts() {
  const today = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const addD = (d, days) => { const r=new Date(d); r.setDate(r.getDate()+days); return fmt(r); };
  const addY = (d, y)    => { const r=new Date(d); r.setFullYear(r.getFullYear()+y); return fmt(r); };

  return [
    {
      id: 'demo-1',
      name: currentLang === 'en' ? 'iPhone 16 Pro' : 'iPhone 16 Pro',
      brand: 'Apple',
      price: 1199,
      store: currentLang === 'en' ? 'Apple Store' : 'Apple Store',
      purchaseDate: fmt(today),
      notes: currentLang === 'en' ? 'Natural Titanium, 256 GB' : 'Titanio natural, 256 GB',
      retDays: 14,
      retStart: fmt(today),
      retConditions: currentLang === 'en'
        ? 'Unopened original box required.'
        : 'Caja original sin abrir, con todos los accesorios.',
      warStart: fmt(today),
      warYears: 2,
      warCovers: currentLang === 'en'
        ? 'Manufacturing defects\nHardware failures\nBattery defects (>80% capacity)'
        : 'Defectos de fabricación\nFallos de hardware\nDefectos de batería (>80% capacidad)',
      warNoCovers: currentLang === 'en'
        ? 'Accidental damage\nWater damage\nUnauthorised repairs'
        : 'Daños accidentales\nDaños por agua\nReparaciones no autorizadas',
      ticketImage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      name: currentLang === 'en' ? 'Sony WH-1000XM5' : 'Sony WH-1000XM5',
      brand: 'Sony',
      price: 279,
      store: currentLang === 'en' ? 'Amazon' : 'Amazon',
      purchaseDate: addD(today, -20),
      notes: currentLang === 'en' ? 'Black, noise-cancelling' : 'Negro, cancelación de ruido',
      retDays: 30,
      retStart: addD(today, -20),
      retConditions: currentLang === 'en'
        ? 'Original packaging and receipt required.'
        : 'Embalaje original y ticket de compra.',
      warStart: addD(today, -20),
      warYears: 1,
      warCovers: currentLang === 'en'
        ? 'Manufacturing defects\nElectronic failures'
        : 'Defectos de fabricación\nFallos electrónicos',
      warNoCovers: currentLang === 'en'
        ? 'Physical damage\nWater damage\nNormal wear'
        : 'Daños físicos\nDaños por líquidos\nDesgaste normal',
      ticketImage: null,
      createdAt: addD(today, -20) + 'T10:00:00.000Z',
      updatedAt: addD(today, -20) + 'T10:00:00.000Z',
    },
    {
      id: 'demo-3',
      name: currentLang === 'en' ? 'Samsung 65" OLED TV' : 'Samsung 65" OLED TV',
      brand: 'Samsung',
      price: 1499,
      store: currentLang === 'en' ? 'MediaMarkt' : 'MediaMarkt',
      purchaseDate: addD(today, -5),
      notes: currentLang === 'en' ? '4K, 120Hz, Smart TV' : '4K, 120Hz, Smart TV',
      retDays: 15,
      retStart: addD(today, -5),
      retConditions: currentLang === 'en'
        ? 'Must be in original packaging, unused.'
        : 'En embalaje original, sin uso.',
      warStart: addD(today, -5),
      warYears: 3,
      warCovers: currentLang === 'en'
        ? 'Panel defects\nElectronic component failures'
        : 'Defectos de panel\nFallos de componentes electrónicos',
      warNoCovers: currentLang === 'en'
        ? 'Dead pixels <5\nPhysical damage\nPower surges'
        : 'Píxeles muertos <5\nDaños físicos\nSubidas de tensión',
      ticketImage: null,
      createdAt: addD(today, -5) + 'T09:00:00.000Z',
      updatedAt: addD(today, -5) + 'T09:00:00.000Z',
    },
    {
      id: 'demo-4',
      name: currentLang === 'en' ? 'LG Washing Machine' : 'Lavadora LG',
      brand: 'LG',
      price: 699,
      store: currentLang === 'en' ? 'El Corte Inglés' : 'El Corte Inglés',
      purchaseDate: addD(today, -400),
      notes: currentLang === 'en' ? '9kg, A+++ energy class' : '9kg, clase energética A+++',
      retDays: 14,
      retStart: addD(today, -400),
      retConditions: '',
      warStart: addD(today, -400),
      warYears: 5,
      warCovers: currentLang === 'en'
        ? 'Motor defects (10 years)\nElectronic parts\nDrums and bearings'
        : 'Defectos del motor (10 años)\nPiezas electrónicas\nTambor y rodamientos',
      warNoCovers: currentLang === 'en'
        ? 'Wear parts (belts, filters)\nCosmétic damage\nMisuse'
        : 'Piezas de desgaste (correas, filtros)\nDaños estéticos\nUso indebido',
      ticketImage: null,
      createdAt: addD(today, -400) + 'T08:00:00.000Z',
      updatedAt: addD(today, -400) + 'T08:00:00.000Z',
    },
  ];
}

function handleDemo() {
  // Create demo session
  const demoSession = {
    token: 'demo-' + Date.now(),
    userId: 'demo',
    name: currentLang === 'en' ? 'Demo User' : 'Usuario Demo',
    email: 'demo@garantiaspro.app',
    isDemo: true,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  };
  try {
    sessionStorage.setItem('gp_session_v1', JSON.stringify(demoSession));
    // Only load demo products if there's nothing stored yet
    const existing = localStorage.getItem(DEMO_PRODUCTS_KEY);
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(loadDemoProducts()));
    }
  } catch (e) { /* continue anyway */ }
  window.location.replace('index.html');
}

/* ══════════════════════════════════════════════════════════════
   16. INIT
══════════════════════════════════════════════════════════════ */
function initAuth() {
  applyAuthLang();

  // Switch panels
  document.getElementById('go-register')?.addEventListener('click', showRegister);
  document.getElementById('go-login')?.addEventListener('click', showLogin);

  // Demo button
  document.getElementById('btn-demo')?.addEventListener('click', handleDemo);

  // Forms
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);

  // Password strength
  document.getElementById('reg-password')?.addEventListener('input', (e) => {
    updateStrengthMeter(e.target.value);
  });

  // Toggle password visibility
  document.querySelectorAll('.toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.setAttribute('aria-label', isText ? 'Mostrar contraseña' : 'Ocultar contraseña');
      // swap eye icon opacity as visual cue
      btn.style.opacity = isText ? '0.5' : '1';
    });
  });

  // Language toggles
  ['auth-lang-toggle','auth-lang-toggle2'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      currentLang = currentLang === 'es' ? 'en' : 'es';
      localStorage.setItem('gp_lang', currentLang);
      applyAuthLang();
      updateStrengthMeter(document.getElementById('reg-password')?.value || '');
    });
  });

  // Clear field errors on input
  document.querySelectorAll('.field-wrap input').forEach(input => {
    input.addEventListener('input', () => {
      const wrap = input.closest('.field-wrap');
      if (wrap) wrap.classList.remove('error');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
