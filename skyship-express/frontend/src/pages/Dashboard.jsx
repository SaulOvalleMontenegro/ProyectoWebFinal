import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { shipmentService } from '../services/api'
import './Dashboard.css'

const ESTADO_BADGE = {
  pendiente:   { label: 'Pendiente',   cls: 'badge--yellow' },
  en_transito: { label: 'En Tránsito', cls: 'badge--blue'   },
  entregado:   { label: 'Entregado',   cls: 'badge--green'  },
  cancelado:   { label: 'Cancelado',   cls: 'badge--red'    },
}

const TARIFAS = {
  misma_ciudad:      { base: 25, por_kg: 5 },
  otro_departamento: { base: 55, por_kg: 8 },
  internacional:     { base: 150, por_kg: 20 },
}

/* ── Formulario de nuevo envío ───────────────────────────────────────────── */
const NuevoEnvioForm = ({ onCreado, onCancelar }) => {
  const [form, setForm] = useState({ origen: '', destino: '', region: '', peso: '', tipo_ruta: 'misma_ciudad', nivel: 'estandar', recoleccion: false, seguro: false })
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [preview, setPreview] = useState(null)

  const handle = (e) => {
    const { name, value, type, checked } = e.target
    const newForm = { ...form, [name]: type === 'checkbox' ? checked : value }
    setForm(newForm)
    setErrores(p => ({ ...p, [name]: '' }))
    // Calcular preview de costo
    const tarifa = TARIFAS[newForm.tipo_ruta] || TARIFAS.misma_ciudad
    const peso = parseFloat(newForm.peso)
    if (!isNaN(peso) && peso > 0) {
      const mult = newForm.nivel === 'expres' ? 1.6 : 1
      const c = (tarifa.base + peso * tarifa.por_kg) * mult + (newForm.recoleccion ? 20 : 0) + (newForm.seguro ? 15 : 0)
      setPreview(c.toFixed(2))
    } else setPreview(null)
  }

  const validar = () => {
    const err = {}
    if (!form.origen.trim()) err.origen = 'Requerido'
    if (!form.destino.trim()) err.destino = 'Requerido'
    if (!form.peso || isNaN(form.peso) || Number(form.peso) <= 0) err.peso = 'Peso inválido'
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validar()
    if (Object.keys(err).length > 0) { setErrores(err); return }
    setCargando(true)
    try {
      const data = await shipmentService.create(form)
      onCreado(data.envio)
    } catch (error) {
      alert(error.message || 'Error al crear el envío')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="dash-modal-overlay" onClick={onCancelar}>
      <div className="dash-modal" onClick={e => e.stopPropagation()}>
        <div className="dash-modal__header">
          <h2>📦 Nuevo Envío</h2>
          <button className="dash-modal__close" onClick={onCancelar}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="dash-modal__form">
          <div className="dash-modal__grid">
            <div className="dash-field">
              <label>Ciudad de Origen *</label>
              <input type="text" name="origen" value={form.origen} onChange={handle} placeholder="Ej. Guatemala City" disabled={cargando} />
              {errores.origen && <span className="error">{errores.origen}</span>}
            </div>
            <div className="dash-field">
              <label>Ciudad de Destino *</label>
              <input type="text" name="destino" value={form.destino} onChange={handle} placeholder="Ej. Miami, FL, USA" disabled={cargando} />
              {errores.destino && <span className="error">{errores.destino}</span>}
            </div>
            <div className="dash-field">
              <label>Región (opcional)</label>
              <input type="text" name="region" value={form.region} onChange={handle} placeholder="Ej. Norte, Sur, Internacional" disabled={cargando} />
            </div>
            <div className="dash-field">
              <label>Peso (kg) *</label>
              <input type="number" name="peso" value={form.peso} onChange={handle} placeholder="Ej. 2.5" min="0.1" step="0.1" disabled={cargando} />
              {errores.peso && <span className="error">{errores.peso}</span>}
            </div>
          </div>

          <div className="dash-field">
            <label>Tipo de servicio</label>
            <div className="dash-radios">
              {[{ val: 'misma_ciudad', lbl: 'Misma ciudad' }, { val: 'otro_departamento', lbl: 'Otro departamento' }, { val: 'internacional', lbl: 'Internacional' }].map(r => (
                <label key={r.val} className={`dash-radio ${form.tipo_ruta === r.val ? 'dash-radio--active' : ''}`}>
                  <input type="radio" name="tipo_ruta" value={r.val} checked={form.tipo_ruta === r.val} onChange={handle} />
                  {r.lbl}
                </label>
              ))}
            </div>
          </div>

          <div className="dash-field">
            <label>Nivel de servicio</label>
            <div className="dash-radios">
              {[{ val: 'estandar', lbl: 'Estándar' }, { val: 'expres', lbl: 'Exprés (+60%)' }].map(r => (
                <label key={r.val} className={`dash-radio ${form.nivel === r.val ? 'dash-radio--active' : ''}`}>
                  <input type="radio" name="nivel" value={r.val} checked={form.nivel === r.val} onChange={handle} />
                  {r.lbl}
                </label>
              ))}
            </div>
          </div>

          <div className="dash-checks">
            {[{ name: 'recoleccion', lbl: '🏠 Recolección a domicilio (+Q20)' }, { name: 'seguro', lbl: '🛡️ Seguro contra pérdida (+Q15)' }].map(c => (
              <label key={c.name} className={`dash-check ${form[c.name] ? 'dash-check--active' : ''}`}>
                <input type="checkbox" name={c.name} checked={form[c.name]} onChange={handle} />
                {c.lbl}
              </label>
            ))}
          </div>

          {preview && (
            <div className="dash-preview">
              💰 Costo estimado: <strong>Q{preview}</strong>
            </div>
          )}

          <div className="dash-modal__actions">
            <button type="button" className="dash-btn dash-btn--ghost" onClick={onCancelar} disabled={cargando}>Cancelar</button>
            <button type="submit" className="dash-btn dash-btn--primary" disabled={cargando}>
              {cargando ? 'Creando...' : 'Crear Envío'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Dashboard principal ──────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth()
  const [envios, setEnvios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todos')

  useEffect(() => {
    cargarEnvios()
  }, [])

  const cargarEnvios = async () => {
    setCargando(true)
    try {
      const data = await shipmentService.getAll()
      setEnvios(data.envios)
    } catch (err) {
      setError(err.message || 'Error al cargar envíos')
    } finally {
      setCargando(false)
    }
  }

  const handleEnvioCreado = (nuevoEnvio) => {
    setEnvios(prev => [nuevoEnvio, ...prev])
    setMostrarForm(false)
  }

  // Estadísticas rápidas
  const stats = {
    total:      envios.length,
    pendientes: envios.filter(e => e.estado === 'pendiente').length,
    en_transito:envios.filter(e => e.estado === 'en_transito').length,
    entregados: envios.filter(e => e.estado === 'entregado').length,
  }

  const enviosFiltrados = filtroEstado === 'todos'
    ? envios
    : envios.filter(e => e.estado === filtroEstado)

  const formatFecha = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div className="container">
          <div className="dash-header__inner">
            <div>
              <h1 className="dash-header__title">Mis Envíos</h1>
              <p className="dash-header__sub">Bienvenido, <strong>{user?.nombre_completo}</strong></p>
            </div>
            <button className="dash-btn dash-btn--primary" onClick={() => setMostrarForm(true)}>
              + Nuevo Envío
            </button>
          </div>
        </div>
      </div>

      <div className="container dash-body">
        {/* Stats */}
        <div className="dash-stats">
          {[
            { label: 'Total', value: stats.total, icon: '📦', cls: '' },
            { label: 'Pendientes', value: stats.pendientes, icon: '⏳', cls: 'dash-stat--yellow' },
            { label: 'En Tránsito', value: stats.en_transito, icon: '🚚', cls: 'dash-stat--blue' },
            { label: 'Entregados', value: stats.entregados, icon: '✅', cls: 'dash-stat--green' },
          ].map((s, i) => (
            <div key={i} className={`dash-stat ${s.cls}`}>
              <span className="dash-stat__icon">{s.icon}</span>
              <span className="dash-stat__value">{s.value}</span>
              <span className="dash-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="dash-filtros">
          {['todos', 'pendiente', 'en_transito', 'entregado', 'cancelado'].map(f => (
            <button
              key={f}
              className={`dash-filtro-btn ${filtroEstado === f ? 'dash-filtro-btn--active' : ''}`}
              onClick={() => setFiltroEstado(f)}
            >
              {f === 'todos' ? 'Todos' : ESTADO_BADGE[f]?.label}
            </button>
          ))}
        </div>

        {/* Tabla de envíos */}
        {cargando ? (
          <div className="dash-loading">Cargando envíos...</div>
        ) : error ? (
          <div className="dash-error">{error}</div>
        ) : enviosFiltrados.length === 0 ? (
          <div className="dash-empty">
            <span>📭</span>
            <p>{filtroEstado === 'todos' ? 'Aún no tienes envíos.' : `No hay envíos con estado "${ESTADO_BADGE[filtroEstado]?.label}".`}</p>
            {filtroEstado === 'todos' && (
              <button className="dash-btn dash-btn--primary" onClick={() => setMostrarForm(true)}>
                Crear mi primer envío
              </button>
            )}
          </div>
        ) : (
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Código de Guía</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Región</th>
                  <th>Peso</th>
                  <th>Costo Est.</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {enviosFiltrados.map(e => (
                  <tr key={e.id}>
                    <td><code className="dash-codigo">{e.codigo_guia}</code></td>
                    <td>{e.origen}</td>
                    <td>{e.destino}</td>
                    <td>{e.region || '—'}</td>
                    <td>{e.peso} kg</td>
                    <td>Q{e.costo_estimado}</td>
                    <td>
                      <span className={`badge ${ESTADO_BADGE[e.estado]?.cls}`}>
                        {ESTADO_BADGE[e.estado]?.label}
                      </span>
                    </td>
                    <td>{formatFecha(e.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de nuevo envío */}
      {mostrarForm && (
        <NuevoEnvioForm onCreado={handleEnvioCreado} onCancelar={() => setMostrarForm(false)} />
      )}
    </div>
  )
}

export default Dashboard
