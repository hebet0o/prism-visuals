import { Link } from 'react-router-dom'

export default function ContactForm({ formData, onSubmit, onChange, hu }) {
  return <form onSubmit={onSubmit} className="space-y-6" aria-describedby="contact-privacy">
    <div>
      <label htmlFor="contact-name" className="block mb-2">{hu ? 'Név (nem kötelező)' : 'Name (optional)'}</label>
      <input id="contact-name" name="name" autoComplete="name" maxLength={100} value={formData.name} onChange={onChange} className="w-full bg-brand-dark border border-brand-muted p-3 rounded" />
    </div>
    <div>
      <label htmlFor="contact-message" className="block mb-2">{hu ? 'Üzenet (kötelező)' : 'Message (required)'}</label>
      <textarea id="contact-message" name="message" required maxLength={2000} rows={6} value={formData.message} onChange={onChange} className="w-full bg-brand-dark border border-brand-muted p-3 rounded" />
    </div>
    <p id="contact-privacy" className="text-sm text-brand-muted leading-relaxed">
      {hu ? 'Csak a megkereséshez szükséges adatokat add meg. A gomb a saját leveleződben készít tervezetet; neked kell elküldened. Az oldal nem menti és nem küldi el az űrlapot. ' : 'Share only what is needed for your enquiry. The button prepares a draft in your email app; you must send it yourself. The website does not save or submit the form. '}
      <Link className="underline" to="/privacy-policy">{hu ? 'Adatkezelési tájékoztató' : 'Privacy policy'}</Link>
    </p>
    <button type="submit" className="btn-primary">{hu ? 'E-mail-tervezet megnyitása' : 'Open email draft'}</button>
  </form>
}
