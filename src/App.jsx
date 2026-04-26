import { useState, useMemo, useEffect, useCallback } from 'react'
import { detectUserRegion } from './lib/geo.js'
import { detectInitialLanguage, makeT } from './lib/i18n.js'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Tagline from './components/Tagline.jsx'
import JustDroppedSection from './components/JustDroppedSection.jsx'
import FeaturedEditSection from './components/FeaturedEditSection.jsx'
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
  // selectedCountry: 'ALL' | 'MX' | 'CO' — filtro único del catálogo.
  // - 'MX' / 'CO': muestra productos de ese país + GLOBAL (los GLOBAL son ubicuos)
  // - 'ALL': muestra todo el catálogo sin filtrar
  // Default 'ALL'; si la geo IP detecta MX o CO, se auto-selecciona ese país.
  const [selectedCountry, setSelectedCountry] = useState('ALL')

  // activeNav: navegación jerárquica del mega-menú / drawer.
  // - gender: null | 'Men' | 'Women' | 'Unisex'
  // - category: null | 'Footwear' | 'Clothing' | 'Accessories' | 'Bags'
  const [activeNav, setActiveNav] = useState({ gender: null, category: null })

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

  // Detectar país al cargar y auto-seleccionar el filtro.
  // detectUserRegion() devuelve 'MX' | 'CO' | 'GLOBAL'; mapeamos GLOBAL → 'ALL'.
  useEffect(() => {
    let cancelled = false
    detectUserRegion().then((detected) => {
      if (cancelled) return
      const next = detected === 'MX' || detected === 'CO' ? detected : 'ALL'
      setSelectedCountry(next)
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

  // Países disponibles en el catálogo (excluye GLOBAL: no es un país real,
  // siempre se muestra junto al país seleccionado). Lista única, sin orden:
  // CountryDropdown la ordena alfabéticamente por nombre traducido.
  const availableCountries = useMemo(() => {
    const set = new Set()
    for (const p of products) {
      if (p.geo_tag && p.geo_tag !== 'GLOBAL') set.add(p.geo_tag)
    }
    return Array.from(set)
  }, [products])

  // Productos visibles: intersección de país + nav (gender + category agrupados).
  // Regla de país: 'ALL' no filtra; 'MX'/'CO' incluye ese país + GLOBAL (los GLOBAL
  // son ubicuos y aparecen siempre que no estemos en ALL — donde ya se ven igual).
  const visibleProducts = useMemo(() => {
    const allowedGenders = activeNav.gender ? GENDER_MAP[activeNav.gender] : null
    const allowedCategories = activeNav.category ? CATEGORY_MAP[activeNav.category] : null

    return products.filter((p) => {
      if (selectedCountry !== 'ALL' && p.geo_tag !== selectedCountry && p.geo_tag !== 'GLOBAL') {
        return false
      }
      if (allowedGenders && !allowedGenders.includes(p.gender)) return false
      if (allowedCategories && !allowedCategories.includes(p.category)) return false
      return true
    })
  }, [selectedCountry, activeNav, products])

  // Productos para las secciones editoriales (JustDropped + FeaturedEdit).
  // Respetan país y género (declaración de identidad), pero NO categoría: las
  // secciones editoriales son discovery, romper el filtro de categoría es
  // intencional y aporta variedad respecto al catálogo principal de abajo.
  const editorialProducts = useMemo(() => {
    const allowedGenders = activeNav.gender ? GENDER_MAP[activeNav.gender] : null
    return products.filter((p) => {
      if (selectedCountry !== 'ALL' && p.geo_tag !== selectedCountry && p.geo_tag !== 'GLOBAL') {
        return false
      }
      if (allowedGenders && !allowedGenders.includes(p.gender)) return false
      return true
    })
  }, [selectedCountry, activeNav.gender, products])

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
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        availableCountries={availableCountries}
        totalDeals={visibleProducts.length}
        lang={lang}
        setLang={setLang}
        t={t}
      />
      <Hero t={t} />
      <Tagline t={t} />

      {!loading && !error && (
        <>
          <JustDroppedSection products={editorialProducts} onSelect={onSelect} t={t} />
          <FeaturedEditSection products={editorialProducts} onSelect={onSelect} t={t} />
        </>
      )}

      <main className="max-w-[1400px] mx-auto w-full px-6 mt-20 md:mt-24">
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
