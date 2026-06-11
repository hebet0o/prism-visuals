import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import JSZip from 'jszip'
import pb from '../utils/pocketbase'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  getStoredGuestToken,
  getStoredGuestName,
  storeGuestToken,
  storeGuestName,
  loadGuestLikesLocal,
  saveGuestLikesLocal,
  generateGuestToken,
  loadGuestUserByToken,
  createGuestUser,
  updateGuestUserLikes,
} from '../utils/guestAuth'

const GalleryPage = () => {
  const { t } = useTranslation()
  const { name } = useParams()
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
  const [downloadLikedLoading, setDownloadLikedLoading] = useState(false)
  const [guest, setGuest] = useState(null)
  const [guestName, setGuestName] = useState('')
  const [guestLoading, setGuestLoading] = useState(true)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [hasSeenGuestPrompt, setHasSeenGuestPrompt] = useState(false)
  const [guestError, setGuestError] = useState('')
  const [likedPictureIds, setLikedPictureIds] = useState([])
  const [showLikedOnly, setShowLikedOnly] = useState(false)
  const [savingLike, setSavingLike] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      const storedToken = getStoredGuestToken()
      const storedName = getStoredGuestName() || ''

      if (storedToken) {
        const loadedGuest = await loadGuestUserByToken(storedToken)

        if (loadedGuest) {
          setGuest(loadedGuest)
          setLikedPictureIds(loadedGuest.likedPhotos)
        } else if (storedName) {
          const fallbackGuest = {
            id: null,
            name: storedName,
            token: storedToken,
            likedPhotos: loadGuestLikesLocal(name),
            localOnly: true,
          }
          setGuest(fallbackGuest)
          setLikedPictureIds(fallbackGuest.likedPhotos)
        }
      } else {
        setGuestName(storedName)
      }

      const authKey = `gallery_auth_${name}`
      const storedAuth = localStorage.getItem(authKey)
      const isAuth = storedAuth === 'true'

      if (isAuth) {
        setIsAuthenticated(true)
        await loadGallery()
        if (!storedName && !hasSeenGuestPrompt) {
          setShowGuestModal(true)
          setHasSeenGuestPrompt(true)
        }
      } else {
        setLoading(false)
      }

      setGuestLoading(false)
    }

    initialize()
  }, [name])

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

      // Load pictures for this gallery
      const picturesRecords = await pb.collection('pictures').getFullList({
        filter: `gallery = "${galleryRecord.id}"`,
        sort: 'created'
      })
      console.log('Pictures records:', picturesRecords)

      setPictures(picturesRecords)
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
        if (!guest?.name) {
          setShowGuestModal(true)
        }
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

  const handleGuestSubmit = async (e) => {
    e.preventDefault()
    setGuestLoading(true)
    setGuestError('')

    const trimmedName = guestName.trim()
    if (!trimmedName) {
      setGuestError(t('gallery.guestNameRequired') || 'Please enter your name')
      setGuestLoading(false)
      return
    }

    const guestToken = getStoredGuestToken() || generateGuestToken()
    const guestRecord = await createGuestUser(trimmedName, guestToken)

    if (guestRecord) {
      storeGuestToken(guestToken)
      storeGuestName(guestRecord.name)
      setGuest(guestRecord)
      setLikedPictureIds(guestRecord.likedPhotos)
    } else {
      storeGuestToken(guestToken)
      storeGuestName(trimmedName)
      const fallbackGuest = {
        id: null,
        name: trimmedName,
        token: guestToken,
        likedPhotos: loadGuestLikesLocal(name),
        localOnly: true,
      }
      setGuest(fallbackGuest)
      setLikedPictureIds(fallbackGuest.likedPhotos)
    }

    setShowGuestModal(false)
    setGuestLoading(false)
  }

  const handleGuestSkip = () => {
    setShowGuestModal(false)
    setHasSeenGuestPrompt(true)
  }

  const handleDownloadLiked = async () => {
    if (likedPictureIds.length === 0) return

    setDownloadLikedLoading(true)
    const zip = new JSZip()
    const likedPictures = pictures.filter((picture) => likedPictureIds.includes(picture.id))

    await Promise.all(likedPictures.map(async (picture, index) => {
      const url = pb.files.getUrl(picture, picture.image)
      const response = await fetch(url)
      const blob = await response.blob()
      const ext = picture.image.split('.').pop()
      zip.file(`${index + 1}.${ext}`, blob)
    }))

    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = `${gallery?.name || 'liked-photos'}.zip`
    a.click()
    URL.revokeObjectURL(a.href)
    setDownloadLikedLoading(false)
  }

  const handleToggleLike = async (pictureId) => {
    if (!guest) {
      setShowGuestModal(true)
      setHasSeenGuestPrompt(true)
      return
    }

    setSavingLike(true)
    const nextLikes = likedPictureIds.includes(pictureId)
      ? likedPictureIds.filter((id) => id !== pictureId)
      : [...likedPictureIds, pictureId]

    setLikedPictureIds(nextLikes)
    saveGuestLikesLocal(name, nextLikes)

    if (guest.id && !guest.localOnly) {
      const updatedLikes = await updateGuestUserLikes(guest.id, nextLikes)
      if (updatedLikes) {
        setGuest((prev) => ({ ...prev, likedPhotos: updatedLikes }))
      } else {
        setGuest((prev) => ({ ...prev, likedPhotos: nextLikes, localOnly: true }))
      }
    } else {
      setGuest((prev) => ({ ...prev, likedPhotos: nextLikes, localOnly: true }))
    }

    setSavingLike(false)
  }

  const isPictureLiked = (pictureId) => likedPictureIds.includes(pictureId)

  const handleDownloadAll = async () => {
    setDownloadingAll(true)
    const zip = new JSZip()
    await Promise.all(pictures.map(async (picture, index) => {
      const url = pb.files.getUrl(picture, picture.image)
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
    const url = pb.files.getUrl(picture, picture.image)
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

  if (guestLoading || (loading && !isAuthenticated) || (isAuthenticated && loading && !gallery)) {
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

  const likedCount = likedPictureIds.length
  const displayedPictures = showLikedOnly
    ? pictures.filter((picture) => isPictureLiked(picture.id))
    : pictures

  return (
    <div className="min-h-screen bg-brand-black">
      {showGuestModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={handleGuestSkip}
        >
          <div
            className="max-w-lg w-full bg-brand-dark border border-brand-charcoal rounded-3xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="font-display text-3xl text-brand-warm mb-3">
                {t('gallery.guestTitle') || 'Who are you?'}
              </h2>
              <p className="text-brand-muted">
                {t('gallery.guestDescription') || 'Share your name so we can save your liked photos and make your next visit smoother. You can skip this step and still browse the gallery.'}
              </p>
            </div>

            <form onSubmit={handleGuestSubmit} className="space-y-6">
              {guestError && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-md">
                  <p className="text-red-400 text-sm">{guestError}</p>
                </div>
              )}

              <div>
                <label htmlFor="guestName" className="block text-brand-warm font-medium mb-2">
                  {t('gallery.guestName') || 'Your name'}
                </label>
                <input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-black border border-brand-charcoal rounded-md text-brand-warm placeholder-brand-muted focus:outline-none focus:border-brand-bronze"
                  placeholder={t('gallery.guestNamePlaceholder') || 'Enter your name'}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={guestLoading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {guestLoading && <LoadingSpinner size="sm" />}
                  <span>{guestLoading ? (t('gallery.guestLoading') || 'Saving...') : (t('gallery.guestContinue') || 'Continue')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleGuestSkip}
                  className="flex-1 px-5 py-3 border border-brand-charcoal rounded-md text-brand-muted hover:text-brand-warm transition-colors"
                >
                  {t('gallery.skipGuest') || 'Skip for now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative bg-brand-dark border-b border-brand-charcoal/50 py-16 px-6 text-center">
        <p className="section-label mb-4">{t('gallery.privateGallery') || 'Private Gallery'}</p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-warm tracking-display mb-4">
          {gallery?.name || 'Gallery'}
        </h1>
        <span className="divider-line" />
        <p className="text-brand-muted text-sm mt-4">
          {displayedPictures.length} {displayedPictures.length === 1 ? (t('gallery.photo') || 'photo') : (t('gallery.photos') || 'photos')}
        </p>
        {guest?.name && (
          <p className="text-brand-muted text-sm mt-2">
            {(t('gallery.welcomeBack') || 'Welcome back')}, {guest.name}
          </p>
        )}
        {likedCount > 0 && (
          <p className="text-brand-muted text-sm mt-2">
            {likedCount} {likedCount === 1 ? (t('gallery.likedCount') || 'liked photo') : (t('gallery.likedCount') || 'liked photos')}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4 mt-8 sm:flex-row">
          <button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="px-6 py-2.5 bg-brand-bronze hover:bg-brand-bronze/80 text-brand-black rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm font-medium"
          >
            {downloadingAll && <LoadingSpinner size="sm" />}
            <span>{downloadingAll ? t('gallery.downloading') || 'Downloading...' : t('gallery.downloadAll')}</span>
          </button>
          {likedCount > 0 && (
            <button
              onClick={handleDownloadLiked}
              disabled={downloadLikedLoading}
              className="px-6 py-2.5 bg-brand-warm hover:bg-brand-warm/80 text-black rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm font-medium"
            >
              {downloadLikedLoading && <LoadingSpinner size="sm" />}
              <span>{downloadLikedLoading ? (t('gallery.downloading') || 'Downloading...') : (t('gallery.downloadLiked') || 'Download Liked')}</span>
            </button>
          )}
          <button
            onClick={() => {
              localStorage.removeItem(`gallery_auth_${name}`)
              setIsAuthenticated(false)
              setPassword('')
            }}
            className="px-6 py-2.5 bg-transparent border border-brand-charcoal hover:border-brand-muted text-brand-muted hover:text-brand-warm rounded-md transition-colors text-sm"
          >
            {t('gallery.logout') || 'Logout'}
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-brand-warm">{t('gallery.title') || 'Gallery Access'}</h2>
            <p className="text-brand-muted text-sm">
              {t('gallery.subtitle') || 'Enter the password to access this gallery'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowLikedOnly((prev) => !prev)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition ${showLikedOnly ? 'bg-brand-warm text-brand-black' : 'bg-brand-dark border border-brand-charcoal text-brand-muted hover:bg-brand-charcoal'}`}
            >
              {showLikedOnly ? (t('gallery.filterLikedActive') || 'Showing liked photos') : (t('gallery.filterLiked') || 'Filter by liked')}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {displayedPictures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-brand-muted">
              {showLikedOnly ? (t('gallery.noLikedYet') || 'No liked photos yet') : (t('gallery.noPictures') || 'No pictures in this gallery yet')}
            </p>
            {showLikedOnly && (
              <p className="text-brand-muted text-sm mt-3">{t('gallery.noLikedHint') || 'Tap the heart on any photo to save it here'}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedPictures.map((picture, index) => (
              <div
                key={picture.id}
                className="relative bg-brand-dark rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleToggleLike(picture.id) }}
                  className={`absolute top-3 right-3 z-10 rounded-full p-2 transition ${isPictureLiked(picture.id) ? 'bg-brand-bronze text-brand-black' : 'bg-black/70 text-white hover:bg-black/90'}`}
                >
                  {isPictureLiked(picture.id) ? '♥' : '♡'}
                </button>
                <img
                  src={pb.files.getUrl(picture, picture.image)}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
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
                onClick={(e) => { e.stopPropagation(); handleDownloadSingle(displayedPictures[lightboxIndex]) }}
                disabled={downloadingSingle}
                className="px-4 py-2 bg-brand-bronze hover:bg-brand-bronze/80 text-brand-black rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {downloadingSingle && <LoadingSpinner size="sm" />}
                <span>{downloadingSingle ? (t('gallery.downloading') || 'Downloading...') : (t('gallery.download') || 'Download')}</span>
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
              src={pb.files.getUrl(displayedPictures[lightboxIndex], displayedPictures[lightboxIndex].image)}
              alt={`Gallery image ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[85vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {lightboxIndex < displayedPictures.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-4 bg-black/50 hover:bg-black/70 text-white rounded-md transition-colors text-xl"
              >
                ›
              </button>
            )}

            <div className="absolute bottom-4 text-brand-muted text-sm">
              {lightboxIndex + 1} / {displayedPictures.length}
            </div>
          </div>
        )}
      </div>
    </div>
  )

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
        {guest?.name && (
          <p className="text-brand-muted text-sm mt-2">
            {t('gallery.welcomeBack') || 'Logged in as'} {guest.name}
          </p>
        )}
        {likedPictureIds.length > 0 && (
          <p className="text-brand-muted text-sm mt-2">
            {likedPictureIds.length} {likedPictureIds.length === 1 ? 'liked photo' : 'liked photos'}
          </p>
        )}

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
          <button
            onClick={() => {
              localStorage.removeItem(`gallery_auth_${name}`)
              setIsAuthenticated(false)
              setPassword('')
            }}
            className="px-6 py-2.5 bg-transparent border border-brand-charcoal hover:border-brand-muted text-brand-muted hover:text-brand-warm rounded-md transition-colors text-sm"
          >
            {t('gallery.logout') || 'Logout'}
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {pictures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-brand-muted">
              {t('gallery.noPictures') || 'No pictures in this gallery yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pictures.map((picture, index) => (
              <div
                key={picture.id}
                className="relative bg-brand-dark rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleToggleLike(picture.id) }}
                  className={`absolute top-3 right-3 z-10 rounded-full p-2 transition ${isPictureLiked(picture.id) ? 'bg-brand-bronze text-brand-black' : 'bg-black/70 text-white hover:bg-black/90'}`}
                >
                  {isPictureLiked(picture.id) ? '♥' : '♡'}
                </button>
                <img
                  src={pb.files.getUrl(picture, picture.image)}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
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
                onClick={(e) => { e.stopPropagation(); handleDownloadSingle(pictures[lightboxIndex]) }}
                disabled={downloadingSingle}
                className="px-4 py-2 bg-brand-bronze hover:bg-brand-bronze/80 text-brand-black rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {downloadingSingle && <LoadingSpinner size="sm" />}
                <span>{downloadingSingle ? (t('gallery.downloading') || 'Downloading...') : (t('gallery.download') || 'Download')}</span>
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
              src={pb.files.getUrl(pictures[lightboxIndex], pictures[lightboxIndex].image)}
              alt={`Gallery image ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[85vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {lightboxIndex < pictures.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-4 bg-black/50 hover:bg-black/70 text-white rounded-md transition-colors text-xl"
              >
                ›
              </button>
            )}

            <div className="absolute bottom-4 text-brand-muted text-sm">
              {lightboxIndex + 1} / {pictures.length}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GalleryPage