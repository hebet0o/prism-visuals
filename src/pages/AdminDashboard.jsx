import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import pb from '../utils/pocketbase'
import { useReviews } from '../hooks/useReviews'
import { slugify } from '../utils/helpers'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminDashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { reviews, deleteReview, toggleReviewVisibility, isLoading: reviewsLoading } = useReviews()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [galleries, setGalleries] = useState([])
  const [galleriesLoading, setGalleriesLoading] = useState(true)
  const [showCreateGallery, setShowCreateGallery] = useState(false)
  const [galleryForm, setGalleryForm] = useState({
    name: '',
    slug: '',
    password: '',
    images: []
  })
  const [galleryFormLoading, setGalleryFormLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null) // { done, total } | null
  const [fileInputKey, setFileInputKey] = useState(0)
  const [editingGallery, setEditingGallery] = useState(null)
  const [deletingGalleryId, setDeletingGalleryId] = useState(null)
  const [togglingReviewId, setTogglingReviewId] = useState(null)
  const [deletingReviewId, setDeletingReviewId] = useState(null)

  // Auto-generate slug when name changes
  useEffect(() => {
    if (galleryForm.name) {
      const generatedSlug = slugify(galleryForm.name)
      setGalleryForm(prev => ({ ...prev, slug: generatedSlug }))
    }
  }, [galleryForm.name])

  useEffect(() => {
    loadGalleries()
  }, [])

  const loadGalleries = async () => {
    try {
      const records = await pb.collection('galleries').getFullList({
        sort: '-created',
        expand: 'createdBy'
      })
      setGalleries(records)
    } catch (error) {
      console.error('Failed to load galleries:', error)
    } finally {
      setGalleriesLoading(false)
    }
  }

  const handleCreateGallery = async (e) => {
    e.preventDefault()
    setGalleryFormLoading(true)
    setUploadProgress(null)

    try {
      const galleryData = {
        name: galleryForm.name,
        slug: galleryForm.slug,
        passwordHash: galleryForm.password,
        createdBy: pb.authStore.model?.id
      }

      const gallery = await pb.collection('galleries').create(galleryData)

      if (galleryForm.images.length > 0) {
        const total = galleryForm.images.length
        let done = 0
        setUploadProgress({ done: 0, total })

        // Upload in batches of 8 concurrent requests
        const CONCURRENCY = 8
        const queue = [...galleryForm.images]
        const failed = []

        const uploadOne = async (image) => {
          try {
            const formData = new FormData()
            formData.append('image', image)
            formData.append('gallery', gallery.id)
            await pb.collection('pictures').create(formData)
          } catch {
            failed.push(image.name)
          } finally {
            done++
            setUploadProgress({ done, total })
          }
        }

        while (queue.length > 0) {
          const batch = queue.splice(0, CONCURRENCY)
          await Promise.all(batch.map(uploadOne))
        }

        if (failed.length > 0) {
          alert(`Uploaded ${done - failed.length} / ${total} photos. ${failed.length} failed: ${failed.slice(0, 5).join(', ')}${failed.length > 5 ? '...' : ''}`)
        }
      }

      setGalleryForm({ name: '', slug: '', password: '', images: [] })
      setFileInputKey(k => k + 1)
      setShowCreateGallery(false)
      setUploadProgress(null)
      loadGalleries()

      alert(t('admin.galleries.createSuccess') || 'Gallery created successfully!')
    } catch (error) {
      console.error('Failed to create gallery:', error)
      alert(t('admin.galleries.createError') || 'Failed to create gallery')
    } finally {
      setGalleryFormLoading(false)
      setUploadProgress(null)
    }
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setGalleryForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
    // Reset the input so the same folder can be re-picked and multiple folders accumulate correctly
    setFileInputKey(k => k + 1)
  }

  const removeImage = (index) => {
    setGalleryForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleLogout = () => {
    pb.authStore.clear()
    navigate('/')
  }

  const startEditingGallery = (gallery) => {
    setEditingGallery(gallery)
    setGalleryForm({
      name: gallery.name,
      slug: gallery.slug,
      password: gallery.passwordHash,
      images: [] // Don't pre-populate images for editing
    })
    setShowCreateGallery(true)
  }

  const cancelEditing = () => {
    setEditingGallery(null)
    setGalleryForm({ name: '', slug: '', password: '', images: [] })
    setShowCreateGallery(false)
  }

  const handleUpdateGallery = async (e) => {
    e.preventDefault()
    setGalleryFormLoading(true)

    try {
      // Update the gallery record
      const updateData = {
        name: galleryForm.name,
        slug: galleryForm.slug,
        passwordHash: galleryForm.password
      }

      // Only update password if it was changed
      if (!galleryForm.password) {
        delete updateData.passwordHash
      }

      await pb.collection('galleries').update(editingGallery.id, updateData)

      // Reload galleries
      loadGalleries()

      // Reset form
      setEditingGallery(null)
      setGalleryForm({ name: '', slug: '', password: '', images: [] })
      setShowCreateGallery(false)

      alert(t('admin.galleries.updateSuccess') || 'Gallery updated successfully!')
    } catch (error) {
      console.error('Failed to update gallery:', error)
      alert(t('admin.galleries.updateError') || 'Failed to update gallery')
    } finally {
      setGalleryFormLoading(false)
    }
  }

  const handleDeleteGallery = async (galleryId, galleryName) => {
    const message = (t('admin.galleries.confirmDelete') || `Are you sure you want to delete the gallery "${galleryName}"? This action cannot be undone.`).replace('{{name}}', galleryName)
    if (window.confirm(message)) {
      setDeletingGalleryId(galleryId)
      try {
        // First delete all pictures in the gallery
        const pictures = await pb.collection('pictures').getFullList({
          filter: `gallery = "${galleryId}"`
        })

        for (const picture of pictures) {
          await pb.collection('pictures').delete(picture.id)
        }

        // Then delete the gallery
        await pb.collection('galleries').delete(galleryId)

        // Reload galleries
        loadGalleries()

        alert(t('admin.galleries.deleteSuccess') || 'Gallery deleted successfully!')
      } catch (error) {
        console.error('Failed to delete gallery:', error)
        alert(t('admin.galleries.deleteError') || 'Failed to delete gallery')
      } finally {
        setDeletingGalleryId(null)
      }
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm(t('admin.reviews.confirmDelete') || 'Are you sure you want to delete this review?')) {
      setDeletingReviewId(reviewId)
      try {
        await deleteReview(reviewId)
      } catch (error) {
        alert(t('admin.reviews.deleteError') || 'Failed to delete review')
      } finally {
        setDeletingReviewId(null)
      }
    }
  }

  const handleToggleVisibility = async (reviewId, currentVisibility) => {
    setTogglingReviewId(reviewId)
    try {
      await toggleReviewVisibility(reviewId, !currentVisibility)
    } catch (error) {
      alert(t('admin.reviews.visibilityError') || 'Failed to update review visibility')
    } finally {
      setTogglingReviewId(null)
    }
  }

  const tabs = [
    { id: 'dashboard', label: t('admin.tabs.dashboard') || 'Dashboard' },
    { id: 'reviews', label: t('admin.tabs.reviews') || 'Reviews' },
    { id: 'galleries', label: t('admin.tabs.galleries') || 'Galleries' },
  ]

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Header */}
      <div className="bg-brand-dark border-b border-brand-charcoal">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-display text-2xl text-brand-warm">
              {t('admin.title') || 'Admin Dashboard'}
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-brand-charcoal hover:bg-brand-charcoal/80 text-brand-warm rounded-md transition-colors"
            >
              {t('admin.logout') || 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-brand-dark border-b border-brand-charcoal">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-bronze text-brand-bronze'
                    : 'border-transparent text-brand-muted hover:text-brand-warm hover:border-brand-warm/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="font-display text-2xl text-brand-warm mb-6">
              {t('admin.dashboard.title') || 'Dashboard Overview'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-brand-dark p-6 rounded-lg">
                <h3 className="font-heading text-lg text-brand-warm mb-2">
                  {t('admin.dashboard.totalReviews') || 'Total Reviews'}
                </h3>
                <p className="text-3xl font-display text-brand-bronze">
                  {reviews.length}
                </p>
              </div>
              <div className="bg-brand-dark p-6 rounded-lg">
                <h3 className="font-heading text-lg text-brand-warm mb-2">
                  {t('admin.dashboard.totalGalleries') || 'Total Galleries'}
                </h3>
                <p className="text-3xl font-display text-brand-bronze">
                  {galleries.length}
                </p>
              </div>
              <div className="bg-brand-dark p-6 rounded-lg">
                <h3 className="font-heading text-lg text-brand-warm mb-2">
                  {t('admin.dashboard.welcome') || 'Welcome'}
                </h3>
                <p className="text-brand-muted">
                  {pb.authStore.model?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h2 className="font-display text-2xl text-brand-warm mb-6">
              {t('admin.reviews.title') || 'Review Management'}
            </h2>
            {reviewsLoading ? (
              <div className="text-brand-muted">Loading reviews...</div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-brand-dark p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-heading text-lg text-brand-warm mb-1">
                          {review.author}
                        </h3>
                        <p className="text-brand-muted text-sm">{review.event} • {review.date}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleVisibility(review.id, review.isVisible !== false)}
                          disabled={togglingReviewId === review.id}
                          className={`px-3 py-1 rounded text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                            review.isVisible !== false
                              ? 'bg-green-900/20 text-green-400 border border-green-500/50'
                              : 'bg-red-900/20 text-red-400 border border-red-500/50'
                          }`}
                        >
                          {togglingReviewId === review.id && <LoadingSpinner size="xs" />}
                          <span>{review.isVisible !== false ? (t('admin.reviews.visible') || 'Visible') : (t('admin.reviews.hidden') || 'Hidden')}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          className="px-3 py-1 bg-red-900/20 text-red-400 border border-red-500/50 rounded text-sm hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {deletingReviewId === review.id && <LoadingSpinner size="xs" />}
                          <span>{t('admin.reviews.delete') || 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                    <blockquote className="text-brand-muted italic">
                      "{review.quote}"
                    </blockquote>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'galleries' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl text-brand-warm">
                {t('admin.galleries.title') || 'Gallery Management'}
              </h2>
              <button
                onClick={() => setShowCreateGallery(!showCreateGallery)}
                className="btn-primary"
              >
                {showCreateGallery ? (t('admin.galleries.cancel') || 'Cancel') : (t('admin.galleries.createNew') || 'Create New Gallery')}
              </button>
            </div>

            {showCreateGallery && (
              <div className="bg-brand-dark p-6 rounded-lg mb-6">
                <h3 className="font-heading text-lg text-brand-warm mb-4">
                  {editingGallery 
                    ? (t('admin.galleries.editForm.title') || 'Edit Gallery')
                    : (t('admin.galleries.createForm.title') || 'Create New Gallery')
                  }
                </h3>
                <form onSubmit={editingGallery ? handleUpdateGallery : handleCreateGallery} className="space-y-4">
                  <div>
                    <label className="block text-brand-warm font-medium mb-2">
                      {t('admin.galleries.createForm.name') || 'Gallery Name'}
                    </label>
                    <input
                      type="text"
                      value={galleryForm.name}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-brand-black border border-brand-charcoal rounded-md text-brand-warm placeholder-brand-muted focus:outline-none focus:border-brand-bronze"
                      placeholder={t('admin.galleries.createForm.namePlaceholder') || 'e.g., Barbi & Andor'}
                    />
                  </div>

                  <div>
                    <label className="block text-brand-warm font-medium mb-2">
                      {t('admin.galleries.createForm.slug') || 'URL Slug'}
                    </label>
                    <input
                      type="text"
                      value={galleryForm.slug}
                      readOnly
                      className="w-full px-4 py-3 bg-brand-charcoal border border-brand-charcoal rounded-md text-brand-muted cursor-not-allowed"
                      placeholder={t('admin.galleries.createForm.slugPlaceholder') || 'barbi-andor'}
                    />
                    <p className="text-brand-muted text-sm mt-1">
                      {t('admin.galleries.createForm.slugHelp') || 'Auto-generated from gallery name for clean URLs'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-brand-warm font-medium mb-2">
                      {t('admin.galleries.createForm.password') || 'Password'}
                    </label>
                    <input
                      type="password"
                      value={galleryForm.password}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-brand-black border border-brand-charcoal rounded-md text-brand-warm placeholder-brand-muted focus:outline-none focus:border-brand-bronze"
                      placeholder={t('admin.galleries.createForm.passwordPlaceholder') || 'Enter access password'}
                    />
                  </div>

                  <div>
                    <label className="block text-brand-warm font-medium mb-2">
                      {t('admin.galleries.createForm.images') || 'Images'}
                    </label>
                    <input
                      key={fileInputKey}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full px-4 py-3 bg-brand-black border border-brand-charcoal rounded-md text-brand-warm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-bronze file:text-brand-black hover:file:bg-brand-bronze/80"
                    />
                    <p className="text-brand-muted text-xs mt-1">
                      You can pick from multiple folders — each selection adds to the list below.
                    </p>
                    {galleryForm.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-brand-bronze text-sm mb-2">
                          {galleryForm.images.length} photo{galleryForm.images.length !== 1 ? 's' : ''} selected
                        </p>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                          {galleryForm.images.map((image, index) => (
                            <div key={index} className="flex items-center bg-brand-charcoal px-3 py-1 rounded-md">
                              <span className="text-sm text-brand-warm mr-2 max-w-[160px] truncate">{image.name}</span>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="text-red-400 hover:text-red-300 flex-shrink-0"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {uploadProgress && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-brand-muted mb-1">
                          <span>Uploading photos...</span>
                          <span>{uploadProgress.done} / {uploadProgress.total}</span>
                        </div>
                        <div className="w-full bg-brand-charcoal rounded-full h-2">
                          <div
                            className="bg-brand-bronze h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={galleryFormLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {galleryFormLoading && <LoadingSpinner size="sm" />}
                    <span>
                      {galleryFormLoading 
                        ? (editingGallery ? (t('admin.galleries.updating') || 'Updating...') : (t('admin.galleries.creating') || 'Creating...'))
                        : (editingGallery ? (t('admin.galleries.update') || 'Update Gallery') : (t('admin.galleries.create') || 'Create Gallery'))
                      }
                    </span>
                  </button>

                  {editingGallery && (
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="w-full mt-2 px-4 py-2 bg-brand-charcoal hover:bg-brand-charcoal/80 text-brand-warm rounded-md transition-colors"
                    >
                      {t('admin.galleries.cancelEdit') || 'Cancel Edit'}
                    </button>
                  )}
                </form>
              </div>
            )}

            {galleriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="md" className="mr-3" />
                <span className="text-brand-muted">{t('admin.galleries.loading') || 'Loading galleries...'}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {galleries.map((gallery) => (
                  <div key={gallery.id} className="bg-brand-dark p-6 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-heading text-lg text-brand-warm mb-1">
                          {gallery.name}
                        </h3>
                        <p className="text-brand-muted text-sm">
                          Created: {new Date(gallery.created).toLocaleDateString()}
                        </p>
                        <p className="text-brand-muted text-sm">
                          URL: /gallery/{gallery.slug}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => startEditingGallery(gallery)}
                          className="px-3 py-1 bg-brand-charcoal text-brand-warm rounded text-sm hover:bg-brand-charcoal/80"
                        >
                          {t('admin.galleries.edit') || 'Edit'}
                        </button>
                        <button 
                          onClick={() => handleDeleteGallery(gallery.id, gallery.name)}
                          disabled={deletingGalleryId === gallery.id}
                          className="px-3 py-1 bg-red-900/20 text-red-400 border border-red-500/50 rounded text-sm hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {deletingGalleryId === gallery.id && <LoadingSpinner size="xs" />}
                          <span>{t('admin.galleries.delete') || 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {galleries.length === 0 && !showCreateGallery && (
                  <div className="text-center py-12">
                    <p className="text-brand-muted mb-4">
                      {t('admin.galleries.noGalleries') || 'No galleries created yet'}
                    </p>
                    <button
                      onClick={() => setShowCreateGallery(true)}
                      className="btn-primary"
                    >
                      {t('admin.galleries.createFirst') || 'Create Your First Gallery'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard