import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import LanguageSwitch from './LanguageSwitch'
import Logo from './Logo'
import AccessibleDialog from '../AccessibleDialog'

const Header = () => {
  const { t, i18n } = useTranslation()
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
        <nav className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center">

            {/* Left Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-10 justify-self-start">
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
            <Link to="/" className="col-start-2 row-start-1 justify-self-center" aria-label="Home">
              <Logo />
            </Link>

            {/* Right Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-10 justify-self-end">
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
              className="col-start-3 row-start-1 justify-self-end lg:hidden p-2 text-brand-warm"
              onClick={() => setIsMenuOpen(true)}
              aria-label={i18n.language === 'hu' ? 'Menü megnyitása' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-haspopup="dialog"
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
        <AccessibleDialog label={i18n.language === 'hu' ? 'Navigáció' : 'Navigation'} onClose={() => setIsMenuOpen(false)} className="fixed inset-0 z-[100] bg-brand-black flex flex-col">
          <div className="flex justify-between items-center px-6 py-5">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <Logo />
            </Link>
            <button
              className="p-2 text-brand-warm"
              onClick={() => setIsMenuOpen(false)}
              aria-label={i18n.language === 'hu' ? 'Menü bezárása' : 'Close menu'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center gap-6 py-6">
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
        </AccessibleDialog>
      )}
    </>
  )
}

export default Header
