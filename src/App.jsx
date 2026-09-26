import Seo from './components/Seo'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
// import MaintenancePage from './pages/MaintenancePage'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import WeddingGalleriesPage from './pages/WeddingGalleriesPage'
import PortfolioPage from './pages/PortfolioPage'
import PricingPage from './pages/PricingPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import LegalPage from './pages/LegalPage'
import GalleryPage from './pages/GalleryPage'
import { legalRoutes } from './components/presentational/LegalLinks'

function App() {
  return (
    <>
    <Seo />
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/wedding-galleries" element={<Layout><WeddingGalleriesPage /></Layout>} />
      <Route path="/portfolio" element={<Layout><PortfolioPage /></Layout>} />
      <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

      {/* Gallery route without layout */}
      <Route path="/gallery/:name" element={<GalleryPage />} />
      {legalRoutes.map(([kind, path]) => <Route key={kind} path={path} element={<Layout><LegalPage kind={kind} /></Layout>} />)}

      {/* Auth routes without layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
    </>
  )
}

export default App
