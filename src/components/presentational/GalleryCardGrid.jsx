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

const GalleryCardGrid = ({ galleries, loading, labels = {} }) => {
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

  return (
    <>
      {/* Gallery Cards Grid — Responsive 4 columns max with consistent 3:2 ratio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {galleries.map((gallery) => {
          const cover = gallery.pictures[0]

          return (
            <div
              key={gallery.id}
              onClick={() => toggleGallery(gallery.id)}
              className="group flex flex-col bg-brand-dark border border-brand-charcoal/70 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-brand-bronze/60 hover:shadow-xl hover:shadow-brand-bronze/5"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-brand-black">
                {cover ? (
                  <img
                    src={pb.files.getURL(cover, cover.image, { thumb: '600x400' })}
                    alt={gallery.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs">
                    {emptyText}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                {gallery.type && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-brand-black/70 backdrop-blur-md border border-brand-charcoal text-[10px] font-heading font-semibold uppercase tracking-wider text-brand-bronze rounded-full">
                    {gallery.type}
                  </span>
                )}

                <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-brand-black/70 backdrop-blur-md text-[11px] font-body text-brand-offwhite/90 rounded-full">
                  {gallery.pictures.length} {photosText}
                </span>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-display text-xl text-brand-warm group-hover:text-brand-bronze transition-colors line-clamp-1 italic">
                    {gallery.name}
                  </h3>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-brand-muted font-heading uppercase tracking-widest pt-3 border-t border-brand-charcoal/40">
                  <span>{viewGalleryText}</span>
                  <span className="text-brand-bronze transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
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
