import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { contactService } from '../services/api'
import './Home.css'

// ── Imágenes (copia la carpeta Imagenes del proyecto AEROPAQ a src/Imagenes/) ──
import ImgCalculators from '../Imagenes/Calculators.png'
import ImgCamion     from '../Imagenes/Camion.png'
import ImgMundo      from '../Imagenes/Mundo icono.png'
import ImgHome       from '../Imagenes/Home.png'
import ImgRayo       from '../Imagenes/Rayo simbolo.png'
import ImgPedir      from '../Imagenes/Pedir.png'
import ImgPaquete    from '../Imagenes/Paquete.png'
import ImgCamion2    from '../Imagenes/Camion2.png'
import ImgChecklist  from '../Imagenes/Checklist.png'
import ImgPlaneta    from '../Imagenes/Planeta Tierra.png'
import ImgSoporte    from '../Imagenes/Soporte.png'
import ImgEntrega    from '../Imagenes/Entrega inmediata.png'
import ImgTelefono   from '../Imagenes/Telefono.png'
import ImgCorreo     from '../Imagenes/Correo.png'
import ImgUbicaciones from '../Imagenes/ubicaciones.png'

/* ══════════════════════════════════════
   HERO
══════════════════════════════════════ */
const Hero = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' })
  }

  return (
    <section className="hero" id="inicio">
      <div className="hero__bg" />
      <div className="container hero__inner">
        <div className="hero__left">
          <div className="hero__badge">✈ Envíos Express Guatemala</div>
          <h1 className="hero__title">
            Envíos<br />Rápidos y<br />Confiables
          </h1>
          <p className="hero__subtitle">
            SkyShip Express conecta Guatemala con el mundo. Desde entregas locales hasta
            envíos internacionales, tu paquete siempre llega a tiempo.
          </p>
          <div className="hero__btns">
            <button className="btn btn--blanco" onClick={() => scrollTo('cotizador')}>
              Cotizar envío
            </button>
            {user ? (
              <button className="btn btn--outline" onClick={() => navigate('/dashboard')}>
                📦 Mis Envíos
              </button>
            ) : (
              <button className="btn btn--outline" onClick={() => navigate('/register')}>
                Crear cuenta gratis
              </button>
            )}
          </div>
          <div className="hero__stats">
            {[
              { img: ImgPlaneta, num: '+150', lbl: 'Países', color: true },
              { img: ImgSoporte, num: '24/7', lbl: 'Soporte' },
              { img: ImgEntrega, num: '99.7%', lbl: 'A tiempo' },
            ].map((s, i) => (
              <div className="hero__stat" key={i}>
                <div className="hero__stat-icon">
                  <img src={s.img} alt={s.lbl} className={s.color ? 'stat-color' : ''} />
                </div>
                <div className="hero__stat-num">{s.num}</div>
                <div className="hero__stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__right">
          <div className="hero__card">
            <div className="hero__card-header">
              <div className="hero__card-icon">✈</div>
              <div>
                <div className="hero__card-label">Seguimiento de paquete</div>
                <div className="hero__card-code">SKY-GTM-87654321</div>
              </div>
            </div>
            <div className="hero__card-steps">
              {[
                { dot: 'done', text: 'Paquete recogido', time: '9:30 am' },
                { dot: 'done', text: 'En tránsito', time: '2:15 pm' },
                { dot: 'active', text: 'En proceso de entrega', time: '' },
              ].map((s, i) => (
                <div key={i} className={`hero__card-step ${s.dot === 'active' ? 'hero__card-step--active' : ''}`}>
                  <span className={`step-dot step-dot--${s.dot}`} />
                  <span>{s.text}</span>
                  {s.time && <span className="step-time">{s.time}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════
   SERVICIOS
══════════════════════════════════════ */
const servicios = [
  { img: ImgCamion,  titulo: 'Envíos Nacionales',        desc: 'Entregas en todo Guatemala con rastreo en tiempo real y opciones de seguro.' },
  { img: ImgMundo,   titulo: 'Envíos Internacionales',   desc: 'Llega a más de 150 países con asistencia aduanal y tarifas competitivas.' },
  { img: ImgHome,    titulo: 'Recolección a Domicilio',  desc: 'Recolectamos tu paquete donde estés, en el horario de tu preferencia.' },
  { img: ImgRayo,    titulo: 'Servicio Exprés',          desc: 'Entrega prioritaria para envíos urgentes. Mismo día disponible en área metropolitana.' },
]

const Servicios = () => (
  <section className="servicios" id="servicios">
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">Nuestros Servicios</h2>
        <p className="section-sub">Soluciones logísticas diseñadas para cubrir todas tus necesidades.</p>
      </div>
      <div className="servicios__grid">
        {servicios.map((s, i) => (
          <div className="servicios__card" key={i}>
            <div className="servicios__card-icon"><img src={s.img} alt={s.titulo} /></div>
            <h3 className="servicios__card-title">{s.titulo}</h3>
            <p className="servicios__card-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ══════════════════════════════════════
   COTIZADOR
══════════════════════════════════════ */
const TARIFAS = {
  misma_ciudad:       { base: 25, por_kg: 5,  dias: '1-2 días' },
  otro_departamento:  { base: 55, por_kg: 8,  dias: '2-4 días' },
  internacional:      { base: 150, por_kg: 20, dias: '5-10 días' },
}
const NIVEL  = { estandar: 1, expres: 1.6 }
const EXTRAS = { recoleccion: 20, seguro: 15 }

const Cotizador = () => {
  const [form, setForm] = useState({ origen: '', destino: '', peso: '', ancho: '', alto: '', largo: '', tipo_ruta: 'misma_ciudad', nivel: 'estandar', recoleccion: false, seguro: false })
  const [resultado, setResultado] = useState(null)
  const [errores, setErrores] = useState({})

  const handle = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setErrores(p => ({ ...p, [name]: '' }))
  }

  const calcular = (e) => {
    e.preventDefault()
    const err = {}
    if (!form.origen.trim()) err.origen = 'El origen es requerido'
    if (!form.destino.trim()) err.destino = 'El destino es requerido'
    if (!form.peso || isNaN(form.peso) || Number(form.peso) <= 0) err.peso = 'Ingresa un peso válido'
    if (Object.keys(err).length > 0) { setErrores(err); return }

    const tarifa = TARIFAS[form.tipo_ruta]
    const peso = Number(form.peso)
    let vol = 0
    if (form.ancho && form.alto && form.largo) {
      const v = (Number(form.ancho) * Number(form.alto) * Number(form.largo)) / 5000
      if (v > peso) vol = (v - peso) * tarifa.por_kg
    }
    const sub = (tarifa.base + peso * tarifa.por_kg + vol) * NIVEL[form.nivel]
    const total = sub + (form.recoleccion ? EXTRAS.recoleccion : 0) + (form.seguro ? EXTRAS.seguro : 0)
    setResultado({ costoBase: tarifa.base.toFixed(2), costoPeso: (peso * tarifa.por_kg).toFixed(2), costoVolumen: vol.toFixed(2), extraRecoleccion: (form.recoleccion ? 20 : 0).toFixed(2), extraSeguro: (form.seguro ? 15 : 0).toFixed(2), total: total.toFixed(2), tiempo: tarifa.dias })
  }

  return (
    <section className="cotizador" id="cotizador">
      <div className="container">
        <div className="cotizador__box">
          <div className="cotizador__header">
            <div className="cotizador__header-icon"><img src={ImgCalculators} alt="Calcular" /></div>
            <h2 className="cotizador__header-title">Calcular costo de envío</h2>
          </div>
          <form className="cotizador__form" onSubmit={calcular} noValidate>
            <div className="cotizador__row">
              <div className="cotizador__field">
                <label>Origen</label>
                <input type="text" name="origen" value={form.origen} onChange={handle} placeholder="Ciudad de origen" />
                {errores.origen && <span className="error">{errores.origen}</span>}
              </div>
              <div className="cotizador__field">
                <label>Destino</label>
                <input type="text" name="destino" value={form.destino} onChange={handle} placeholder="Ciudad de destino" />
                {errores.destino && <span className="error">{errores.destino}</span>}
              </div>
            </div>
            <div className="cotizador__row">
              <div className="cotizador__field">
                <label>Peso (kg)</label>
                <input type="number" name="peso" value={form.peso} onChange={handle} placeholder="ej. 2.5" min="0" step="0.1" />
                {errores.peso && <span className="error">{errores.peso}</span>}
              </div>
              <div className="cotizador__field cotizador__field--dims">
                <label>Dimensiones cm – opcional</label>
                <div className="cotizador__dims">
                  <input type="number" name="ancho" value={form.ancho} onChange={handle} placeholder="Ancho" min="0" />
                  <input type="number" name="alto"  value={form.alto}  onChange={handle} placeholder="Alto"  min="0" />
                  <input type="number" name="largo" value={form.largo} onChange={handle} placeholder="Largo" min="0" />
                </div>
              </div>
            </div>
            <div className="cotizador__field">
              <label>Tipo de servicio</label>
              <div className="cotizador__radios">
                {[{ val:'misma_ciudad',lbl:'Misma ciudad',sub:'Opción más económica'},{ val:'otro_departamento',lbl:'Otro departamento',sub:'Cobertura nacional'},{ val:'internacional',lbl:'Internacional',sub:'A cualquier país'}].map(r => (
                  <label key={r.val} className={`cotizador__radio-label ${form.tipo_ruta===r.val?'cotizador__radio-label--active':''}`}>
                    <input type="radio" name="tipo_ruta" value={r.val} checked={form.tipo_ruta===r.val} onChange={handle} />
                    <span className="radio-text"><strong>{r.lbl}</strong><small>{r.sub}</small></span>
                  </label>
                ))}
              </div>
            </div>
            <div className="cotizador__field">
              <label>Nivel de servicio</label>
              <div className="cotizador__radios">
                {[{ val:'estandar',lbl:'Estándar',sub:'Opción más económica'},{ val:'expres',lbl:'Exprés',sub:'Entrega prioritaria'}].map(r => (
                  <label key={r.val} className={`cotizador__radio-label ${form.nivel===r.val?'cotizador__radio-label--active':''}`}>
                    <input type="radio" name="nivel" value={r.val} checked={form.nivel===r.val} onChange={handle} />
                    <span className="radio-text"><strong>{r.lbl}</strong><small>{r.sub}</small></span>
                  </label>
                ))}
              </div>
            </div>
            <div className="cotizador__field">
              <label>Servicios extras</label>
              <div className="cotizador__checks">
                {[{ name:'recoleccion',lbl:'Recolección a domicilio',sub:'Recogemos en tu ubicación (+Q20)'},{ name:'seguro',lbl:'Seguro contra pérdida',sub:'Protección total de tu paquete (+Q15)'}].map(c => (
                  <label key={c.name} className={`cotizador__check-label ${form[c.name]?'cotizador__check-label--active':''}`}>
                    <input type="checkbox" name={c.name} checked={form[c.name]} onChange={handle} />
                    <span className="check-text"><strong>{c.lbl}</strong><small>{c.sub}</small></span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn--azul btn--full">Calcular envío</button>
          </form>
          {resultado && (
            <div className="cotizador__resultado">
              <h3>Cotización estimada</h3>
              <div className="resultado__desglose">
                <div className="resultado__row"><span>Costo base</span><span>Q{resultado.costoBase}</span></div>
                <div className="resultado__row"><span>Costo por peso</span><span>Q{resultado.costoPeso}</span></div>
                {Number(resultado.costoVolumen) > 0 && <div className="resultado__row"><span>Ajuste volumétrico</span><span>Q{resultado.costoVolumen}</span></div>}
                {Number(resultado.extraRecoleccion) > 0 && <div className="resultado__row"><span>Recolección</span><span>Q{resultado.extraRecoleccion}</span></div>}
                {Number(resultado.extraSeguro) > 0 && <div className="resultado__row"><span>Seguro</span><span>Q{resultado.extraSeguro}</span></div>}
                <div className="resultado__row resultado__row--total"><span>Total estimado</span><span>Q{resultado.total}</span></div>
              </div>
              <div className="resultado__tiempo">⏱ Tiempo estimado: <strong>{resultado.tiempo}</strong></div>
              <p className="resultado__nota">* Precios en quetzales (GTQ). Cotización estimada, puede variar.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════
   CÓMO FUNCIONA
══════════════════════════════════════ */
const pasos = [
  { img: ImgPedir,    titulo: 'Solicitud',   desc: 'Obtén una cotización y realiza tu orden en línea o por teléfono.' },
  { img: ImgPaquete,  titulo: 'Recolección', desc: 'Recolectamos tu paquete en tu ubicación.' },
  { img: ImgCamion2,  titulo: 'Despacho',    desc: 'Tu paquete se procesa y despacha a través de nuestra red segura.' },
  { img: ImgChecklist,titulo: 'Entrega',     desc: 'Entrega en destino con rastreo en tiempo real.' },
]
const ComoFunciona = () => (
  <section className="como-funciona" id="como-funciona">
    <div className="container">
      <div className="section-header section-header--light">
        <h2 className="section-title">¿Cómo Funciona?</h2>
        <p className="section-sub">Un proceso simple y transparente, desde la recolección hasta la entrega.</p>
      </div>
      <div className="pasos__grid">
        {pasos.map((p, i) => (
          <div className="paso" key={i}>
            <div className="paso__icon"><img src={p.img} alt={p.titulo} /></div>
            {i < pasos.length - 1 && <div className="paso__linea" />}
            <h3 className="paso__titulo">{p.titulo}</h3>
            <p className="paso__desc">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ══════════════════════════════════════
   COBERTURA
══════════════════════════════════════ */
const Cobertura = () => (
  <section className="cobertura" id="cobertura">
    <div className="container">
      <div className="section-header"><h2 className="section-title" style={{color:'white'}}>Nuestra Cobertura</h2></div>
      <div className="cobertura__grid">
        {[
          { titulo:'Cobertura Local', desc:'Cobertura completa en las principales ciudades con entregas el mismo día.', items:['Áreas Metropolitanas','Centros Urbanos','Zonas Suburbanas'] },
          { titulo:'Red Nacional',    desc:'Llegamos a todos los departamentos y regiones de Guatemala.', items:['Todos los Departamentos','Áreas Remotas','Islas'] },
          { titulo:'Cobertura Global',desc:'Envíos a más de 150 países en todos los continentes.', items:['Américas','Europa','Asia-Pacífico','África','Medio Oriente'] },
        ].map((c, i) => (
          <div className="cobertura__card" key={i}>
            <h3>{c.titulo}</h3><p>{c.desc}</p>
            <ul>{c.items.map((it, j) => <li key={j}>✔ {it}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="cobertura__banner">
        <h3>Logística Global, Experiencia Local</h3>
        <p>Con centros de distribución estratégicos y alianzas internacionales, combinamos alcance global con conocimiento local.</p>
      </div>
    </div>
  </section>
)

/* ══════════════════════════════════════
   SOBRE NOSOTROS
══════════════════════════════════════ */
const SobreNosotros = () => (
  <section className="sobre" id="sobre-nosotros">
    <div className="container">
      <div className="section-header"><h2 className="section-title">Sobre SkyShip Express</h2></div>
      <div className="sobre__grid">
        {[
          { titulo:'Nuestra Historia', texto:'Fundada en 2010, SkyShip Express nació como respuesta a la creciente necesidad logística de Guatemala. En poco tiempo nos expandimos a nivel centroamericano y global, construyendo una red confiable de envíos.' },
          { titulo:'Nuestra Misión',   texto:'Proveer soluciones de envío rápidas, seguras y rentables que conecten a empresas e individuos en Guatemala y el mundo, optimizando cada eslabón de la cadena logística.' },
          { titulo:'Nuestra Visión',   texto:'Ser el operador logístico líder de Centroamérica, reconocido por nuestra innovación tecnológica, responsabilidad ambiental y excelencia operativa.' },
          { titulo:'Nuestros Valores', texto:'Integridad, innovación y excelencia son los pilares de nuestra cultura. Priorizamos la satisfacción del cliente y el respeto hacia nuestro equipo, socios y comunidades.' },
        ].map((item, i) => (
          <div className="sobre__card" key={i}>
            <h3 className="sobre__card-title">{item.titulo}</h3>
            <p className="sobre__card-text">{item.texto}</p>
          </div>
        ))}
      </div>
      <div className="sobre__porque">
        <div className="sobre__porque-left">
          <h3>¿Por qué elegir SkyShip Express?</h3>
          <ul>
            <li>Tasa de entrega a tiempo del 99.7%, líder en la industria.</li>
            <li>Soporte 24/7 en español e inglés.</li>
            <li>Tecnología de rastreo avanzada en tiempo real.</li>
            <li>Opciones de envío ecológico y programas carbono neutral.</li>
            <li>Precios transparentes sin costos ocultos.</li>
          </ul>
        </div>
        <div className="sobre__porque-right">
          {[
            { num:'99.7%', lbl:'Entregas a tiempo' },
            { num:'15+',   lbl:'Años de experiencia' },
            { num:'500+',  lbl:'Colaboradores' },
            { num:'8,000+',lbl:'Clientes activos' },
          ].map((s, i) => (
            <div className="sobre__stat" key={i}>
              <span className="sobre__stat-lbl">{s.lbl}</span>
              <span className="sobre__stat-num">{s.num}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

/* ══════════════════════════════════════
   FAQ
══════════════════════════════════════ */
const faqs = [
  { pregunta:'¿Cómo puedo rastrear mi envío?', respuesta:'Ingresa a tu cuenta en SkyShip Express y accede a "Mis Envíos" para ver el estado en tiempo real de todos tus paquetes con el código de guía.' },
  { pregunta:'¿Qué artículos están prohibidos enviar?', respuesta:'Materiales peligrosos, inflamables, explosivos, drogas ilegales, armas y productos perecederos sin embalaje adecuado están prohibidos.' },
  { pregunta:'¿Cuánto tarda un envío internacional?', respuesta:'Envíos estándar: 5-10 días hábiles. Servicio exprés: 2-3 días. Varía según el país de destino.' },
  { pregunta:'¿Ofrecen seguro para mis paquetes?', respuesta:'Sí, ofrecemos seguro contra pérdida y accidentes por un costo adicional de Q15 al crear tu envío.' },
  { pregunta:'¿Cuál es el peso máximo por paquete?', respuesta:'Envíos nacionales: hasta 70 kg. Internacionales: varía según destino. Consulta nuestra calculadora de tarifas.' },
  { pregunta:'¿Realizan recolección a domicilio?', respuesta:'Sí, ofrecemos recolección desde tu ubicación por Q20 adicionales. Programa el horario al crear tu envío.' },
]
const FAQ = () => {
  const [abierto, setAbierto] = useState(null)
  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="section-header"><h2 className="section-title">Preguntas Frecuentes</h2></div>
        <div className="faq__lista">
          {faqs.map((f, i) => (
            <div key={i} className={`faq__item ${abierto===i?'faq__item--open':''}`} onClick={()=>setAbierto(abierto===i?null:i)}>
              <div className="faq__pregunta"><span>{f.pregunta}</span><span className="faq__chevron">{abierto===i?'∧':'∨'}</span></div>
              {abierto===i && <div className="faq__respuesta">{f.respuesta}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════
   CONTACTO (conectado al backend)
══════════════════════════════════════ */
const Contacto = () => {
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', mensaje: '' })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  const handle = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    setErrores(p => ({ ...p, [name]: '' }))
    setExito(false)
  }

  const validar = () => {
    const err = {}
    if (!form.nombre.trim() || form.nombre.trim().length < 2) err.nombre = 'Nombre inválido (mínimo 2 caracteres)'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) err.correo = 'Correo inválido'
    if (!/^[\d\s\+\-\(\)]{7,15}$/.test(form.telefono)) err.telefono = 'Teléfono inválido (7-15 dígitos)'
    if (!form.mensaje.trim() || form.mensaje.trim().length < 10) err.mensaje = 'El mensaje debe tener al menos 10 caracteres'
    return err
  }

  const enviar = async (e) => {
    e.preventDefault()
    const err = validar()
    if (Object.keys(err).length > 0) { setErrores(err); return }
    setEnviando(true)
    try {
      await contactService.send(form)
      setExito(true)
      setForm({ nombre: '', correo: '', telefono: '', mensaje: '' })
    } catch {
      alert('Hubo un error al enviar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="contacto" id="contacto">
      <div className="container">
        <div className="section-header"><h2 className="section-title">Contáctanos</h2></div>
        <div className="contacto__grid">
          <div className="contacto__form-box">
            <div className="contacto__form-header"><h3>Mándanos un mensaje</h3></div>
            {exito && (
              <div className="contacto__exito">
                <span>✅</span>
                <p>¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.</p>
              </div>
            )}
            {!exito && (
              <form onSubmit={enviar} noValidate style={{padding:'28px',display:'flex',flexDirection:'column',gap:'16px'}}>
                <div className="form__row">
                  <div className="form__field">
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={form.nombre} onChange={handle} placeholder="Tu nombre completo" disabled={enviando} />
                    {errores.nombre && <span className="error">{errores.nombre}</span>}
                  </div>
                  <div className="form__field">
                    <label>Correo</label>
                    <input type="email" name="correo" value={form.correo} onChange={handle} placeholder="tu@correo.com" disabled={enviando} />
                    {errores.correo && <span className="error">{errores.correo}</span>}
                  </div>
                </div>
                <div className="form__field">
                  <label>Teléfono</label>
                  <input type="tel" name="telefono" value={form.telefono} onChange={handle} placeholder="+502 1234-5678" disabled={enviando} />
                  {errores.telefono && <span className="error">{errores.telefono}</span>}
                </div>
                <div className="form__field">
                  <label>Mensaje</label>
                  <textarea name="mensaje" value={form.mensaje} onChange={handle} placeholder="¿En qué podemos ayudarte?" rows={4} disabled={enviando} />
                  {errores.mensaje && <span className="error">{errores.mensaje}</span>}
                </div>
                <button type="submit" className="btn btn--azul btn--full" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
          <div className="contacto__info">
            <div className="contacto__info-box">
              <h3>Información de contacto</h3>
              {[
                { img: ImgTelefono, label: 'Teléfono', lines: ['(+502) 2345-6789', '(+502) 5678-9012'] },
                { img: ImgCorreo,   label: 'Correos',  lines: ['soporte@skyshipexpress.com', 'ventas@skyshipexpress.com'] },
                { img: ImgUbicaciones, label: 'Dirección', lines: ['Av. Reforma 8-60, Zona 9', 'Guatemala City, Guatemala'] },
              ].map((item, i) => (
                <div className="contacto__info-item" key={i}>
                  <div className="info-icon"><img src={item.img} alt={item.label} /></div>
                  <div><strong>{item.label}</strong>{item.lines.map((l, j) => <p key={j}>{l}</p>)}</div>
                </div>
              ))}
            </div>
            <div className="contacto__horarios">
              <h3>Horarios de Atención</h3>
              {[['Lunes - Viernes','8:00 AM - 8:00 PM'],['Sábados','9:00 AM - 6:00 PM'],['Domingos','10:00 AM - 4:00 PM']].map(([dia, hora]) => (
                <div className="horario__row" key={dia}><span>{dia}</span><span>{hora}</span></div>
              ))}
              <p className="horario__nota">Atención al Cliente 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════
   HOME (página principal)
══════════════════════════════════════ */
const Home = () => (
  <main>
    <Hero />
    <Servicios />
    <Cotizador />
    <ComoFunciona />
    <Cobertura />
    <SobreNosotros />
    <FAQ />
    <Contacto />
  </main>
)

export default Home
