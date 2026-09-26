# Prism Visuals — privacy, legal and accessibility review

Review date: 26 September 2026. Status: local review version; not committed or deployed.

## Decision summary

The website now has Hungarian and English privacy, website terms, cookie/storage, business-details and accessibility pages. It collects less data, removes misleading submission behaviour, avoids external font requests and improves keyboard and visual accessibility. These are implementation improvements, not a legal certification or a guarantee against claims.

**Do not publish these as final legal notices yet.** Registration details, website/email providers, operational retention and server access controls remain incomplete. The client-gallery route is temporarily unavailable in this version because its existing browser-side access checks do not establish secure private delivery. This local change does not secure files already hosted online.

## Facts supplied by the owner

| Item | Recorded information |
| --- | --- |
| Operator | Iszak Gábor Adrián E.V; owner confirms the business is operating |
| Address | 1149 Budapest 14. Nagy Lajos Király útja 125. B lph. 2. em. 1 a. |
| Tax number | 90845745-1-42 |
| Telephone | +36 30 562 1723 |
| Existing website email | info@prismvisuals.hu; hosting and readiness still to confirm |
| Database/gallery infrastructure | Hetzner, Nuremberg, Germany |
| Full client galleries | One year after delivery |
| Full-gallery backups | Delete at the same one-year deadline; no additional automatic year |
| References | Selected client-approved images on Wedding Galleries or other portfolio pages |
| Registration number | Not supplied |

The address and tax number were entered as supplied, not independently matched to a registry. Hetzner's legal identity/address/contact were taken from its [official legal notice](https://www.hetzner.com/legal/legal-notice/). A production HEAD response identified Vercel, but that does not establish the contracting entity, all processing countries or the provider agreement.

## Changes made

### Legal information

Added footer links and bilingual routes:

| Route | Purpose |
| --- | --- |
| `/privacy-policy` | Purposes, proposed bases, recipients, retention, rights, NAIH and photo publication |
| `/terms` | Website use, separate booking agreements, cancellation/consumer rights, copyright and complaints |
| `/cookie-policy` | Actual browser storage, no optional tracking banner, conditions for future tracking |
| `/business-details` | Operator identity and explicit missing-information labels |
| `/accessibility` | Implemented assistance, reporting channel and audit limitations |

Content lives in `src/utils/legalContent.js`; factual settings in `src/utils/business.js`; rendering in `src/pages/LegalPage.jsx`. Missing details deliberately display as pending. Draft notices are visible rather than silently inventing facts.

### Contact and reviews

- The old contact form logged personal data and simulated success without sending a message. It now prepares an email draft with an optional name and required message. The visitor sends it from their own mail application. It never claims delivery.
- Removed unnecessary contact email/telephone fields. The sender address is received naturally when the visitor sends the email. No newsletter or bundled marketing permission was added.
- Reviews submit directly to PocketBase with isVisible: false for admin moderation. The form includes an initially unticked publication permission, allows a nickname and makes event/location optional. Success appears only after the create request succeeds; failures retain entered text. Admin visibility/delete controls remain connected. See the moderation setup below for required server enforcement and consent storage.
- Removed the hardcoded example testimonial, review-cache migration and persistent personal review cache. Existing database reviews still need an owner audit for authenticity and permission.
- Email client behaviour and actual mailbox delivery were not exercised. Mailto requires an installed/configured handler and may have practical length limits; a direct email fallback is provided.

Relevant files: ContactContainer, ContactForm, ReviewForm, useReviews and HomePage.

### Tracking, embeds and storage

- No analytics SDK, advertising pixel, embedded social feed or iframe was found in the reviewed active application code. Unfinished social links were removed.
- Google font requests were replaced with local Montserrat and Playfair Display files, including their OFL licence files under `public/fonts`.
- Language selection, administrator authentication and administrative cover selections use session storage. Blocked storage falls back to in-memory authentication rather than breaking initialization.
- Public gallery reads request a limited field set. This reduces accidental data retrieval; it does not enforce authorization on the server.

