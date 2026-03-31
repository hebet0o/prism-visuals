const inputClass = (hasError) =>
  `w-full bg-transparent border-b py-3 text-sm text-brand-warm placeholder-brand-muted/50 font-body font-light
   focus:outline-none focus:border-brand-bronze transition-colors duration-300
   ${hasError ? 'border-red-500' : 'border-brand-charcoal'}`

const ContactForm = ({ formData, errors, onSubmit, onChange, t }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <label htmlFor="name" className="section-label block mb-3">
            {t('contact.form.name')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            className={inputClass(errors.name)}
            required
          />
          {errors.name && <p className="text-red-400 text-xs mt-2">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="section-label block mb-3">
            {t('contact.form.email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className={inputClass(errors.email)}
            required
          />
          {errors.email && <p className="text-red-400 text-xs mt-2">{errors.email}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <label htmlFor="phone" className="section-label block mb-3">
            {t('contact.form.phone')}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className={inputClass(false)}
          />
        </div>

        <div>
          <label htmlFor="service" className="section-label block mb-3">
            {t('contact.form.service')}
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={onChange}
            className="w-full bg-transparent border-b border-brand-charcoal py-3 text-sm text-brand-warm font-body font-light focus:outline-none focus:border-brand-bronze transition-colors duration-300"
          >
            <option value="" className="bg-brand-black">—</option>
            <option value="wedding" className="bg-brand-black">{t('services.wedding.title')}</option>
            <option value="portrait" className="bg-brand-black">{t('services.portrait.title')}</option>
            <option value="event" className="bg-brand-black">{t('services.event.title')}</option>
            <option value="video" className="bg-brand-black">{t('services.video.title')}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="section-label block mb-3">
          {t('contact.form.message')}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={onChange}
          rows={5}
          className={`${inputClass(errors.message)} resize-none`}
          required
        />
        {errors.message && <p className="text-red-400 text-xs mt-2">{errors.message}</p>}
      </div>

      <div className="pt-4">
        <button type="submit" className="btn-primary">
          {t('contact.form.send')}
        </button>
      </div>
    </form>
  )
}

export default ContactForm
