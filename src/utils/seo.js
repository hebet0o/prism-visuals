import { business } from './business'

export const siteUrl = 'https://prismvisuals.hu'
export const publicPages = {
  '/': {
    hu: ['Esküvői fotózás és videózás Budapesten', 'Esküvői fotózás, esküvői filmek, portrék és üzleti videók Budapesten és Magyarországon. Ismerd meg a Prism Visuals munkáit és csomagjait.'],
    en: ['Wedding Photography & Videography in Budapest', 'Wedding photography, wedding films, portraits and business videos in Budapest and Hungary. Explore the Prism Visuals portfolio and packages.'],
  },
  '/about': {
    hu: ['Rólunk – fotós és videós csapat', 'Ismerd meg a Prism Visuals budapesti csapatát: Iszak Gábort és Horváth Balázst, valamint fotós és videós munkáikat.'],
    en: ['About Our Photography & Video Team', 'Meet the Budapest-based Prism Visuals team: photographer Gábor Iszak and videographer Balázs Horváth.'],
  },
  '/wedding-galleries': {
    hu: ['Esküvői galériák', 'Válogatás a Prism Visuals esküvői fotóiból. Nézd meg a párok történeteit, és keress minket esküvői fotózással kapcsolatban.'],
    en: ['Wedding Galleries', 'Explore selected wedding photographs and stories by Prism Visuals. Get in touch about wedding photography in Budapest and Hungary.'],
  },
  '/portfolio': {
    hu: ['Fotós és videós portfólió', 'Portrék, események, üzleti fotók és videók a Prism Visuals portfóliójában. Válogatás budapesti fotós és videós csapatunk munkáiból.'],
    en: ['Photography & Video Portfolio', 'Explore portraits, events, commercial photography and video work in the Prism Visuals portfolio. A selection from our Budapest-based team.'],
  },
  '/pricing': {
    hu: ['Fotózás és videózás árak, csomagok', 'Esküvői fotós, videós és közös csomagok árai, valamint marketingvideós szolgáltatások. Nézd meg a csomagok tartalmát, és egyeztess velünk.'],
    en: ['Photography & Videography Prices and Packages', 'Compare wedding photography, videography and combined packages, plus marketing video services. View prices and discuss your project with us.'],
  },
  '/contact': {
    hu: ['Kapcsolat és időpont-egyeztetés', 'Keress minket esküvői fotózás, portré, rendezvény vagy üzleti videó kapcsán. Prism Visuals Budapest: info@prismvisuals.hu, +36 30 562 1723.'],
    en: ['Contact & Booking Enquiries', 'Contact Prism Visuals Budapest about weddings, portraits, events or business videos: info@prismvisuals.hu, +36 30 562 1723.'],
  },
}

export function localizedPath(path, language) {
  return `/${language}${path === '/' ? '' : path}`
}

export function getSeo(path, language) {
  path = path.replace(/\/+$/, '') || '/'
  const page = publicPages[path]
  const secondaryTitles = {
    '/privacy-policy': ['Adatkezelési tájékoztató', 'Privacy Policy'],
    '/terms': ['Felhasználási feltételek', 'Website Terms'],
    '/cookie-policy': ['Sütik és tárhely', 'Cookies & Storage'],
    '/business-details': ['Impresszum', 'Business Details'],
    '/accessibility': ['Akadálymentesség', 'Accessibility'],
    '/login': ['Bejelentkezés', 'Login'],
    '/admin': ['Adminisztráció', 'Administration'],
  }
  const secondaryTitle = secondaryTitles[path]?.[language === 'hu' ? 0 : 1]
  const [name, description] = page?.[language] || [secondaryTitle || (language === 'hu' ? 'Weboldal' : 'Website'), 'Prism Visuals Budapest']
  return {
    title: `${name} | Prism Visuals`, description,
    canonical: siteUrl + localizedPath(path, language),
    indexable: Boolean(page),
    image: `${siteUrl}/optimized/social-cover.jpg`,
    structuredData: page ? {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteUrl}/#business`,
      name: 'Prism Visuals Budapest', legalName: business.name,
      url: siteUrl + localizedPath('/', language),
      image: `${siteUrl}/optimized/social-cover.jpg`,
      email: business.email, telephone: business.phone,
      areaServed: { '@type': 'Country', name: 'Hungary' },
      description,
      hasOfferCatalog: {
        '@type': 'OfferCatalog', name: language === 'hu' ? 'Fotózás és videózás' : 'Photography and videography',
        itemListElement: (language === 'hu'
          ? ['Esküvői fotózás', 'Esküvői videózás', 'Portréfotózás', 'Rendezvényfotózás', 'Üzleti fotózás és videózás']
          : ['Wedding photography', 'Wedding videography', 'Portrait photography', 'Event photography', 'Business photography and videography']
        ).map(name => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
      },
    } : null,
  }
}
