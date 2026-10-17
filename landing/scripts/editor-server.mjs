// Servidor local para ordenar el mosaico con drag & drop. Sin dependencias.
// Uso: node landing/scripts/editor-server.mjs  ->  http://localhost:5174/__editor/
import http from 'node:http';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDir, '..');
const editorDir = path.join(scriptsDir, 'editor');
const orderFile = path.join(root, 'content', 'order.json');
const PORT = Number(process.env.PORT) || 5174;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.avif': 'image/avif', '.mp4': 'video/mp4',
};

const rebuild = () => new Promise((resolve, reject) =>
  execFile(process.execPath, [path.join(scriptsDir, 'build-feed.mjs')], (err, out) => (err ? reject(err) : resolve(out))));

const readBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', (c) => { data += c; if (data.length > 5e6) req.destroy(); });
  req.on('end', () => resolve(data));
  req.on('error', reject);
});

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

const server = http.createServer(async (req, res) => {
  try {
    // Solo acepta pedidos dirigidos a localhost (evita DNS rebinding)
    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host ?? '')) return send(res, 403, { error: 'host' });
    const { pathname } = new URL(req.url, 'http://localhost');

    if (pathname === '/api/order' && req.method === 'POST') {
      const { order } = JSON.parse(await readBody(req));
      if (!Array.isArray(order) || !order.every((x) => typeof x === 'string')) return send(res, 400, { error: 'order inválido' });
      await writeFile(orderFile, JSON.stringify(order, null, 2) + '\n');
      return send(res, 200, { ok: true, build: (await rebuild()).trim() });
    }
    if (pathname === '/api/order' && req.method === 'DELETE') {
      await unlink(orderFile).catch(() => {});
      return send(res, 200, { ok: true, build: (await rebuild()).trim() });
    }
    if (req.method !== 'GET') return send(res, 405, { error: 'method' });

    let file;
    if (pathname === '/') {
      res.writeHead(302, { Location: '/__editor/' });
      return res.end();
    }
    if (pathname.startsWith('/__editor/')) {
      file = path.join(editorDir, pathname.slice('/__editor/'.length) || 'index.html');
      if (file.endsWith(path.sep)) file += 'index.html';
    } else {
      file = path.join(root, decodeURIComponent(pathname));
    }
    const base = pathname.startsWith('/__editor/') ? editorDir : root;
    if (!path.resolve(file).startsWith(base + path.sep)) return send(res, 403, { error: 'path' });
    const data = await readFile(file);
    send(res, 200, data, TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream');
  } catch (err) {
    send(res, err.code === 'ENOENT' || err.code === 'EISDIR' ? 404 : 500, { error: String(err.message) });
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`Editor de orden: http://localhost:${PORT}/__editor/`));
