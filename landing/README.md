# Landing page personal

Portfolio personal de martinpilu.github.io: una página de scroll vertical con tres secciones.

1. **Portada** (`#portada`): foto, nombre e introducción corta.
2. **Feed** (`#feed`): mosaico de imágenes (filas justificadas, estilo Google Photos) generado desde carpetas. Cada tile abre un visor con el carrete, descripción y tags.
3. **Recursos y contacto** (`#contacto`): bio corta y links.

Los textos de portada, bio y links están en [`index.html`](./index.html). La foto va en `assets/img/` (hoy hay un placeholder `avatar.svg`).

## Estructura

```
landing/
├── index.html
├── feed.json                 # GENERADO, se commitea (lo lee la web)
├── scripts/build-feed.mjs    # genera feed.json
├── scripts/editor-server.mjs # editor local de orden (drag & drop)
├── content/order.json        # orden manual (generado por el editor, opcional)
├── content/posts/<slug>/     # un post por carpeta
│   ├── post.json
│   └── 1.jpg, 2.jpg, ...     # imagen o carrete
└── assets/                   # css, js, img
```

## Agregar, editar o quitar un post

1. Crear `content/posts/<slug>/` (el slug es el id; las carpetas que empiezan con `_` se ignoran).
2. Poner las imágenes. Un solo archivo = imagen; varios = carrete, en orden alfabético (`1.jpg`, `2.jpg`...).
3. Crear `post.json`:

   ```json
   {
     "title": "Nombre del trabajo",
     "date": "2026-10-01",
     "description": "Descripción corta.",
     "tags": ["diseño", "web"],
     "link": "https://opcional.com",
     "alt": "Texto alternativo opcional",
      "cover": "portada.jpg",
      "overlay": { "text": "Destacado", "position": "top-left", "style": "tag" },
      "media": ["portada.jpg", "detalle.jpg"],
      "draft": false
   }
   ```

   Todos los campos son opcionales salvo `title`.
   - `cover`: imagen que se ve en el mosaico (por defecto, la primera). Su proporción define el tamaño de la tile.
   - `media`: orden explícito de las imágenes del carrete del visor; si falta se usan todas las de la carpeta.
   - `overlay`: texto sobre la tile. Puede ser un string (`"overlay": "Nuevo"`) u objeto. `position`: `top-left` (default), `top-right`, `bottom-left`, `bottom-right`. `style`: `tag` (pastilla oscura, default) o `text` (texto suelto con sombra). Sin `overlay`, la tile queda limpia. Los posts con varias imágenes muestran además un ícono ⧉ abajo a la derecha.
   - `draft: true` oculta el post. `link` convierte el título del visor en enlace.
4. Regenerar el feed: `node landing/scripts/build-feed.mjs` (desde la raíz del repo).
5. Commitear la carpeta y `feed.json`.

Para quitar un post, borrar su carpeta (o poner `draft: true`) y regenerar. El feed se ordena por `date`, del más nuevo al más viejo.

### Modo galería

Una carpeta en `content/posts/` **sin** `post.json` se trata como galería: cada imagen se vuelve su propia tile (sin título ni tags; el visor solo muestra la foto). Sirve para volcar muchas fotos de golpe. Si querés que una foto tenga texto, tags u overlay, sacala de la galería y hacele su propia carpeta con `post.json`.

La fecha de cada foto sale del EXIF (`DateTimeOriginal`, solo JPEG) o, si no tiene, de una fecha en el nombre del archivo (`IMG_20150508_...`). Las tiles de la galería se mezclan con el resto de los posts, ordenadas de más reciente a más vieja; las fotos sin fecha van al final y el script las lista como advertencia. Para ubicar una foto sin fecha, renombrala con la fecha (`2019-05-13_nombre.jpg`) o dale su propio `post.json` con `date`. Los `.heic` no se muestran (los navegadores no los soportan): convertirlos a JPG.

### Ordenar el mosaico a mano (drag & drop)

```
node landing/scripts/editor-server.mjs
```

Abre un servidor local (solo `127.0.0.1`, sin dependencias) en <http://localhost:5174/__editor/>. Ahí se ve el mosaico con cada tile numerada: arrastrá para reordenar y tocá **Guardar orden**. Eso escribe `content/order.json` (lista de ids) y regenera `feed.json` en el momento; después commiteá ambos. **Volver al orden por fecha** borra `order.json`.

- El script de build respeta `order.json`. Lo que no figura ahí (fotos o posts nuevos) aparece **arriba**, más reciente primero, hasta que lo acomodes y guardes de nuevo.
- Los ids son la carpeta del post (`mi-post`) o `galeria/archivo.jpg`. Si renombrás o borrás un archivo, su entrada en `order.json` se ignora sola.
- El editor es solo para uso local: en GitHub Pages la carpeta `scripts/` es inerte porque no hay servidor.

## Publicación (GitHub Pages)

El workflow [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) publica solo `landing/` en cada push a `main` (sin `scripts/` ni `content/_originales/`). Requiere una vez: Settings → Pages → Source: **GitHub Actions**. Antes de pushear, correr `node landing/scripts/build-feed.mjs` (o guardar desde el editor) y commitear `feed.json` y `feed.js`.

## Probar en local

`fetch` no funciona con `file://`, hay que servir la carpeta:

```
node landing/scripts/build-feed.mjs
npx serve landing        # o: python -m http.server -d landing
```

## Decisiones

- El manifiesto es JSON y no XML porque el navegador lo consume directamente sin parser extra.
- `feed.json` se commitea para que GitHub Pages funcione sin build. Si más adelante se agrega un GitHub Action, puede generarse en CI (ver [`docs/architecture.md`](../docs/architecture.md)).
- Los proyectos de `../projects/` quedan on hold y ya no se enlazan desde la landing.
