import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import LegalLinks from './LegalLinks'
import { business } from '../../utils/business'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-brand-black border-t border-brand-charcoal">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

          {/* Brand */}
          <div>
            <Link to="/">
              <Logo loading="lazy" />
            </Link>
            <p className="text-brand-muted text-xs font-body font-light mt-4 leading-relaxed">
              {t('footer.tagline')}<br />
              {t('footer.location')}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <p className="section-label mb-2">{t('footer.navigate')}</p>
            {[
              { to: '/about', label: t('nav.about') },
              { to: '/wedding-galleries', label: t('nav.weddingGalleries') },
              { to: '/portfolio', label: t('nav.portfolio') },
              { to: '/pricing', label: t('nav.pricing') },
              { to: '/contact', label: t('nav.contact') },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-brand-muted hover:text-brand-bronze text-xs font-heading uppercase tracking-display transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </div>

          <div><p className="section-label mb-6">{t('nav.contact')}</p><a className="underline text-brand-warm text-sm" href={`mailto:${business.email}`}>{business.email}</a><p className="mt-4 text-sm"><a className="underline" href="tel:+36305621723">{business.phone}</a></p></div>
        </div>

        <div className="mt-12 space-y-5">
          <p className="text-sm text-brand-muted">{business.name} · {business.email}</p>
          <LegalLinks />
        </div>
        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-brand-charcoal flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-brand-muted text-xs font-body font-light">
            {t('footer.copyright')}
          </p>
          <p className="text-brand-muted text-xs font-body font-light">
            {t('footer.crafted')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
