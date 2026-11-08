// GarantíasPro — pruebas de extremo a extremo (sin tocar la base de datos real)
import { test, expect } from '@playwright/test';

const CONSENT = `localStorage.setItem('gp_cookie_consent', JSON.stringify({technical:true,preferences:false,analytics:false,timestamp:new Date().toISOString(),version:'1.0'}));`;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(CONSENT);
  // Ninguna prueba debe llegar a Supabase: se simulan sus respuestas
  await page.route('**/*.supabase.co/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
});

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|fonts\.g/.test(m.text())) errors.push(m.text()); });
  return errors;
}

test('acceso: carga sin errores y muestra «¿Has olvidado la contraseña?»', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/auth.html');
  await expect(page.locator('#card-login')).toBeVisible();
  await expect(page.locator('#go-forgot')).toHaveText('¿Has olvidado la contraseña?');
  expect(errors).toEqual([]);
});

test('recuperar contraseña: valida el correo y muestra un mensaje neutro', async ({ page }) => {
  let recoverCalls = 0;
  await page.route('**/auth/v1/recover**', route => { recoverCalls++; route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  await page.goto('/auth.html');
  await page.fill('#login-email', 'ana@example.com');
  await page.click('#go-forgot');
  await expect(page.locator('#card-forgot')).toBeVisible();
  await expect(page.locator('#forgot-email')).toHaveValue('ana@example.com'); // copia el correo del login
  await page.fill('#forgot-email', 'no-es-un-correo');
  await page.click('#btn-forgot');
  await expect(page.locator('#forgot-error')).toBeVisible();
  await page.fill('#forgot-email', 'ana@example.com');
  await page.click('#btn-forgot');
  await expect(page.locator('#forgot-ok')).toContainText('Si existe una cuenta');
  expect(recoverCalls).toBe(1);
  await page.click('#forgot-back');
  await expect(page.locator('#card-login')).toBeVisible();
});

test('enlace del email: abre «Crea una contraseña nueva» y exige que coincidan', async ({ page }) => {
  await page.goto('/auth.html?reset=1');
  await expect(page.locator('#card-reset')).toBeVisible();
  await page.fill('#reset-password', 'clave1234');
  await page.fill('#reset-password2', 'clave9999');
  await page.click('#btn-reset');
  await expect(page.locator('#reset-error')).toContainText('no coinciden');
});

test('idioma: la pantalla de recuperación se traduce al inglés', async ({ page }) => {
  await page.goto('/auth.html');
  await page.click('#auth-lang-toggle');
  await expect(page.locator('#go-forgot')).toHaveText('Forgot your password?');
  await page.click('#go-forgot');
  await expect(page.locator('#forgot-title')).toHaveText('Reset your password');
});

test('tema: cambia entre oscuro y claro y se recuerda al recargar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/auth.html');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.locator('#card-login .js-theme-toggle').click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#card-login .js-theme-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(246, 244, 239)');
});

test('demo: entra en la app, el tour arranca solo y se puede cerrar con Esc', async ({ page }) => {
  test.setTimeout(60000);
  const errors = collectErrors(page);
  const t0 = Date.now(); const mark = (m) => console.log(`[${Date.now() - t0}ms] ${m}`);
  await page.goto('/auth.html');
  await page.click('#btn-demo');
  await page.waitForURL('**/index.html');
  const dialog = page.locator('.tour-pop[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 8000 });
  mark('tour visible');
  await expect(page.locator('.tour-title')).toHaveText('Bienvenido a GarantíasPro');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.tour-title')).toHaveText('Añade una compra');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('gp_tour_done_v1'))).toBe('1');
  // Se puede volver a abrir desde el botón de la guía
  mark('cerrado con Esc');
  await page.click('#btn-tour');
  mark('btn-tour pulsado');
  await expect(dialog).toBeVisible();
  mark('reabierto');
  // Recorre todos los pasos hasta el final
  for (let i = 0; i < 12 && await dialog.count(); i++) { mark('paso ' + i + ': ' + await page.locator('.tour-title').textContent()); await page.locator('.tour-next').click(); }
  await expect(dialog).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('cabecera: nada se sale de la pantalla y no hay scroll horizontal', async ({ page }) => {
  await page.addInitScript(`localStorage.setItem('gp_tour_done_v1','1');`);
  await page.goto('/auth.html');
  await page.click('#btn-demo');
  await page.waitForURL('**/index.html');
  await page.waitForTimeout(800);
  const vw = page.viewportSize().width;
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  for (const sel of ['#theme-toggle', '#btn-tour', '#lang-toggle']) {
    const box = await page.locator(sel).boundingBox();
    expect(box, sel).not.toBeNull();
    expect(box.x + box.width, sel).toBeLessThanOrEqual(vw);
  }
  const add = page.locator(vw > 768 ? '#btn-add-main' : '#btn-fab');
  const box = await add.boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(vw);
});

test('accesibilidad: todos los campos de la pantalla de acceso tienen etiqueta', async ({ page }) => {
  await page.goto('/auth.html');
  const unlabeled = await page.evaluate(() => [...document.querySelectorAll('input:not([type=hidden]), textarea, select')]
    .filter(i => !(i.labels && i.labels.length) && !i.getAttribute('aria-label')).map(i => i.id));
  expect(unlabeled).toEqual([]);
});

test('página inexistente: muestra la 404 propia', async ({ page }) => {
  const res = await page.goto('/no-existe');
  expect(res.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Esta página no existe');
});

test('móvil: la barra de navegación inferior está abajo y no tapa la cabecera', async ({ page }) => {
  test.skip(page.viewportSize().width > 768, 'solo en móvil');
  await page.addInitScript(`localStorage.setItem('gp_tour_done_v1','1');`);
  await page.goto('/auth.html');
  await page.click('#btn-demo');
  await page.waitForURL('**/index.html');
  const nav = await page.locator('.header-nav').boundingBox();
  const vh = page.viewportSize().height;
  expect(nav.y + nav.height).toBeGreaterThan(vh - 4);
  expect(nav.y).toBeGreaterThan(vh / 2);
  await expect(page.locator('.logo-text')).toBeVisible();
});

test('enlace de recuperación que llega a la página principal: lleva a «Crea una contraseña nueva»', async ({ page }) => {
  await page.goto('/index.html#access_token=x&refresh_token=y&type=recovery');
  await page.waitForURL('**/auth.html?reset=1*');
  await expect(page.locator('#card-reset')).toBeVisible();
});
