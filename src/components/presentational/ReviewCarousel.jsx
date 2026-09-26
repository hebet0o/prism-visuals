import { useState } from 'react'

const ReviewCarousel = ({ reviews }) => {
  const [current, setCurrent] = useState(0)

  if (!reviews || reviews.length === 0) {
    return null
  }

  const activeIndex = Math.min(current, reviews.length - 1)
  const hasMultiple = reviews.length > 1

  const goToPrevious = () => {
    setCurrent(activeIndex === 0 ? reviews.length - 1 : activeIndex - 1)
  }

  const goToNext = () => {
    setCurrent(activeIndex === reviews.length - 1 ? 0 : activeIndex + 1)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Review Content */}
      {/* Stacked grid items reserve the tallest review's height at every screen width.
          Inactive items retain layout space but are hidden visually and from assistive tech. */}
      <div className="mb-10 grid" aria-live="polite">
        {reviews.map((review, index) => (
        <div key={review.id ?? index} aria-hidden={index !== activeIndex}
          className={`col-start-1 row-start-1 min-w-0 flex flex-col break-words ${index !== activeIndex ? 'invisible pointer-events-none' : ''}`}>
        <blockquote className="font-display italic text-2xl md:text-3xl text-brand-warm/90 leading-relaxed mb-10 text-center flex-1">
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
        ))}
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
                  index === activeIndex ? 'bg-brand-bronze' : 'bg-brand-warm/30'
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
          {activeIndex + 1} / {reviews.length}
        </p>
      )}
    </div>
  )
}

export default ReviewCarousel
