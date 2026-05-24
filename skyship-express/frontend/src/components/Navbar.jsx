import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import './Navbar.css'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    if (!isHome) {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset - 80
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 80
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
    setMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <div className="navbar__logo" onClick={() => navigate('/')}>
          <span className="navbar__logo-icon">✈</span>
          <span className="navbar__logo-text">
            SKY<strong>SHIP</strong>
          </span>
        </div>

        {/* Links de navegación */}
        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <li><button onClick={() => scrollTo('servicios')}>Servicios</button></li>
          <li><button onClick={() => scrollTo('como-funciona')}>Cómo funciona</button></li>
          <li><button onClick={() => scrollTo('cobertura')}>Cobertura</button></li>
          <li><button onClick={() => scrollTo('sobre-nosotros')}>Nosotros</button></li>
          <li><button onClick={() => scrollTo('faq')}>FAQ</button></li>
          <li><button onClick={() => scrollTo('contacto')}>Contacto</button></li>

          {/* Links de auth en móvil */}
          {user ? (
            <>
              <li className="navbar__divider-mobile" />
              <li>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="navbar__link-btn">
                  📦 Mis Envíos
                </Link>
              </li>
              {isAdmin() && (
                <li>
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="navbar__link-btn">
                    ⚙️ Panel Admin
                  </Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="navbar__link-btn navbar__link-btn--logout">
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar__divider-mobile" />
              <li>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="navbar__link-btn">
                  Iniciar Sesión
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Acciones de auth (escritorio) */}
        <div className="navbar__actions">
          {user ? (
            <>
              <Link to="/dashboard" className="navbar__user-link">
                📦 Mis Envíos
              </Link>
              {isAdmin() && (
                <Link to="/admin" className="navbar__user-link navbar__user-link--admin">
                  ⚙️ Admin
                </Link>
              )}
              <div className="navbar__user-info">
                <span className="navbar__user-name">{user.nombre_completo.split(' ')[0]}</span>
                <button className="navbar__logout-btn" onClick={handleLogout}>
                  Salir
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__login-link">Iniciar Sesión</Link>
              <Link to="/register" className="navbar__cta">Registrarse</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
