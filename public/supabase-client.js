/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Supabase client
   La clave publicable es pública por diseño: la seguridad real la
   aplican las políticas RLS de la base de datos (cada usuario solo
   puede leer/escribir sus propias filas y archivos).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const SUPABASE_URL = 'https://ynmqlzpqsyvhzlspzfkd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qRi7b8QQD0t6iDg14iPM5g_0MNKlR_X';
const SUPABASE_AUTH_STORAGE_KEY = 'sb-ynmqlzpqsyvhzlspzfkd-auth-token';
const TICKETS_BUCKET = 'tickets';

// Página a la que vuelve el usuario desde los emails de Supabase
const AUTH_REDIRECT_URL = new URL('auth.html', window.location.href).href;

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: SUPABASE_AUTH_STORAGE_KEY,
  },
});

// Sesión demo (solo local, nunca toca Supabase)
const DEMO_SESSION_KEY  = 'gp_session_v1';
const DEMO_PRODUCTS_KEY = 'gp_demo_products_v1';

function getDemoSession() {
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.isDemo || Date.now() > s.expiresAt) {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

function clearDemoSession() {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
  sessionStorage.removeItem(DEMO_PRODUCTS_KEY);
}

// Fecha local en formato YYYY-MM-DD (evita desfases por UTC)
function localISODate(d) {
  const dt = d instanceof Date ? d : new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
