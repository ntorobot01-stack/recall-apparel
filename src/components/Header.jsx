import { useState, useEffect, useRef } from 'react'
import { ORIGIN_FLAGS } from '../lib/geo.js'
import { LANGUAGES } from '../lib/i18n.js'

// Géneros expuestos en la nav (Kids existe en el schema pero no se muestra).
const NAV_GENDERS = [
  { code: 'Men', labelKey: 'nav_men', genderTextKey: 'gender_men' },
  { code: 'Women', labelKey: 'nav_women', genderTextKey: 'gender_women' },
  { code: 'Unisex', labelKey: 'nav_unisex', genderTextKey: 'gender_unisex' },
]

// Las 4 categorías de la mega-nav (algunas son grupos: ver mapping en App.jsx).
const NAV_CATEGORIES = [
  { code: 'Footwear', labelKey: 'nav_footwear' },
  { code: 'Clothing', labelKey: 'nav_clothing' },
  { code: 'Accessories', labelKey: 'nav_accessories_grouped' },
  { code: 'Bags', labelKey: 'nav_bags' },
]

export default function Header({
  activeNav,
  setActiveNav,
  originFilter,
  setOriginFilter,
  totalDeals,
  autoDetected,
  lang,
  setLang,
  t,
}) {
  // Mega-menú desktop
  const [hoverGender, setHoverGender] = useState(null)
  const closeTimer = useRef(null)

  // Drawer mobile
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerGender, setDrawerGender] = useState(null) // null = nivel 1; gender code = nivel 2

  const originOptions = [
    { code: 'MX', label: t('filter_mexico'), flag: ORIGIN_FLAGS.MX },
    { code: 'CO', label: t('filter_colombia'), flag: ORIGIN_FLAGS.CO },
    { code: 'GLOBAL', label: t('filter_global'), flag: ORIGIN_FLAGS.GLOBAL },
  ]

  // Body scroll-lock cuando el drawer mobile está abierto.
  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerOpen])

  // Resetea nivel 2 al cerrar drawer.
  useEffect(() => {
    if (!drawerOpen) setDrawerGender(null)
  }, [drawerOpen])

  // Hover handlers — pequeño delay para tolerar el cruce mouse del label al panel.
  function openMega(genderCode) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setHoverGender(genderCode)
  }
  function scheduleCloseMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setHoverGender(null), 120)
  }

  function applyNav(gender, category) {
    setActiveNav({ gender, category })
    setHoverGender(null)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  function closeDrawerAndApply(gender, category) {
    applyNav(gender, category)
    setDrawerOpen(false)
  }

  return (
    <>
      <header className="border-b border-[var(--line)] bg-white sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        {/* Top strip */}
        <div className="bg-black text-white text-[11px] tracking-[0.18em] uppercase">
          <div className="max-w-[1400px] mx-auto px-6 h-8 flex items-center justify-between gap-4">
            <span className="font-mono truncate">{t('top_strip_left')}</span>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline opacity-80 truncate">{t('top_strip_right')}</span>

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
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between gap-4">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden -ml-1 p-2 text-[var(--ink)]"
            aria-label={t('open_menu')}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Wordmark */}
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[20px] md:text-[22px] tracking-[0.02em] leading-none">
              RECALL
            </span>
            <span className="font-display text-[20px] md:text-[22px] tracking-[0.02em] leading-none">
              APPAREL
            </span>
            <span className="hidden lg:inline ml-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {t('aggregator_tagline')}
            </span>
          </div>

          {/* Right side: deals counter + origin pills (desktop) */}
          <div className="hidden md:flex items-center gap-5">
            <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t('deals_active', totalDeals)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden lg:inline font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                {autoDetected ? t('region_detected') : t('region_detecting')}:
              </span>
              <div className="flex items-center bg-[#F5F5F5] rounded-full p-0.5">
                {originOptions.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => setOriginFilter(originFilter === r.code ? 'ALL' : r.code)}
                    className={`region-pill px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap ${
                      originFilter === r.code
                        ? 'bg-black text-white'
                        : 'text-[var(--ink)] hover:bg-white'
                    }`}
                    aria-pressed={originFilter === r.code}
                    title={r.label}
                  >
                    <span className="mr-1">{r.flag}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Spacer mobile (mantiene el wordmark visualmente centrado) */}
          <div className="md:hidden w-6" aria-hidden="true" />
        </div>

        {/* Nav bar (desktop only) */}
        <div
          className="hidden md:block border-t border-[var(--line)] relative"
          onMouseLeave={scheduleCloseMega}
        >
          <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-center gap-12">
            {NAV_GENDERS.map((g) => (
              <button
                key={g.code}
                onMouseEnter={() => openMega(g.code)}
                onClick={() => applyNav(g.code, null)}
                className={`font-display text-[13px] tracking-[0.14em] py-2 transition-opacity ${
                  activeNav.gender === g.code
                    ? 'opacity-100 border-b-2 border-black -mb-[2px]'
                    : 'opacity-80 hover:opacity-100'
                }`}
                aria-haspopup="true"
                aria-expanded={hoverGender === g.code}
              >
                {t(g.labelKey)}
              </button>
            ))}
          </div>

          {/* Mega-panel */}
          {hoverGender && (
            <div
              className="mega-panel absolute left-0 right-0 top-full bg-white border-t border-[var(--line)] border-b border-[var(--line)] shadow-sm z-40"
              onMouseEnter={() => openMega(hoverGender)}
              onMouseLeave={scheduleCloseMega}
            >
              <div className="max-w-[1400px] mx-auto px-6 py-8 flex items-center justify-center gap-10">
                {NAV_CATEGORIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => applyNav(hoverGender, c.code)}
                    className="font-display text-[13px] tracking-[0.14em] opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {t(c.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label={t('close_menu')}
          />

          {/* Panel */}
          <div className="drawer-panel absolute top-0 left-0 h-full w-[85%] max-w-[360px] bg-white shadow-xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--line)]">
              {drawerGender ? (
                <button
                  onClick={() => setDrawerGender(null)}
                  className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-[var(--ink)] hover:opacity-70"
                >
                  <span aria-hidden="true">←</span>
                  <span>{t('back')}</span>
                </button>
              ) : (
                <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {t('open_menu')}
                </span>
              )}
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-[12px] font-medium uppercase tracking-wide text-[var(--ink)] hover:opacity-70"
                aria-label={t('close_menu')}
              >
                {t('close_menu')} <span aria-hidden="true" className="ml-1">✕</span>
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto">
              {drawerGender === null ? (
                <ul className="py-2">
                  {NAV_GENDERS.map((g) => (
                    <li key={g.code}>
                      <button
                        onClick={() => setDrawerGender(g.code)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FAFAFA] border-b border-[var(--line)]"
                      >
                        <span className="font-display text-[16px] tracking-[0.08em]">
                          {t(g.labelKey)}
                        </span>
                        <span aria-hidden="true" className="text-[var(--muted)]">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="py-2">
                  <li>
                    <button
                      onClick={() => closeDrawerAndApply(drawerGender, null)}
                      className="w-full text-left px-5 py-4 hover:bg-[#FAFAFA] border-b border-[var(--line)]"
                    >
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                        {t('view_all_in', t(NAV_GENDERS.find((x) => x.code === drawerGender).genderTextKey))}
                      </span>
                    </button>
                  </li>
                  {NAV_CATEGORIES.map((c) => (
                    <li key={c.code}>
                      <button
                        onClick={() => closeDrawerAndApply(drawerGender, c.code)}
                        className="w-full text-left px-5 py-4 hover:bg-[#FAFAFA] border-b border-[var(--line)]"
                      >
                        <span className="font-display text-[15px] tracking-[0.08em]">
                          {t(c.labelKey)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Drawer footer: región + idioma */}
            <div className="border-t border-[var(--line)] px-5 py-5 space-y-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
                  {t('region_label')}
                </div>
                <div className="flex items-center bg-[#F5F5F5] rounded-full p-0.5 w-fit">
                  {originOptions.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => setOriginFilter(originFilter === r.code ? 'ALL' : r.code)}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-full whitespace-nowrap ${
                        originFilter === r.code
                          ? 'bg-black text-white'
                          : 'text-[var(--ink)] hover:bg-white'
                      }`}
                      aria-pressed={originFilter === r.code}
                    >
                      <span className="mr-1">{r.flag}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
                  {t('language_label')}
                </div>
                <div className="flex items-center gap-1 font-mono text-[12px]">
                  {LANGUAGES.map((l, i) => (
                    <span key={l.code} className="flex items-center">
                      <button
                        onClick={() => setLang(l.code)}
                        className={`px-2 py-1 ${
                          lang === l.code ? 'opacity-100 font-semibold' : 'opacity-50 hover:opacity-80'
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
        </div>
      )}
    </>
  )
}
