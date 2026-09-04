import { useState, useEffect, useCallback, useRef } from 'react'
import pb from '../../utils/pocketbase'
import LoadingSpinner from '../LoadingSpinner'

function buildColumns(items, colCount, heights) {
  const cols = Array.from({ length: colCount }, () => ({ items: [], height: 0 }))
  for (const item of items) {
    const shortest = cols.reduce((a, b) => (a.height <= b.height ? a : b))
    shortest.items.push(item)
    shortest.height += heights.get(item.id) ?? 300
  }
  return cols.map((c) => c.items)
}

function useColCount(containerRef) {
  const [colCount, setColCount] = useState(3)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const compute = () => {
      const w = el.offsetWidth
      if (w >= 1280) setColCount(5)
      else if (w >= 1024) setColCount(4)
      else if (w >= 640) setColCount(3)
      else setColCount(2)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [containerRef])
  return colCount
}

const GalleryCardGrid = ({ galleries, loading, labels = {}, columns = 3 }) => {
  const [openGalleryId, setOpenGalleryId] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [layout, setLayout] = useState('masonry')

  const masonryRef = useRef(null)
  const colCount = useColCount(masonryRef)
  const [imgHeights, setImgHeights] = useState(() => new Map())

  const registerHeight = useCallback((id, h) => {
    setImgHeights((prev) => {
      if (prev.get(id) === h) return prev
      const next = new Map(prev)
      next.set(id, h)
      return next
    })
  }, [])

  const {
    loadingText = 'Loading galleries...',
    emptyText = 'No galleries yet',
    photosText = 'photos',
    viewGalleryText = 'View Gallery',
  } = labels

  const toggleGallery = (id) => {
    setLightboxIndex(null)
    setOpenGalleryId((prev) => (prev === id ? null : id))
  }

  const openGallery = galleries.find((g) => g.id === openGalleryId)

  // Disable background scrolling when open gallery overlay or lightbox is active
  useEffect(() => {
    if (openGalleryId || lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [openGalleryId, lightboxIndex])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null || !openGallery) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : prev))
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev < openGallery.pictures.length - 1 ? prev + 1 : prev
        )
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, openGallery])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 space-x-3">
        <LoadingSpinner size="lg" />
        <span className="text-brand-muted">{loadingText}</span>
      </div>
    )
  }

  if (galleries.length === 0) {
    return <p className="text-center text-brand-muted py-24">{emptyText}</p>
  }

  const gridClass =
    columns === 2
      ? 'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10'
      : columns === 4
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
      : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8'

  return (
    <>
      {/* Clean full-bleed picture cards — hover dark overlay with gallery title */}
      <div className={gridClass}>
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

              <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col items-center justify-center px-6 text-center">
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-brand-warm italic mb-2">
                  {gallery.name}
                </h2>
                <p className="text-brand-bronze text-xs tracking-widest uppercase">
                  {gallery.pictures.length} {photosText}
                </p>
                <span className="mt-4 text-brand-offwhite text-xs tracking-display uppercase opacity-80 border-b border-brand-bronze/40 pb-1">
                  {viewGalleryText}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Opened Gallery Fullscreen View — exact same layout as private galleries */}
      {openGallery && (
        <div className="fixed inset-0 bg-brand-black z-[60] flex flex-col overflow-hidden">
          {/* Header matching private gallery */}
          <div className="flex-shrink-0 bg-brand-dark border-b border-brand-charcoal/50 py-10 px-6 relative text-center">
            <button
              onClick={() => {
                setOpenGalleryId(null)
                setLightboxIndex(null)
              }}
              className="absolute top-6 right-6 px-4 py-2 bg-brand-charcoal/80 hover:bg-brand-charcoal text-brand-warm rounded-md transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <span>✕</span>
              <span className="hidden sm:inline">Close</span>
            </button>

            <p className="section-label mb-2 uppercase tracking-widest text-xs font-heading font-semibold text-brand-bronze">
              {openGallery.type ? openGallery.type : 'Gallery'}
            </p>
            <h1 className="font-display text-3xl md:text-5xl text-brand-warm tracking-display mb-3 font-normal italic">
              {openGallery.name}
            </h1>
            <span className="divider-line my-3 block w-12 h-px bg-brand-bronze mx-auto" />
            <p className="text-brand-muted text-xs tracking-widest uppercase mt-2">
              {openGallery.pictures.length} {photosText}
            </p>
          </div>

          {/* Toolbar with Masonry / Grid Toggle */}
          <div className="max-w-7xl w-full mx-auto px-6 py-4 flex items-center justify-between border-b border-brand-charcoal/30">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setLayout('masonry')}
                title="Masonry Layout"
                className={`p-2 rounded-md transition-colors ${
                  layout === 'masonry'
                    ? 'text-brand-bronze bg-brand-dark'
                    : 'text-brand-muted hover:text-brand-warm'
                }`}
              >
                <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                  <rect x="2" y="2" width="5" height="8" rx="1" />
                  <rect x="2" y="12" width="5" height="6" rx="1" />
                  <rect x="7.5" y="2" width="5" height="5" rx="1" />
                  <rect x="7.5" y="9" width="5" height="9" rx="1" />
                  <rect x="13" y="2" width="5" height="11" rx="1" />
                  <rect x="13" y="15" width="5" height="3" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setLayout('grid')}
                title="Grid Layout"
                className={`p-2 rounded-md transition-colors ${
                  layout === 'grid'
                    ? 'text-brand-bronze bg-brand-dark'
                    : 'text-brand-muted hover:text-brand-warm'
                }`}
              >
                <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                  <rect x="2" y="2" width="7" height="7" rx="1" />
                  <rect x="11" y="2" width="7" height="7" rx="1" />
                  <rect x="2" y="11" width="7" height="7" rx="1" />
                  <rect x="11" y="11" width="7" height="7" rx="1" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-brand-muted font-body font-light hidden sm:block">
              Click any photo for lightbox view
            </p>
          </div>

          {/* Gallery Pictures Body — Masonry vs Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-8 max-w-7xl w-full mx-auto">
            {layout === 'masonry' ? (
              <div ref={masonryRef} className="flex gap-2">
                {buildColumns(openGallery.pictures, colCount, imgHeights).map(
                  (col, ci) => (
                    <div key={ci} className="flex-1 flex flex-col gap-2">
                      {col.map((picture) => {
                        const globalIndex = openGallery.pictures.indexOf(picture)
                        return (
                          <div
                            key={picture.id}
                            className="group relative overflow-hidden cursor-pointer rounded bg-brand-dark"
                            onClick={() => setLightboxIndex(globalIndex)}
                          >
                            <img
                              src={pb.files.getURL(picture, picture.image, {
                                thumb: '0x800',
                              })}
                              alt={`${openGallery.name} ${globalIndex + 1}`}
                              className="w-full h-auto block transition-opacity duration-300 hover:opacity-90"
                              loading="lazy"
                              onLoad={(e) =>
                                registerHeight(
                                  picture.id,
                                  e.currentTarget.offsetHeight
                                )
                              }
                            />
                          </div>
                        )
                      })}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {openGallery.pictures.map((picture, index) => (
                  <div
                    key={picture.id}
                    className="group relative overflow-hidden cursor-pointer rounded bg-brand-dark"
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img
                      src={pb.files.getURL(picture, picture.image, {
                        thumb: '0x800',
                      })}
                      alt={`${openGallery.name} ${index + 1}`}
                      className="w-full aspect-square object-cover block transition-opacity duration-300 hover:opacity-90"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && openGallery && openGallery.pictures[lightboxIndex] && (
        <div
          className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 px-4 py-2 bg-brand-charcoal hover:bg-brand-charcoal/80 text-brand-warm rounded-md transition-colors text-sm font-medium z-10"
          >
            ✕
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex - 1)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 px-4 py-5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors text-2xl z-10"
            >
              ‹
            </button>
          )}

          <img
            src={pb.files.getURL(
              openGallery.pictures[lightboxIndex],
              openGallery.pictures[lightboxIndex].image
            )}
            alt={`${openGallery.name} — ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[88vw] object-contain select-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < openGallery.pictures.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex + 1)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors text-2xl z-10"
            >
              ›
            </button>
          )}

          <div className="absolute bottom-4 text-brand-muted text-sm font-body tracking-wider">
            {lightboxIndex + 1} / {openGallery.pictures.length}
          </div>
        </div>
      )}
    </>
  )
}

export default GalleryCardGrid
