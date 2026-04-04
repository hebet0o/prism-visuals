import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import pb from '../utils/pocketbase'
import LoadingSpinner from '../components/LoadingSpinner'

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
      console.log('Stored password:', galleryRecord?.password)

      if (!galleryRecord) {
        setError(t('gallery.notFound') || 'Gallery not found')
        return
      }

      // Verify password (in production, this should be done server-side)
      // For now, we'll do client-side verification
      if (password === galleryRecord.password) {
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

  const handleDownloadAll = () => {
    // In a real implementation, this would create a zip file
    // For now, we'll open each image in a new tab
    pictures.forEach(picture => {
      window.open(pb.files.getUrl(picture, picture.image), '_blank')
    })
  }

  const handleDownloadSingle = (picture) => {
    window.open(pb.files.getUrl(picture, picture.image), '_blank')
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
      {/* Header */}
      <div className="bg-brand-dark border-b border-brand-charcoal">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-display text-2xl text-brand-warm">
              {gallery?.name || 'Gallery'}
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={handleDownloadAll}
                className="px-4 py-2 bg-brand-bronze hover:bg-brand-bronze/80 text-brand-black rounded-md transition-colors"
              >
                {t('gallery.downloadAll') || 'Download All'}
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(`gallery_auth_${name}`)
                  setIsAuthenticated(false)
                  setPassword('')
                }}
                className="px-4 py-2 bg-brand-charcoal hover:bg-brand-charcoal/80 text-brand-warm rounded-md transition-colors"
              >
                {t('gallery.logout') || 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
            {pictures.map((picture) => (
              <div key={picture.id} className="group relative bg-brand-dark rounded-lg overflow-hidden">
                <img
                  src={pb.files.getUrl(picture, picture.image)}
                  alt={`Gallery image ${picture.id}`}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button
                    onClick={() => handleDownloadSingle(picture)}
                    className="px-4 py-2 bg-brand-bronze hover:bg-brand-bronze/80 text-brand-black rounded-md transition-colors"
                  >
                    {t('gallery.download') || 'Download'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GalleryPage