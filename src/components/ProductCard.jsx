import { fmt, discount } from '../lib/format.js'
import { ORIGIN_FLAGS } from '../lib/geo.js'

export default function ProductCard({ product, onSelect, t }) {
  const off = discount(product)
  const flag = ORIGIN_FLAGS[product.geo_tag] || ORIGIN_FLAGS.GLOBAL

  return (
    <article className="card group">
      <button
        onClick={() => onSelect(product)}
        className="card-img-wrap card-img-bg relative w-full aspect-[4/5] overflow-hidden block"
        aria-label={`${product.brand} ${product.name}`}
      >
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {off > 0 && (
          <div className="absolute top-4 left-4 bg-black text-white px-3 py-1.5 text-[12px] font-bold tracking-wider">
            −{off}%
          </div>
        )}
      </button>

      <div className="pt-5 px-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
            {product.brand}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--muted)] flex items-center gap-1.5">
            <span aria-hidden="true">{flag}</span>
            <span>{product.store}</span>
          </span>
        </div>

        <h3 className="text-[15px] font-medium leading-snug mb-3">{product.name}</h3>

        <div className="flex items-baseline gap-3 mb-5">
          <span className="text-[18px] font-semibold">
            {fmt(product.price, product.currency)}
          </span>
          <span className="text-[13px] line-through text-[var(--muted)]">
            {fmt(product.originalPrice, product.currency)}
          </span>
        </div>

        <button
          onClick={() => onSelect(product)}
          className="btn-primary w-full py-3.5 text-[12px] font-semibold uppercase"
        >
          {t('go_to')} {product.brand}
          <span className="ml-2 inline-block translate-y-[1px]">→</span>
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] text-[var(--muted)]">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{t('trust_badge')}</span>
        </div>
      </div>
    </article>
  )
}
