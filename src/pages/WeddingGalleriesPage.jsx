import { useTranslation } from 'react-i18next'
import { useVisibleGalleries } from '../hooks/useVisibleGalleries'
import GalleryCardGrid from '../components/presentational/GalleryCardGrid'

const WeddingGalleriesPage = () => {
  const { t } = useTranslation()
  const { galleries, loading } = useVisibleGalleries()
  const weddingGalleries = galleries.filter(g => g.type === 'wedding')

  return (
    <div className="bg-brand-black min-h-screen pt-32 pb-24">
      {/* Hero Header */}
      <div className="text-center px-6 mb-16">
        <p className="section-label mb-4">{t('weddingGalleries.title')}</p>
        <h1 className="font-display text-5xl md:text-6xl text-brand-warm mb-4 italic">
          {t('weddingGalleries.storiesTitle')}
        </h1>
        <span className="divider-line" />
        <p className="text-brand-muted text-sm font-body font-light mt-6 max-w-lg mx-auto">
          {t('weddingGalleries.description')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <GalleryCardGrid
          galleries={weddingGalleries}
          loading={loading}
          columns={2}
          labels={{
            loadingText: t('weddingGalleries.loading'),
            emptyText: t('weddingGalleries.noGalleries'),
            photosText: t('weddingGalleries.photos'),
            viewGalleryText: t('weddingGalleries.viewGallery'),
          }}
        />
      </div>
    </div>
  )
}

export default WeddingGalleriesPage
