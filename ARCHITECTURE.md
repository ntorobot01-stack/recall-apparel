# Recall Apparel — Architecture

Documento de arquitectura de la tubería de "verified offers".
Última actualización: 2026-04-28 (cierre Sesión 1 de 5).

---

## 1. Visión general

Recall Apparel es un agregador de afiliación de **piezas de ropa premium con descuento real verificado**. El sitio NO procesa pagos, NO mantiene inventario, NO almacena información sensible del usuario. El click final lleva al usuario directo a la tienda oficial.

El diferencial competitivo es la **garantía estructural** de que cada producto visible cumple criterios objetivos de calidad de oferta (descuento mínimo 20%, stock confirmado, link válido a tienda oficial). Esa garantía no se basa en confianza humana — está enforzada a nivel de base de datos.

---

## 2. Las 6 decisiones del Director que rigen la arquitectura

| # | Decisión | Razón |
|---|----------|-------|
| 1 | Umbral mínimo de descuento: **20%** | Filtro objetivo que separa "oferta real" de "precio de catálogo disfrazado". Enforced por `CHECK constraint` en DB — imposible insertar oferta sub-20%. |
| 2 | Frecuencia de sync: **cada 6 horas** | Balance entre frescura del catálogo y carga sobre los feeds de afiliados. Configurable vía `SYNC_FREQUENCY_HOURS`. |
| 3 | Producto que dejó de ser oferta: **eliminación inmediata + log histórico** | Cero tolerancia a productos rancios. El log queda en `offer_history` para analítica. |
| 4 | Proyecto Supabase: **`hfhljqtithkcdgkujery`** (São Paulo) | Región más cercana al tráfico LATAM target (MX/CO/resto). |
| 5 | Moneda: **multi-moneda nativo** | Cada oferta guarda su `currency` original (MXN/COP/USD/...). Sin conversiones lossy en el catálogo. |
| 6 | Notificaciones: **diferidas** | No es prioridad para el MVP de la tubería. Schema preparado para sumarlas sin migración disruptiva. |

---

## 3. Diagrama de flujo de datos

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Feeds afiliados│───▶│  Sync Worker    │───▶│   Supabase      │◀───│   Frontend      │
│  (Awin, Rakuten,│    │  (Node, every   │    │   (Postgres +   │    │   (React/Vite,  │
│   ShareASale,…) │    │   6h, server)   │    │    RLS)         │    │    anon key)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                       │
                              │                       │
                              ▼                       ▼
                       SUPABASE_SECRET_KEY    verified_offers (SELECT public)
                       (bypassa RLS,          offer_history   (zero public access)
                        escribe/borra)
