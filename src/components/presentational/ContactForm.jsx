import { Link } from 'react-router-dom'

const inputClass = (hasError) =>
  `w-full bg-transparent border-b py-3 text-sm text-brand-warm placeholder-brand-muted/50 font-body font-light
   focus:outline-none focus:border-brand-bronze transition-colors duration-300
   ${hasError ? 'border-red-500' : 'border-brand-charcoal'}`

export default function ContactForm({
  formData,
  errors,
  status,
  errorMessage,
  onSubmit,
  onChange,
  t,
  hu,
}) {
  const isSubmitting = status === 'submitting'

  return (
    <form onSubmit={onSubmit} className="space-y-10" aria-describedby="contact-privacy" noValidate>
      {/* Honeypot field for anti-spam bot protection */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        style={{ display: 'none' }}
        tabIndex="-1"
        autoComplete="off"
        checked={formData.botcheck || false}
        onChange={onChange}
      />

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <label htmlFor="name" className="section-label block mb-3">
            {t('contact.form.name')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            maxLength={100}
            value={formData.name}
            onChange={onChange}
            disabled={isSubmitting}
            className={inputClass(errors.name)}
            placeholder={hu ? 'A neved' : 'Your name'}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            required
          />
          {errors.name && (
            <p id="name-error" className="text-red-400 text-xs mt-2" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="section-label block mb-3">
            {t('contact.form.email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            maxLength={120}
            value={formData.email}
            onChange={onChange}
            disabled={isSubmitting}
            className={inputClass(errors.email)}
            placeholder={hu ? 'pelda@email.hu' : 'example@email.com'}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            required
          />
          {errors.email && (
            <p id="email-error" className="text-red-400 text-xs mt-2" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <label htmlFor="phone" className="section-label block mb-3">
            {t('contact.form.phone')} <span className="normal-case text-brand-muted/70 text-xs">({hu ? 'opcionális' : 'optional'})</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            maxLength={30}
            value={formData.phone}
            onChange={onChange}
            disabled={isSubmitting}
            className={inputClass(false)}
            placeholder="+36 ..."
          />
        </div>

        <div>
          <label htmlFor="service" className="section-label block mb-3">
            {t('contact.form.service')} <span className="normal-case text-brand-muted/70 text-xs">({hu ? 'opcionális' : 'optional'})</span>
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={onChange}
            disabled={isSubmitting}
            className="w-full bg-brand-black border-b border-brand-charcoal py-3 text-sm text-brand-warm font-body font-light focus:outline-none focus:border-brand-bronze transition-colors duration-300 cursor-pointer"
          >
            <option value="" className="bg-brand-black">— {hu ? 'Válassz szolgáltatást' : 'Select a service'} —</option>
            <option value="wedding" className="bg-brand-black">{t('services.wedding.title')}</option>
            <option value="portrait" className="bg-brand-black">{t('services.portrait.title')}</option>
            <option value="event" className="bg-brand-black">{t('services.event.title')}</option>
            <option value="video" className="bg-brand-black">{t('services.video.title')}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="section-label block mb-3">
          {t('contact.form.message')} *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={2000}
          value={formData.message}
          onChange={onChange}
          disabled={isSubmitting}
          className={`${inputClass(errors.message)} resize-none`}
          placeholder={hu ? 'Írd le pár mondatban az elképzelésed...' : 'Tell us a bit about your project or event...'}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          required
        />
        {errors.message && (
          <p id="message-error" className="text-red-400 text-xs mt-2" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <p id="contact-privacy" className="text-xs text-brand-muted leading-relaxed">
        {hu
          ? 'Az űrlap elküldésével hozzájárulsz ahhoz, hogy a megadott adataidat a megkeresésed megválaszolására és ajánlatadásra használjuk. '
          : 'By submitting this form, you agree that your details will be used to respond to your enquiry and provide an offer. '}
        <Link className="underline text-brand-warm hover:text-brand-bronze transition-colors" to="/privacy-policy">
          {hu ? 'Adatkezelési tájékoztató' : 'Privacy policy'}
        </Link>
      </p>

      {status === 'success' && (
        <div role="status" className="p-4 bg-brand-charcoal/60 border border-brand-bronze rounded text-brand-warm text-sm">
          <p className="font-heading text-brand-bronze mb-1">
            {hu ? 'Köszönjük a megkeresést!' : 'Thank you for reaching out!'}
          </p>
          <p>{t('contact.form.success')}</p>
        </div>
      )}

      {status === 'error' && (
        <div role="alert" className="p-4 bg-red-950/40 border border-red-500/50 rounded text-red-200 text-sm">
          <p className="font-heading text-red-400 mb-1">
            {t('contact.form.error')}
          </p>
          <p className="text-xs text-red-300/80">
            {errorMessage || (hu ? 'Kérjük próbáld újra, vagy írj közvetlenül az info@prismvisuals.hu címre.' : 'Please try again or email us directly at info@prismvisuals.hu.')}
          </p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn-primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting
            ? (hu ? 'Küldés folyamatban...' : 'Sending...')
            : t('contact.form.send')}
        </button>
      </div>
    </form>
  )
}
