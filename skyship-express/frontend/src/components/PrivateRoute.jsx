import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protege rutas que requieren autenticación.
 * Si adminOnly=true, solo permite acceso a administradores.
 */
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PrivateRoute
