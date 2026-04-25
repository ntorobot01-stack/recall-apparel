import { useState, useMemo, useEffect, useCallback } from 'react'
import { PRODUCTS } from './data/products.js'
import { detectUserRegion } from './lib/geo.js'
import { detectInitialLanguage, makeT } from './lib/i18n.js'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import ProductCard from './components/ProductCard.jsx'
import RedirectModal from './components/RedirectModal.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  // Filtro de origen: 'ALL' | 'MX' | 'CO' | 'GLOBAL'
  // Default: 'ALL' — el usuario ve todo el catálogo. El orden es local-first
  // según su país detectado (eso lo manejamos por separado abajo).
  const [originFilter, setOriginFilter] = useState('ALL')
  const [userCountry, setUserCountry] = useState('GLOBAL')
  const [autoDetected, setAutoDetected] = useState(false)
  const [lang, setLang] = useState(() => detectInitialLanguage())
  const [selected, setSelected] = useState(null)

  // Detectar país al cargar (afecta el ORDEN del catálogo, no el filtro).
  useEffect(() => {
    let cancelled = false
    detectUserRegion().then((detected) => {
      if (cancelled) return
      setUserCountry(detected)
      setAutoDetected(true)
      // Si el usuario está en MX o CO y el navegador no tenía español, priorizamos español.
      if ((detected === 'MX' || detected === 'CO') && lang !== 'es') {
        setLang('es')
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const t = useMemo(() => makeT(lang), [lang])

  // Productos visibles según el filtro de origen.
  // Cuando el filtro es 'ALL', se muestran todos pero ordenados local-first
  // según el país detectado del usuario.
  const visibleProducts = useMemo(() => {
    if (originFilter === 'ALL') {
      // Local-first ordering
      if (userCountry === 'GLOBAL') {
        // Para usuarios fuera de LATAM: globales primero, luego locales
        const globals = PRODUCTS.filter((p) => p.geo_tag === 'GLOBAL')
        const rest = PRODUCTS.filter((p) => p.geo_tag !== 'GLOBAL')
        return [...globals, ...rest]
      }
      const local = PRODUCTS.filter((p) => p.geo_tag === userCountry)
      const globals = PRODUCTS.filter((p) => p.geo_tag === 'GLOBAL')
      const otherLocal = PRODUCTS.filter(
        (p) => p.geo_tag !== userCountry && p.geo_tag !== 'GLOBAL'
      )
      return [...local, ...globals, ...otherLocal]
    }
    // Filtro específico: solo productos de ese origen
    return PRODUCTS.filter((p) => p.geo_tag === originFilter)
  }, [originFilter, userCountry])

  const onSelect = useCallback((product) => setSelected(product), [])
  const onClose = useCallback(() => setSelected(null), [])

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [selected])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        originFilter={originFilter}
        setOriginFilter={setOriginFilter}
        totalDeals={visibleProducts.length}
        autoDetected={autoDetected}
        lang={lang}
        setLang={setLang}
        t={t}
      />
      <Hero t={t} />
      <Marquee />

      <main className="max-w-[1400px] mx-auto w-full px-6 mt-12">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-[20px] font-medium tracking-tight">
            {t('catalog_title')}
            <span className="ml-3 text-[12px] font-mono text-[var(--muted)] uppercase tracking-[0.18em]">
              ({t('catalog_meta', visibleProducts.length)})
            </span>
          </h2>
          {originFilter === 'ALL' && (
            <span className="hidden md:block text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
              {t('catalog_order_note')}
            </span>
          )}
        </div>

        {visibleProducts.length === 0 ? (
          <div className="py-20 text-center text-[14px] text-[var(--muted)]">
            {t('catalog_empty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelect} t={t} />
            ))}
          </div>
        )}
      </main>

      <Footer t={t} />
      <RedirectModal product={selected} onClose={onClose} t={t} />
    </div>
  )
}
