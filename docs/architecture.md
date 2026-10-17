# Arquitectura del repositorio

Este repositorio (`martinpilu.github.io`) aloja la landing page personal y las landing pages de los proyectos individuales, publicados vía GitHub Pages.

## Estructura de carpetas

```
/
├── docs/                     # Documentación general del repositorio
├── landing/                  # Landing page principal (personal)
│   ├── index.html
│   └── assets/
├── projects/                 # Proyectos individuales, cada uno con su propia landing
│   ├── SACP/
│   │   ├── README.md
│   │   └── landing/
│   │       ├── index.html
│   │       └── assets/
│   └── Radio_Jurney/
│       ├── README.md
│       └── landing/
│           ├── index.html
│           └── assets/
└── README.md                 # Punto de entrada / índice del repositorio
```

## Landing personal: feed modular

El feed de la landing se arma desde carpetas: `landing/content/posts/<slug>/` (imágenes + `post.json`). El script `landing/scripts/build-feed.mjs` las recorre y genera `landing/feed.json`, que el navegador carga para renderizar los posts. `feed.json` se commitea, así Pages no necesita build. Detalle en [`landing/README.md`](../landing/README.md).

## Convenciones

- Cada proyecto vive en `projects/<NombreProyecto>/` y es autocontenido (su propia landing, assets y documentación).
- Los assets de cada landing (CSS, JS, imágenes) se guardan en `assets/` dentro de la carpeta de esa landing, evitando dependencias cruzadas entre proyectos.
- Nuevos proyectos futuros se agregan como una nueva carpeta bajo `projects/`, siguiendo la misma estructura interna (`README.md` + `landing/`).

## Estrategia de despliegue (pendiente de definir)

GitHub Pages para un repositorio `<usuario>.github.io` publica por defecto el contenido de la raíz (o de `/docs` si se configura así en Settings > Pages). Como el código fuente de cada landing vive en subcarpetas (`landing/`, `projects/*/landing/`), hay dos opciones a decidir más adelante:

1. **Sin build**: mover/copiar manualmente el contenido de `landing/` a la raíz del repo (o configurar Pages para servir desde una rama/carpeta específica), y exponer cada proyecto en una subruta como `/projects/SACP/landing/`.
2. **Con build** (recomendado a futuro): usar un GitHub Action que compile/copie cada `landing/` a una carpeta de salida (`dist/` o raíz) en la rama de publicación.

Por ahora, la estructura se mantiene como fuente organizada; la decisión de despliegue se documentará aquí cuando se defina.
