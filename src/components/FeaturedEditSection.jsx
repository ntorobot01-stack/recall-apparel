import { useMemo } from 'react'
import ProductCard from './ProductCard.jsx'
import { discount } from '../lib/format.js'

// ─────────────────────────────────────────────────────────────────────
// "Edición del momento" — selección automática editorial híbrida
// ─────────────────────────────────────────────────────────────────────
//
// Algoritmo greedy determinístico que combina 4 criterios ponderados
// para garantizar piezas con descuento fuerte + diversidad de catálogo,
// sin intervención manual y reproducible para el mismo input.
//
//   score(p) = 0.40·discountNorm
//            + 0.30·categoryDiversity
//            + 0.20·storeDiversity
//            + 0.10·recencyNorm
//
//   discountNorm(p) = discount(p) / maxDiscountInCatalog        ∈ [0, 1]
//   recencyNorm(p)  = (N - originalIndex) / N                   ∈ (0, 1]
//   categoryDiversity = 1.0 si la categoría no se eligió aún, sino 0.2
//   storeDiversity    = 1.0 si la tienda no se eligió aún, sino 0.3
//
// La diversidad se recalcula entre iteraciones: cada pick "marca" su
// categoría y tienda, penalizando con fuerza a candidatos repetidos en
// las próximas rondas. Esto garantiza variedad real con catálogos
// pequeños sin caer en aleatoriedad.
//
// Tiebreaker: id ascendente — estabilidad determinística absoluta.
// ─────────────────────────────────────────────────────────────────────

const PICK_COUNT = 3

const W_DISCOUNT = 0.4
const W_CATEGORY = 0.3
const W_STORE = 0.2
const W_RECENCY = 0.1

const PENALTY_CATEGORY_REPEAT = 0.2
const PENALTY_STORE_REPEAT = 0.3

function selectFeaturedEdit(products, k = PICK_COUNT) {
  if (products.length === 0) return []

  const N = products.length
  const maxDiscount = Math.max(...products.map((p) => discount(p)), 1)

  // Snapshot inmutable con normalizaciones precalculadas + posición original.
  const candidates = products.map((p, idx) => ({
    product: p,
    discountNorm: discount(p) / maxDiscount,
    recencyNorm: (N - idx) / N,
  }))

  const chosen = []
  const chosenCategories = new Set()
  const chosenStores = new Set()
  const remaining = [...candidates]

  for (let i = 0; i < k && remaining.length > 0; i++) {
    let bestIdx = -1
    let bestScore = -Infinity
    let bestId = null

    for (let j = 0; j < remaining.length; j++) {
      const c = remaining[j]
      const catDiv = chosenCategories.has(c.product.category) ? PENALTY_CATEGORY_REPEAT : 1
      const storeDiv = chosenStores.has(c.product.store) ? PENALTY_STORE_REPEAT : 1
      const score =
        W_DISCOUNT * c.discountNorm +
        W_CATEGORY * catDiv +
        W_STORE * storeDiv +
        W_RECENCY * c.recencyNorm

      // Tiebreaker estable: ante igual score, gana el id alfabéticamente menor.
      if (score > bestScore || (score === bestScore && c.product.id < bestId)) {
        bestScore = score
        bestIdx = j
        bestId = c.product.id
      }
    }

    const pick = remaining[bestIdx]
    chosen.push(pick.product)
    chosenCategories.add(pick.product.category)
    chosenStores.add(pick.product.store)
    remaining.splice(bestIdx, 1)
  }

  return chosen
}

export default function FeaturedEditSection({ products, onSelect, t }) {
  const picks = useMemo(() => selectFeaturedEdit(products), [products])
  if (picks.length === 0) return null

  return (
    <section className="max-w-[1400px] mx-auto w-full px-6 mt-20 md:mt-24">
      <div className="mb-6">
        <h2 className="text-[22px] md:text-[26px] font-medium tracking-tight">
          {t('section_featured_edit_title')}
        </h2>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          {t('section_featured_edit_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
        {picks.map((p) => (
          <ProductCard key={p.id} product={p} onSelect={onSelect} t={t} />
        ))}
      </div>
    </section>
  )
}
