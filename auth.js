/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Auth Logic (Supabase Auth)
   Seguridad: contraseñas gestionadas por Supabase (bcrypt en servidor),
              verificación de email obligatoria, límites de intentos
              en servidor + bloqueo local, operaciones DOM sin innerHTML.
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. CONSTANTS & CONFIG
══════════════════════════════════════════════════════════════ */
const RATE_KEY       = 'gp_rate_v1';
const MAX_ATTEMPTS   = 5;          // intentos fallidos antes del bloqueo local
const LOCKOUT_MS     = 5 * 60000;  // 5 minutos
const MIN_PWD_LEN    = 8;

/* ══════════════════════════════════════════════════════════════
   2. i18n (Auth strings only)
══════════════════════════════════════════════════════════════ */
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
    'ph.name':          'Tu nombre',
    'ph.pwd.new':       'Mínimo 8 caracteres',
    'ph.pwd.repeat':    'Repite la contraseña',
    'pwd.hint':         'Usa letras y números. Mínimo 8 caracteres.',
    'btn.login':        'Iniciar sesión',
    'btn.register':     'Crear cuenta',
    'no.account':       '¿No tienes cuenta?',
    'go.register':      'Regístrate',
    'have.account':     '¿Ya tienes cuenta?',
    'go.login':         'Iniciar sesión',
    'err.required':     'Rellena todos los campos obligatorios.',
    'err.email':        'Introduce un correo electrónico válido.',
    'err.pwd.short':    `La contraseña debe tener al menos ${MIN_PWD_LEN} caracteres.`,
    'err.pwd.weak':     'La contraseña debe incluir letras y números.',
    'err.pwd.match':    'Las contraseñas no coinciden.',
    'err.credentials':  'Correo o contraseña incorrectos.',
    'err.unconfirmed':  'Todavía no has confirmado tu correo. Revisa tu bandeja de entrada (y la carpeta de spam).',
    'err.locked':       'Demasiados intentos. Espera 5 minutos.',
    'err.ratelimit':    'Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.',
    'err.network':      'No se pudo conectar con el servidor. Comprueba tu conexión.',
    'err.generic':      'Ha ocurrido un error. Inténtalo de nuevo.',
    'pwd.weak':         'Débil',
    'pwd.fair':         'Regular',
    'pwd.good':         'Buena',
    'pwd.strong':       'Muy segura',
    'demo.or':          'o continúa sin cuenta',
    'demo.btn':         'Ver demo',
    'verify.title':     'Revisa tu correo',
    'verify.text':      'Te hemos enviado un enlace de confirmación. Ábrelo para activar tu cuenta y después inicia sesión.',
    'verify.resend':    'Reenviar email',
    'verify.sent':      'Email reenviado. Puede tardar unos minutos.',
    'verify.back':      'Volver a iniciar sesión',
    'resend.login':     'Reenviar email de confirmación',
    'pwd.show':         'Mostrar contraseña',
    'pwd.hide':         'Ocultar contraseña',
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
    'ph.name':          'Your name',
    'ph.pwd.new':       'At least 8 characters',
    'ph.pwd.repeat':    'Repeat password',
    'pwd.hint':         'Use letters and numbers. At least 8 characters.',
    'btn.login':        'Sign in',
    'btn.register':     'Create account',
    'no.account':       "Don't have an account?",
    'go.register':      'Sign up',
    'have.account':     'Already have an account?',
    'go.login':         'Sign in',
    'err.required':     'Please fill in all required fields.',
    'err.email':        'Please enter a valid email address.',
    'err.pwd.short':    `Password must be at least ${MIN_PWD_LEN} characters.`,
    'err.pwd.weak':     'Password must include letters and numbers.',
    'err.pwd.match':    'Passwords do not match.',
    'err.credentials':  'Incorrect email or password.',
    'err.unconfirmed':  "You haven't confirmed your email yet. Check your inbox (and spam folder).",
    'err.locked':       'Too many attempts. Please wait 5 minutes.',
    'err.ratelimit':    'Too many requests. Please wait a few minutes and try again.',
    'err.network':      'Could not reach the server. Check your connection.',
    'err.generic':      'Something went wrong. Please try again.',
    'pwd.weak':         'Weak',
    'pwd.fair':         'Fair',
    'pwd.good':         'Good',
    'pwd.strong':       'Strong',
    'demo.or':          'or continue without an account',
    'demo.btn':         'Try demo',
    'verify.title':     'Check your email',
    'verify.text':      'Te hemos enviado un enlace de confirmación. Ábrelo para activar tu cuenta y después inicia sesión.',
    'verify.resend':    'Resend email',
    'verify.sent':      'Email sent again. It may take a few minutes.',
    'verify.back':      'Back to sign in',
    'resend.login':     'Resend confirmation email',
    'pwd.show':         'Show password',
    'pwd.hide':         'Hide password',
  }
};