| Data/storage | Purpose and duration | Remaining action |
| --- | --- | --- |
| `language` | Remember an explicitly selected language for the tab session | No optional tracking use |
| `pocketbase_auth` | Requested administrator login; clear on logout/session end | Test actual admin login/logout; review server token expiry and account security |
| `gallery_cover_*` | Administrator's selected covers in session | Administrative functionality only |
| Old local storage | Old gallery flags, tokens or review data are no longer read by this version | May remain on existing browsers until website data is cleared |
| Connection logs/IP/browser data | Hosting/security operations | Confirm provider, purpose, access, exact log periods and lawful basis |
| Enquiries | Pre-contract steps for bookings; justified legitimate interest for other replies | Six months after final reply is a proposed unsuccessful-enquiry period, not an implemented mailbox rule |
| Client photos | Agreed service and separately assessed rights/bases for people pictured | One-year deletion needs server/backup implementation |
| Portfolio/reviews | Separate documented publication permission where applicable | Review necessity at least annually; remove when withdrawn/no longer justified |

Browser restore features can restore session storage. Session storage is still covered by device-storage privacy rules; it is not exempt merely because it is not called a cookie.

**Cookie consent assessment:** no optional banner is necessary for the reviewed configuration using only narrowly necessary requested functions. This is conditional on production/CDN configuration: a source-code audit and one HEAD response cannot exclude platform-added tracking. Obtain prior consent before optional analytics, advertising or non-essential embeds/storage; keep rejection as accessible as acceptance. The [EU business privacy guide](https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm) and [Working Party Opinion 04/2012](https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf) support the necessity-based assessment. A production HEAD response showed no Set-Cookie, but that is not a full-session network audit.

### Private-gallery security — unresolved release blocker

The legacy ClientGalleryPage checked a password-like field in frontend code and persisted a browser authorization flag. Guest/PIN logic and client-side record filters cannot establish server authorization. A user controlling their browser can bypass frontend checks. The configured server rules were not available in this repository, so actual external exposure has not been proven or ruled out.

The `/gallery/:name` route now renders an unavailable/contact page and does not mount the legacy flow. New admin-created galleries/photos default to hidden, and an admin warning explains the unresolved access and deletion requirements. The legacy source remains for review but is not routed.

**This is a local pause, not a backend security repair.** Existing API routes, file URLs and the deployed site are unchanged. Do not upload private client data until the server is reviewed. PocketBase says files are public by default; protected files need correct authorization rules as well as tokens. See [PocketBase files](https://pocketbase.io/docs/files-handling/) and [API rules](https://pocketbase.io/docs/api-rules-and-filters/).

Required server work: separate public approved references from private originals; enforce client identity/entitlements in collection rules or authenticated server endpoints; use protected file fields with restrictive view rules; avoid readable passwords; expire/revoke sessions or links; constrain guest actions; verify unauthenticated and cross-client requests fail, including original/thumbnail URLs. Review existing exposure and logs before deciding whether any incident response is needed. No production records, permissions or files were changed in this task.

### Accessibility and presentation

- Added skip navigation, visible keyboard focus, route focus on main content and document language updates.
- Replaced mobile navigation and gallery overlays with native modal dialogs to support Escape, focus containment, inert background and focus restoration. Gallery/card actions support Enter/Space; carousel controls have names and keyboard support.
- Forms have explicit labels, native required validation, bounded input lengths and announced feedback. Login fields use appropriate autocomplete.
- Added slideshow pause/resume and reduced-motion support; removed automatic carousel playback. Hero content can grow instead of being clipped by a fixed height.
- Improved bronze colour, muted text visibility, control borders. Review dots have larger targets.
- Added accurate descriptions for the inspected featured images. Decorative hero backgrounds use empty alt. Dynamic galleries prefer supplied altText/description and otherwise fall back to gallery context plus an image number. Those fallbacks are not an adequate substitute for individual descriptive text for all photographs.
- Failed gallery loading now displays an error instead of suggesting there are simply no galleries.

Calculated sRGB contrast examples (not a complete page certification):

| Text/background | Before | After |
| --- | --- | --- |
| Bronze on charcoal | 4.46:1 | 6.60:1 |
| Bronze on brand black | — | 8.60:1 |
| Hero text over images | — | Previous gradient restored at owner request; earlier 4.72:1 calculation no longer applies |
| Muted text on charcoal | — | 4.99:1 |

WCAG AA requires at least 4.5:1 for normal text, with different thresholds for large text and non-text controls. Transparent overlays and all content states still require assessment. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) is the target, not a certification.

