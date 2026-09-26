import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ContactForm from '../presentational/ContactForm'
import { business } from '../../utils/business'
import { addInquiry } from '../../hooks/useInquiries'

export default function ContactContainer() {
  const { t, i18n } = useTranslation()
  const hu = i18n.language === 'hu'

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    botcheck: false
  }

  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null) // 'submitting' | 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.validation.nameRequired')
    }
    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('contact.form.validation.emailInvalid')
    }
    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.validation.messageRequired')
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setStatus('submitting')
    setErrorMessage('')

    // If botcheck is filled by a spam bot, drop silently and pretend success
    if (formData.botcheck) {
      setStatus('success')
      setFormData(initialForm)
      return
    }

    const serviceLabel = formData.service
      ? t(`services.${formData.service}.title`, formData.service)
      : (hu ? 'Nincs megadva' : 'Not specified')

    let pbSaved = false
    let web3Saved = false
    let web3Error = ''

    // 1. Save to PocketBase database so it appears in the Admin Dashboard
    try {
      await addInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: serviceLabel,
        message: formData.message
      })
      pbSaved = true
    } catch (pbErr) {
      console.warn('PocketBase inquiry save not available:', pbErr)
    }

    // 2. Dispatch via Web3Forms for immediate email delivery
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
    if (accessKey) {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: accessKey,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || undefined,
            service: serviceLabel,
            message: formData.message.trim(),
            subject: `Prism Visuals megkeresés: ${formData.name.trim()}`,
            from_name: 'Prism Visuals Weboldal'
          })
        })
        const data = await response.json()
        if (response.ok && data.success) {
          web3Saved = true
        } else {
          web3Error = data.message || ''
        }
      } catch (err) {
        console.warn('Web3Forms dispatch error:', err)
      }
    }

    // If either destination succeeded, the user's message is safely stored/sent!
    if (pbSaved || web3Saved) {
      setStatus('success')
      setFormData(initialForm)
    } else {
      setStatus('error')
      setErrorMessage(
        web3Error || (hu
          ? 'Hiba történt a küldés során. Kérjük próbáld újra, vagy írj közvetlenül az info@prismvisuals.hu címre.'
          : 'Failed to send message. Please try again or email info@prismvisuals.hu directly.')
      )
    }
  }

  return (
    <div className="grid md:grid-cols-5 gap-16">
      <div className="md:col-span-3">
        <ContactForm
          formData={formData}
          errors={errors}
          status={status}
          errorMessage={errorMessage}
          onChange={handleChange}
          onSubmit={handleSubmit}
          t={t}
          hu={hu}
        />
      </div>
      <div className="md:col-span-2 space-y-6 break-words">
        <h2 className="text-2xl font-heading text-brand-warm">{hu ? 'Elérhetőségek' : 'Contact details'}</h2>
        <p className="text-brand-warm font-light">{business.name}</p>
        <p>
          <a
            className="underline text-brand-warm hover:text-brand-bronze transition-colors"
            href={`mailto:${business.email}`}
          >
            {business.email}
          </a>
        </p>
        <p>
          <a
            className="underline text-brand-warm hover:text-brand-bronze transition-colors"
            href={`tel:${business.phone.replace(/\s+/g, '')}`}
          >
            {business.phone}
          </a>
        </p>
        <p className="text-sm text-brand-muted font-light">{business.address}</p>
      </div>
    </div>
  )
}
