import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

/**
 * Hero slider – persistent two-layer crossfade with Ken Burns zoom.
 *
 * Architecture (two-slot pattern)
 * ────────────────────────────────────────────────────────────────
 * Two <img> elements (slot 0 and slot 1) live permanently in the DOM.
 * We alternate which slot holds the "active" image and which holds
 * the "incoming" image, swapping roles each transition.
 *
 * Transition sequence
 *  1. Timer fires → pick nextIdx.
 *  2. Preload nextIdx image (Image() object).
 *  3. Once loaded: write src + bump zoomKey on the *inactive* slot.
 *  4. Double-rAF: wait for the browser to paint the new src into the
 *     inactive slot, then flip activeSlot → crossfade begins.
 *  5. After TRANSITION_DURATION ms the inactive slot is now visually
 *     on top; it becomes the new activeSlot in state.
 *  6. Repeat.
 *
 * Why this eliminates the flash
 * ────────────────────────────────────────────────────────────────
 * ✓ No conditional mount/unmount → the browser never discards the
 *   <img> element, so CSS transitions always have a painted baseline.
 * ✓ The incoming image is fully painted (opacity-0) before the
 *   crossfade starts, so frame 1 of the transition is already clean.
 * ✓ zoomKey alternates between 0 and 1, toggling the CSS
 *   animation-name between slow-zoom-0 and slow-zoom-1.  The browser
 *   detects a name change and restarts the keyframe from scale(1.05)
 *   only on the slot that received a new image.
 * ✓ transitioningRef prevents overlapping transitions even if an
 *   image loads unusually fast or slow.
 */

const TRANSITION_DURATION = 800  // ms – keep in sync with CSS transition
const SLIDE_INTERVAL      = 6000 // ms – net display time per slide

const Hero = ({ images, title, tagline, ctaText, ctaLink }) => {
  const [activeSlot, setActiveSlot] = useState(0)
  const [slots, setSlots] = useState(() => [
    { src: images?.[0] ?? null, zoomKey: 0 },
    { src: null,                zoomKey: 0 },
  ])

  // Refs so interval callback always has fresh values without recreating
  const activeSlotRef    = useRef(0)
  const currentIdxRef    = useRef(0)
  const transitioningRef = useRef(false)
  const intervalRef      = useRef(null)
  const preloadRef       = useRef(null)

  // Keep ref in sync with state
  const setActiveSlotSynced = (slot) => {
    activeSlotRef.current = slot
    setActiveSlot(slot)
  }

  useEffect(() => {
    if (!images || images.length === 0) return

    // Reset to initial state when images prop changes
    activeSlotRef.current = 0
    currentIdxRef.current = 0
    transitioningRef.current = false
    setActiveSlotSynced(0)
    setSlots([
      { src: images[0], zoomKey: 0 },
      { src: null,      zoomKey: 0 },
    ])

    if (images.length <= 1) return

    const advance = () => {
      if (transitioningRef.current) return
      transitioningRef.current = true

      const nextIdx      = (currentIdxRef.current + 1) % images.length
      const nextSrc      = images[nextIdx]
      const incomingSlot = activeSlotRef.current === 0 ? 1 : 0

      // Cancel any in-flight preload
      if (preloadRef.current) {
        preloadRef.current.onload  = null
        preloadRef.current.onerror = null
      }

      const doSwap = () => {
        currentIdxRef.current = nextIdx

        // 1. Write the new src + restart zoom animation on the inactive slot
        setSlots(prev => {
          const next = [...prev]
          next[incomingSlot] = {
            src:     nextSrc,
            zoomKey: prev[incomingSlot].zoomKey + 1,
          }
          return next
        })

        // 2. Wait two frames so the browser paints the new src before fading
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 3. Crossfade: make the incoming slot visible
            setActiveSlotSynced(incomingSlot)

            // 4. After fade completes, release the transition lock
            setTimeout(() => {
              transitioningRef.current = false
            }, TRANSITION_DURATION + 50)
          })
        })
      }

      const img = new window.Image()
      preloadRef.current = img
      img.onload  = doSwap
      img.onerror = doSwap  // don't get stuck if an image 404s
      img.src = nextSrc

      // If already cached (complete before onload fires)
      if (img.complete) {
        img.onload = null
        doSwap()
      }
    }

    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(advance, SLIDE_INTERVAL)

    return () => {
      clearInterval(intervalRef.current)
      if (preloadRef.current) {
        preloadRef.current.onload  = null
        preloadRef.current.onerror = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  if (!images || images.length === 0) return null

  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* Persistent two-slot background */}
      <div className="absolute inset-0">
        {slots.map((slot, i) =>
          slot.src ? (
            <img
              key={`hero-slot-${i}`}
              src={slot.src}
              alt=""
              style={{
                // Alternating between slow-zoom-0 / slow-zoom-1 restarts the
                // CSS keyframe each time a new image lands on this slot.
                animationName: `slow-zoom-${slot.zoomKey % 2}`,
              }}
              className={[
                'absolute inset-0 w-full h-full object-cover scale-105',
                'transition-opacity ease-in-out',
                i === activeSlot ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            />
          ) : null
        )}
      </div>

      {/* Dark cinematic overlay — stronger at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/30 via-brand-black/40 to-brand-black/70" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        {/* Eyebrow label */}
        <p className="section-label mb-8 opacity-80">{t('hero.location') || 'Budapest, Hungary'}</p>

        {/* Main headline — serif display */}
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
        <span className="section-label text-[10px]">{t('hero.scroll') || 'scroll'}</span>
        <span className="block w-px h-8 bg-brand-warm animate-pulse" />
      </div>

    </section>
  )
}

export default Hero
