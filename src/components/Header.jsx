import { ORIGIN_FLAGS } from '../lib/geo.js'
import { LANGUAGES } from '../lib/i18n.js'

export default function Header({
  originFilter,
  setOriginFilter,
  totalDeals,
  autoDetected,
  lang,
  setLang,
  t,
}) {
  const filterOptions = [
    { code: 'ALL', label: t('filter_all'), flag: null },
    { code: 'MX', label: t('filter_mexico'), flag: ORIGIN_FLAGS.MX },
    { code: 'CO', label: t('filter_colombia'), flag: ORIGIN_FLAGS.CO },
    { code: 'GLOBAL', label: t('filter_global'), flag: ORIGIN_FLAGS.GLOBAL },
  ]

  return (
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

          {/* Filtro de origen */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
              {t('filter_label')}:
            </span>
            <div className="flex items-center bg-[#F5F5F5] rounded-full p-1">
              {filterOptions.map((r) => (
                <button
                  key={r.code}
                  onClick={() => setOriginFilter(r.code)}
                  className={`region-pill px-3 py-1.5 text-[12px] font-medium tracking-wide rounded-full ${
                    originFilter === r.code
                      ? 'bg-black text-white'
                      : 'text-[var(--ink)] hover:bg-white'
                  }`}
                  aria-pressed={originFilter === r.code}
                >
                  {r.flag && <span className="mr-1.5">{r.flag}</span>}
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
