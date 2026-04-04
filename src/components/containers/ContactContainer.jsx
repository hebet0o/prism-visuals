import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ContactForm from '../presentational/ContactForm'

const ContactContainer = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = t('contact.form.validation.nameRequired')
    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.validation.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('contact.form.validation.emailInvalid')
    }
    if (!formData.message.trim()) newErrors.message = t('contact.form.validation.messageRequired')
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    console.log('Form submitted:', formData)
    setStatus('success')
    setFormData({ name: '', email: '', phone: '', service: '', message: '' })
    setTimeout(() => setStatus(null), 5000)
  }

  return (
    <div className="grid md:grid-cols-5 gap-16">
      {/* Form - wider */}
      <div className="md:col-span-3">
        <ContactForm
          formData={formData}
          errors={errors}
          onSubmit={handleSubmit}
          onChange={handleChange}
          t={t}
        />
        {status === 'success' && (
          <p className="mt-6 text-brand-bronze text-sm font-body font-light">
            {t('contact.form.success')}
          </p>
        )}
        {status === 'error' && (
          <p className="mt-6 text-red-400 text-sm font-body font-light">
            {t('contact.form.error')}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="md:col-span-2 flex flex-col gap-10 pt-2">
        <div>
          <p className="section-label mb-4">{t('contact.labels.email')}</p>
          <a
            href="mailto:info@prismvisuals.hu"
            className="text-brand-warm hover:text-brand-bronze transition-colors duration-300 text-sm font-body font-light"
          >
            {t('contact.info.email')}
          </a>
        </div>
        <div>
          <p className="section-label mb-4">{t('contact.labels.location')}</p>
          <p className="text-brand-muted text-sm font-body font-light">
            {t('contact.info.location')}
          </p>
        </div>
        <div>
          <p className="section-label mb-4">{t('contact.labels.responseTime')}</p>
          <p className="text-brand-muted text-sm font-body font-light">
            {t('contact.info.responseTime')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ContactContainer
