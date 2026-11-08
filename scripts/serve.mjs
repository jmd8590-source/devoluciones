// Servidor estático mínimo para pruebas locales (aplica también _headers básicos)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
const [root = 'public', port = '8787'] = process.argv.slice(2);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.xml': 'application/xml' };
createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(root, path));
    if (!file.startsWith(normalize(root))) { res.writeHead(403); return res.end(); }
    let body;
    try { if ((await stat(file)).isFile()) body = await readFile(file); } catch {}
    if (!body) { res.writeHead(404, { 'Content-Type': TYPES['.html'] }); return res.end(await readFile(join(root, '404.html'))); }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
}).listen(Number(port), () => console.log(`Sirviendo ${root}/ en http://localhost:${port}`));
