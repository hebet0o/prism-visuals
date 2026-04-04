import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import LanguageSwitch from './LanguageSwitch'

const Header = () => {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinkClass = ({ isActive }) =>
    `text-xs font-heading font-semibold uppercase tracking-display transition-colors duration-300 ${
      isActive ? 'text-brand-bronze' : 'text-brand-warm hover:text-brand-bronze'
    }`

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          scrolled ? 'bg-brand-black/95 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-center lg:justify-between lg:items-center gap-8 lg:gap-0">

            {/* Left Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-10">
              <NavLink to="/about" className={navLinkClass}>
                {t('nav.about')}
              </NavLink>
              <NavLink to="/wedding-galleries" className={navLinkClass}>
                {t('nav.weddingGalleries')}
              </NavLink>
              <NavLink to="/portfolio" className={navLinkClass}>
                {t('nav.portfolio')}
              </NavLink>
            </div>

            {/* Logo - Center */}
            <Link to="/" className="flex-shrink-0" aria-label="Home">
              <img
                src="/logosvg.svg"
                alt="PRISM logo"
                className="h-12 w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>

            {/* Right Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-10">
              <NavLink to="/pricing" className={navLinkClass}>
                {t('nav.pricing')}
              </NavLink>
              <NavLink to="/contact" className={navLinkClass}>
                {t('nav.contact')}
              </NavLink>
              <LanguageSwitch />
            </div>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-2 text-brand-warm ml-auto"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Full-Screen Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-brand-black flex flex-col">
          <div className="flex justify-between items-center px-6 py-5">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <span className="font-display text-xl tracking-widest text-brand-warm">PRISM</span>
            </Link>
            <button
              className="p-2 text-brand-warm"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center gap-10">
            {[
              { to: '/about', label: t('nav.about') },
              { to: '/wedding-galleries', label: t('nav.weddingGalleries') },
              { to: '/portfolio', label: t('nav.portfolio') },
              { to: '/pricing', label: t('nav.pricing') },
              { to: '/contact', label: t('nav.contact') },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `font-display text-3xl transition-colors duration-300 ${
                    isActive ? 'text-brand-bronze' : 'text-brand-warm hover:text-brand-bronze'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="mt-4">
              <LanguageSwitch />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
