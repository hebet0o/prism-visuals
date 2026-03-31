import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import GalleryGrid from '../presentational/GalleryGrid'
import { PLACEHOLDER_IMAGES, CATEGORIES } from '../../utils/constants'

const PortfolioContainer = () => {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: t('portfolio.allCategories') },
    { id: CATEGORIES.PORTRAIT, label: t('portfolio.portrait') },
    { id: CATEGORIES.EVENT, label: t('portfolio.event') },
    { id: CATEGORIES.COMMERCIAL, label: t('portfolio.commercial') },
    { id: CATEGORIES.VIDEOGRAPHY, label: t('portfolio.videography') },
  ]

  const images = PLACEHOLDER_IMAGES.portfolio

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

      <GalleryGrid images={images} columns={3} />
    </div>
  )
}

export default PortfolioContainer
