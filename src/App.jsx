import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import WeddingGalleriesPage from './pages/WeddingGalleriesPage'
import PortfolioPage from './pages/PortfolioPage'
import PricingPage from './pages/PricingPage'
import ContactPage from './pages/ContactPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/wedding-galleries" element={<WeddingGalleriesPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Layout>
  )
}

export default App
