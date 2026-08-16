import { useAuthContext } from '../context/AuthContext'

/**
 * Convenience hook — single import for all auth state and actions.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth()
 */
export function useAuth() {
  return useAuthContext()
}
