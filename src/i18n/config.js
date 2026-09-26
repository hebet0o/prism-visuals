import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import hu from './locales/hu.json'
import en from './locales/en.json'

let savedLanguage = 'hu'
try { savedLanguage = sessionStorage.getItem('language') || 'hu' } catch { /* Storage can be blocked. */ }

i18n
  .use(initReactI18next)
  .init({
    resources: {
      hu: { translation: hu },
      en: { translation: en },
    },
    lng: savedLanguage,
    fallbackLng: 'hu',
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng === 'hu' ? 'hu' : 'en'
  try { sessionStorage.setItem('language', lng) } catch { /* Keep language in memory. */ }
})
document.documentElement.lang = savedLanguage === 'hu' ? 'hu' : 'en'

export default i18n
