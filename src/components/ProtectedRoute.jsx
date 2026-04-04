import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '../utils/pocketbase'

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    if (!pb.authStore.isValid) {
      // Redirect to login with the current location
      navigate('/login', { state: { from: window.location.pathname } })
    }
  }, [navigate])

  // Show loading or redirect while checking auth
  if (!pb.authStore.isValid) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-brand-warm">Loading...</div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute