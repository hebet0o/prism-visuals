import { useTranslation } from 'react-i18next'
import ContactContainer from '../components/containers/ContactContainer'

const ContactPage = () => {
  const { t } = useTranslation()

  return (
    <div className="bg-brand-black min-h-screen pt-32 pb-24 px-6">
      <div className="text-center mb-16">
        <p className="section-label mb-4">{t('contact.title')}</p>
        <h1 className="font-display text-5xl md:text-6xl text-brand-warm mb-4">
          {t('contact.heading.start')} <span className="italic text-brand-offwhite/70">{t('contact.heading.emphasis')}</span>
        </h1>
        <span className="divider-line" />
        <p className="text-brand-muted text-sm font-body font-light mt-6 max-w-lg mx-auto">
          {t('contact.description')}
        </p>
      </div>
      <div className="max-w-5xl mx-auto">
        <ContactContainer />
      </div>
    </div>
  )
}

export default ContactPage
