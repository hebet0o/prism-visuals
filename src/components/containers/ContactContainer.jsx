import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ContactForm from '../presentational/ContactForm'
import { business } from '../../utils/business'

export default function ContactContainer() {
  const { i18n } = useTranslation()
  const hu = i18n.language === 'hu'
  const [formData, setFormData] = useState({ name: '', message: '' })
  const [draftOpened, setDraftOpened] = useState(false)
  const handleSubmit = e => {
    e.preventDefault()
    const body = `${formData.name.trim() ? `${formData.name.trim()}\n\n` : ''}${formData.message.trim()}`
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(hu ? 'Prism Visuals érdeklődés' : 'Prism Visuals enquiry')}&body=${encodeURIComponent(body)}`
    setDraftOpened(true)
  }
  return <div className="grid md:grid-cols-5 gap-16">
    <div className="md:col-span-3">
      <ContactForm formData={formData} onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} onSubmit={handleSubmit} hu={hu} />
      {draftOpened && <p role="status" className="mt-6 text-sm">{hu ? 'Ha megnyílt a leveleződ, ellenőrizd és küldd el a tervezetet. Ha nem, másold ki az üzenetedet és írj közvetlenül az alábbi e-mail-címre. Az oldal nem igazolja a kézbesítést.' : 'If your email app opened, review and send the draft. Otherwise copy your message and email us directly using the address below. This website cannot confirm delivery.'}</p>}
    </div>
    <div className="md:col-span-2 space-y-6 break-words">
      <h2 className="text-2xl">{hu ? 'Elérhetőségek' : 'Contact details'}</h2>
      <p>Iszak Gábor Adrián</p>
      <p><a className="underline" href={`mailto:${business.email}`}>{business.email}</a></p>
      <p><a className="underline" href="tel:+36305621723">{business.phone}</a></p>
      <p className="text-sm text-brand-muted">{business.address}</p>
    </div>
  </div>
}
