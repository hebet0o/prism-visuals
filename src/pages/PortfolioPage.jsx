import { useTranslation } from 'react-i18next'
import PortfolioContainer from '../components/containers/PortfolioContainer'

const PortfolioPage = () => {
  const { t } = useTranslation()

  return (
    <div className="bg-brand-black min-h-screen pt-32 pb-24">
      <div className="text-center px-6 mb-16">
        <p className="section-label mb-4">{t('portfolio.title')}</p>
        <h1 className="font-display text-5xl md:text-6xl text-brand-warm mb-4">
          Selected Work
        </h1>
        <span className="divider-line" />
        <p className="text-brand-muted text-sm font-body font-light mt-6 max-w-lg mx-auto">
          {t('portfolio.description')}
        </p>
      </div>

      <PortfolioContainer />
    </div>
  )
}

export default PortfolioPage
