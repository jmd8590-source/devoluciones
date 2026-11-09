// GarantíasPro — auditoría automática de accesibilidad (axe-core, WCAG 2.1 AA)
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const INIT = `localStorage.setItem('gp_cookie_consent', JSON.stringify({technical:true}));localStorage.setItem('gp_tour_done_v1','1');`;

for (const scheme of ['light', 'dark']) {
  test(`accesibilidad WCAG 2.1 AA sin infracciones · tema ${scheme}`, async ({ page }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.addInitScript(INIT);
    await page.route('**/*.supabase.co/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const found = [];
    const scan = async (name) => {
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      r.violations.forEach(v => found.push(`${name}: ${v.id} → ${v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(', ')}`));
    };
    await page.goto('/auth.html'); await scan('acceso');
    await page.click('#go-forgot'); await scan('recuperar');
    await page.click('#forgot-back'); await page.click('#btn-demo'); await page.waitForURL('**/index.html');
    await page.waitForTimeout(600); await scan('inicio');
    await page.click('#nav-products'); await scan('productos');
    await page.click('#nav-alerts'); await scan('alertas');
    await page.click('#nav-dashboard'); await page.click('#next-up-open'); await scan('detalle');
    await page.click('.btn-detail-claim'); await scan('reclamación');
    expect(found).toEqual([]);
  });
}
