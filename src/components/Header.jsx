export default function Header({ region, setRegion, totalDeals }) {
  const regions = [
    { code: 'MX', label: 'México', flag: '🇲🇽' },
    { code: 'CO', label: 'Colombia', flag: '🇨🇴' },
  ]

  return (
    <header className="border-b border-[var(--line)] bg-white sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      {/* Top strip */}
      <div className="bg-black text-white text-[11px] tracking-[0.18em] uppercase">
        <div className="max-w-[1400px] mx-auto px-6 h-8 flex items-center justify-between">
          <span className="font-mono">// Solo Ofertas · Actualizado hoy</span>
          <span className="hidden sm:inline opacity-80">No procesamos pagos · Te llevamos a la tienda oficial</span>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-bold tracking-[0.02em]">RECALL</span>
          <span className="text-[22px] font-light tracking-[0.02em]">APPAREL</span>
          <span className="hidden md:inline ml-3 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
            Premium Streetwear · Aggregator
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{totalDeals} ofertas activas</span>
          </div>

          <div className="flex items-center bg-[#F5F5F5] rounded-full p-1">
            {regions.map((r) => (
              <button
                key={r.code}
                onClick={() => setRegion(r.code)}
                className={`region-pill px-4 py-1.5 text-[12px] font-medium tracking-wide rounded-full ${
                  region === r.code ? 'bg-black text-white' : 'text-[var(--ink)] hover:bg-white'
                }`}
                aria-pressed={region === r.code}
              >
                <span className="mr-1.5">{r.flag}</span>{r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
