import { useTranslation } from 'react-i18next'

const LanguageSwitch = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'hu' ? 'en' : 'hu'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      aria-label={i18n.language === 'hu' ? 'Switch to English' : 'Váltás magyar nyelvre'}
      lang={i18n.language === 'hu' ? 'en' : 'hu'}
      className="min-h-11 min-w-11 text-sm font-heading font-semibold uppercase tracking-display text-brand-warm hover:text-brand-bronze transition-colors duration-300"
    >
      {i18n.language === 'hu' ? 'EN' : 'HU'}
    </button>
  )
}

export default LanguageSwitch
