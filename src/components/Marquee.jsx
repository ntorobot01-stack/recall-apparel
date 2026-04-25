const STORES = [
  'Lust México', 'Hype Colombia', 'SSENSE', 'END. Clothing',
  'Innvictus', 'Distrito Urbano', 'Farfetch', 'Stüssy', 'Off-White', 'Salomon',
]

function Row() {
  return (
    <div className="flex gap-12 px-6 shrink-0">
      {STORES.map((s, i) => (
        <span key={i} className="text-[12px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
          — {s}
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="border-y border-[var(--line)] py-4 overflow-hidden">
      <div className="marquee-track flex w-max">
        <Row /><Row />
      </div>
    </div>
  )
}
