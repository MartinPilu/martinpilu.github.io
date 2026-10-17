// Renderiza el mosaico a partir de feed.json (generado por scripts/build-feed.mjs)

const feedEl = document.getElementById('feed');
const viewer = document.getElementById('viewer');
const viewerBody = viewer.querySelector('.viewer__body');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderTile(post) {
  const tile = el('button', 'tile');
  tile.type = 'button';
  tile.setAttribute('aria-label', post.title);

  const img = el('img');
  img.src = post.cover;
  img.alt = post.media[0]?.alt ?? post.title;
  img.loading = 'lazy';
  // El ancho/alto de cada tile sigue la proporción real de la imagen (filas justificadas)
  const setRatio = () => {
    const ratio = img.naturalWidth / img.naturalHeight || 1;
    tile.style.setProperty('--ratio', ratio);
  };
  img.addEventListener('load', setRatio);
  if (img.complete) setRatio();
  tile.append(img);

  if (post.media.length > 1) tile.append(el('span', 'tile__multi', '⧉'));
  if (post.overlay) {
    tile.append(el('span', `tile__overlay tile__overlay--${post.overlay.position} tile__overlay--${post.overlay.style}`, post.overlay.text));
  }

  tile.addEventListener('click', () => openViewer(post));
  return tile;
}

function openViewer(post) {
  viewerBody.replaceChildren();

  const media = el('div', 'viewer__media');
  for (const m of post.media) {
    const img = el('img');
    img.src = m.src;
    img.alt = m.alt;
    media.append(img);
  }
  viewerBody.append(media);

  const info = el('div', 'viewer__info');
  const title = el('h2', null);
  if (post.link) {
    const a = el('a', null, post.title);
    a.href = post.link;
    title.append(a);
  } else {
    title.textContent = post.title;
  }
  info.append(title, el('p', null, post.description));
  if (post.tags.length) {
    const tags = el('ul', 'tags');
    post.tags.forEach((t) => tags.append(el('li', null, `#${t}`)));
    info.append(tags);
  }
  if (post.date) info.append(el('time', 'viewer__date', post.date));
  viewerBody.append(info);

  viewer.showModal();
}

viewer.querySelector('.viewer__close').addEventListener('click', () => viewer.close());
// Click fuera del contenido cierra el visor
viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });

async function loadFeed() {
  try {
    let data = window.__FEED__;
    if (!data) {
      const res = await fetch('feed.json');
      if (!res.ok) throw new Error(res.status);
      data = await res.json();
    }
    const { posts } = data;
    feedEl.replaceChildren(...(posts.length ? posts.map(renderTile) : [el('p', 'feed__status', 'Próximamente.')]));
    if (posts.length) feedEl.append(el('span', 'feed__filler'));
  } catch (err) {
    feedEl.replaceChildren(el('p', 'feed__status', 'No se pudo cargar el feed.'));
    console.error(err);
  }
}

loadFeed();
