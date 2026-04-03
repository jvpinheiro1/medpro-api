import { normalizeResponse } from './constants'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Token management
export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('medpro_token')
}

export function setToken(token) {
  localStorage.setItem('medpro_token', token)
}

export function removeToken() {
  localStorage.removeItem('medpro_token')
}

// Fetch wrapper com interceptors
async function apiFetch(endpoint, options = {}) {
  const token = getToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle 401 - Redirect to login
  if (response.status === 401) {
    removeToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw { message: 'Sessão expirada', status: 401 }
  }

  // Handle 403 - Forbidden
  if (response.status === 403) {
    throw { message: 'Você não tem permissão para realizar esta ação', status: 403 }
  }

  // Handle other errors
  if (!response.ok) {
    let errorData = {}
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: 'Erro desconhecido' }
    }
    throw {
      message: errorData.message || getErrorMessage(response.status),
      errors: errorData.errors,
      status: response.status,
    }
  }

  // Handle empty response
  if (response.status === 204) {
    return {}
  }

  return response.json()
}

function getErrorMessage(status) {
  switch (status) {
    case 400:
      return 'Dados inválidos'
    case 404:
      return 'Recurso não encontrado'
    case 409:
      return 'Conflito de dados'
    case 500:
      return 'Erro interno do servidor'
    default:
      return 'Erro desconhecido'
  }
}

// Auth API
export const authApi = {
  login: (credentials) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
}

// Médicos API
export const medicosApi = {
  list: async () => {
    const data = await apiFetch('/medicos')
    return normalizeResponse(data)
  },
  create: (data) =>
    apiFetch('/medicos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch('/medicos', {
      method: 'PUT',
      body: JSON.stringify({ ...data, id }),
    }),
  delete: (id) =>
    apiFetch(`/medicos/${id}`, {
      method: 'DELETE',
    }),
}

// Pacientes API
export const pacientesApi = {
  list: async () => {
    const data = await apiFetch('/pacientes')
    return normalizeResponse(data)
  },
  create: (data) =>
    apiFetch('/pacientes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch('/pacientes', {
      method: 'PUT',
      body: JSON.stringify({ ...data, id }),
    }),
  delete: (id) =>
    apiFetch(`/pacientes/${id}`, {
      method: 'DELETE',
    }),
}

// Consultas API
export const consultasApi = {
  list: async () => {
    const data = await apiFetch('/consultas')
    return normalizeResponse(data)
  },
  create: (data) =>
    apiFetch('/consultas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (data) =>
    apiFetch('/consultas', {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),
}

// Dashboard API
export const dashboardApi = {
  getMetrics: async () => {
    const [medicos, pacientes, consultas] = await Promise.all([
      medicosApi.list(),
      pacientesApi.list(),
      consultasApi.list(),
    ])
    
    const hoje = new Date().toISOString().split('T')[0]
    const consultasHoje = consultas.filter(c => 
      c.data.startsWith(hoje) && c.status === 'ATIVA'
    ).length

    return {
      totalMedicos: medicos.length,
      totalPacientes: pacientes.length,
      totalConsultas: consultas.length,
      consultasHoje,
    }
  },
}
