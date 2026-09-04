import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVisibleGalleries } from '../../hooks/useVisibleGalleries'
import GalleryCardGrid from '../presentational/GalleryCardGrid'

const PORTFOLIO_TYPES = ['portrait', 'event', 'commercial', 'video']

const PortfolioContainer = () => {
  const { t } = useTranslation()
  const { galleries, loading } = useVisibleGalleries()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const portfolioGalleries = galleries.filter(g => PORTFOLIO_TYPES.includes(g.type))

  const categories = [
    { id: 'all', label: t('portfolio.allCategories') },
    { id: 'portrait', label: t('portfolio.portrait') },
    { id: 'event', label: t('portfolio.event') },
    { id: 'commercial', label: t('portfolio.commercial') },
    { id: 'video', label: t('portfolio.videography') },
  ]

  const visibleGalleries = selectedCategory === 'all'
    ? portfolioGalleries
    : portfolioGalleries.filter(g => g.type === selectedCategory)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap justify-center gap-8 mb-12 px-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`text-xs font-heading font-semibold uppercase tracking-display transition-colors duration-300 pb-1 border-b ${
              selectedCategory === category.id
                ? 'text-brand-bronze border-brand-bronze'
                : 'text-brand-muted border-transparent hover:text-brand-warm hover:border-brand-warm/30'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <GalleryCardGrid
          galleries={visibleGalleries}
          loading={loading}
          columns={3}
          labels={{
            loadingText: t('portfolio.loading') || 'Loading...',
            emptyText: t('portfolio.noWorkYet'),
            photosText: t('weddingGalleries.photos'),
            viewGalleryText: t('weddingGalleries.viewGallery'),
          }}
        />
      </div>
    </div>
  )
}

export default PortfolioContainer