let currentLang = localStorage.getItem('gp_lang') || 'es';

function at(key) {
  return (AUTH_STRINGS[currentLang] || AUTH_STRINGS.es)[key] || key;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function setPlaceholder(id, text) {
  const el = document.getElementById(id);
  if (el) el.placeholder = text;
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
  setText('demo-or-text',      at('demo.or'));
  setText('btn-demo-text',     at('demo.btn'));
  setText('pwd-hint',          at('pwd.hint'));
  setText('verify-title',      at('verify.title'));
  setText('verify-text',       at('verify.text'));
  setText('btn-resend-text',   at('verify.resend'));
  setText('verify-go-login',   at('verify.back'));
  setText('btn-resend-login',  at('resend.login'));
  setPlaceholder('reg-name',      at('ph.name'));
  setPlaceholder('reg-password',  at('ph.pwd.new'));
  setPlaceholder('reg-password2', at('ph.pwd.repeat'));

  document.querySelectorAll('.js-lang-code').forEach(el => {
    el.textContent = currentLang === 'es' ? 'ES' : 'EN';
  });
  document.querySelectorAll('.toggle-pwd').forEach(btn => {
    const input = document.getElementById(btn.dataset.target);
    btn.setAttribute('aria-label', input && input.type === 'text' ? at('pwd.hide') : at('pwd.show'));
  });

  document.documentElement.lang = currentLang;
}

/* ══════════════════════════════════════════════════════════════
   3. VALIDATION
══════════════════════════════════════════════════════════════ */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

function sanitizeName(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x1F\x7F<>&"']/g, '').trim().slice(0, 60);
}

/* ══════════════════════════════════════════════════════════════
   4. LOCAL RATE LIMITING (complementa el límite del servidor)
══════════════════════════════════════════════════════════════ */
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
    if (Date.now() - entry.lastAttempt < LOCKOUT_MS) return true;
    delete data[email.toLowerCase()];
    saveRateData(data);
  }
  return false;
}
function recordFailedAttempt(email) {
  const data = getRateData();
  const key  = email.toLowerCase();
  data[key] = { count: ((data[key]?.count) || 0) + 1, lastAttempt: Date.now() };
  saveRateData(data);
}
function clearAttempts(email) {
  const data = getRateData();
  delete data[email.toLowerCase()];
  saveRateData(data);
}

/* ══════════════════════════════════════════════════════════════
   5. UI HELPERS
══════════════════════════════════════════════════════════════ */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;  // textContent: seguro frente a XSS
  el.hidden = false;
}
function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const txt  = btn.querySelector('.btn-text');
  const spin = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  if (txt)  txt.hidden = loading;
  if (spin) spin.hidden = !loading;
}

function mapAuthError(error) {
  if (!error) return at('err.generic');
  const code = error.code || '';
  const msg  = (error.message || '').toLowerCase();
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) return at('err.credentials');
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) return at('err.unconfirmed');
  if (code.startsWith('over_') || error.status === 429 || msg.includes('rate limit')) return at('err.ratelimit');
  if (code === 'weak_password') return at('err.pwd.weak');
  if (error.name === 'AuthRetryableFetchError' || msg.includes('fetch') || msg.includes('network')) return at('err.network');
  return at('err.generic');
}

/* ══════════════════════════════════════════════════════════════
   6. PASSWORD STRENGTH METER
══════════════════════════════════════════════════════════════ */
function calcStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(4, Math.max(0, Math.ceil(score * 4 / 5)));
}

function updateStrengthMeter(pwd) {
  const bars   = ['sb1','sb2','sb3','sb4'].map(id => document.getElementById(id));
  const label  = document.getElementById('strength-label');
  const score  = calcStrength(pwd);
  const colors = ['', '#e5484d', '#e5a03a', '#4a7dff', '#30a46c'];
  const labels = ['', at('pwd.weak'), at('pwd.fair'), at('pwd.good'), at('pwd.strong')];

  bars.forEach((b, i) => {
    if (!b) return;
    b.style.background = i < score ? colors[score] : '';
  });
  if (label) {
    label.textContent = pwd.length > 0 ? (labels[score] || '') : '';
    label.style.color = colors[score] || '';
  }
}

