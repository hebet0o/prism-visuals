import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const ReviewForm = ({ onSubmit }) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    quote: '',
    author: '',
    event: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.quote.trim() || !formData.author.trim() || !formData.event.trim()) {
      alert(t('reviews.form.allFieldsRequired') || 'All fields are required')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Submit the review
      onSubmit(formData)

      // Reset form and show success message
      setFormData({ quote: '', author: '', event: '' })
      setSubmitted(true)

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error('Failed to submit review:', error)
      alert(t('reviews.form.error') || 'Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Quote Field */}
        <div>
          <label htmlFor="quote" className="block text-xs uppercase tracking-display text-brand-bronze mb-3">
            {t('reviews.form.review') || 'Your Review'}
          </label>
          <textarea
            id="quote"
            name="quote"
            value={formData.quote}
            onChange={handleChange}
            placeholder={t('reviews.form.reviewPlaceholder') || 'Share your experience with us...'}
            className="w-full px-4 py-3 bg-brand-charcoal border border-brand-warm/20 rounded text-brand-warm placeholder-brand-muted focus:outline-none focus:border-brand-bronze transition-colors duration-300"
            rows="5"
            required
          />
          <p className="text-xs text-brand-muted mt-2">
            {formData.quote.length}/500 {t('reviews.form.characters') || 'characters'}
          </p>
        </div>

        {/* Author and Event Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Author Field */}
          <div>
            <label htmlFor="author" className="block text-xs uppercase tracking-display text-brand-bronze mb-3">
              {t('reviews.form.name') || 'Your Name'}
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder={t('reviews.form.namePlaceholder') || 'Name'}
              className="w-full px-4 py-3 bg-brand-charcoal border border-brand-warm/20 rounded text-brand-warm placeholder-brand-muted focus:outline-none focus:border-brand-bronze transition-colors duration-300"
              required
            />
          </div>

          {/* Event Field */}
          <div>
            <label htmlFor="event" className="block text-xs uppercase tracking-display text-brand-bronze mb-3">
              {t('reviews.form.event') || 'Event / Location'}
            </label>
            <input
              type="text"
              id="event"
              name="event"
              value={formData.event}
              onChange={handleChange}
              placeholder={t('reviews.form.eventPlaceholder') || 'e.g., Wedding, Budapest'}
              className="w-full px-4 py-3 bg-brand-charcoal border border-brand-warm/20 rounded text-brand-warm placeholder-brand-muted focus:outline-none focus:border-brand-bronze transition-colors duration-300"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-brand-bronze text-brand-black font-heading font-semibold uppercase tracking-display rounded hover:bg-brand-bronze/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isSubmitting ? (t('reviews.form.submitting') || 'Submitting...') : t('reviews.form.submit') || 'Submit Review'}
          </button>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="p-4 bg-green-900/30 border border-green-500/50 rounded text-green-400 text-sm text-center">
            {t('reviews.form.success') || 'Thank you! Your review has been added.'}
          </div>
        )}
      </div>
    </form>
  )
}

export default ReviewForm
