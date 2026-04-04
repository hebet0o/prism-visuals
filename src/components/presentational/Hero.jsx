import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const Hero = ({ images, title, tagline, ctaText, ctaLink }) => {
  const [current, setCurrent] = useState(0)
  const [nextIndex, setNextIndex] = useState(null)
  const [nextImageLoaded, setNextImageLoaded] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!images || images.length <= 1) return

    intervalRef.current = setInterval(() => {
      const upcoming = (current + 1) % images.length
      setNextImageLoaded(false)
      setNextIndex(upcoming)
    }, 5000)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(timeoutRef.current)
    }
  }, [images, current])

  useEffect(() => {
    if (nextIndex === null) return

    const img = new Image()
    img.src = images[nextIndex]
    img.onload = () => setNextImageLoaded(true)

    return () => {
      img.onload = null
    }
  }, [nextIndex, images])

  useEffect(() => {
    if (!nextImageLoaded || nextIndex === null) return
    setTransitioning(true)
  }, [nextImageLoaded, nextIndex])

  useEffect(() => {
    if (!transitioning || nextIndex === null) return

    timeoutRef.current = setTimeout(() => {
      setCurrent(nextIndex)
      setTransitioning(false)
      setNextImageLoaded(false)
    }, 800)

    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [transitioning, nextIndex])

  useEffect(() => {
    if (transitioning || nextIndex === null) return
    
    // Clear nextIndex after transition completes + a tiny buffer for DOM stability
    const cleanupTimeout = setTimeout(() => {
      setNextIndex(null)
    }, 50)

    return () => clearTimeout(cleanupTimeout)
  }, [transitioning, nextIndex])

  if (!images || images.length === 0) {
    return null
  }

  const currentImage = images[current]
  const nextImage = nextIndex !== null ? images[nextIndex] : null

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image with slow zoom */}
      <div className="absolute inset-0">
        <img
          src={currentImage}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-in-out scale-105 animate-slow-zoom ${
            transitioning ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {nextImage && (
          <img
            src={nextImage}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-in-out scale-105 animate-slow-zoom ${
              transitioning ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Dark cinematic overlay - stronger at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/30 via-brand-black/40 to-brand-black/70" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        {/* Eyebrow label */}
        <p className="section-label mb-8 opacity-80">Budapest, Hungary</p>

        {/* Main headline - serif display */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-brand-warm font-normal leading-tight mb-6 max-w-5xl text-balance">
          {title}
        </h1>

        {/* Divider */}
        <span className="divider-line" />

        {/* Italic tagline */}
        <p className="font-display italic text-lg md:text-xl lg:text-2xl text-brand-offwhite/80 mb-10 max-w-2xl leading-relaxed">
          {tagline}
        </p>

        {/* CTA */}
        <Link to={ctaLink} className="btn-ghost">
          {ctaText}
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="section-label text-[10px]">scroll</span>
        <span className="block w-px h-8 bg-brand-warm animate-pulse" />
      </div>
    </section>
  )
}

export default Hero