/* ══════════════════════════════════════════════════════════════
   7. PANEL SWITCHING
══════════════════════════════════════════════════════════════ */
function showCard(which) {
  ['login', 'register', 'verify'].forEach(name => {
    const card = document.getElementById('card-' + name);
    if (!card) return;
    const active = name === which;
    card.classList.toggle('auth-card-hidden', !active);
    card.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  hideError('login-error');
  hideError('register-error');
  hideError('verify-msg');
  const resendLogin = document.getElementById('btn-resend-login');
  if (resendLogin) resendLogin.hidden = true;
  if (which === 'login')    document.getElementById('login-email')?.focus();
  if (which === 'register') document.getElementById('reg-name')?.focus();
}

let pendingVerifyEmail = '';

function showVerify(email) {
  pendingVerifyEmail = email;
  setText('verify-email', email);
  const loginInput = document.getElementById('login-email');
  if (loginInput) loginInput.value = email;
  showCard('verify');
}

/* ══════════════════════════════════════════════════════════════
   8. LOGIN HANDLER
══════════════════════════════════════════════════════════════ */
async function handleLogin(e) {
  e.preventDefault();
  hideError('login-error');
  const resendLogin = document.getElementById('btn-resend-login');
  if (resendLogin) resendLogin.hidden = true;

  const email = (document.getElementById('login-email')?.value || '').trim().toLowerCase();
  const pwd   = document.getElementById('login-password')?.value || '';

  if (!email || !pwd)        return showError('login-error', at('err.required'));
  if (!isValidEmail(email))  return showError('login-error', at('err.email'));
  if (isLockedOut(email))    return showError('login-error', at('err.locked'));

  setLoading('btn-login', true);
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pwd });
    if (error) {
      const unconfirmed = error.code === 'email_not_confirmed' ||
                          (error.message || '').toLowerCase().includes('email not confirmed');
      if (!unconfirmed) recordFailedAttempt(email);
      showError('login-error', mapAuthError(error));
      if (unconfirmed && resendLogin) {
        pendingVerifyEmail = email;
        resendLogin.hidden = false;
      }
      return;
    }
    if (data && data.session) {
      clearAttempts(email);
      clearDemoSession();
      window.location.replace('index.html');
    }
  } catch (err) {
    showError('login-error', mapAuthError(err));
  } finally {
    setLoading('btn-login', false);
  }
}

/* ══════════════════════════════════════════════════════════════
   9. REGISTER HANDLER
══════════════════════════════════════════════════════════════ */
async function handleRegister(e) {
  e.preventDefault();
  hideError('register-error');

  const name  = sanitizeName(document.getElementById('reg-name')?.value || '');
  const email = (document.getElementById('reg-email')?.value || '').trim().toLowerCase();
  const pwd   = document.getElementById('reg-password')?.value || '';
  const pwd2  = document.getElementById('reg-password2')?.value || '';

  if (!name || !email || !pwd || !pwd2)           return showError('register-error', at('err.required'));
  if (!isValidEmail(email))                       return showError('register-error', at('err.email'));
  if (pwd.length < MIN_PWD_LEN)                   return showError('register-error', at('err.pwd.short'));
  if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) return showError('register-error', at('err.pwd.weak'));
  if (pwd !== pwd2)                               return showError('register-error', at('err.pwd.match'));

  setLoading('btn-register', true);
  try {
    const { data, error } = await sb.auth.signUp({
      email,
      password: pwd,
      options: {
        data: { name },
        emailRedirectTo: AUTH_REDIRECT_URL,
      },
    });
    if (error) {
      showError('register-error', mapAuthError(error));
      return;
    }
    // Si la verificación de email está desactivada en Supabase, ya hay sesión
    if (data && data.session) {
      clearDemoSession();
      window.location.replace('index.html');
      return;
    }
    // Por privacidad, Supabase no revela si el correo ya existía:
    // mostramos siempre el mismo mensaje.
    document.getElementById('register-form')?.reset();
    updateStrengthMeter('');
    showVerify(email);
  } catch (err) {
    showError('register-error', mapAuthError(err));
  } finally {
    setLoading('btn-register', false);
  }
}