```

**Reglas de flujo:**
- El frontend SÓLO lee `verified_offers` con la clave anon (publishable). No tiene credenciales de escritura.
- El sync worker es el ÚNICO componente con `service_role`. Vive en server, nunca toca el browser.
- Cada cambio (entered/exited/updated) se loguea en `offer_history` para auditoría y futuras alertas.

---

## 4. Schema de tablas

### `verified_offers` (pública)
Surface única que el frontend consume. 23 columnas + 5 indexes + trigger `updated_at` automático. Garantías a nivel DB:
- `discount_percent >= 20` (CHECK constraint).
- `gender IN ('men', 'women', 'unisex')` (CHECK constraint).
- `UNIQUE (sku, store_id)` — un producto por tienda, sin duplicados.
- Precios en `DECIMAL(10,2)` — sin errores de coma flotante.
- Arrays (imágenes, países, talles) en `JSONB` — queries eficientes con índice GIN sobre `country_availability`.

**Indexes optimizados para los accesos esperados:**
- `(store_id, in_stock)` — filtros por tienda + disponibilidad.
- `(category, gender)` — navegación del catálogo.
- GIN sobre `country_availability` — filtro por país de envío.
- `verified_at DESC` — sección "Acaba de bajar de precio".
- `discount_percent DESC` — ordenamiento por descuento.

**RLS:** SELECT público + INSERT/UPDATE/DELETE sólo `service_role`.

### `offer_history` (interna)
Log inmutable de eventos del ciclo de vida de cada oferta. 9 columnas + 3 indexes. Eventos: `entered`, `exited`, `updated`. **RLS:** cero acceso público, sólo `service_role` (FOR ALL policy).

---

## 5. Plan de las 5 sesiones

| Sesión | Objetivo | Estado |
|--------|----------|--------|
| **1** — Cimiento DB | Supabase CLI, migraciones versionadas, schema + RLS aplicado | ✅ Completada (2026-04-28) |
| **2** — Sync Worker | Node service que consume feeds de afiliados, valida, escribe a `verified_offers`, loguea en `offer_history` | Pendiente |
| **3** — Verificación humana (opcional) | Panel admin para ofertas borderline o con baja confianza algorítmica | Pendiente |
| **4** — Frontend → Supabase | Reemplazar `products.json` por queries a `verified_offers`. Mantener todo el UX existente. | Pendiente |
| **5** — Scheduling + monitoring | Cron del sync worker (cada 6h), alertas de fallos, dashboard interno | Pendiente |

---

## 6. Cómo escala el sistema

**Cuando lleguen 10+ tiendas aprobadas:**
- El schema NO cambia: `store_id` y `store_name` ya soportan N tiendas con el unique compuesto `(sku, store_id)`.
- El sync worker corre en paralelo por tienda (cada feed independiente).
- Los indexes existentes manejan miles de productos sin retunear.
- El RLS es por-fila, no por-tienda — agregar tiendas no requiere policies nuevas.

**Cuando el catálogo crezca a 10k+ productos:**
- El índice GIN sobre `country_availability` evita full-scans en queries por país.
- El `discount_percent DESC` permite top-N queries en O(log n).
- Si un día las queries del frontend se ralentizan, hay margen para materialized views por país (Sesión 4+).

### Independencia operacional

La operación recurrente del sistema es 100% autónoma y NO requiere intervención manual del operador del sitio:

- **Hosting del frontend:** Vercel (auto-deploy en push a main)
- **Base de datos:** Supabase Cloud (gestionado, sin servidores que mantener)
- **Sync worker (Sesión 2+):** correrá en Vercel Cron Jobs o GitHub Actions cada 6 horas, sin requerir PC encendida
- **Setup inicial:** requiere autenticación humana una vez (Supabase login + Vercel link), después es automático para siempre

El operador NO necesita tener instalado en su PC: Docker, PostgreSQL local, Node.js (más allá de Vite para development opcional), ni ninguna herramienta de DevOps. Toda la infraestructura corre en cloud.

---

## 7. Garantía estructural — "Por qué es imposible mostrar un producto sin oferta verificada"

El frontend NO recibe productos crudos de los feeds. Recibe únicamente filas de `verified_offers`, que pasaron 4 capas de filtrado:

1. **Capa código** (sync worker): validación de descuento, stock, link, schema.
2. **Capa DB** (CHECK constraints): `discount_percent >= 20` enforced en INSERT. Una fila sub-20% es **rechazada** por Postgres antes de existir.
3. **Capa DB** (CHECK constraints): `gender` en lista cerrada. UUID auto-generado. Tipos estrictos.
4. **Capa DB** (RLS): el frontend usa la `anon` key, que sólo puede SELECT. No tiene forma técnica de insertar/modificar nada.

Si el sync worker tuviera un bug que intentara insertar una oferta de 15% de descuento, Postgres respondería:
```
ERROR: new row for relation "verified_offers" violates check constraint
"verified_offers_discount_percent_check"
```
La oferta nunca existe en la tabla, nunca llega al frontend, nunca se muestra al usuario. **No es una promesa, es una imposibilidad estructural.**

Si en algún momento se decide bajar el umbral (e.g. a 15%), requiere una migración SQL nueva que altera el constraint. Esa migración queda versionada en `supabase/migrations/` y revisada en PR — no se cambia desde un dashboard sin trazabilidad.

---

## Apéndice — Operaciones comunes

```bash
# Ver estado de migraciones (local vs remoto)
npx supabase migration list --linked

# Crear una nueva migración (genera timestamp)
npx supabase migration new nombre_descriptivo

# Aplicar migraciones pendientes al remoto
npx supabase db push
```

Verificación de parity local↔remoto se hace con `migration list --linked` (no requiere Docker). Para usuarios que quieran experimentar con Supabase localmente, ver docs oficiales de Supabase CLI.

Variables de entorno: ver `.env.local.example`.
