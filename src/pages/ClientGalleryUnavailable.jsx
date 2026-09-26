import { useTranslation } from 'react-i18next'
import { business } from '../utils/business'

// Do not restore the legacy client-side password check. Private delivery needs
// server-side authorization and protected files; see docs/WEBSITE-REVIEW.md.
export default function ClientGalleryUnavailable() {
  const { i18n } = useTranslation()
  const hu = i18n.language === 'hu'
  return <section className="pt-40 pb-24 px-6 max-w-3xl mx-auto">
    <h1 className="text-3xl mb-6">{hu ? 'Ügyfélgaléria' : 'Client gallery'}</h1>
    <p className="mb-6">{hu ? 'Az online ügyfélgaléria jelenleg nem érhető el. Kérjük, írj nekünk a képeid átadásának egyeztetéséhez.' : 'The online client gallery is currently unavailable. Please contact us to arrange delivery of your photographs.'}</p>
    <a className="underline" href={`mailto:${business.email}`}>{business.email}</a>
  </section>
}
