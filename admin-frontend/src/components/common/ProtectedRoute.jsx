import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

/**
 * ProtectedRoute — RULE 18
 *
 * - requireSuperAdmin: only superadmin can access (activity log, users, roles)
 *   roleName stored as 'superadmin' (matches setup.service.js and permissions.js)
 *
 * Route checks:
 *  - Not authenticated → /login
 *  - requireSuperAdmin + not superadmin → /dashboard
 *  - Otherwise → render children
 */
export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { user, roleName, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to="/login" replace />
  if (requireSuperAdmin && roleName !== 'superadmin') return <Navigate to="/dashboard" replace />

  return children
}
