export default function Hero({ t }) {
  return (
    <section className="max-w-[1400px] mx-auto px-6 pt-16 pb-10 md:pt-24 md:pb-14">
      <h1 className="text-[44px] sm:text-[64px] md:text-[92px] leading-[0.95] tracking-[-0.02em] font-bold rise-2">
        {t('hero_title')}
      </h1>
      <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--muted)] rise-3">
        {t('hero_subtitle')}
      </p>
    </section>
  )
}
