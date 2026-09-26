import { useTranslation } from 'react-i18next'
import { business, legalNeedsReview, LEGAL_VERSION } from '../utils/business'
import { legalContent } from '../utils/legalContent'
import LegalLinks from '../components/presentational/LegalLinks'

export default function LegalPage({ kind }) {
  const { i18n } = useTranslation()
  const hu = i18n.language === 'hu'
  const content = legalContent[hu ? 'hu' : 'en'][kind]
  const missing = hu ? 'Még nincs megadva – közzététel előtt pótolandó.' : 'Not yet supplied — required before publication.'
  return <article className="pt-40 pb-24 px-6 max-w-4xl mx-auto leading-relaxed">
    <h1 className="text-3xl md:text-5xl mb-6">{content.title}</h1>
    <p className="text-sm text-brand-muted mb-8">{hu ? 'Felülvizsgálati változat' : 'Review version'}: {LEGAL_VERSION}</p>
    {legalNeedsReview && <p className="border border-brand-bronze p-5 mb-10 text-brand-warm" role="note">
      {hu ? 'Tervezet: a nyilvántartási szám, egyes szolgáltatói adatok és az üzemeltetési beállítások még kiegészítésre várnak. Ez a változat nem tekinthető végleges adatkezelési vagy szerződéses tájékoztatónak.' : 'Draft: the registration number, some provider details and operational settings still need completion. This version is not a final privacy or contractual notice.'}
    </p>}
    {(kind === 'business' || kind === 'privacy') && <section className="mb-10">
      <h2 className="text-2xl mb-4">{hu ? 'Üzemeltető / adatkezelő' : 'Operator / data controller'}</h2>
      <p>{business.registrationConfirmed ? business.name : (hu ? `Tervezett vállalkozói név: ${business.name}. Bejegyzés még nincs megerősítve; kapcsolattartó: Iszak Gábor Adrián.` : `Planned trading name: ${business.name}. Registration is not yet confirmed; contact: Iszak Gábor Adrián.`)}</p>
      <a className="underline" href={`mailto:${business.email}`}>{business.email}</a>
      <dl className="mt-4 space-y-3">
        {[
          ['address', 'Székhely / levelezési cím', 'Registered / correspondence address'],
          ['registrationNumber', 'Nyilvántartási szám', 'Registration number'],
          ['registerAuthority', 'Nyilvántartó szerv', 'Registration authority'],
          ['taxNumber', 'Adószám', 'Tax number'],
          ['phone', 'Telefonszám', 'Telephone'],
          ['hostingProvider', 'Webtárhely szolgáltatója', 'Website hosting provider'],
          ['hostingAddress', 'Tárhelyszolgáltató címe', 'Hosting provider address'],
          ['hostingContact', 'Tárhelyszolgáltató elérhetősége', 'Hosting provider contact'],
          ['backendProvider', 'Képtár / adatbázis szolgáltatója', 'Gallery / database provider'],
          ['emailProvider', 'Levelezési szolgáltató', 'Email provider'],
          ['serverLocations', 'Adatkezelés országai és adattovábbítások', 'Processing countries and international transfers'],
        ].map(([key, labelHu, labelEn]) => <div key={key}><dt className="font-semibold">{hu ? labelHu : labelEn}</dt><dd className="text-brand-muted break-words">{business[key] || missing}</dd></div>)}
      </dl>
    </section>}
    {content.sections.map(([heading, ...paragraphs]) => <section key={heading} className="mb-10">
      <h2 className="text-2xl mb-4">{heading}</h2>
      {paragraphs.map(p => <p key={p} className="mb-4 text-brand-offwhite">{p}</p>)}
    </section>)}
    {kind === 'privacy' && <section className="mb-10">
      <h2 className="text-2xl mb-4">{hu ? 'Ügyfélképek megőrzése' : 'Client-image retention'}</h2>
      <p>{hu ? 'Ügyfélgaléria: ' : 'Client gallery: '}{hu ? 'Az átadástól számított 1 év. Ezt követően a teljes ügyfélgalériát törölni kell.' : '1 year after delivery, followed by deletion of the full client gallery.'}</p>
      <p>{hu ? 'Biztonsági másolatok: ' : 'Backups: '}{hu ? 'Az átadástól számított 1 év; a teljes képsorozat másolatait is törölni kell. Külön, igazolható engedéllyel kiválasztott portfólióképek tarthatók meg, a cél fennállásáig vagy visszavonásig, éves felülvizsgálattal. A törlés szerveroldali beállítása még ellenőrzésre vár.' : '1 year after delivery; full-gallery backups must also be deleted. Separately selected portfolio images may be retained with documented permission while the purpose remains, or until withdrawal, with annual review. Server-side deletion configuration still requires verification.'}</p>
    </section>}
    <section className="mb-10">
      <h2 className="text-2xl mb-4">{hu ? 'Hivatalos források' : 'Official sources'}</h2>
      <ul className="list-disc pl-6 space-y-3">{content.sources.map(([label, url]) => <li key={url}><a className="underline underline-offset-4" href={url}>{label}</a></li>)}</ul>
    </section>
    <LegalLinks />
  </article>
}
