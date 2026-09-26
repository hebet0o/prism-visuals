import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const legalRoutes = [
  ['privacy', '/privacy-policy', 'Adatkezelés', 'Privacy'],
  ['terms', '/terms', 'Felhasználási feltételek', 'Terms'],
  ['cookies', '/cookie-policy', 'Sütik és tárhely', 'Cookies & storage'],
  ['business', '/business-details', 'Impresszum', 'Business details'],
  ['accessibility', '/accessibility', 'Akadálymentesség', 'Accessibility'],
]

export default function LegalLinks() {
  const { i18n } = useTranslation()
  return <nav aria-label={i18n.language === 'hu' ? 'Jogi információk' : 'Legal information'} className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
    {legalRoutes.map(([key, path, hu, en]) => <Link key={key} to={path} className="underline underline-offset-4 text-brand-muted hover:text-brand-warm">{i18n.language === 'hu' ? hu : en}</Link>)}
  </nav>
}
