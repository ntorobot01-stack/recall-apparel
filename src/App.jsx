import { useState, useMemo, useEffect, useCallback } from 'react'
import { detectUserRegion } from './lib/geo.js'
import { detectInitialLanguage, makeT } from './lib/i18n.js'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import ProductCard from './components/ProductCard.jsx'
import RedirectModal from './components/RedirectModal.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  // Filtros del catálogo: 'ALL' es siempre el default (no filtra).
  // - originFilter: 'ALL' | 'MX' | 'CO' | 'GLOBAL'
  // - genderFilter: 'ALL' | 'Men' | 'Women' | 'Unisex' | 'Kids'
  // - categoryFilter: 'ALL' | 'Footwear' | 'Tops' | 'Bottoms' | 'Sets' | 'Outerwear' | 'Accessories' | 'Bags' | 'Jewelry'
  // El orden local-first sólo aplica cuando los tres están en 'ALL'.
  const [originFilter, setOriginFilter] = useState('ALL')
  const [genderFilter, setGenderFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [userCountry, setUserCountry] = useState('GLOBAL')
  const [autoDetected, setAutoDetected] = useState(false)
  const [lang, setLang] = useState(() => detectInitialLanguage())
  const [selected, setSelected] = useState(null)

  // Catálogo: viene de /public/data/products.json, generado por scrapers en GitHub Actions.
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/data/products.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('catalog_fetch_failed')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

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

  // Productos visibles: intersección de los 3 filtros (origen, género, categoría).
  // El orden local-first se aplica primero sobre el catálogo completo y luego
  // se filtra, para que el resultado preserve el orden incluso con filtros activos.
  const visibleProducts = useMemo(() => {
    // 1) Ordenar local-first sobre el catálogo completo.
    let ordered
    if (userCountry === 'GLOBAL') {
      const globals = products.filter((p) => p.geo_tag === 'GLOBAL')
      const rest = products.filter((p) => p.geo_tag !== 'GLOBAL')
      ordered = [...globals, ...rest]
    } else {
      const local = products.filter((p) => p.geo_tag === userCountry)
      const globals = products.filter((p) => p.geo_tag === 'GLOBAL')
      const otherLocal = products.filter(
        (p) => p.geo_tag !== userCountry && p.geo_tag !== 'GLOBAL'
      )
      ordered = [...local, ...globals, ...otherLocal]
    }

    // 2) Aplicar los 3 filtros como intersección.
    return ordered.filter((p) => {
      if (originFilter !== 'ALL' && p.geo_tag !== originFilter) return false
      if (genderFilter !== 'ALL' && p.gender !== genderFilter) return false
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false
      return true
    })
  }, [originFilter, genderFilter, categoryFilter, userCountry, products])

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
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
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

        {loading ? (
          <div className="py-20 text-center text-[12px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
            {lang === 'es' ? 'Cargando catálogo…' : 'Loading catalog…'}
          </div>
        ) : error ? (
          <div className="py-20 text-center text-[13px] text-[var(--muted)]">
            {lang === 'es'
              ? 'No pudimos cargar el catálogo en este momento.'
              : 'We could not load the catalog right now.'}
          </div>
        ) : visibleProducts.length === 0 ? (
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
