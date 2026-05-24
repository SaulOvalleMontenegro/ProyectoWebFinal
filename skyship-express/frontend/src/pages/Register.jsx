import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'  /* Reutiliza los estilos de auth */
import './Register.css'

const Register = () => {
  const [form, setForm] = useState({ nombre_completo: '', correo: '', telefono: '', direccion: '', password: '', confirmar: '' })
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handle = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    setErrores(p => ({ ...p, [name]: '' }))
    setErrorGeneral('')
  }

  const validar = () => {
    const err = {}
    if (!form.nombre_completo.trim() || form.nombre_completo.trim().length < 2) err.nombre_completo = 'El nombre debe tener al menos 2 caracteres'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) err.correo = 'Correo inválido'
    if (!/^[\d\s\+\-\(\)]{7,15}$/.test(form.telefono)) err.telefono = 'Teléfono inválido (7-15 dígitos)'
    if (!form.direccion.trim() || form.direccion.trim().length < 5) err.direccion = 'La dirección debe tener al menos 5 caracteres'
    if (form.password.length < 6) err.password = 'La contraseña debe tener al menos 6 caracteres'
    if (form.password !== form.confirmar) err.confirmar = 'Las contraseñas no coinciden'
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validar()
    if (Object.keys(err).length > 0) { setErrores(err); return }

    setCargando(true)
    try {
      await register({
        nombre_completo: form.nombre_completo.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        password: form.password,
      })
      navigate('/dashboard')
    } catch (error) {
      setErrorGeneral(error.message || 'Error al registrarse')
    } finally {
      setCargando(false)
    }
  }

  const campos = [
    { name: 'nombre_completo', label: 'Nombre completo',      type: 'text',     placeholder: 'Tu nombre completo',    autoComplete: 'name' },
    { name: 'correo',          label: 'Correo electrónico',   type: 'email',    placeholder: 'tu@correo.com',          autoComplete: 'email' },
    { name: 'telefono',        label: 'Teléfono',             type: 'tel',      placeholder: '+502 1234-5678',         autoComplete: 'tel' },
    { name: 'direccion',       label: 'Dirección',            type: 'text',     placeholder: 'Tu dirección completa',  autoComplete: 'street-address' },
    { name: 'password',        label: 'Contraseña',           type: 'password', placeholder: 'Mínimo 6 caracteres',    autoComplete: 'new-password' },
    { name: 'confirmar',       label: 'Confirmar contraseña', type: 'password', placeholder: 'Repite tu contraseña',   autoComplete: 'new-password' },
  ]

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__header">
          <div className="auth-card__logo">✈</div>
          <h1 className="auth-card__title">Crear Cuenta</h1>
          <p className="auth-card__subtitle">Únete a SkyShip Express y gestiona tus envíos</p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          {errorGeneral && <div className="auth-card__error-banner">{errorGeneral}</div>}

          <div className="register-grid">
            {campos.map(c => (
              <div className={`auth-field ${c.name === 'direccion' ? 'auth-field--full' : ''}`} key={c.name}>
                <label htmlFor={c.name}>{c.label}</label>
                <input
                  id={c.name} type={c.type} name={c.name}
                  value={form[c.name]} onChange={handle}
                  placeholder={c.placeholder}
                  disabled={cargando}
                  autoComplete={c.autoComplete}
                />
                {errores[c.name] && <span className="error">{errores[c.name]}</span>}
              </div>
            ))}
          </div>

          <button type="submit" className="auth-btn" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-card__footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-card__link">Inicia sesión</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
