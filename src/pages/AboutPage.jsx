import { useTranslation } from 'react-i18next'

const AboutPage = () => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language

  return (
    <div className="bg-brand-black min-h-screen pt-32 pb-24">
      {/* Page header */}
      <div className="text-center px-6 mb-20">
        <p className="section-label mb-4">{t('about.title')}</p>
        <h1 className="font-display text-5xl md:text-6xl text-brand-warm mb-4">{t('about.pageHeading')}</h1>
        <span className="divider-line" />
      </div>

      {/* About — two-person introduction */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid gap-10 items-center lg:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] bg-brand-charcoal min-h-[420px]">
            <img
              src="/statikus-kepek/about-me/4L5A1834.jpg"
              alt="Iszak Gábor"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <p className="section-label">{t('about.gabor.role')}</p>
            <h2 className="font-display text-4xl text-brand-warm">Iszak Gábor</h2>
            <p className="text-brand-bronze uppercase tracking-display text-xs">
              {t('about.gabor.subtitle')}
            </p>
            <div className="space-y-6 text-brand-warm text-sm leading-loose font-body font-light whitespace-pre-line">
              {t('about.gabor.bio')}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid gap-10 items-center lg:grid-cols-2">
          <div className="space-y-6 order-2 lg:order-1">
            <p className="section-label">{t('about.partner.role')}</p>
            <h2 className="font-display text-4xl text-brand-warm">{t('about.partner.name')}</h2>
            <p className="text-brand-bronze uppercase tracking-display text-xs">
              {t('about.partner.title')}
            </p>
            <div className="space-y-6 text-brand-warm text-sm leading-loose font-body font-light whitespace-pre-line">
              {t('about.partner.bio')}
            </div>
          </div>
          <div className="overflow-hidden rounded-[32px] bg-brand-charcoal min-h-[420px] order-1 lg:order-2">
            <img
              src="/statikus-kepek/about-me/4L5A3466.jpg"
              alt={t('about.partner.imageAlt')}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
