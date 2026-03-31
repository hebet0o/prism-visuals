import { useTranslation } from 'react-i18next'

const AboutPage = () => {
  const { t } = useTranslation()

  return (
    <div className="bg-brand-black min-h-screen pt-32 pb-24">
      {/* Page header */}
      <div className="text-center px-6 mb-20">
        <p className="section-label mb-4">{t('about.title')}</p>
        <h1 className="font-display text-5xl md:text-6xl text-brand-warm mb-4">Our Story</h1>
        <span className="divider-line" />
      </div>

      {/* Hero image */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div className="aspect-video overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&h=675&fit=crop"
            alt="Photographers"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Story */}
      <div className="max-w-3xl mx-auto px-6 mb-24">
        <p className="font-display italic text-xl md:text-2xl text-brand-warm/80 leading-relaxed text-center">
          {t('about.story')}
        </p>
      </div>

      {/* Two columns */}
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-1 bg-brand-charcoal">
        <div className="bg-brand-black p-12">
          <p className="section-label mb-6">{t('about.approach')}</p>
          <span className="block w-8 h-px bg-brand-bronze mb-6" />
          <p className="text-brand-muted text-sm leading-loose font-body font-light">
            {t('about.approachText')}
          </p>
        </div>
        <div className="bg-brand-black p-12">
          <p className="section-label mb-6">{t('about.equipment')}</p>
          <span className="block w-8 h-px bg-brand-bronze mb-6" />
          <p className="text-brand-muted text-sm leading-loose font-body font-light">
            {t('about.equipmentText')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
