import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getSeo, localizedPath, siteUrl } from '../utils/seo'

export default function Seo() {
  const location = useLocation()
  const pathname = location.pathname.replace(/\/+$/, '') || '/'
  const { i18n } = useTranslation()
  useEffect(() => {
    const language = i18n.language === 'en' ? 'en' : 'hu'
    const seo = getSeo(pathname, language)
    document.title = seo.title
    document.querySelectorAll('[data-seo], meta[name="description"], meta[name="robots"]').forEach(node => node.remove())
    const add = (tag, attributes, content) => {
      const node = document.createElement(tag)
      node.dataset.seo = ''
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value))
      if (content) node.textContent = content
      document.head.appendChild(node)
    }
    add('meta', { name: 'description', content: seo.description })
    add('meta', { name: 'robots', content: seo.indexable ? 'index,follow' : 'noindex,follow' })
    if (seo.indexable) {
      add('link', { rel: 'canonical', href: seo.canonical })
      for (const lang of ['hu', 'en', 'x-default']) add('link', { rel: 'alternate', hreflang: lang, href: siteUrl + localizedPath(pathname, lang === 'x-default' ? 'hu' : lang) })
    }
    for (const [property, content] of Object.entries({ 'og:type': 'website', 'og:site_name': 'Prism Visuals Budapest', 'og:title': seo.title, 'og:description': seo.description, 'og:url': seo.canonical, 'og:image': seo.image, 'og:locale': language === 'hu' ? 'hu_HU' : 'en_GB' })) add('meta', { property, content })
    for (const [name, content] of Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': seo.title, 'twitter:description': seo.description, 'twitter:image': seo.image })) add('meta', { name, content })
    if (seo.structuredData) add('script', { type: 'application/ld+json' }, JSON.stringify(seo.structuredData))
  }, [pathname, i18n.language])
  return null
}
