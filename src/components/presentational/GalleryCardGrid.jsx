import { useState } from 'react'
import pb from '../../utils/pocketbase'
import GalleryGrid from './GalleryGrid'
import LoadingSpinner from '../LoadingSpinner'

const GalleryCardGrid = ({ galleries, loading, labels = {} }) => {
  const [openGalleryId, setOpenGalleryId] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const {
    loadingText = 'Loading galleries...',
    emptyText = 'No galleries yet',
    photosText = 'photos',
    viewGalleryText = 'View Gallery',
  } = labels

  const toggleGallery = (id) => {
    setLightboxIndex(null)
    setOpenGalleryId(prev => prev === id ? null : id)
  }

  const openGallery = galleries.find(g => g.id === openGalleryId)
  const openPictureUrls = openGallery
    ? openGallery.pictures.map(p => pb.files.getURL(p, p.image))
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 space-x-3">
        <LoadingSpinner size="lg" />
        <span className="text-brand-muted">{loadingText}</span>
      </div>
    )
  }

  if (galleries.length === 0) {
    return (
      <p className="text-center text-brand-muted py-24">
        {emptyText}
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => {
          const cover = gallery.pictures[0]

          return (
            <div
              key={gallery.id}
              onClick={() => toggleGallery(gallery.id)}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg cursor-pointer"
            >
              {cover ? (
                <img
                  src={pb.files.getURL(cover, cover.image, { thumb: '600x800' })}
                  alt={gallery.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-brand-dark flex items-center justify-center">
                  <span className="text-brand-muted text-sm">{emptyText}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col items-center justify-center px-4 text-center">
                <h2 className="font-display text-2xl md:text-3xl text-brand-warm italic mb-2">
                  {gallery.name}
                </h2>
                <p className="text-brand-bronze text-xs tracking-widest uppercase">
                  {gallery.pictures.length} {photosText}
                </p>
                <span className="mt-4 text-brand-offwhite text-xs tracking-display uppercase opacity-80">
                  {viewGalleryText}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {openGallery && (
        <div className="fixed inset-0 bg-brand-black z-[60] flex flex-col">
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-brand-charcoal">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-brand-warm italic">
                {openGallery.name}
              </h2>
              <p className="text-brand-bronze text-xs tracking-widest uppercase mt-1">
                {openGallery.pictures.length} {photosText}
              </p>
            </div>
            <button
              onClick={() => { setOpenGalleryId(null); setLightboxIndex(null) }}
              className="px-4 py-2 bg-brand-charcoal hover:bg-brand-charcoal/80 text-brand-warm rounded-md transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <GalleryGrid
              images={openPictureUrls}
              onImageClick={setLightboxIndex}
              columns={3}
            />
          </div>
        </div>
      )}

      {lightboxIndex !== null && openGallery && (
        <div
          className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 px-4 py-2 bg-brand-charcoal hover:bg-brand-charcoal/80 text-brand-warm rounded-md transition-colors text-sm"
          >
            ✕
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 px-3 py-4 bg-black/50 hover:bg-black/70 text-white rounded-md transition-colors text-xl"
            >
              ‹
            </button>
          )}

          <img
            src={openPictureUrls[lightboxIndex]}
            alt={`${openGallery.name} — ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[85vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < openPictureUrls.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-4 bg-black/50 hover:bg-black/70 text-white rounded-md transition-colors text-xl"
            >
              ›
            </button>
          )}

          <div className="absolute bottom-4 text-brand-muted text-sm">
            {lightboxIndex + 1} / {openPictureUrls.length}
          </div>
        </div>
      )}
    </>
  )
}

export default GalleryCardGrid
