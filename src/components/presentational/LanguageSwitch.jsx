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
      className="text-xs font-heading font-semibold uppercase tracking-display text-brand-muted hover:text-brand-bronze transition-colors duration-300"
    >
      {i18n.language === 'hu' ? 'EN' : 'HU'}
    </button>
  )
}

export default LanguageSwitch
