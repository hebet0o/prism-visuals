import { useTranslation } from 'react-i18next'
import PricingContainer from '../components/containers/PricingContainer'

const PricingPage = () => {
  const { t } = useTranslation()

  return (
    <div className="bg-brand-black min-h-screen pt-32 pb-24 px-6">
      <div className="text-center mb-16">
        <p className="section-label mb-4">{t('pricing.title')}</p>
        <h1 className="font-display text-5xl md:text-6xl text-brand-warm mb-4">
          {t('pricing.description')}
        </h1>
        <span className="divider-line" />
      </div>
      <div className="max-w-6xl mx-auto">
        <PricingContainer />
      </div>
    </div>
  )
}

export default PricingPage
