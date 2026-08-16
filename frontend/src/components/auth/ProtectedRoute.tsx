import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

/**
 * Wraps routes that require the user to be authenticated.
 * Unauthenticated visitors are redirected to /login with a return path.
 * Shows nothing while auth state is loading to avoid flash redirects.
 */
export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
