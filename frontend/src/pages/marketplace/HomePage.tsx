import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import Home from '../Home'

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuthContext()

  if (!isLoading && isAuthenticated) {
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/browse" replace />
  }

  return <Home />
}
