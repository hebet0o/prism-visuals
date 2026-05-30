import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import MaintenancePage from './pages/MaintenancePage'
import AboutPage from './pages/AboutPage'
import WeddingGalleriesPage from './pages/WeddingGalleriesPage'
import PortfolioPage from './pages/PortfolioPage'
import PricingPage from './pages/PricingPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import GalleryPage from './pages/GalleryPage'

function App() {
  return (
    <Routes>
      {/* Maintenance page without layout */}
      <Route path="/" element={<MaintenancePage />} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/wedding-galleries" element={<Layout><WeddingGalleriesPage /></Layout>} />
      <Route path="/portfolio" element={<Layout><PortfolioPage /></Layout>} />
      <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

      {/* Gallery route without layout */}
      <Route path="/gallery/:name" element={<GalleryPage />} />

      {/* Auth routes without layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
