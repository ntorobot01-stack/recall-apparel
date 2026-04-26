import { useRef } from 'react'
import ProductCard from './ProductCard.jsx'

// "Acaba de bajar de precio" — carrusel horizontal con los drops más recientes.
// Sin campo de fecha en el schema, usa el orden del array como proxy de recencia
// (los más nuevos van al inicio del feed). Slice de 8 elementos.
const SHOWCASE_LIMIT = 8

export default function JustDroppedSection({ products, onSelect, t }) {
  const scrollerRef = useRef(null)

  const items = products.slice(0, SHOWCASE_LIMIT)
  if (items.length === 0) return null

  function scrollBy(dir) {
    const el = scrollerRef.current
    if (!el) return
    const delta = el.clientWidth * 0.85 * dir
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="max-w-[1400px] mx-auto w-full px-6 mt-20 md:mt-24">
      <div className="flex items-end justify-between gap-6 mb-6">
        <div>
          <h2 className="text-[22px] md:text-[26px] font-medium tracking-tight">
            {t('section_just_dropped_title')}
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            {t('section_just_dropped_subtitle')}
          </p>
        </div>

        {/* Flechas de navegación — sólo desktop, no interfieren con touch en mobile */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={() => scrollBy(-1)}
            className="w-10 h-10 flex items-center justify-center border border-[var(--line)] rounded-full hover:bg-[#FAFAFA] transition-colors"
            aria-label={t('carousel_prev')}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="w-10 h-10 flex items-center justify-center border border-[var(--line)] rounded-full hover:bg-[#FAFAFA] transition-colors"
            aria-label={t('carousel_next')}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-thin"
        style={{ scrollPaddingInline: '1.5rem' }}
      >
        {items.map((p) => (
          <div key={p.id} className="shrink-0 w-[260px] sm:w-[280px] md:w-[300px] snap-start">
            <ProductCard product={p} onSelect={onSelect} t={t} />
          </div>
        ))}
      </div>
    </section>
  )
}
