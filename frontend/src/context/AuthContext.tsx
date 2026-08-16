import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, AuthResponse, LoginFormData } from '../types/auth'
import * as authService from '../services/auth.service'
import toast from 'react-hot-toast'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginFormData) => Promise<User | null>
  logout: () => Promise<void>
  setAuthFromResponse: (auth: AuthResponse) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const response = await authService.getMe()
        if (response.success && response.data) {
          setUser(response.data.user)
        } else {
          localStorage.removeItem('accessToken')
        }
      } catch {
        localStorage.removeItem('accessToken')
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()
  }, [])

  const setAuthFromResponse = useCallback((auth: AuthResponse) => {
    localStorage.setItem('accessToken', auth.accessToken)
    setUser(auth.user)
  }, [])

  const login = useCallback(async (data: LoginFormData) => {
    const response = await authService.login(data)
    if (response.success && response.data) {
      setAuthFromResponse(response.data)
      return response.data.user
    }
    return null
  }, [setAuthFromResponse])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Always clear locally even if the server call fails
    } finally {
      localStorage.removeItem('accessToken')
      setUser(null)
      toast.success('Logged out successfully.')
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe()
      if (response.success && response.data) {
        setUser(response.data.user)
      }
    } catch {
      // Session might be expired; clear it
      localStorage.removeItem('accessToken')
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setAuthFromResponse,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>')
  return ctx
}

export function useAuth(): AuthContextValue {
  return useAuthContext()
}
