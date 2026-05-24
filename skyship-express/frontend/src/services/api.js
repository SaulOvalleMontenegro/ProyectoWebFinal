const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Helpers ───────────────────────────────────────────────────────────────────

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('skyship_token') && {
    Authorization: `Bearer ${localStorage.getItem('skyship_token')}`,
  }),
})

const handleResponse = async (res) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud')
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authService = {
  login: (credentials) =>
    fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }).then(handleResponse),

  me: () =>
    fetch(`${API_URL}/api/auth/me`, { headers: getHeaders() }).then(handleResponse),
}

// ── Shipments ─────────────────────────────────────────────────────────────────

export const shipmentService = {
  getAll: () =>
    fetch(`${API_URL}/api/shipments`, { headers: getHeaders() }).then(handleResponse),

  create: (data) =>
    fetch(`${API_URL}/api/shipments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getById: (id) =>
    fetch(`${API_URL}/api/shipments/${id}`, { headers: getHeaders() }).then(handleResponse),
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminService = {
  getDashboard: () =>
    fetch(`${API_URL}/api/admin/dashboard`, { headers: getHeaders() }).then(handleResponse),

  // Usuarios
  getUsers: () =>
    fetch(`${API_URL}/api/admin/users`, { headers: getHeaders() }).then(handleResponse),

  updateUser: (id, data) =>
    fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteUser: (id) =>
    fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  // Envíos
  getShipments: () =>
    fetch(`${API_URL}/api/admin/shipments`, { headers: getHeaders() }).then(handleResponse),

  updateShipment: (id, data) =>
    fetch(`${API_URL}/api/admin/shipments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteShipment: (id) =>
    fetch(`${API_URL}/api/admin/shipments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  // Contactos
  getContacts: () =>
    fetch(`${API_URL}/api/admin/contacts`, { headers: getHeaders() }).then(handleResponse),
}

// ── Contact ───────────────────────────────────────────────────────────────────

export const contactService = {
  send: (data) =>
    fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
}
