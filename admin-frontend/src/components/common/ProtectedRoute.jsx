import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { user, role, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to="/login" replace />
  if (requireSuperAdmin && role !== 'super_admin') return <Navigate to="/dashboard" replace />

  return children
}
