// GarantíasPro — compilación para producción
// Copia public/ a dist/ y ofusca el JavaScript propio (no las librerías de vendor/).
// Se conservan los nombres globales porque los ficheros se comparten funciones entre sí.
import { cpSync, rmSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import JavaScriptObfuscator from 'javascript-obfuscator';

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
  stringArrayThreshold: 0.6,
  stringArrayEncoding: ['base64'],
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
console.log(`dist/ listo: ${n} ficheros JS ofuscados (${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB)`);