The European Accessibility Act's application depends on the actual service and business size. A service-provider microenterprise exemption may apply, but sole-trader status alone does not prove eligibility. Confirm workforce and turnover/balance-sheet conditions before relying on it; absence of checkout alone is not a complete scope assessment. See the [official EU summary](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=legissum:4403933) and [Hungarian Act XVII of 2022](https://njt.jog.gov.hu/jogszabaly/2022-17-00-00.0).

### Claims and pricing

Removed unsupported popularity badges, a seeded testimonial and unconfirmed service guarantees. Numeric package prices are temporarily replaced by requests for a quote because tax-inclusive consumer pricing/VAT status needs confirmation; original values remain in translation data for review. Agreed scope, delivery date and final tax-inclusive price should appear in the actual quote/contract. The existing logo arrangement and committed favicon were retained.

## Answers to the legal questions

### Is the sole-trader registration number needed?

Yes: the provider-information requirements include registration authority/register and number where registered, alongside name, address, contact details and applicable tax information. The website's hosting provider must also be identified. Supply the actual details rather than leaving them out because there is no checkout. See [Act CVIII of 2001, §4](https://njt.jog.gov.hu/jogszabaly/2001-108-00-00).

### Is a refund page or compulsory form consent needed?

There is no checkout to attach an online refund workflow to, so cancellation/refund information is included in the terms and deferred to the service agreement and mandatory law. No blanket non-refundable rule was added. Contracts made by email/phone can still be distance contracts, generally with a 14-day service withdrawal period where applicable. Early performance requests and loss of rights need the prescribed disclosures and acknowledgements; assess any exception for the actual service. See [Government Decree 45/2014](https://njt.jog.gov.hu/jogszabaly/2014-45-20-22).

For a normal enquiry, provide a privacy notice and use the appropriate lawful basis; forcing a visitor to consent to all processing is unnecessary. Publication of a review or photo is a separate choice. Merely accepting website terms does not establish valid consent for every use.

Written consumer complaints are addressed in the terms with a 30-day reply and three-year record period, and a conciliation contact. Sources: [Consumer Protection Act §17/A](https://njt.jog.gov.hu/jogszabaly/1997-155-00-00) and [Budapest Conciliation Board](https://bekeltet.bkik.hu/elerhetosegek). The discontinued EU ODR platform is not linked; see the [Commission's relocation notice](https://consumer-redress.ec.europa.eu/site-relocation_en).

### Does owning the photos resolve copyright and publication?

It supports your copyright position for photographs you actually created, but does not settle the subjects' image/privacy rights, third-party artwork/music or any contractual restrictions. In Hungary, making and using a person's likeness generally requires permission, subject to narrow statutory exceptions such as crowd/public-life images. A wedding is not automatically such an exception. Couple/client approval does not automatically authorize every identifiable guest or child. See [Civil Code §2:48](https://njt.jog.gov.hu/jogszabaly/2013-5-00-00).

### Can photos be stored after delivery? Is online acceptance necessary?

Delivery is not an automatic cutoff, nor permission for indefinite retention. Tell people before processing what is stored, why, by whom and for how long. Necessary performance of a client's contract can be an appropriate basis for that client's data; other subjects and continued storage require their own assessment. A one-year availability commitment should be agreed and its necessity documented. It is your chosen operational period, not a statutory safe harbour. Online checkbox acceptance is not inherently required if an appropriate contract/notice and evidence exist. A checkbox also cannot retrospectively cure undisclosed or unlawful processing. See [GDPR Articles 5, 6, 7, 13–14 and 28](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679) and [Commission principles](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en).

Use separate optional permission for selected portfolio images and any optional extended archive. Keep a record of the selected image IDs, people covered, permitted channels, wording/version, date and evidence. Website publication does not imply Instagram/Facebook permission. Give withdrawal a working route; withdrawal stops future consent-based use, while earlier lawful use is not retroactively unlawful. Handle minors through the appropriate representative and assess their interests. Consult Hungarian counsel for the final booking/release workflow, especially guests and children.

Suggested optional publication wording to adapt to actual selected images and channels:

> I permit Iszak Gábor Adrián E.V (Prism Visuals) to publish the selected photographs listed in [image list] in the website portfolio at prismvisuals.hu. This is optional and does not affect my photography service. I can withdraw permission at info@prismvisuals.hu. The privacy notice explains recipients, retention and my rights.

> Hozzájárulok, hogy Iszak Gábor Adrián E.V (Prism Visuals) a [képlista] szerinti kiválasztott fényképeket a prismvisuals.hu weboldal portfóliójában közzétegye. Ez önkéntes, és nem feltétele a fotós szolgáltatásnak. A hozzájárulást az info@prismvisuals.hu címen visszavonhatom. A címzettekről, megőrzésről és jogaimról az adatkezelési tájékoztató ad tájékoztatást.

This template is not blanket permission from everyone pictured. Add separate choices for additional channels and obtain permission from the appropriate person. Keep permission evidence restricted and only as long as its purpose justifies; avoid collecting identity-document copies by default.

## One-year deletion procedure to implement

1. Record the actual delivery date and an explicit expiry date for each client gallery. Inform the client of that date and agreed download availability.
2. Delete the full gallery at the anniversary, including originals, derivatives/thumbnails and cached copies under your control. Hiding a record does not delete a file.
3. Expire all corresponding full-gallery backups at the same deadline. Configure backup rotation accordingly; restoration must not reintroduce already deleted items. Record completion without retaining unnecessary image content.
4. Keep only separately selected, approved reference copies in a distinct public collection. Record rights/permissions and review them annually, removing them upon applicable withdrawal or when the purpose ends.
5. Document any narrowly necessary legal hold separately, restrict access and set a review/end date. Accounting obligations do not automatically justify retaining the whole photo library.

No scheduled deletion job was added: backend/backup configuration is absent from this repository. The new policy describes the agreed target and visibly flags this operational gap.

## Verification performed and limits

- `npm run build` passed: 101 modules compiled. Browserslist reports an outdated compatibility database; no dependency update was made for this task.
- `git diff --check` passed; Git reported line-ending conversion notices only.
- Browser checks covered contact/form labels and native validation structure, language updates, visible focus, legal routes, footer links and the paused client-gallery route.
- Mobile privacy page at 390 × 844 had no horizontal overflow. Mobile menu opened as a dialog; Escape closed it and restored focus to the Open menu button. Desktop legal routes rendered their expected headings without missing img alt attributes or horizontal overflow in the inspected DOM.
- Featured images were visually inspected before writing descriptions. Main colour pairs were calculated; this is not an exhaustive contrast audit.
- Public gallery API loading failed in the test browser. Its populated dialog/lightbox behaviour, real image descriptions and live server rules could not be verified end to end. The UI now reports this failure honestly.
- No real enquiry/review email was sent, no admin credentials were used, and no production upload/deletion/permission changes were performed.
- Full screen-reader testing, comprehensive zoom/mobile assistive-technology testing, server penetration testing, all file metadata/EXIF inspection and a production tracking-session audit remain outstanding. Inspect exported public images for GPS/other unnecessary metadata before publication.
- Existing user changes in `index.html`, `package-lock.json` and the untracked `public/prism_final.svg` were preserved. No commit or deployment was made.

## Before release

| Priority | Action |
| --- | --- |
| Critical | Verify/fix PocketBase authorization and protected files before resuming private galleries; review existing hosted data separately |
| Required | Supply registration number and registration authority; verify entered business facts |
| Required | Confirm website host legal identity/address/contact, email provider, processing countries, DPAs/subprocessors and any international-transfer safeguards |
| Required | Verify info@prismvisuals.hu works before offering it as the enquiry, rights and complaint channel |
| Required | Implement and test one-year deletion of galleries and backups; confirm log and unsuccessful-enquiry retention |
| Required | Audit all existing public photos/reviews for documented publication rights; add meaningful dynamic image descriptions |
| Required | Complete service quote/contract, consumer disclosures, cancellation and image-release workflow; confirm tax-inclusive prices before restoring them |
| Review | Check deployed headers/network for optional tracking and host-added services; update notice before enabling social embeds/analytics |
| Review | Finish assistive-technology/content testing and assess legal accessibility scope |
| Final | Replace draft notices only after facts and actual operations match; review this diff, then explicitly authorize commit/deployment |

This document and the local implementation are ready for owner review. The external operational and legal-detail items above remain open rather than being represented as completed.

## Follow-up: homepage design and moderated reviews

The original transparent-at-top header and 30%/40%/70% hero gradient are restored. The pause control is now a small 44px circular icon with a translated accessible name, tooltip and visible keyboard focus. Reduced-motion support remains. Restored image overlays need slide-specific contrast review; the earlier opaque-overlay result is superseded.

The review form again uses bronze uppercase labels, charcoal fields, a two-column name/event row on larger screens and a full-width bronze submit button. It submits hidden reviews directly to PocketBase, without email or immediate publication. Existing admin controls can publish/hide/delete reviews and the admin query includes hidden records. Consent metadata is sent as publicationConsent; persistence requires the schema addition below.

### PocketBase setup required before release

No backend schema or administrator credentials are available in this repository. These settings have NOT been applied to production.

- Keep isVisible as a boolean defaulting to false. Enforce the hidden state on public create requests server-side: e.g. require `@request.body.isVisible = false`, or a server hook that forces it. Do not rely solely on frontend payloads.
- Public list/view rules must expose only isVisible = true. Permit all-review access only to the actual admin identity/role used by this installation. Update/delete must be admin-only; authenticated alone is insufficient if clients can sign in.
- Add a JSON field named publicationConsent for the submitted version, text, language and acceptedAt. Protect this field from public read responses using the installed PocketBase version’s supported hidden-field or server-response mechanism. Unknown fields can be ignored without being stored, so verify persistence explicitly. Use server-created time as the receipt time; the visitor timestamp is not trusted evidence. Validate required consent and bounded text on the server.
- Add server rate limiting/abuse prevention. Delete rejected reviews within the proposed 30-day period and adopt an actual moderation/retention schedule.
- Test with two roles: visitor creates hidden, visitor cannot list/view pending or update/delete/publish; admin sees pending and can toggle/delete; approved reviews appear publicly. No live test reviews were posted in this task.

Rule semantics: [official PocketBase API rules documentation](https://pocketbase.io/docs/api-rules-and-filters/). The local implementation is ready for review; server enforcement and consent persistence are unverified.

Follow-up validation: production build passed; mocked PocketBase checks passed for forced hidden creation, exclusion from public state, rejected create propagation, and admin visibility/delete state updates. Browser verified the translated pause/play name change and restyled review form. No real review was submitted.

