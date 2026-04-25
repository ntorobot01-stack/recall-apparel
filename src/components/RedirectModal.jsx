import { useEffect } from 'react'

// Convierte un texto con marcadores **palabra** en JSX con énfasis en negrita.
function renderEmphasis(text) {
  if (typeof text !== 'string') return text
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-black font-medium">
        {part}
      </span>
    ) : (
      part
    )
  )
}

export default function RedirectModal({ product, onClose, t }) {
  useEffect(() => {
    if (!product) return
    const timer = setTimeout(() => {
      try {
        window.open(product.storeUrl, '_blank', 'noopener,noreferrer')
      } catch {
        /* ignore */
      }
      onClose()
    }, 1500)
    return () => clearTimeout(timer)
  }, [product, onClose])

  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="modal-backdrop absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div
        className="modal-card relative bg-white w-full max-w-md p-8 elev-soft"
        role="dialog"
        aria-modal="true"
      >
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] mb-5">
          {t('secure_redirect')}
        </div>

        <h2 className="text-[22px] font-light leading-tight mb-1">{t('we_take_you_to')}</h2>
        <h3 className="text-[28px] font-bold leading-tight mb-6">{product.store}</h3>

        <p className="text-[13.5px] text-[var(--muted)] leading-relaxed mb-6">
          {renderEmphasis(t('leaving_message', product.store, product.brand))}
        </p>

        <div className="h-[2px] w-full bg-[var(--line)] overflow-hidden">
          <div className="bar-fill h-full bg-black"></div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
          <span>{product.brand}</span>
          <span>{t('verifying_link')}</span>
        </div>
      </div>
    </div>
  )
}
