import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import JSZip from 'jszip'
import pb from '../utils/pocketbase'
import LoadingSpinner from '../components/LoadingSpinner'

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
)

// Returns items distributed into `colCount` columns, shortest column first.
// `heights` is a Map of item key → rendered pixel height, updated via onLoad callbacks.
function buildColumns(items, colCount, heights) {
  const cols = Array.from({ length: colCount }, () => ({ items: [], height: 0 }))
  for (const item of items) {
    const shortest = cols.reduce((a, b) => a.height <= b.height ? a : b)
    shortest.items.push(item)
    shortest.height += heights.get(item.id) ?? 300 // default estimate before image loads
  }
  return cols.map(c => c.items)
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

const GalleryPage = () => {
  const { t } = useTranslation()
  const { name } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [gallery, setGallery] = useState(null)
  const [pictures, setPictures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [downloadingSingle, setDownloadingSingle] = useState(false)
  const [likedIds, setLikedIds] = useState(new Set())
  const [downloadingLiked, setDownloadingLiked] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [pendingLeave, setPendingLeave] = useState(null)
  const [layout, setLayout] = useState('masonry')
  const [showLikedOnly, setShowLikedOnly] = useState(false)
  const masonryRef = useRef(null)
  const colCount = useColCount(masonryRef)
  const [imgHeights, setImgHeights] = useState(() => new Map())
  const registerHeight = useCallback((id, h) => {
    setImgHeights(prev => {
      if (prev.get(id) === h) return prev
      const next = new Map(prev)
      next.set(id, h)
      return next
    })
  }, [])

  useEffect(() => {
    // Check if user is already authenticated for this gallery
    const authKey = `gallery_auth_${name}`
    const storedAuth = localStorage.getItem(authKey)
    console.log('Checking auth for key:', authKey, 'value:', storedAuth)
    const isAuth = storedAuth === 'true'
    if (isAuth) {
      console.log('User already authenticated, loading gallery')
      setIsAuthenticated(true)
      loadGallery()
    } else {
      console.log('User not authenticated')
      setLoading(false)
    }
  }, [name])

  // Intercept browser refresh/tab-close when there are likes
  useEffect(() => {
    if (likedIds.size === 0) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [likedIds])

  const toggleLike = useCallback((id) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleDownloadLiked = async () => {
    const liked = pictures.filter(p => likedIds.has(p.id))
    if (!liked.length) return
    setDownloadingLiked(true)
    const zip = new JSZip()
    await Promise.all(liked.map(async (picture, index) => {
      const url = pb.files.getURL(picture, picture.image)
      const response = await fetch(url)
      const blob = await response.blob()
      const ext = picture.image.split('.').pop()
      zip.file(`${index + 1}.${ext}`, blob)
    }))
    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = `${gallery?.name || 'gallery'}-liked.zip`
    a.click()
    URL.revokeObjectURL(a.href)
    setDownloadingLiked(false)
  }

  const requestLeave = (action) => {
    if (likedIds.size > 0) {
      setPendingLeave(() => action)
      setShowLeaveModal(true)
    } else {
      action()
    }
  }

  const confirmLeave = () => {
    setShowLeaveModal(false)
    setLikedIds(new Set())
    pendingLeave?.()
  }

  const loadGallery = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('Loading gallery for slug:', name)

      // Find gallery by slug instead of name
      const galleryRecord = await pb.collection('galleries').getFirstListItem(`slug = "${name}"`)
      console.log('Gallery record:', galleryRecord)

      if (!galleryRecord) {
        setError(t('gallery.notFound') || 'Gallery not found')
        return
      }

      setGallery(galleryRecord)

      // Load first page immediately so the grid renders fast, then fetch remaining pages
      const PAGE_SIZE = 50
      const first = await pb.collection('pictures').getList(1, PAGE_SIZE, {
        filter: `gallery = "${galleryRecord.id}"`,
        sort: 'created'
      })
      setPictures(first.items)
      setLoading(false)

      if (first.totalPages > 1) {
        const remaining = await Promise.all(
          Array.from({ length: first.totalPages - 1 }, (_, i) =>
            pb.collection('pictures').getList(i + 2, PAGE_SIZE, {
              filter: `gallery = "${galleryRecord.id}"`,
              sort: 'created'
            })
          )
        )
        setPictures([...first.items, ...remaining.flatMap(p => p.items)])
      }
    } catch (error) {
      console.error('Failed to load gallery:', error)
      setError(t('gallery.loadError') || 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')

    try {
      console.log('Attempting to authenticate for gallery slug:', name)

      // Find gallery by slug instead of name
      const galleryRecord = await pb.collection('galleries').getFirstListItem(`slug = "${name}"`)
      console.log('Found gallery:', galleryRecord)
      console.log('Entered password:', password)
      console.log('Stored password:', galleryRecord?.passwordHash)

      if (!galleryRecord) {
        setError(t('gallery.notFound') || 'Gallery not found')
        return
      }

      if (password === galleryRecord.passwordHash) {
        console.log('Password correct, authenticating...')
        setIsAuthenticated(true)
        setGallery(galleryRecord)
        localStorage.setItem(`gallery_auth_${name}`, 'true')
        await loadGallery()
      } else {
        console.log('Password incorrect')
        setError(t('gallery.wrongPassword') || 'Wrong password')
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      setError(t('gallery.authError') || 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleDownloadAll = async () => {
    setDownloadingAll(true)
    const zip = new JSZip()
    await Promise.all(pictures.map(async (picture, index) => {
      const url = pb.files.getURL(picture, picture.image)
      const response = await fetch(url)
      const blob = await response.blob()
      const ext = picture.image.split('.').pop()
      zip.file(`${index + 1}.${ext}`, blob)
    }))
    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = `${gallery?.name || 'gallery'}.zip`
    a.click()
    URL.revokeObjectURL(a.href)
    setDownloadingAll(false)
  }

  const handleDownloadSingle = async (picture) => {
    setDownloadingSingle(true)
    const url = pb.files.getURL(picture, picture.image)
    const response = await fetch(url)
    const blob = await response.blob()
    const ext = picture.image.split('.').pop()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = picture.image || `image.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
    setDownloadingSingle(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <LoadingSpinner size="lg" />
          <span className="text-brand-warm text-lg">{t('gallery.loading') || 'Loading gallery...'}</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-brand-warm mb-4">
              {t('gallery.title') || 'Gallery Access'}
            </h1>
            <p className="text-brand-muted">
              {t('gallery.subtitle') || 'Enter the password to access this gallery'}
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="bg-brand-dark p-8 rounded-lg">
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-8">
              <label htmlFor="password" className="block text-brand-warm font-medium mb-2">
                {t('gallery.password') || 'Password'}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-brand-black border border-brand-charcoal rounded-md text-brand-warm placeholder-brand-muted focus:outline-none focus:border-brand-bronze"
                placeholder={t('gallery.passwordPlaceholder') || 'Enter gallery password'}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {authLoading && <LoadingSpinner size="sm" />}
              <span>{authLoading ? (t('gallery.accessing') || 'Accessing...') : (t('gallery.submit') || 'Access Gallery')}</span>
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero Header */}
      <div className="relative bg-brand-dark border-b border-brand-charcoal/50 py-16 px-6 text-center">
        <p className="section-label mb-4">{t('gallery.privateGallery') || 'Private Gallery'}</p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-warm tracking-display mb-4">
          {gallery?.name || 'Gallery'}
        </h1>
        <span className="divider-line" />
        <p className="text-brand-muted text-sm mt-4">
          {pictures.length} {pictures.length === 1 ? (t('gallery.photo') || 'photo') : (t('gallery.photos') || 'photos')}
        </p>

        {/* Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="px-6 py-2.5 bg-brand-bronze hover:bg-brand-bronze/80 text-brand-black rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm font-medium"
          >
            {downloadingAll && <LoadingSpinner size="sm" />}
            <span>{downloadingAll ? t('gallery.downloading') : t('gallery.downloadAll')}</span>
          </button>
          {likedIds.size > 0 && (
            <button
              onClick={handleDownloadLiked}
              disabled={downloadingLiked}
              className="px-6 py-2.5 bg-transparent border border-brand-bronze/50 hover:border-brand-bronze text-brand-bronze rounded-md transition-colors text-sm flex items-center space-x-2 disabled:opacity-50"
            >
              {downloadingLiked ? <LoadingSpinner size="sm" /> : <HeartIcon filled />}
              <span>{downloadingLiked ? t('gallery.downloading') : t('gallery.downloadLiked')}</span>
            </button>
          )}
          <button
            onClick={() => requestLeave(() => {
              localStorage.removeItem(`gallery_auth_${name}`)
              setIsAuthenticated(false)
              setPassword('')
            })}
            className="px-6 py-2.5 bg-transparent border border-brand-charcoal hover:border-brand-muted text-brand-muted hover:text-brand-warm rounded-md transition-colors text-sm"
          >
            {t('gallery.logout') || 'Logout'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        {/* Layout toggles */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setLayout('masonry')}
            title={t('gallery.layoutMasonry')}
            className={`p-2 rounded-md transition-colors ${layout === 'masonry' ? 'text-brand-bronze' : 'text-brand-muted hover:text-brand-warm'}`}
          >
            {/* Masonry / columns icon */}
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
              <rect x="2" y="2" width="5" height="8" rx="1"/>
              <rect x="2" y="12" width="5" height="6" rx="1"/>
              <rect x="7.5" y="2" width="5" height="5" rx="1"/>
              <rect x="7.5" y="9" width="5" height="9" rx="1"/>
              <rect x="13" y="2" width="5" height="11" rx="1"/>
              <rect x="13" y="15" width="5" height="3" rx="1"/>
            </svg>
          </button>
          <button
            onClick={() => setLayout('grid')}
            title={t('gallery.layoutGrid')}
            className={`p-2 rounded-md transition-colors ${layout === 'grid' ? 'text-brand-bronze' : 'text-brand-muted hover:text-brand-warm'}`}
          >
            {/* Grid icon */}
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
              <rect x="2" y="2" width="7" height="7" rx="1"/>
              <rect x="11" y="2" width="7" height="7" rx="1"/>
              <rect x="2" y="11" width="7" height="7" rx="1"/>
              <rect x="11" y="11" width="7" height="7" rx="1"/>
            </svg>
          </button>
        </div>

        {/* Liked filter */}
        <button
          onClick={() => { setLightboxIndex(null); setShowLikedOnly(p => !p) }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm transition-colors ${
            showLikedOnly
              ? 'bg-brand-bronze/10 border border-brand-bronze/40 text-brand-bronze'
              : 'border border-brand-charcoal text-brand-muted hover:text-brand-warm hover:border-brand-muted'
          }`}
        >
          <HeartIcon filled={showLikedOnly} />
          <span>{showLikedOnly ? t('gallery.filterLikedActive') : t('gallery.filterLiked')}</span>
          {likedIds.size > 0 && <span className="text-xs opacity-60">({likedIds.size})</span>}
        </button>
      </div>

      {/* Gallery */}
      {(() => {
        const visiblePictures = showLikedOnly ? pictures.filter(p => likedIds.has(p.id)) : pictures

        const PictureCard = ({ picture, index }) => {
          const liked = likedIds.has(picture.id)
          return (
            <div
              className="group relative overflow-hidden cursor-pointer"
              onClick={() => setLightboxIndex(index)}
            >
              <img
                src={pb.files.getURL(picture, picture.image, { thumb: '0x800' })}
                alt={`Gallery image ${index + 1}`}
                className={`w-full block transition-opacity duration-300 hover:opacity-90 ${layout === 'grid' ? 'aspect-square object-cover' : 'h-auto'}`}
                loading="lazy"
              />
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(picture.id) }}
                className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                  liked
                    ? 'bg-brand-bronze text-brand-black opacity-100'
                    : 'bg-black/40 text-brand-warm opacity-0 group-hover:opacity-100'
                }`}
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                <HeartIcon filled={liked} />
              </button>
            </div>
          )
        }

        if (showLikedOnly && visiblePictures.length === 0) {
          return (
            <div className="text-center py-24 px-6">
              <div className="flex justify-center mb-4 text-brand-charcoal">
                <HeartIcon filled />
              </div>
              <p className="text-brand-warm text-lg mb-2">{t('gallery.noLikedYet')}</p>
              <p className="text-brand-muted text-sm">{t('gallery.noLikedHint')}</p>
            </div>
          )
        }

        if (pictures.length === 0) {
          return (
            <div className="text-center py-24 px-6">
              <p className="text-brand-muted">{t('gallery.noPictures')}</p>
            </div>
          )
        }

        return (
          <div className="max-w-7xl mx-auto px-6 pb-12">
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {layout === 'masonry' ? (
              <div ref={masonryRef} className="flex gap-2">
                {buildColumns(visiblePictures, colCount, imgHeights).map((col, ci) => (
                  <div key={ci} className="flex-1 flex flex-col gap-2">
                    {col.map((picture, index) => {
                      const globalIndex = visiblePictures.indexOf(picture)
                      return (
                        <div key={picture.id} className="group relative overflow-hidden cursor-pointer"
                          onClick={() => setLightboxIndex(globalIndex)}>
                          <img
                            src={pb.files.getURL(picture, picture.image, { thumb: '0x800' })}
                            alt={`Gallery image ${globalIndex + 1}`}
                            className="w-full h-auto block transition-opacity duration-300 hover:opacity-90"
                            loading="lazy"
                            onLoad={e => registerHeight(picture.id, e.currentTarget.offsetHeight)}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleLike(picture.id) }}
                            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                              likedIds.has(picture.id)
                                ? 'bg-brand-bronze text-brand-black opacity-100'
                                : 'bg-black/40 text-brand-warm opacity-0 group-hover:opacity-100'
                            }`}
                            aria-label={likedIds.has(picture.id) ? 'Unlike' : 'Like'}
                          >
                            <HeartIcon filled={likedIds.has(picture.id)} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {visiblePictures.map((picture, index) => (
                  <PictureCard key={picture.id} picture={picture} index={index} />
                ))}
              </div>
            )}

            {lightboxIndex !== null && (
              <div
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                onClick={() => setLightboxIndex(null)}
              >
                <div className="absolute top-4 right-4 flex space-x-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(visiblePictures[lightboxIndex].id) }}
                    className={`p-2.5 rounded-full transition-all duration-200 ${
                      likedIds.has(visiblePictures[lightboxIndex].id)
                        ? 'bg-brand-bronze text-brand-black'
                        : 'bg-brand-charcoal text-brand-warm hover:bg-brand-charcoal/80'
                    }`}
                  >
                    <HeartIcon filled={likedIds.has(visiblePictures[lightboxIndex].id)} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownloadSingle(visiblePictures[lightboxIndex]) }}
                    disabled={downloadingSingle}
                    className="px-4 py-2 bg-brand-bronze hover:bg-brand-bronze/80 text-brand-black rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {downloadingSingle && <LoadingSpinner size="sm" />}
                    <span>{downloadingSingle ? t('gallery.downloading') : t('gallery.download')}</span>
                  </button>
                  <button
                    onClick={() => setLightboxIndex(null)}
                    className="px-4 py-2 bg-brand-charcoal hover:bg-brand-charcoal/80 text-brand-warm rounded-md transition-colors text-sm font-medium"
                  >
                    ✕
                  </button>
                </div>

                {lightboxIndex > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 px-3 py-4 bg-black/50 hover:bg-black/70 text-white rounded-md transition-colors text-xl"
                  >
                    ‹
                  </button>
                )}

                <img
                  src={pb.files.getURL(visiblePictures[lightboxIndex], visiblePictures[lightboxIndex].image)}
                  alt={`Gallery image ${lightboxIndex + 1}`}
                  className="max-h-[85vh] max-w-[85vw] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />

                {lightboxIndex < visiblePictures.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-4 bg-black/50 hover:bg-black/70 text-white rounded-md transition-colors text-xl"
                  >
                    ›
                  </button>
                )}

                <div className="absolute bottom-4 text-brand-muted text-sm">
                  {lightboxIndex + 1} / {visiblePictures.length}
                </div>
              </div>
            )}
          </div>
        )
      })()}
      {/* Leave confirmation modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-6">
          <div className="bg-brand-dark border border-brand-charcoal rounded-lg max-w-md w-full p-8 text-center">
            <div className="flex justify-center mb-4 text-brand-bronze">
              <HeartIcon filled />
            </div>
            <h2 className="font-display text-2xl text-brand-warm mb-3">
              {t('gallery.unsavedLikes')}
            </h2>
            <p className="text-brand-muted text-sm mb-8 leading-relaxed">
              {t('gallery.unsavedLikesBody', { count: likedIds.size })}
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={async () => {
                  setShowLeaveModal(false)
                  await handleDownloadLiked()
                  confirmLeave()
                }}
                disabled={downloadingLiked}
                className="w-full px-6 py-3 bg-brand-bronze hover:bg-brand-bronze/80 text-brand-black rounded-md transition-colors text-sm font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {downloadingLiked ? <LoadingSpinner size="sm" /> : <HeartIcon filled />}
                <span>{downloadingLiked ? t('gallery.downloading') : t('gallery.downloadBeforeLeaving')}</span>
              </button>
              <button
                onClick={confirmLeave}
                className="w-full px-6 py-3 bg-transparent border border-brand-charcoal hover:border-red-500/50 text-brand-muted hover:text-red-400 rounded-md transition-colors text-sm"
              >
                {t('gallery.leaveAnyway')}
              </button>
              <button
                onClick={() => { setShowLeaveModal(false); setPendingLeave(null) }}
                className="w-full px-6 py-3 bg-transparent text-brand-muted hover:text-brand-warm transition-colors text-sm"
              >
                {t('gallery.stayHere')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage