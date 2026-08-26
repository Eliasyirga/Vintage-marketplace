import { useState, useEffect, type ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { SplashScreen } from './SplashScreen'

interface AppLoaderProps {
  children: ReactNode
}

/**
 * AppLoader orchestrates the initial startup experience for Vintage Marketplace.
 * It coordinates with the existing AuthContext authentication initialization
 * and ensures a smooth, polished entrance without UI flashes.
 */
export function AppLoader({ children }: AppLoaderProps) {
  const { isLoading, refreshUser } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    let exitTimeoutId: ReturnType<typeof setTimeout> | undefined

    // Safety timeout: If initialization hangs for more than 10 seconds, show recovery error
    const watchdogTimer = setTimeout(() => {
      if (isLoading) {
        setInitError('Startup initialization timed out.')
      }
    }, 10000)

    if (!isLoading) {
      clearTimeout(watchdogTimer)
      setInitError(null)

      // Begin graceful exit transition (300ms)
      setIsExiting(true)
      exitTimeoutId = setTimeout(() => {
        setShowSplash(false)
      }, 300)
    }

    return () => {
      clearTimeout(watchdogTimer)
      if (timeoutId) clearTimeout(timeoutId)
      if (exitTimeoutId) clearTimeout(exitTimeoutId)
    }
  }, [isLoading])

  const handleRetry = async () => {
    setInitError(null)
    try {
      await refreshUser()
    } catch {
      window.location.reload()
    }
  }

  return (
    <>
      {showSplash && (
        <SplashScreen
          isExiting={isExiting}
          error={initError}
          onRetry={handleRetry}
        />
      )}
      <div
        className={`min-h-screen transition-opacity duration-300 ease-out ${
          showSplash && !isExiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </>
  )
}

export default AppLoader