/* ══════════════════════════════════════════════════════════════
   10. RESEND CONFIRMATION
══════════════════════════════════════════════════════════════ */
async function resendConfirmation(targetMsgId) {
  if (!pendingVerifyEmail) return;
  try {
    const { error } = await sb.auth.resend({
      type: 'signup',
      email: pendingVerifyEmail,
      options: { emailRedirectTo: AUTH_REDIRECT_URL },
    });
    const el = document.getElementById(targetMsgId);
    if (error) {
      if (el) el.classList.remove('info-msg');
      showError(targetMsgId, mapAuthError(error));
    } else {
      if (el) el.classList.add('info-msg');
      showError(targetMsgId, at('verify.sent'));
    }
  } catch (err) {
    showError(targetMsgId, mapAuthError(err));
  }
}

/* ══════════════════════════════════════════════════════════════
   11. DEMO MODE (100% local, en sessionStorage)
══════════════════════════════════════════════════════════════ */
function buildDemoProducts() {
  const en = currentLang === 'en';
  const now = new Date();
  const addD = (days) => { const r = new Date(now); r.setDate(r.getDate() + days); return localISODate(r); };
  const stamp = (days) => { const r = new Date(now); r.setDate(r.getDate() + days); return r.toISOString(); };

  return [
    {
      id: 'demo-1', name: 'iPhone 16 Pro', brand: 'Apple', price: 1199, store: 'Apple Store',
      purchaseDate: addD(0), notes: en ? 'Natural Titanium, 256 GB' : 'Titanio natural, 256 GB',
      retDays: 14, retStart: addD(0),
      retConditions: en ? 'Unopened original box required.' : 'Caja original sin abrir, con todos los accesorios.',
      warStart: addD(0), warYears: 2,
      warCovers: en ? 'Manufacturing defects\nHardware failures\nBattery defects (>80% capacity)'
                    : 'Defectos de fabricación\nFallos de hardware\nDefectos de batería (>80% capacidad)',
      warNoCovers: en ? 'Accidental damage\nWater damage\nUnauthorised repairs'
                      : 'Daños accidentales\nDaños por agua\nReparaciones no autorizadas',
      ticketImage: null, createdAt: stamp(0), updatedAt: stamp(0),
    },
    {
      id: 'demo-2', name: 'Sony WH-1000XM5', brand: 'Sony', price: 279, store: 'Amazon',
      purchaseDate: addD(-27), notes: en ? 'Black, noise-cancelling' : 'Negro, cancelación de ruido',
      retDays: 29, retStart: addD(-27),
      retConditions: en ? 'Original packaging and receipt required.' : 'Embalaje original y ticket de compra.',
      warStart: addD(-27), warYears: 1,
      warCovers: en ? 'Manufacturing defects\nElectronic failures' : 'Defectos de fabricación\nFallos electrónicos',
      warNoCovers: en ? 'Physical damage\nWater damage\nNormal wear' : 'Daños físicos\nDaños por líquidos\nDesgaste normal',
      ticketImage: null, createdAt: stamp(-27), updatedAt: stamp(-27),
    },
    {
      id: 'demo-3', name: 'Samsung 65" OLED TV', brand: 'Samsung', price: 1499, store: 'MediaMarkt',
      purchaseDate: addD(-7), notes: '4K, 120Hz, Smart TV',
      retDays: 10, retStart: addD(-7),
      retConditions: en ? 'Must be in original packaging, unused.' : 'En embalaje original, sin uso.',
      warStart: addD(-5), warYears: 3,
      warCovers: en ? 'Panel defects\nElectronic component failures' : 'Defectos de panel\nFallos de componentes electrónicos',
      warNoCovers: en ? 'Dead pixels <5\nPhysical damage\nPower surges' : 'Píxeles muertos <5\nDaños físicos\nSubidas de tensión',
      ticketImage: null, createdAt: stamp(-5), updatedAt: stamp(-5),
    },
    {
      id: 'demo-4', name: en ? 'LG Washing Machine' : 'Lavadora LG', brand: 'LG', price: 699, store: 'El Corte Inglés',
      purchaseDate: addD(-400), notes: en ? '9kg, A+++ energy class' : '9kg, clase energética A+++',
      retDays: 14, retStart: addD(-400), retConditions: '',
      warStart: addD(-400), warYears: 5,
      warCovers: en ? 'Motor defects (10 years)\nElectronic parts\nDrums and bearings' : 'Defectos del motor (10 años)\nPiezas electrónicas\nTambor y rodamientos',
      warNoCovers: en ? 'Wear parts (belts, filters)\nCosmetic damage\nMisuse' : 'Piezas de desgaste (correas, filtros)\nDaños estéticos\nUso indebido',
      ticketImage: null, createdAt: stamp(-400), updatedAt: stamp(-400),
    },
  ];
}

