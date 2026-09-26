import { createServer } from 'vite'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, resolve: { alias: { 'react-router-dom': 'react-router' } } })
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
try {
  const { render, getSeo, publicPages, localizedPath, siteUrl } = await server.ssrLoadModule('/src/entry-prerender.jsx')
  const template = await readFile('dist/index.html', 'utf8')
  const legalPaths = ['/privacy-policy', '/terms', '/cookie-policy', '/business-details', '/accessibility']
  for (const language of ['hu', 'en']) {
    for (const path of [...Object.keys(publicPages), ...legalPaths]) {
      const seo = getSeo(path, language)
      const meta = (name, content, attribute = 'name') => `<meta data-seo ${attribute}="${name}" content="${escape(content)}" />`
      const tags = [meta('description', seo.description), meta('robots', seo.indexable ? 'index,follow' : 'noindex,follow')]
      if (seo.indexable) {
        tags.push(`<link data-seo rel="canonical" href="${seo.canonical}" />`)
        for (const lang of ['hu', 'en', 'x-default']) tags.push(`<link data-seo rel="alternate" hreflang="${lang}" href="${siteUrl + localizedPath(path, lang === 'x-default' ? 'hu' : lang)}" />`)
      }
      for (const [name, content] of Object.entries({ 'og:type': 'website', 'og:site_name': 'Prism Visuals Budapest', 'og:title': seo.title, 'og:description': seo.description, 'og:url': seo.canonical, 'og:image': seo.image, 'og:locale': language === 'hu' ? 'hu_HU' : 'en_GB' })) tags.push(meta(name, content, 'property'))
      for (const [name, content] of Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': seo.title, 'twitter:description': seo.description, 'twitter:image': seo.image })) tags.push(meta(name, content))
      if (seo.structuredData) tags.push(`<script data-seo type="application/ld+json">${JSON.stringify(seo.structuredData).replaceAll('<', '\\u003c')}</script>`)
      const html = template.replace('<html lang="hu">', `<html lang="${language}">`)
        .replace(/<title>.*?<\/title>/s, `<title>${escape(seo.title)}</title>`)
        .replace(/\s*<meta name="description"[^>]*>/, '')
        .replace('</head>', `${tags.join('\n    ')}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">${await render(path, language)}</div>`)
      const dir = `dist${localizedPath(path, language)}`
      await mkdir(dir, { recursive: true })
      await writeFile(`${dir}/index.html`, html)
    }
  }
  // The generic SPA shell is only used for admin, login, private or unknown URLs.
  await writeFile('dist/index.html', template.replace('</head>', '<meta name="robots" content="noindex,follow" /></head>'))
  const urls = Object.keys(publicPages).flatMap(path => ['hu', 'en'].map(language => `<url><loc>${siteUrl + localizedPath(path, language)}</loc>${['hu', 'en', 'x-default'].map(lang => `<xhtml:link rel="alternate" hreflang="${lang}" href="${siteUrl + localizedPath(path, lang === 'x-default' ? 'hu' : lang)}" />`).join('')}</url>`))
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`)
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
  await sharp('public/statikus-kepek/main-page/201.jpg').rotate().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85 }).toFile('dist/optimized/social-cover.jpg')
  console.log('Prerendered 22 localized pages; generated sitemap, robots.txt and social preview image.')
} finally {
  await server.close()
}
