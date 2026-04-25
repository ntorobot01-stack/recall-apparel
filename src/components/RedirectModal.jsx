import { useEffect } from 'react'

export default function RedirectModal({ product, onClose }) {
  useEffect(() => {
    if (!product) return
    const t = setTimeout(() => {
      try {
        window.open(product.storeUrl, '_blank', 'noopener,noreferrer')
      } catch {
        /* ignore */
      }
      onClose()
    }, 1500)
    return () => clearTimeout(t)
  }, [product, onClose])

  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="modal-backdrop absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose}></div>

      <div className="modal-card relative bg-white w-full max-w-md p-8 elev-soft" role="dialog" aria-modal="true">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] mb-5">
          Redirección segura
        </div>

        <h2 className="text-[22px] font-light leading-tight mb-1">Te llevamos a</h2>
        <h3 className="text-[28px] font-bold leading-tight mb-6">{product.store}</h3>

        <p className="text-[13.5px] text-[var(--muted)] leading-relaxed mb-6">
          Estás saliendo de Recall Apparel. Tu pago y datos serán procesados directamente por{' '}
          <span className="text-black font-medium">{product.store}</span>, la tienda oficial de{' '}
          <span className="text-black font-medium">{product.brand}</span>.
        </p>

        <div className="h-[2px] w-full bg-[var(--line)] overflow-hidden">
          <div className="bar-fill h-full bg-black"></div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
          <span>{product.brand}</span>
          <span>Verificando enlace…</span>
        </div>
      </div>
    </div>
  )
}
