import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Hero = ({ images, title, tagline, ctaText, ctaLink }) => {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!images || images.length <= 1) return
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % images.length)
        setFading(false)
      }, 800)
    }, 5000)
    return () => clearInterval(interval)
  }, [images])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image with slow zoom */}
      <div className="absolute inset-0">
        <img
          key={current}
          src={images[current]}
          alt=""
          className={`w-full h-full object-cover transition-opacity duration-[800ms] ${
            fading ? 'opacity-0' : 'opacity-100'
          } scale-105 animate-slow-zoom`}
        />
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
