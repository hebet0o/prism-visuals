import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import i18n from './i18n/config'
export { getSeo, publicPages, localizedPath, siteUrl } from './utils/seo'

export async function render(path, language) {
  await i18n.changeLanguage(language)
  const basename = `/${language}`
  return renderToString(<StaticRouter basename={basename} location={`${basename}${path === '/' ? '' : path}`}><App /></StaticRouter>)
}
