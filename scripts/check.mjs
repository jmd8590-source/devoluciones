// Comprobaciones rápidas antes de desplegar: sintaxis JS, secretos y ficheros prohibidos en public/
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
let fail = 0;
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk('public');
for (const f of files.filter(f => f.endsWith('.js') && !f.includes('/vendor/'))) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { console.error('Sintaxis:', f, e.stderr?.toString().split('\n')[0]); fail++; }
}
const SECRET = /(sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}|sb_secret_[A-Za-z0-9_-]{10,}|service_role"?\s*[:=]\s*["']eyJ|-----BEGIN [A-Z ]*PRIVATE KEY)/;
for (const f of files.filter(f => /\.(js|html|json|txt|css)$/.test(f))) {
  if (SECRET.test(readFileSync(f, 'utf8'))) { console.error('Posible secreto en', f); fail++; }
}
for (const f of files) if (/(^|\/)(\.env|\.git|README\.md|package\.json|wrangler\.toml)/.test(f.replace(/^public\//, ''))) { console.error('No debe publicarse:', f); fail++; }
console.log(fail ? `✗ ${fail} problema(s)` : '✓ Comprobaciones superadas');
process.exit(fail ? 1 : 0);
