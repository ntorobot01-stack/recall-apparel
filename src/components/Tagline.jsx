export default function Tagline({ t }) {
  return (
    <div className="border-y border-[var(--line)] py-5">
      <p className="px-6 text-center font-mono uppercase tracking-[0.22em] text-[var(--muted)] text-[10px] sm:text-[11px] md:text-[12px] leading-relaxed">
        {t('tagline_text')}
      </p>
    </div>
  )
}
