// GarantíasPro — compilación para producción
// Copia public/ a dist/ y ofusca el JavaScript propio (no las librerías de vendor/).
// Se conservan los nombres globales porque los ficheros se comparten funciones entre sí.
import { cpSync, rmSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { transform as transformCss } from 'lightningcss';

const SRC = 'public', OUT = 'dist';
const SKIP = new Set(['sw.js']); // el service worker se deja legible para depurar la caché

rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true });

const options = {
  compact: true,
  target: 'browser',
  renameGlobals: false,          // imprescindible: app.js usa funciones de otros ficheros
  identifierNamesGenerator: 'hexadecimal',
  stringArray: true,
  stringArrayThreshold: 0.5,
  stringArrayEncoding: [],          // sin codificación extra: ofusca igual y pesa menos
  splitStrings: false,
  controlFlowFlattening: false,  // desactivado: penaliza mucho el rendimiento en móviles
  deadCodeInjection: false,
  selfDefending: false,
  sourceMap: false,
};

let n = 0, before = 0, after = 0;
for (const f of readdirSync(OUT)) {
  const p = join(OUT, f);
  if (!f.endsWith('.js') || SKIP.has(f) || statSync(p).isDirectory()) continue;
  const code = readFileSync(p, 'utf8');
  const out = JavaScriptObfuscator.obfuscate(code, options).getObfuscatedCode();
  writeFileSync(p, out);
  n++; before += code.length; after += out.length;
}
// CSS minificado (compatible con navegadores de los últimos años)
let cssBefore = 0, cssAfter = 0;
for (const f of readdirSync(OUT)) {
  if (!f.endsWith('.css')) continue;
  const p = join(OUT, f);
  const code = readFileSync(p);
  const { code: min } = transformCss({ filename: f, code, minify: true, targets: { chrome: 100 << 16, safari: (15 << 16), firefox: 100 << 16 } });
  writeFileSync(p, min);
  cssBefore += code.length; cssAfter += min.length;
}
console.log(`CSS minificado: ${Math.round(cssBefore / 1024)} KB -> ${Math.round(cssAfter / 1024)} KB`);
console.log(`dist/ listo: ${n} ficheros JS ofuscados (${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB)`);
