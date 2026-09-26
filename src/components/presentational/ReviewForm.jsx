import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LEGAL_VERSION } from '../../utils/business'

export default function ReviewForm({ onSubmit }) {
  const { t, i18n } = useTranslation()
  const hu = i18n.language === 'hu'
  const busy = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')
  const [length, setLength] = useState(0)
  const permission = hu
    ? 'Hozzájárulok az értékelésem, a választott nevem és a megadott esemény / helyszín közzétételéhez a Prism Visuals weboldalán. A hozzájárulásomat az info@prismvisuals.hu címen visszavonhatom.'
    : 'I consent to publication of my review, chosen name and supplied event / location on the Prism Visuals website. I can withdraw permission at info@prismvisuals.hu.'
  const handleSubmit = async e => {
    e.preventDefault()
    if (busy.current) return
    const form = e.currentTarget
    const data = new FormData(form)
    const quote = String(data.get('quote') || '').trim()
    const author = String(data.get('author') || '').trim()
    if (!quote || !author || data.get('publication') !== 'yes') { setStatus('invalid'); return }
    busy.current = true
    setSubmitting(true)
    setStatus('')
    try {
      await onSubmit({ quote, author, event: String(data.get('event') || '').trim(),
        publicationConsent: { version: LEGAL_VERSION, text: permission, language: hu ? 'hu' : 'en', acceptedAt: new Date().toISOString() } })
      form.reset()
      setLength(0)
      setStatus('success')
    } catch { setStatus('error') }
    finally { busy.current = false; setSubmitting(false) }
  }
  const labelClass = 'block text-xs font-heading uppercase tracking-display text-brand-bronze mb-3'
  const fieldClass = 'w-full px-4 py-3 bg-brand-charcoal border border-brand-muted rounded text-brand-warm placeholder-brand-muted focus:border-brand-bronze transition-colors duration-300'
  return <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6" aria-describedby="review-notice" aria-busy={submitting}>
    <fieldset disabled={submitting} className="space-y-6">
      <legend className="sr-only">{t('reviews.formTitle')}</legend>
      <div>
        <label htmlFor="review-quote" className={labelClass}>{t('reviews.form.review')}</label>
        <textarea id="review-quote" name="quote" rows={5} required maxLength={500} className={fieldClass}
          placeholder={t('reviews.form.reviewPlaceholder')} onChange={e => setLength(e.target.value.length)} aria-describedby="review-count" />
        <p id="review-count" className="text-xs text-brand-muted mt-2">{length}/500 {t('reviews.form.characters')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div><label htmlFor="review-author" className={labelClass}>{t('reviews.form.name')}</label>
          <input id="review-author" name="author" required maxLength={60} placeholder={hu ? 'Név vagy becenév' : 'Name or nickname'} className={fieldClass} /></div>
        <div><label htmlFor="review-event" className={labelClass}>{t('reviews.form.event')} <span className="normal-case tracking-normal">({hu ? 'opcionális' : 'optional'})</span></label>
          <input id="review-event" name="event" maxLength={100} placeholder={t('reviews.form.eventPlaceholder')} className={fieldClass} /></div>
      </div>
      <div className="border-t border-brand-charcoal pt-6 space-y-4">
        <p id="review-notice" className="text-xs leading-relaxed text-brand-muted">{hu ? 'Az értékelés csak jóváhagyás után jelenik meg. Ne adj meg más személyt azonosító adatot. ' : 'Your review appears only after approval. Please do not identify other people. '}<Link className="underline underline-offset-4 hover:text-brand-warm" to="/privacy-policy">{hu ? 'Adatkezelési tájékoztató' : 'Privacy policy'}</Link></p>
        <label className="flex gap-3 items-start text-xs leading-relaxed text-brand-muted cursor-pointer">
          <input type="checkbox" name="publication" value="yes" required className="mt-0.5 w-4 h-4 shrink-0 accent-brand-bronze" />
          <span>{permission} {hu ? 'A szolgáltatás igénybevételének nem feltétele.' : 'This is not required to book a service.'}</span>
        </label>
      </div>
      <button type="submit" className="w-full px-6 py-4 bg-brand-bronze text-brand-black font-heading font-semibold text-xs uppercase tracking-display rounded hover:bg-brand-warm disabled:opacity-60 disabled:cursor-wait transition-colors">
        {submitting ? t('reviews.form.submitting') : t('reviews.form.submit')}
      </button>
    </fieldset>
    {status === 'success' && <p role="status" className="border border-brand-bronze p-4 text-brand-warm text-sm text-center">{hu ? 'Köszönjük! Az értékelésed beérkezett, ellenőrzés után jelenik meg.' : 'Thank you! Your review was received and is awaiting approval.'}</p>}
    {(status === 'error' || status === 'invalid') && <p role="alert" className="text-brand-warm text-sm">{status === 'invalid' ? (hu ? 'Kérjük, add meg a neved, az értékelésed és a közzétételi engedélyt.' : 'Please provide your name, review and publication permission.') : (hu ? 'Nem sikerült elküldeni. Az adataid megmaradtak; kérjük, próbáld újra később.' : 'Submission failed. Your entries have been kept; please try again later.')}</p>}
  </form>
}
