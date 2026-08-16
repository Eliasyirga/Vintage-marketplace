import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/auth'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  roles: UserRole[]
}

/**
 * Wraps routes that require a specific role.
 * Must be used inside (or alongside) ProtectedRoute — assumes user is authenticated.
 * A USER hitting an ADMIN page gets 403 redirect.
 *
 * Note: The backend ALSO enforces role checks — this is UX only.
 */
export function RoleRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
