# Recall Apparel — MVP

Agregador de ofertas de streetwear premium · Modelo de afiliación pura.

## Setup local (una sola vez)

### 1. Instala Node.js

Si no lo tienes, descárgalo desde https://nodejs.org (versión LTS). Hace `next > next > next` y listo.

Para verificar que quedó instalado, abre una terminal y corre:

```bash
node --version
npm --version
```

Ambos deben imprimir un número de versión.

### 2. Instala las dependencias del proyecto

Abre una terminal en la carpeta del proyecto (`recall-apparel/`) y corre:

```bash
npm install
```

Esto descarga React, Vite, Tailwind y demás herramientas. Tarda ~30 segundos. Sólo se hace una vez.

## Día a día

### Ver el sitio en local

```bash
npm run dev
```

Abre el navegador en `http://localhost:5173`. Cualquier cambio que hagas a un archivo se refleja en pantalla en menos de un segundo (hot reload).

### Construir para producción

```bash
npm run build
```

Esto genera la carpeta `dist/` con todo el sitio optimizado, listo para Vercel.

## Deploy a Vercel

### Opción A — Conectar a GitHub (recomendado)

1. Crea un repo en GitHub y sube el proyecto (`git init && git add . && git commit -m "init" && git remote add origin <url> && git push -u origin main`).
2. En vercel.com, "Add New Project" → importa el repo.
3. Vercel detecta automáticamente que es Vite. No necesitas configurar nada.
4. Cada `git push` despliega una nueva versión en segundos.

### Opción B — Drag & drop

1. Corre `npm run build`.
2. Arrastra la carpeta `dist/` al dashboard de Vercel.

## Estructura del proyecto

```
recall-apparel/
├── index.html              # HTML root (entry de Vite)
├── package.json            # Dependencias
├── vite.config.js          # Config de Vite
├── tailwind.config.js      # Config de Tailwind
├── postcss.config.js       # Config de PostCSS
├── src/
│   ├── main.jsx            # Bootstrap de React
│   ├── App.jsx             # Composición principal
│   ├── index.css           # Estilos globales + variables CSS
│   ├── data/
│   │   └── products.js     # Base de datos de productos (10 SKUs)
│   ├── lib/
│   │   └── format.js       # Helpers de moneda y descuento
│   └── components/
│       ├── Header.jsx      # Logo + selector de región
│       ├── Hero.jsx        # Título + texto introductorio
│       ├── Marquee.jsx     # Tira animada de tiendas
│       ├── ProductCard.jsx # Tarjeta de producto individual
│       ├── RedirectModal.jsx # Modal de transición de 1.5s
│       └── Footer.jsx
└── README.md
```

## Próximos pasos sugeridos

1. **Reemplazar imágenes de Unsplash** por las imágenes reales de cada producto (en `src/data/products.js`).
2. **Reemplazar `storeUrl`** por tus links de afiliado reales (con tu tracking ID).
3. **Migrar `products.js` a JSON** que se genere automáticamente desde scrapers en GitHub Actions.
4. **Agregar más SKUs** — la lista crece editando ese mismo archivo.
