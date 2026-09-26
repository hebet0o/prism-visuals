import Header from '../presentational/Header'
import Footer from '../presentational/Footer'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Layout = ({ children }) => {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [pathname])
  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">{i18n.language === 'hu' ? 'Ugrás a tartalomra' : 'Skip to content'}</a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
