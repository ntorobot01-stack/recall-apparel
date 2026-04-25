import { useState, useEffect } from 'react'
import { ORIGIN_FLAGS } from '../lib/geo.js'
import { LANGUAGES } from '../lib/i18n.js'

export default function Header({
  originFilter,
  setOriginFilter,
  genderFilter,
  setGenderFilter,
  categoryFilter,
  setCategoryFilter,
  totalDeals,
  autoDetected,
  lang,
  setLang,
  t,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const originOptions = [
    { code: 'ALL', label: t('filter_all'), flag: null },
    { code: 'MX', label: t('filter_mexico'), flag: ORIGIN_FLAGS.MX },
    { code: 'CO', label: t('filter_colombia'), flag: ORIGIN_FLAGS.CO },
    { code: 'GLOBAL', label: t('filter_global'), flag: ORIGIN_FLAGS.GLOBAL },
  ]

  const genderOptions = [
    { code: 'ALL', label: t('gender_all') },
    { code: 'Men', label: t('gender_men') },
    { code: 'Women', label: t('gender_women') },
    { code: 'Unisex', label: t('gender_unisex') },
    { code: 'Kids', label: t('gender_kids') },
  ]

  const categoryOptions = [
    { code: 'ALL', label: t('category_all') },
    { code: 'Footwear', label: t('category_footwear') },
    { code: 'Tops', label: t('category_tops') },
    { code: 'Bottoms', label: t('category_bottoms') },
    { code: 'Sets', label: t('category_sets') },
    { code: 'Outerwear', label: t('category_outerwear') },
    { code: 'Accessories', label: t('category_accessories') },
    { code: 'Bags', label: t('category_bags') },
    { code: 'Jewelry', label: t('category_jewelry') },
  ]

  // Body scroll-lock cuando el drawer mobile está abierto.
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <>
      <header className="border-b border-[var(--line)] bg-white sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        {/* Top strip */}
        <div className="bg-black text-white text-[11px] tracking-[0.18em] uppercase">
          <div className="max-w-[1400px] mx-auto px-6 h-8 flex items-center justify-between gap-4">
            <span className="font-mono truncate">{t('top_strip_left')}</span>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline opacity-80 truncate">{t('top_strip_right')}</span>

              {/* Toggle de idioma */}
              <div className="flex items-center gap-1 font-mono">
                {LANGUAGES.map((l, i) => (
                  <span key={l.code} className="flex items-center">
                    <button
                      onClick={() => setLang(l.code)}
                      className={`px-1 transition-opacity ${
                        lang === l.code ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                      }`}
                      aria-pressed={lang === l.code}
                    >
                      {l.label}
                    </button>
                    {i < LANGUAGES.length - 1 && <span className="opacity-40">|</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold tracking-[0.02em]">RECALL</span>
            <span className="text-[22px] font-light tracking-[0.02em]">APPAREL</span>
            <span className="hidden md:inline ml-3 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
              {t('aggregator_tagline')}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t('deals_active', totalDeals)}</span>
            </div>

            <div className="hidden xl:flex items-center text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
              <span>{autoDetected ? t('region_detected') : t('region_detecting')}</span>
            </div>
          </div>
        </div>

        {/* Filter bar (sticky con el header) */}
        <div className="border-t border-[var(--line)] bg-white">
          <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center">
            {/* Desktop: 3 grupos centrados, cap a 60% del ancho del header en lg+ */}
            <div className="hidden md:flex items-center justify-center gap-5 mx-auto w-full lg:max-w-[840px] overflow-x-auto">
              <FilterGroup
                label={t('filter_label')}
                options={originOptions}
                value={originFilter}
                onChange={setOriginFilter}
              />
              <FilterGroup
                label={t('gender_label')}
                options={genderOptions}
                value={genderFilter}
                onChange={setGenderFilter}
              />
              <FilterGroup
                label={t('category_label')}
                options={categoryOptions}
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
            </div>

            {/* Mobile: botón único que abre el drawer */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium tracking-wide bg-[#F5F5F5] rounded-full hover:bg-[#EBEBEB] transition-colors"
              aria-label={t('open_filters')}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="9" y1="18" x2="15" y2="18" />
              </svg>
              <span>{t('open_filters')}</span>
              {(originFilter !== 'ALL' || genderFilter !== 'ALL' || categoryFilter !== 'ALL') && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-black"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label={t('close_filters')}
          />
          {/* Panel */}
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-[360px] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--line)]">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                {t('open_filters')}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-[12px] font-medium uppercase tracking-wide text-[var(--ink)] hover:opacity-70"
              >
                {t('close_filters')}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-7">
              <FilterGroup
                label={t('filter_label')}
                options={originOptions}
                value={originFilter}
                onChange={setOriginFilter}
                stacked
              />
              <FilterGroup
                label={t('gender_label')}
                options={genderOptions}
                value={genderFilter}
                onChange={setGenderFilter}
                stacked
              />
              <FilterGroup
                label={t('category_label')}
                options={categoryOptions}
                value={categoryFilter}
                onChange={setCategoryFilter}
                stacked
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FilterGroup({ label, options, value, onChange, stacked = false }) {
  if (stacked) {
    return (
      <div>
        <span className="block mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
          {label}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {options.map((o) => (
            <button
              key={o.code}
              onClick={() => onChange(o.code)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-colors ${
                value === o.code
                  ? 'bg-black text-white'
                  : 'bg-[#F5F5F5] text-[var(--ink)] hover:bg-[#EBEBEB]'
              }`}
              aria-pressed={value === o.code}
            >
              {o.flag && <span className="mr-1.5">{o.flag}</span>}
              {o.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--muted)] whitespace-nowrap">
        {label}:
      </span>
      <div className="flex items-center bg-[#F5F5F5] rounded-full p-0.5">
        {options.map((o) => (
          <button
            key={o.code}
            onClick={() => onChange(o.code)}
            className={`region-pill px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${
              value === o.code
                ? 'bg-black text-white'
                : 'text-[var(--ink)] hover:bg-white'
            }`}
            aria-pressed={value === o.code}
          >
            {o.flag && <span className="mr-1">{o.flag}</span>}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
