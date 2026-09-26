# Search improvements — 26 September 2026

## Implemented

- Build-time HTML rendering for 22 pages: 11 existing routes in Hungarian and English. The same React components produce the HTML; styling, page copy, pricing and package contents were not redesigned or rewritten.
- Stable `/hu` and `/en` URLs. Navigation stays in the chosen language. The existing language button navigates to the matching translated page, preserving query parameters and fragments. A language switch now loads a new document, so unsent form contents and selected tabs reset.
- Vercel permanent redirects from the 11 old public URLs to their Hungarian equivalents. `/login`, `/admin` and `/gallery/:name` remain available at their existing URLs. Local Vite development/preview does not apply Vercel redirects.
- Unique localized titles and descriptions for the six main pages, canonical URLs, reciprocal Hungarian/English hreflang links and Hungarian `x-default` links. Metadata updates during client-side navigation too.
- `dist/sitemap.xml`, generated on every build, contains the 12 indexable language/page combinations. No invented last-modified dates or priority values.
- `dist/robots.txt` identifies the sitemap and allows crawling so crawlers can read `noindex` directives. Robots rules are not authentication or a guarantee of privacy.
- Organization and service-catalog JSON-LD uses the supplied operator name, email, phone and existing services. No fabricated reviews, star ratings, awards, opening hours, social profiles or storefront claims. Organization markup does not claim eligibility for Google's Local Business rich results.
- Open Graph and Twitter card metadata, with a 1200 × 630 JPEG generated from the existing first homepage photograph for shared-link previews. It does not replace the photograph displayed on the site.
- Existing `llms.txt` included and its links updated to English canonical URLs.
- Admin, login, private-gallery, unknown and draft legal pages use `noindex,follow`. Legal pages remain accessible in the footer but are omitted from the sitemap pending completion of the previously documented legal review.
- Browser-only initialization was adjusted for server rendering. React hydrates generated HTML instead of discarding it. Reduced-motion support is retained.

## Build and validation

Run `npm run build`, then `npm run check:seo`. Deploy the complete `dist` directory. The Vercel build command is explicitly set to `npm run build`; running only `vite build` would omit generated HTML and SEO files.

The build passed. The verification script checked all 12 sitemap URLs, unique titles, language attributes, canonical and alternate links, prerendered headings, JSON-LD, image existence, 10 noindex legal pages, fallback noindex, llms.txt copying, and deployment route targets. Browser checks covered Hungarian/English homepages, direct pricing-page loading, navigation metadata, switching language on an inner page, and the mobile menu at 390 × 844. No hydration errors were observed in these browser checks. Git whitespace checks passed.

The installed Browserslist dataset emits an age warning; it does not prevent the build. The existing Sharp dependency/lockfile changes are included because image generation now also uses Sharp during the build.

## Limits and remaining owner actions

1. Deploy this commit. No deployment or push was performed as part of this work. Check the production redirects, `/sitemap.xml`, `/robots.txt`, `/hu`, `/en` and an inner page after deployment; local preview does not validate Vercel's edge routing.
2. Verify `prismvisuals.hu` in Google Search Console using your Google account and domain/DNS access. Submit `https://prismvisuals.hu/sitemap.xml`, then inspect representative Hungarian and English URLs. No account verification token was available, so none was invented or added.
3. Create or update the genuine Google Business Profile through the owner's account. Confirm whether clients can visit the registered address. If the business travels to customers and does not receive them there, use the appropriate service-area setup and hide the address on the profile. No Google profile was created or modified.
4. Finish the outstanding legal information described in `docs/WEBSITE-REVIEW.md`. Then deliberately revisit indexing of those pages; this implementation keeps them noindex regardless of later text edits.
5. Public gallery contents and approved reviews still load live from PocketBase in the browser, preserving moderation behavior. They are not copied into static build files, and private records are not fetched during prerendering. The gallery introduction is prerendered, but live gallery photographs/reviews still require JavaScript. Pricing initially renders the existing Photography tab; other tabs keep their existing interactive behavior.
6. Sitemap discovery, structured data and `llms.txt` do not guarantee rankings, rich results or AI mentions. No ads, analytics, tracking pixels, paid services or new visitor-data collection were added.

The earlier pricing-research document is unrelated to this SEO implementation and was left uncommitted.

## Official references

- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: building and submitting a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: Local Business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google Business Profile representation guidelines](https://support.google.com/business/answer/3038177)
- [Vercel: routing and project configuration](https://vercel.com/docs/project-configuration/vercel-json)
