import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PricingCard from '../presentational/PricingCard'

const PricingContainer = () => {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('photo')

  const categories = [
    { id: 'photo', label: t('pricing.tabPhoto') },
    { id: 'video', label: t('pricing.tabVideo') },
    { id: 'bundle', label: t('pricing.tabBundle') },
    { id: 'marketing', label: t('pricing.tabMarketing') },
  ]

  const packageKeysMap = {
    photo: ['alap', 'deluxe', 'premium'],
    video: ['alap', 'deluxe', 'premium'],
    bundle: ['alap', 'deluxe', 'premium'],
    marketing: ['social', 'promo', 'brand'],
  }

  const keys = packageKeysMap[activeCategory] || []

  return (
    <div className="space-y-12">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 border-b border-brand-charcoal pb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 text-xs font-heading font-semibold tracking-widest uppercase transition-all duration-300 ${
              activeCategory === cat.id
                ? 'bg-brand-bronze text-brand-black shadow-md'
                : 'bg-brand-dark text-brand-muted hover:text-brand-warm hover:border-brand-bronze/50 border border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Heading & Subheading for active tab */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl md:text-3xl font-display text-brand-warm">
          {t(`pricing.${activeCategory}.heading`)}
        </h2>
        <p className="text-sm font-body text-brand-muted font-light leading-relaxed">
          {t(`pricing.${activeCategory}.subheading`)}
        </p>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {keys.map((key) => {
          const pkgData = t(`pricing.${activeCategory}.${key}`, { returnObjects: true })
          if (!pkgData || typeof pkgData !== 'object') return null

          return (
            <PricingCard
              key={key}
              name={pkgData.name}
              price={pkgData.price}
              badge={pkgData.badge}
              features={pkgData.features || []}
              buttonText={t('pricing.contactButton')}
              featured={key === 'deluxe' || (activeCategory === 'bundle' && key === 'deluxe')}
            />
          )
        })}
      </div>

      {/* Bottom Notes */}
      <div className="pt-8 border-t border-brand-charcoal/50 text-center space-y-2 text-xs text-brand-muted font-body font-light">
        <p>{t('pricing.note')}</p>
        <p className="text-brand-bronze/80 font-medium">{t('pricing.offseason')}</p>
      </div>
    </div>
  )
}

export default PricingContainer
