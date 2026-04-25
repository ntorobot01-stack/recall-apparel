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

// Mapea el nombre del producto a la taxonomía de categorías de Recall Apparel.
// Devuelve uno de: Footwear | Tops | Bottoms | Sets | Outerwear | Accessories | Bags | Jewelry.
// Default: Footwear (la categoría más común en streetwear; los scrapers/sources
// pueden sobreescribir explícitamente si la fuente expone su propia taxonomía).
export function inferCategory(name) {
  const s = String(name).toLowerCase()
  if (/(bag|backpack|tote|duffel|crossbody|fanny|pouch)/.test(s)) return 'Bags'
  if (/(necklace|chain|ring|bracelet|earring|pendant|jewel)/.test(s)) return 'Jewelry'
  if (/(jacket|coat|parka|puffer|bomber|windbreaker|anorak|vest)/.test(s)) return 'Outerwear'
  if (/(set|tracksuit|two-piece|2-piece|matching set)/.test(s)) return 'Sets'
  if (/(pant|trouser|jean|short|cargo|sweatpant|jogger|skirt)/.test(s)) return 'Bottoms'
  if (/(hood|tee|t-shirt|shirt|crew|sweater|sweatshirt|polo|tank|jersey|long sleeve)/.test(s)) return 'Tops'
  if (/(cap|hat|beanie|sock|belt|scarf|glove|sunglass|wallet)/.test(s)) return 'Accessories'
  if (/(slide|sandal|sneaker|boot|shoe|trainer|runner|loafer)/.test(s)) return 'Footwear'
  return 'Footwear'
}

// Mapea el nombre del producto a género. Default: Unisex (la mayoría del
// streetwear se vende sin segmentación explícita). Sólo escala a M/W/Kids
// cuando hay indicadores claros en el nombre.
export function inferGender(name) {
  const s = String(name).toLowerCase()
  if (/\b(kids?|youth|toddler|infant|baby|junior|gs|ps|td)\b/.test(s)) return 'Kids'
  if (/\b(women|woman|wmns|w'?s|female|ladies)\b/.test(s)) return 'Women'
  if (/\b(men|man|mens|m'?s|male)\b/.test(s)) return 'Men'
  return 'Unisex'
}
