import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '../utils/pocketbase'
import { isAdminRecord } from '../utils/adminAccess'

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    if (!pb.authStore.isValid || !isAdminRecord(pb.authStore.record)) {
      // Redirect to login with the current location
      navigate('/login', { replace: true, state: { from: { pathname: window.location.pathname } } })
    }
  }, [navigate])

  // Show loading or redirect while checking auth
  if (!pb.authStore.isValid || !isAdminRecord(pb.authStore.record)) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-brand-warm">Loading...</div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
