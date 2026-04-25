import { useState, useMemo, useEffect, useCallback } from 'react'
import { PRODUCTS } from './data/products.js'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import ProductCard from './components/ProductCard.jsx'
import RedirectModal from './components/RedirectModal.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [region, setRegion] = useState('MX')
  const [selected, setSelected] = useState(null)

  // Show products tagged with selected region OR GLOBAL
  const filtered = useMemo(
    () => PRODUCTS.filter((p) => p.geo_tag === region || p.geo_tag === 'GLOBAL'),
    [region]
  )

  const onSelect = useCallback((product) => setSelected(product), [])
  const onClose = useCallback(() => setSelected(null), [])

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [selected])

  return (
    <div className="min-h-screen flex flex-col">
      <Header region={region} setRegion={setRegion} totalDeals={filtered.length} />
      <Hero region={region} />
      <Marquee />

      <main className="max-w-[1400px] mx-auto w-full px-6 mt-12">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-[20px] font-medium tracking-tight">
            Ofertas para {region === 'MX' ? 'México' : 'Colombia'}
            <span className="ml-3 text-[12px] font-mono text-[var(--muted)] uppercase tracking-[0.18em]">
              ({filtered.length} piezas)
            </span>
          </h2>
          <span className="hidden md:block text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
            Tiendas locales + globales
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={onSelect} />
          ))}
        </div>
      </main>

      <Footer />
      <RedirectModal product={selected} onClose={onClose} />
    </div>
  )
}
