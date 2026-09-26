import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'

const sitemap = await readFile('dist/sitemap.xml', 'utf8')
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
assert.equal(urls.length, 12)
assert.equal(new Set(urls).size, urls.length)
const titles = new Set()
for (const url of urls) {
  const path = new URL(url).pathname
  const language = path.split('/')[1]
  const html = await readFile(`dist${path}/index.html`, 'utf8')
  assert.ok(html.includes(`<html lang="${language}">`), path)
  assert.ok(html.includes(`rel="canonical" href="${url}"`), path)
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, path)
  assert.equal((html.match(/hreflang=/g) || []).length, 3, path)
  assert.ok(html.includes('content="index,follow"'), path)
  assert.ok(!html.includes('noindex'), path)
  assert.ok(/<h1[ >]/.test(html), `Missing prerendered content: ${path}`)
  assert.ok(html.includes(`href="/${language}/contact"`), path)
  titles.add(html.match(/<title>(.*?)<\/title>/)[1])
  const schema = JSON.parse(html.match(/<script data-seo type="application\/ld\+json">(.*?)<\/script>/s)[1])
  assert.equal(schema.name, 'Prism Visuals Budapest')
  assert.equal(schema.hasOfferCatalog.itemListElement.length, 5)
  assert.ok(!('aggregateRating' in schema))
  const image = html.match(/property="og:image" content="(.*?)"/)[1]
  await access(`dist${new URL(image).pathname}`)
}
assert.equal(titles.size, urls.length)
for (const language of ['hu', 'en']) {
  for (const path of ['privacy-policy', 'terms', 'cookie-policy', 'business-details', 'accessibility']) {
    const html = await readFile(`dist/${language}/${path}/index.html`, 'utf8')
    assert.ok(html.includes('content="noindex,follow"'))
    assert.ok(!urls.some(url => url.endsWith(`/${path}`)))
  }
}
assert.ok((await readFile('dist/index.html', 'utf8')).includes('content="noindex,follow"'))
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes('Sitemap: https://prismvisuals.hu/sitemap.xml'))
assert.equal(await readFile('dist/llms.txt', 'utf8'), await readFile('public/llms.txt', 'utf8'))
const routing = JSON.parse(await readFile('vercel.json', 'utf8'))
for (const rule of routing.rewrites.filter(rule => rule.source !== '/(.*)')) await access(`dist${rule.destination}`)
for (const rule of routing.redirects) {
  assert.equal(rule.permanent, true)
  assert.ok(routing.rewrites.some(rewrite => rewrite.source === rule.destination))
}
console.log('SEO checks passed: 12 indexable URLs, 10 noindex legal pages, schema, language links, assets and deployment route targets.')
