import { useState, useEffect } from 'react'

const ReviewCarousel = ({ reviews }) => {
  const [current, setCurrent] = useState(0)

  if (!reviews || reviews.length === 0) {
    return null
  }

  const review = reviews[current]
  const hasMultiple = reviews.length > 1

  const goToPrevious = () => {
    setCurrent((prev) => (prev === 0 ? reviews.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrent((prev) => (prev === reviews.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Review Content */}
      <div className="mb-10">
        <blockquote className="font-display italic text-2xl md:text-3xl text-brand-warm/90 leading-relaxed mb-10 text-center">
          &ldquo;{review.quote}&rdquo;
        </blockquote>
        <span className="divider-line" />
        <p className="font-heading text-xs uppercase tracking-display text-brand-bronze mt-6 text-center">
          {review.author}
        </p>
        <p className="font-heading text-xs uppercase tracking-widest text-brand-muted mt-1 text-center">
          {review.event}
        </p>
      </div>

      {/* Navigation Controls - Only show if multiple reviews */}
      {hasMultiple && (
        <div className="flex items-center justify-center gap-6 mt-12">
          <button
            onClick={goToPrevious}
            className="p-3 hover:bg-brand-warm/10 rounded-full transition-colors duration-300"
            aria-label="Previous review"
          >
            <svg className="w-5 h-5 text-brand-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === current ? 'bg-brand-bronze' : 'bg-brand-warm/30'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="p-3 hover:bg-brand-warm/10 rounded-full transition-colors duration-300"
            aria-label="Next review"
          >
            <svg className="w-5 h-5 text-brand-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Review Count */}
      {hasMultiple && (
        <p className="text-center text-brand-muted text-xs mt-6">
          {current + 1} / {reviews.length}
        </p>
      )}
    </div>
  )
}

export default ReviewCarousel
