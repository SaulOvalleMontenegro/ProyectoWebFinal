import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaurar sesión desde localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('skyship_token')
    const savedUser = localStorage.getItem('skyship_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('skyship_token')
        localStorage.removeItem('skyship_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (correo, password) => {
    const data = await authService.login({ correo, password })
    localStorage.setItem('skyship_token', data.token)
    localStorage.setItem('skyship_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (formData) => {
    const data = await authService.register(formData)
    localStorage.setItem('skyship_token', data.token)
    localStorage.setItem('skyship_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('skyship_token')
    localStorage.removeItem('skyship_user')
    setUser(null)
  }

  const isAdmin = () => user?.rol === 'admin'
  const isAuthenticated = () => !!user

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAdmin, isAuthenticated, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
