import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
  const [form, setForm] = useState({ correo: '', password: '' })
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handle = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    setErrores(p => ({ ...p, [name]: '' }))
    setErrorGeneral('')
  }

  const validar = () => {
    const err = {}
    if (!form.correo.trim()) err.correo = 'El correo es requerido'
    if (!form.password) err.password = 'La contraseña es requerida'
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validar()
    if (Object.keys(err).length > 0) { setErrores(err); return }

    setCargando(true)
    try {
      await login(form.correo, form.password)
      // Redirigir según rol
      if (isAdmin()) navigate('/admin')
      else navigate('/dashboard')
    } catch (error) {
      setErrorGeneral(error.message || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-card__header">
          <div className="auth-card__logo">✈</div>
          <h1 className="auth-card__title">Iniciar Sesión</h1>
          <p className="auth-card__subtitle">Bienvenido de vuelta a SkyShip Express</p>
        </div>

        {/* Formulario */}
        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          {errorGeneral && <div className="auth-card__error-banner">{errorGeneral}</div>}

          <div className="auth-field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo" type="email" name="correo"
              value={form.correo} onChange={handle}
              placeholder="tu@correo.com"
              disabled={cargando}
              autoComplete="email"
            />
            {errores.correo && <span className="error">{errores.correo}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password" type="password" name="password"
              value={form.password} onChange={handle}
              placeholder="Tu contraseña"
              disabled={cargando}
              autoComplete="current-password"
            />
            {errores.password && <span className="error">{errores.password}</span>}
          </div>

          <button type="submit" className="auth-btn" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-card__footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="auth-card__link">Regístrate aquí</Link>
        </div>

        {/* Credenciales de prueba */}
        <div className="auth-card__demo">
          <p className="auth-card__demo-title">Credenciales de prueba:</p>
          <div className="auth-card__demo-item">
            <span className="auth-card__demo-role">👤 Admin</span>
            <code>admin@skyship.com / Admin1234!</code>
          </div>
          <div className="auth-card__demo-item">
            <span className="auth-card__demo-role">📦 Usuario</span>
            <code>maria@correo.com / User1234!</code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
