import { useTranslation } from 'react-i18next'
import PricingCard from '../presentational/PricingCard'

const PricingContainer = () => {
  const { t } = useTranslation()

  const packages = [
    {
      name: t('pricing.weddingFull.name'),
      price: t('pricing.weddingFull.price'),
      features: t('pricing.weddingFull.features', { returnObjects: true }),
      featured: true,
    },
    {
      name: t('pricing.eventHalf.name'),
      price: t('pricing.eventHalf.price'),
      features: t('pricing.eventHalf.features', { returnObjects: true }),
    },
    {
      name: t('pricing.portrait.name'),
      price: t('pricing.portrait.price'),
      features: t('pricing.portrait.features', { returnObjects: true }),
    },
    {
      name: t('pricing.custom.name'),
      price: t('pricing.custom.price'),
      features: t('pricing.custom.features', { returnObjects: true }),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {packages.map((pkg, index) => (
        <PricingCard
          key={index}
          name={pkg.name}
          price={pkg.price}
          features={pkg.features}
          buttonText={t('pricing.contactButton')}
          featured={pkg.featured}
        />
      ))}
    </div>
  )
}

export default PricingContainer
