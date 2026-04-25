export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--line)]">
      <div className="max-w-[1400px] mx-auto px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="text-[18px] font-bold tracking-[0.02em]">RECALL APPAREL</div>
          <p className="mt-3 text-[12.5px] text-[var(--muted)] leading-relaxed max-w-xs">
            Agregador de afiliación. No vendemos, no almacenamos inventario, no procesamos pagos.
            Te llevamos a la tienda oficial de cada marca.
          </p>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] mb-3">Cobertura</div>
          <ul className="text-[13px] space-y-1.5">
            <li>🇲🇽 México · MXN</li>
            <li>🇨🇴 Colombia · COP</li>
            <li>🌎 Global · USD</li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] mb-3">Legal</div>
          <ul className="text-[13px] space-y-1.5 text-[var(--muted)]">
            <li>Recall Apparel participa en programas de afiliación.</li>
            <li>Marcas y precios pertenecen a sus respectivos dueños.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-5 text-center text-[10.5px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
        © {new Date().getFullYear()} · Recall Apparel · MVP v1
      </div>
    </footer>
  )
}