function handleDemo() {
  const demoSession = {
    token: 'demo-' + Date.now(),
    userId: 'demo',
    name: currentLang === 'en' ? 'Demo User' : 'Usuario Demo',
    email: '',
    isDemo: true,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hora
  };
  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoSession));
    sessionStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(buildDemoProducts()));
  } catch { /* continuar igualmente */ }
  window.location.replace('index.html');
}

/* ══════════════════════════════════════════════════════════════
   12. INIT
══════════════════════════════════════════════════════════════ */
async function redirectIfLoggedIn() {
  try {
    const { data } = await sb.auth.getSession();
    if (data && data.session) {
      clearDemoSession();
      window.location.replace('index.html');
    }
  } catch { /* sin sesión */ }
}

function initAuth() {
  applyAuthLang();

  // Enlaces "Crear cuenta" de la página de inicio
  if (window.location.hash === '#registro') showCard('register');

  // Si la URL contiene un código de intercambio PKCE (?code=)
  const search = window.location.search || '';
  if (search.includes('code=')) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && sb.auth.exchangeCodeForSession) {
      sb.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data && data.session) {
          clearDemoSession();
          window.location.replace('index.html');
        }
      }).catch(() => {});
    }
  }

  // Cuando el usuario vuelve desde el enlace del email, Supabase crea la sesión
  sb.auth.onAuthStateChange((event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
      clearDemoSession();
      window.location.replace('index.html');
    }
  });
  redirectIfLoggedIn();

  document.getElementById('go-register')?.addEventListener('click', () => showCard('register'));
  document.getElementById('go-login')?.addEventListener('click', () => showCard('login'));
  document.getElementById('verify-go-login')?.addEventListener('click', () => showCard('login'));
  document.getElementById('btn-demo')?.addEventListener('click', handleDemo);
  document.getElementById('btn-resend')?.addEventListener('click', () => resendConfirmation('verify-msg'));
  document.getElementById('btn-resend-login')?.addEventListener('click', () => resendConfirmation('login-error'));

  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);

  document.getElementById('reg-password')?.addEventListener('input', (e) => {
    updateStrengthMeter(e.target.value);
  });

  document.querySelectorAll('.toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-label', show ? at('pwd.hide') : at('pwd.show'));
      btn.innerHTML = iconSvg(show ? 'eyeOff' : 'eye', 16);
    });
  });

  ['auth-lang-toggle', 'auth-lang-toggle2'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      currentLang = currentLang === 'es' ? 'en' : 'es';
      localStorage.setItem('gp_lang', currentLang);
      applyAuthLang();
      updateStrengthMeter(document.getElementById('reg-password')?.value || '');
    });
  });

  document.querySelectorAll('.field-wrap input').forEach(input => {
    input.addEventListener('input', () => {
      const wrap = input.closest('.field-wrap');
      if (wrap) wrap.classList.remove('error');
    });
  });

  // Modales legales en pantalla auth
  const privModal = document.getElementById('modal-privacy');
  const contModal = document.getElementById('modal-contact');
  document.getElementById('btn-open-privacy')?.addEventListener('click', () => {
    if (privModal) privModal.hidden = false;
  });
  document.getElementById('privacy-close')?.addEventListener('click', () => {
    if (privModal) privModal.hidden = true;
  });
  document.getElementById('btn-privacy-ok')?.addEventListener('click', () => {
    if (privModal) privModal.hidden = true;
  });

  document.getElementById('btn-open-contact')?.addEventListener('click', () => {
    if (contModal) contModal.hidden = false;
  });
  document.getElementById('contact-close')?.addEventListener('click', () => {
    if (contModal) contModal.hidden = true;
  });
  document.getElementById('contact-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim();
    const subj = document.getElementById('contact-subject')?.value.trim();
    const msg = document.getElementById('contact-msg')?.value.trim();
    const u = ['jemendo90', 'gmail.com'].join('@');
    const mailUrl = `mailto:${u}?subject=${encodeURIComponent('[GarantíasPro] ' + subj)}&body=${encodeURIComponent('Hola,\n\n' + msg + '\n\nAtentamente,\n' + name)}`;
    window.location.href = mailUrl;
    if (contModal) contModal.hidden = true;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
