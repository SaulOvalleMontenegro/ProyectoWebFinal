import { useState, useEffect } from 'react'
import { adminService } from '../services/api'
import './Admin.css'

const ESTADO_BADGE = {
  pendiente:   { label:'Pendiente',   cls:'badge--yellow' },
  en_transito: { label:'En Tránsito', cls:'badge--blue'   },
  entregado:   { label:'Entregado',   cls:'badge--green'  },
  cancelado:   { label:'Cancelado',   cls:'badge--red'    },
}
const ROL_BADGE = { admin: 'badge--purple', usuario: 'badge--gray' }

const formatFecha = (iso) => new Date(iso).toLocaleDateString('es-GT', { day:'2-digit', month:'short', year:'numeric' })

/* ── Tablero de estadísticas ─────────────────────────────────────────────── */
const Tablero = ({ data }) => {
  if (!data) return <div className="admin-loading">Cargando estadísticas...</div>

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const maxEnvios = Math.max(...(data.envios_por_mes.map(m => m.total) || [1]), 1)

  return (
    <div className="tablero">
      {/* KPIs */}
      <div className="tablero__kpis">
        {[
          { label:'Usuarios', value: data.total_usuarios, icon:'👤', color:'blue' },
          { label:'Envíos totales', value: data.total_envios, icon:'📦', color:'indigo' },
          { label:'Ingresos Estimados', value:`Q${data.ingresos_estimados?.toFixed(2)}`, icon:'💰', color:'green' },
          { label:'Mensajes sin leer', value: data.contactos_no_leidos, icon:'📧', color:'yellow' },
        ].map((k, i) => (
          <div key={i} className={`kpi kpi--${k.color}`}>
            <span className="kpi__icon">{k.icon}</span>
            <span className="kpi__value">{k.value}</span>
            <span className="kpi__label">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="tablero__charts">
        {/* Envíos por estado */}
        <div className="chart-card">
          <h3 className="chart-card__title">📊 Envíos por Estado</h3>
          <div className="estado-list">
            {Object.entries(data.envios_por_estado || {}).map(([est, total]) => (
              <div key={est} className="estado-row">
                <span className={`badge ${ESTADO_BADGE[est]?.cls}`}>{ESTADO_BADGE[est]?.label || est}</span>
                <div className="estado-bar-wrap">
                  <div className="estado-bar" style={{ width: `${(total / (data.total_envios || 1)) * 100}%` }} />
                </div>
                <span className="estado-count">{total}</span>
              </div>
            ))}
            {Object.keys(data.envios_por_estado || {}).length === 0 && <p className="chart-empty">Sin datos aún</p>}
          </div>
        </div>

        {/* Envíos por mes */}
        <div className="chart-card">
          <h3 className="chart-card__title">📅 Envíos por Mes (últimos 6)</h3>
          <div className="bar-chart">
            {data.envios_por_mes.length === 0
              ? <p className="chart-empty">Sin datos aún</p>
              : data.envios_por_mes.map((m, i) => (
                <div key={i} className="bar-chart__item">
                  <div className="bar-chart__bar-wrap">
                    <div className="bar-chart__bar" style={{ height: `${(m.total / maxEnvios) * 100}%` }}>
                      <span className="bar-chart__val">{m.total}</span>
                    </div>
                  </div>
                  <span className="bar-chart__label">{meses[m.mes - 1]}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Envíos por región */}
        <div className="chart-card">
          <h3 className="chart-card__title">🌎 Envíos por Región</h3>
          <div className="region-list">
            {data.envios_por_region.length === 0
              ? <p className="chart-empty">Sin datos aún</p>
              : data.envios_por_region.map((r, i) => (
                <div key={i} className="region-row">
                  <span className="region-name">{r.region}</span>
                  <div className="region-bar-wrap">
                    <div className="region-bar" style={{ width: `${(r.total / (data.envios_por_region[0]?.total || 1)) * 100}%` }} />
                  </div>
                  <span className="region-count">{r.total}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Últimos envíos */}
        <div className="chart-card chart-card--full">
          <h3 className="chart-card__title">🕐 Últimos Envíos</h3>
          {data.ultimos_envios?.length === 0
            ? <p className="chart-empty">Sin envíos aún</p>
            : <table className="mini-table">
                <thead><tr><th>Código</th><th>Destino</th><th>Región</th><th>Costo</th><th>Estado</th><th>Fecha</th></tr></thead>
                <tbody>
                  {data.ultimos_envios?.map(e => (
                    <tr key={e.id}>
                      <td><code className="dash-codigo">{e.codigo_guia}</code></td>
                      <td>{e.destino}</td>
                      <td>{e.region || '—'}</td>
                      <td>Q{e.costo_estimado}</td>
                      <td><span className={`badge ${ESTADO_BADGE[e.estado]?.cls}`}>{ESTADO_BADGE[e.estado]?.label}</span></td>
                      <td>{formatFecha(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  )
}

/* ── Gestión de Usuarios ─────────────────────────────────────────────────── */
const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [formEdit, setFormEdit] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    adminService.getUsers().then(d => { setUsuarios(d.usuarios); setCargando(false) }).catch(() => setCargando(false))
  }, [])

  const abrirEditar = (u) => { setEditando(u.id); setFormEdit({ nombre_completo: u.nombre_completo, telefono: u.telefono, direccion: u.direccion, rol: u.rol, activo: u.activo }) }
  const cerrarEditar = () => { setEditando(null); setFormEdit({}) }

  const guardar = async (id) => {
    setGuardando(true)
    try {
      const data = await adminService.updateUser(id, formEdit)
      setUsuarios(prev => prev.map(u => u.id === id ? data.usuario : u))
      cerrarEditar()
    } catch (e) { alert(e.message) } finally { setGuardando(false) }
  }

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return
    try {
      await adminService.deleteUser(id)
      setUsuarios(prev => prev.filter(u => u.id !== id))
    } catch (e) { alert(e.message) }
  }

  if (cargando) return <div className="admin-loading">Cargando usuarios...</div>

  return (
    <div>
      <div className="admin-section-header">
        <h2>👤 Gestión de Usuarios</h2>
        <span className="admin-count">{usuarios.length} usuarios</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr></thead>
          <tbody>
            {usuarios.map(u => (
              <>
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>{u.nombre_completo}</td>
                  <td>{u.correo}</td>
                  <td>{u.telefono}</td>
                  <td><span className={`badge ${ROL_BADGE[u.rol]}`}>{u.rol}</span></td>
                  <td><span className={`badge ${u.activo ? 'badge--green' : 'badge--red'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td>{formatFecha(u.created_at)}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--edit" onClick={() => abrirEditar(u)}>✏️ Editar</button>
                      <button className="admin-btn admin-btn--delete" onClick={() => eliminar(u.id, u.nombre_completo)}>🗑️ Eliminar</button>
                    </div>
                  </td>
                </tr>
                {editando === u.id && (
                  <tr key={`edit-${u.id}`} className="admin-edit-row">
                    <td colSpan={8}>
                      <div className="admin-edit-form">
                        <h4>Editar usuario #{u.id}</h4>
                        <div className="admin-edit-grid">
                          {[['nombre_completo','Nombre'],['telefono','Teléfono'],['direccion','Dirección']].map(([field, lbl]) => (
                            <div key={field} className="admin-field">
                              <label>{lbl}</label>
                              <input value={formEdit[field] || ''} onChange={e => setFormEdit(p => ({...p, [field]: e.target.value}))} />
                            </div>
                          ))}
                          <div className="admin-field">
                            <label>Rol</label>
                            <select value={formEdit.rol} onChange={e => setFormEdit(p => ({...p, rol: e.target.value}))}>
                              <option value="usuario">usuario</option>
                              <option value="admin">admin</option>
                            </select>
                          </div>
                          <div className="admin-field">
                            <label>Nueva contraseña (opcional)</label>
                            <input type="password" placeholder="Dejar vacío para no cambiar" onChange={e => setFormEdit(p => ({...p, password: e.target.value}))} />
                          </div>
                          <div className="admin-field admin-field--check">
                            <label>
                              <input type="checkbox" checked={formEdit.activo} onChange={e => setFormEdit(p => ({...p, activo: e.target.checked}))} />
                              Cuenta activa
                            </label>
                          </div>
                        </div>
                        <div className="admin-edit-actions">
                          <button className="admin-btn admin-btn--ghost" onClick={cerrarEditar}>Cancelar</button>
                          <button className="admin-btn admin-btn--save" onClick={() => guardar(u.id)} disabled={guardando}>
                            {guardando ? 'Guardando...' : '💾 Guardar'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Gestión de Envíos ───────────────────────────────────────────────────── */
const GestionEnvios = () => {
  const [envios, setEnvios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [formEdit, setFormEdit] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    adminService.getShipments().then(d => { setEnvios(d.envios); setCargando(false) }).catch(() => setCargando(false))
  }, [])

  const abrirEditar = (e) => { setEditando(e.id); setFormEdit({ estado: e.estado, region: e.region || '', costo_estimado: e.costo_estimado }) }
  const cerrarEditar = () => { setEditando(null); setFormEdit({}) }

  const guardar = async (id) => {
    setGuardando(true)
    try {
      const data = await adminService.updateShipment(id, formEdit)
      setEnvios(prev => prev.map(e => e.id === id ? data.envio : e))
      cerrarEditar()
    } catch (e) { alert(e.message) } finally { setGuardando(false) }
  }

  const eliminar = async (id, codigo) => {
    if (!confirm(`¿Eliminar el envío ${codigo}?`)) return
    try {
      await adminService.deleteShipment(id)
      setEnvios(prev => prev.filter(e => e.id !== id))
    } catch (e) { alert(e.message) }
  }

  if (cargando) return <div className="admin-loading">Cargando envíos...</div>

  return (
    <div>
      <div className="admin-section-header">
        <h2>📦 Gestión de Envíos</h2>
        <span className="admin-count">{envios.length} envíos</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Guía</th><th>Usuario</th><th>Origen</th><th>Destino</th><th>Región</th><th>Peso</th><th>Costo</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            {envios.map(e => (
              <>
                <tr key={e.id}>
                  <td><code className="dash-codigo">{e.codigo_guia}</code></td>
                  <td>{e.usuario_nombre || '—'}</td>
                  <td>{e.origen}</td>
                  <td>{e.destino}</td>
                  <td>{e.region || '—'}</td>
                  <td>{e.peso} kg</td>
                  <td>Q{e.costo_estimado}</td>
                  <td><span className={`badge ${ESTADO_BADGE[e.estado]?.cls}`}>{ESTADO_BADGE[e.estado]?.label}</span></td>
                  <td>{formatFecha(e.created_at)}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--edit" onClick={() => abrirEditar(e)}>✏️ Editar</button>
                      <button className="admin-btn admin-btn--delete" onClick={() => eliminar(e.id, e.codigo_guia)}>🗑️</button>
                    </div>
                  </td>
                </tr>
                {editando === e.id && (
                  <tr key={`edit-${e.id}`} className="admin-edit-row">
                    <td colSpan={10}>
                      <div className="admin-edit-form">
                        <h4>Editar envío {e.codigo_guia}</h4>
                        <div className="admin-edit-grid">
                          <div className="admin-field">
                            <label>Estado</label>
                            <select value={formEdit.estado} onChange={ev => setFormEdit(p => ({...p, estado: ev.target.value}))}>
                              <option value="pendiente">Pendiente</option>
                              <option value="en_transito">En Tránsito</option>
                              <option value="entregado">Entregado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </div>
                          <div className="admin-field">
                            <label>Región</label>
                            <input value={formEdit.region} onChange={ev => setFormEdit(p => ({...p, region: ev.target.value}))} placeholder="Ej. Norte, Sur, Internacional" />
                          </div>
                          <div className="admin-field">
                            <label>Costo Estimado (Q)</label>
                            <input type="number" value={formEdit.costo_estimado} onChange={ev => setFormEdit(p => ({...p, costo_estimado: ev.target.value}))} />
                          </div>
                        </div>
                        <div className="admin-edit-actions">
                          <button className="admin-btn admin-btn--ghost" onClick={cerrarEditar}>Cancelar</button>
                          <button className="admin-btn admin-btn--save" onClick={() => guardar(e.id)} disabled={guardando}>{guardando ? 'Guardando...' : '💾 Guardar'}</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Admin principal ─────────────────────────────────────────────────────── */
const Admin = () => {
  const [tab, setTab] = useState('tablero')
  const [dashData, setDashData] = useState(null)

  useEffect(() => {
    adminService.getDashboard().then(setDashData).catch(console.error)
  }, [])

  const tabs = [
    { id: 'tablero',  label: '📊 Tablero'  },
    { id: 'usuarios', label: '👤 Usuarios' },
    { id: 'envios',   label: '📦 Envíos'   },
  ]

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="container">
          <h1 className="admin-header__title">⚙️ Panel Administrativo</h1>
          <p className="admin-header__sub">SkyShip Express – Gestión interna</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <div className="container">
          <div className="admin-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`admin-tab ${tab === t.id ? 'admin-tab--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="container admin-content">
        {tab === 'tablero'  && <Tablero data={dashData} />}
        {tab === 'usuarios' && <GestionUsuarios />}
        {tab === 'envios'   && <GestionEnvios />}
      </div>
    </div>
  )
}

export default Admin
