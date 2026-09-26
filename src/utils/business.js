// Complete and verify these facts before publishing the legal pages.
// Empty values deliberately render as pending; never invent registration details.
export const business = {
  name: 'Iszak Gábor Adrián E.V',
  registrationConfirmed: true,
  email: 'info@prismvisuals.hu',
  address: '1149 Budapest 14. Nagy Lajos Király útja 125. B lph. 2. em. 1 a.',
  registrationNumber: '',
  taxNumber: '90845745-1-42',
  phone: '+36 30 562 1723',
  registerAuthority: '',
  hostingProvider: '',
  hostingAddress: '',
  hostingContact: '',
  backendProvider: 'Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany; info@hetzner.com — PocketBase: Nürnberg, Germany',
  emailProvider: '',
  serverLocations: '',
  galleryRetention: '1 év az átadástól / 1 year after delivery. Selected reference images require a separate lawful purpose and publication permission where applicable.',
  backupRetention: '1 év az átadástól / 1 year after delivery; delete full-gallery backups with the delivered gallery.',
}

export const LEGAL_VERSION = '2026-09-26-review'
export const legalNeedsReview = !business.registrationConfirmed ||
  ['address', 'registrationNumber', 'taxNumber', 'registerAuthority', 'hostingProvider',
    'hostingAddress', 'hostingContact', 'backendProvider', 'emailProvider', 'serverLocations',
    'galleryRetention', 'backupRetention'].some(key => !business[key])
