export default function Footer({ t }) {
  return (
    <footer className="mt-24 border-t border-[var(--line)]">
      <div className="max-w-[1400px] mx-auto px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="text-[18px] font-bold tracking-[0.02em]">RECALL APPAREL</div>
          <p className="mt-3 text-[12.5px] text-[var(--muted)] leading-relaxed max-w-xs">
            {t('footer_description')}
          </p>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] mb-3">
            {t('footer_how_title')}
          </div>
          <ol className="text-[13px] space-y-2">
            <li className="flex gap-3">
              <span className="text-[var(--muted)] font-mono text-[11px] mt-0.5">01</span>
              <span>{t('footer_how_1')}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--muted)] font-mono text-[11px] mt-0.5">02</span>
              <span>{t('footer_how_2')}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--muted)] font-mono text-[11px] mt-0.5">03</span>
              <span>{t('footer_how_3')}</span>
            </li>
          </ol>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] mb-3">
            {t('footer_legal')}
          </div>
          <ul className="text-[13px] space-y-1.5 text-[var(--muted)]">
            <li>{t('legal_1')}</li>
            <li>{t('legal_2')}</li>
            <li>{t('legal_3')}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-5 text-center text-[10.5px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
        © {new Date().getFullYear()} · Recall Apparel
      </div>
    </footer>
  )
}
