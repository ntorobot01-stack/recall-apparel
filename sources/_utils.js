// Helpers compartidos para los scrapers de Recall Apparel.
// Lee y reescribe public/data/products.json haciendo merge por id.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const PRODUCTS_PATH = resolve(__dirname, '..', 'public', 'data', 'products.json')

export async function readProducts() {
  const raw = await readFile(PRODUCTS_PATH, 'utf8')
  return JSON.parse(raw)
}

export async function writeProducts(products) {
  const json = JSON.stringify(products, null, 2) + '\n'
  await writeFile(PRODUCTS_PATH, json, 'utf8')
}

// Merge: nuevos sobreescriben existentes por id, los demás se conservan.
export function mergeById(existing, incoming) {
  const map = new Map(existing.map((p) => [p.id, p]))
  let added = 0
  let updated = 0
  for (const p of incoming) {
    if (map.has(p.id)) updated++
    else added++
    map.set(p.id, p)
  }
  return { merged: [...map.values()], added, updated }
}

// Convierte "$ 1,899.00 MXN" / "1.899,00" / "1899" → 1899 (entero).
export function parseMxnPrice(raw) {
  if (raw == null) return null
  const cleaned = String(raw).replace(/[^\d.,]/g, '')
  if (!cleaned) return null
  // Si tiene coma y punto, asumimos coma=miles, punto=decimal (formato US/MX típico de Shopify).
  // Si sólo tiene coma, asumimos coma=decimal (formato europeo).
  let normalized
  if (cleaned.includes(',') && cleaned.includes('.')) {
    normalized = cleaned.replace(/,/g, '')
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
    normalized = cleaned.replace(',', '.')
  } else {
    normalized = cleaned
  }
  const n = Number(normalized)
  if (!Number.isFinite(n)) return null
  return Math.round(n)
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}

// Extrae categoría a partir del nombre/handle. Heurística mínima.
export function inferCategory(name) {
  const s = String(name).toLowerCase()
  if (/(slide|sandal)/.test(s)) return 'Slides'
  if (/(hood|tee|t-shirt|shirt|jacket|pant|short|crew|sweat)/.test(s)) return 'Apparel'
  if (/(cap|hat|beanie|bag|sock)/.test(s)) return 'Accessories'
  return 'Sneakers'
}
