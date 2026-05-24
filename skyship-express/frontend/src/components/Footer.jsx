import { useNavigate } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  const navigate = useNavigate()

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col">
          <div className="footer__brand">
            <span className="footer__brand-icon">✈</span>
            <span className="footer__brand-name">SKY<strong>SHIP</strong> EXPRESS</span>
          </div>
          <p className="footer__tagline">Envíos rápidos y confiables.<br />Conectamos Guatemala con el mundo.</p>
        </div>
        <div className="footer__col">
          <h4>Navegación</h4>
          <ul>
            <li><button onClick={() => scrollTo('servicios')}>Servicios</button></li>
            <li><button onClick={() => scrollTo('cotizador')}>Calculadora</button></li>
            <li><button onClick={() => scrollTo('como-funciona')}>Cómo funciona</button></li>
            <li><button onClick={() => scrollTo('cobertura')}>Cobertura</button></li>
            <li><button onClick={() => scrollTo('sobre-nosotros')}>Sobre nosotros</button></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Mi Cuenta</h4>
          <ul>
            <li><button onClick={() => navigate('/login')}>Iniciar Sesión</button></li>
            <li><button onClick={() => navigate('/register')}>Registrarse</button></li>
            <li><button onClick={() => navigate('/dashboard')}>Mis Envíos</button></li>
            <li><button onClick={() => scrollTo('faq')}>Preguntas Frecuentes</button></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Contacto</h4>
          <p>(+502) 2345-6789</p>
          <p>soporte@skyshipexpress.com</p>
          <p>Av. Reforma 8-60, Zona 9<br />Guatemala City, Guatemala</p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© 2026 SkyShip Express. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
