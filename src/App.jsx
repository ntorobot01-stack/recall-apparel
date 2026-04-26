import { useState, useMemo, useEffect, useCallback } from 'react'
import { detectUserRegion } from './lib/geo.js'
import { detectInitialLanguage, makeT } from './lib/i18n.js'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import ProductCard from './components/ProductCard.jsx'
import RedirectModal from './components/RedirectModal.jsx'
import Footer from './components/Footer.jsx'

// Mapeo de género de UI → géneros del schema que matchean.
// Hombre/Mujer incluyen Unisex (los unisex aparecen en cualquier género).
const GENDER_MAP = {
  Men: ['Men', 'Unisex'],
  Women: ['Women', 'Unisex'],
  Unisex: ['Unisex'],
}

// Mapeo de categoría agrupada → categorías del schema que matchean.
const CATEGORY_MAP = {
  Footwear: ['Footwear'],
  Clothing: ['Tops', 'Bottoms', 'Sets', 'Outerwear'],
  Accessories: ['Accessories', 'Jewelry'],
  Bags: ['Bags'],
}

export default function App() {
  // originFilter: 'ALL' | 'MX' | 'CO' | 'GLOBAL' — independiente, se mantiene aparte de la nav.
  const [originFilter, setOriginFilter] = useState('ALL')

  // activeNav: navegación jerárquica del mega-menú / drawer.
  // - gender: null | 'Men' | 'Women' | 'Unisex'
  // - category: null | 'Footwear' | 'Clothing' | 'Accessories' | 'Bags'
  const [activeNav, setActiveNav] = useState({ gender: null, category: null })

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

  // Productos visibles: intersección de origen + nav (gender + category agrupados).
  // El orden local-first se aplica primero sobre el catálogo completo y luego
  // se filtra, para que el resultado preserve el orden incluso con filtros activos.
  const visibleProducts = useMemo(() => {
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

    const allowedGenders = activeNav.gender ? GENDER_MAP[activeNav.gender] : null
    const allowedCategories = activeNav.category ? CATEGORY_MAP[activeNav.category] : null

    return ordered.filter((p) => {
      if (originFilter !== 'ALL' && p.geo_tag !== originFilter) return false
      if (allowedGenders && !allowedGenders.includes(p.gender)) return false
      if (allowedCategories && !allowedCategories.includes(p.category)) return false
      return true
    })
  }, [originFilter, activeNav, userCountry, products])

  const onSelect = useCallback((product) => setSelected(product), [])
  const onClose = useCallback(() => setSelected(null), [])

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [selected])

  // Breadcrumb: visible cuando hay navegación activa (gender o category).
  const navActive = activeNav.gender || activeNav.category
  const genderLabelKey = activeNav.gender
    ? activeNav.gender === 'Men'
      ? 'gender_men'
      : activeNav.gender === 'Women'
        ? 'gender_women'
        : 'gender_unisex'
    : null
  const categoryLabelKey = activeNav.category
    ? activeNav.category === 'Footwear'
      ? 'nav_footwear'
      : activeNav.category === 'Clothing'
        ? 'nav_clothing'
        : activeNav.category === 'Accessories'
          ? 'nav_accessories_grouped'
          : 'nav_bags'
    : null

  function clearNav() {
    setActiveNav({ gender: null, category: null })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeNav={activeNav}
        setActiveNav={setActiveNav}
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
        {navActive && (
          <div className="mb-6 flex items-center gap-3">
            <nav
              aria-label="breadcrumb"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] flex items-center gap-2"
            >
              {genderLabelKey && (
                <span className="text-[var(--ink)]">{t(genderLabelKey)}</span>
              )}
              {genderLabelKey && categoryLabelKey && (
                <span aria-hidden="true">/</span>
              )}
              {categoryLabelKey && (
                <span className="text-[var(--ink)]">{t(categoryLabelKey)}</span>
              )}
            </nav>
            <button
              onClick={clearNav}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1"
              aria-label={t('clear_filters')}
            >
              <span aria-hidden="true">✕</span>
              <span>{t('clear_filters')}</span>
            </button>
          </div>
        )}

        <div className="flex items-end justify-between mb-8">
          <h2 className="text-[20px] font-medium tracking-tight">
            {t('catalog_title')}
            <span className="ml-3 text-[12px] font-mono text-[var(--muted)] uppercase tracking-[0.18em]">
              ({t('catalog_meta', visibleProducts.length)})
            </span>
          </h2>
          {originFilter === 'ALL' && !navActive && (
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
