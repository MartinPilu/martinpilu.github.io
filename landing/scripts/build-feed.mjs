// Genera landing/feed.json a partir de landing/content/posts/<slug>/post.json
// Uso: node landing/scripts/build-feed.mjs
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(root, 'content', 'posts');
const outFile = path.join(root, 'feed.json');
const MEDIA_EXT = /\.(jpe?g|png|webp|gif|svg|avif)$/i;

const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

// Lee DateTimeOriginal del EXIF de un JPEG. Devuelve "YYYY-MM-DDTHH:MM:SS" o null
async function exifDate(file) {
  if (!/\.jpe?g$/i.test(file)) return null;
  const buf = await readFile(file);
  if (buf.readUInt16BE(0) !== 0xffd8) return null;
  let p = 2;
  while (p + 4 < buf.length && buf[p] === 0xff) {
    const marker = buf[p + 1];
    const len = buf.readUInt16BE(p + 2);
    if (marker === 0xe1 && buf.toString('latin1', p + 4, p + 8) === 'Exif') {
      const t = p + 10; // inicio del header TIFF
      const le = buf.toString('latin1', t, t + 2) === 'II';
      const u16 = (o) => (le ? buf.readUInt16LE(t + o) : buf.readUInt16BE(t + o));
      const u32 = (o) => (le ? buf.readUInt32LE(t + o) : buf.readUInt32BE(t + o));
      const findTag = (ifd, tag) => {
        for (let i = 0, n = u16(ifd); i < n; i++) {
          const e = ifd + 2 + i * 12;
          if (u16(e) === tag) return u32(e + 8);
        }
        return null;
      };
      const exifIfd = findTag(u32(4), 0x8769);
      const off = exifIfd == null ? null : findTag(exifIfd, 0x9003);
      if (off == null) return null;
      const m = buf.toString('latin1', t + off, t + off + 19).match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
      return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}` : null;
    }
    p += 2 + len;
  }
  return null;
}

// Respaldo: fecha dentro del nombre (IMG_20150508_..., "... 2026-10-17 ...")
function filenameDate(name) {
  const m = name.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/);
  return m ? `${m[1]}-${m[2]}-${m[3]}T00:00:00` : null;
}

// Acepta "texto" o { text, position, style }
function normalizeOverlay(o) {
  if (!o) return null;
  const { text, position = 'top-left', style = 'tag' } = typeof o === 'string' ? { text: o } : o;
  if (!text) return null;
  return { text, position: POSITIONS.includes(position) ? position : 'top-left', style };
}

const posts = [];
const orderFile = path.join(root, 'content', 'order.json');
const order = existsSync(orderFile) ? JSON.parse(await readFile(orderFile, 'utf8')) : [];
const rank = new Map(order.map((id, i) => [id, i]));
for (const slug of (await readdir(postsDir)).sort()) {
  const dir = path.join(postsDir, slug);
  if (!(await stat(dir)).isDirectory() || slug.startsWith('_')) continue;

  const metaPath = path.join(dir, 'post.json');
  if (!existsSync(metaPath)) {
    // Modo galería: sin post.json, cada imagen es su propia tile
    const imgs = (await readdir(dir)).filter((f) => MEDIA_EXT.test(f)).sort();
    if (!imgs.length) console.warn(`! ${slug}: sin post.json ni imágenes, se omite`);
    for (const f of imgs) {
      const src = `content/posts/${slug}/${f}`;
      const ts = (await exifDate(path.join(dir, f))) ?? filenameDate(f);
      if (!ts) console.warn(`! ${slug}/${f}: sin fecha (va al final)`);
      posts.push({
        id: `${slug}/${f}`, title: '', date: ts ? ts.slice(0, 10) : '', ts: ts ?? '', description: '', tags: [], link: null,
        cover: src, overlay: null, media: [{ src, alt: `Foto ${f}` }],
      });
    }
    continue;
  }
  const meta = JSON.parse(await readFile(metaPath, 'utf8'));
  if (meta.draft) continue;

  // Si no hay "media" explícito, se toman las imágenes de la carpeta en orden alfabético
  const files = meta.media ?? (await readdir(dir)).filter((f) => MEDIA_EXT.test(f)).sort();
  if (!files.length) console.warn(`! ${slug}: sin imágenes`);

  posts.push({
    id: slug,
    title: meta.title ?? slug,
    date: meta.date ?? '',
    ts: meta.date ?? '',
    description: meta.description ?? '',
    tags: meta.tags ?? [],
    link: meta.link ?? null,
    cover: `content/posts/${slug}/${meta.cover ?? files[0] ?? ''}`,
    overlay: normalizeOverlay(meta.overlay),
    media: files.map((f) => ({
      src: `content/posts/${slug}/${f}`,
      alt: meta.alt ?? meta.title ?? slug,
    })),
  });
}

// Orden manual (content/order.json) primero; lo que no figura ahí (contenido nuevo) va arriba, más reciente primero
posts.sort((a, b) => {
  const ra = rank.get(a.id);
  const rb = rank.get(b.id);
  if (ra !== undefined && rb !== undefined) return ra - rb;
  if (ra !== undefined) return 1;
  if (rb !== undefined) return -1;
  return b.ts.localeCompare(a.ts);
});
for (const p of posts) delete p.ts;
await writeFile(outFile, JSON.stringify({ posts }, null, 2) + '\n');
// Copia como script: permite abrir index.html con doble clic (file://), donde fetch está bloqueado
await writeFile(path.join(root, 'feed.js'), `window.__FEED__ = ${JSON.stringify({ posts })};\n`);
console.log(`feed.json: ${posts.length} post(s)`);
