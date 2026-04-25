# Sources

Una "fuente" es cualquier origen de productos que termina mergeado en `public/data/products.json`. Puede ser:

- una **API de red de afiliados** (Awin, CJ, Rakuten, Impact) — caso primario,
- un **feed** XML/CSV de un partner directo,
- un **scraper** de un sitio donde no haya API pero sí acuerdo de afiliación,
- una **lista curada** mantenida a mano.

El esquema de salida es siempre el mismo: cada item se mergea por `id` en `products.json` (existentes se sobreescriben, nuevos se agregan).

## Cómo correr local

```bash
npm run sources:run
```

Hoy es un placeholder. La primera fuente real será Awin (esta semana).

## Esquema de producto

```json
{
  "id": "<source-prefix>-<slug>",
  "brand": "Nike",
  "name": "Air Force 1 '07",
  "category": "Sneakers",
  "image": "https://…",
  "price": 1899,
  "originalPrice": 2599,
  "currency": "MXN",
  "store": "Lust México",
  "storeUrl": "https://… (con tracking de afiliado)",
  "geo_tag": "MX"
}
```

- **id**: `awin-...`, `cj-...`, etc. — prefijo que identifica la fuente.
- **storeUrl**: SIEMPRE el deeplink afiliado, no la URL pelona del producto.
- **currency**: ISO (`MXN`, `COP`, `USD`).
- **geo_tag**: `MX`, `CO` o `GLOBAL`.

## Agregar una fuente nueva

1. Crea `sources/<nombre>.js` que sea ejecutable directamente (`node sources/<nombre>.js`).
2. Reusa los helpers de `_utils.js` (`readProducts`, `writeProducts`, `mergeById`, `slugify`, `inferCategory`).
3. Si la fuente devuelve 0 productos, sal con `process.exit(2)` para que el workflow aborte sin commitear.
4. Agrega su invocación al script `sources:run` en `package.json`.

## CI

`.github/workflows/sources.yml` corre cada 6 horas y bajo demanda. Si la corrida produce cambios en `products.json`, hace commit y push a `main`. Vercel deploya automáticamente.
