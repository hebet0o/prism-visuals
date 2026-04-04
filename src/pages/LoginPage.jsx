import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import pb from '../utils/pocketbase'

const LoginPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/admin'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await pb.collection('users').authWithPassword(formData.email, formData.password)

      // Redirect to the page they were trying to access or admin dashboard
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login failed:', error)
      setError(t('admin.login.error') || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-brand-warm mb-4">
            {t('admin.login.title') || 'Admin Login'}
          </h1>
          <p className="text-brand-muted">
            {t('admin.login.subtitle') || 'Access the admin dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-dark p-8 rounded-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="email" className="block text-brand-warm font-medium mb-2">
              {t('admin.login.email') || 'Email'}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-brand-black border border-brand-charcoal rounded-md text-brand-warm placeholder-brand-muted focus:outline-none focus:border-brand-bronze"
              placeholder={t('admin.login.emailPlaceholder') || 'Enter your email'}
            />
          </div>

          <div className="mb-8">
            <label htmlFor="password" className="block text-brand-warm font-medium mb-2">
              {t('admin.login.password') || 'Password'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-brand-black border border-brand-charcoal rounded-md text-brand-warm placeholder-brand-muted focus:outline-none focus:border-brand-bronze"
              placeholder={t('admin.login.passwordPlaceholder') || 'Enter your password'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (t('admin.login.loading') || 'Logging in...') : (t('admin.login.submit') || 'Login')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage