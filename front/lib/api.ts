import type {
  AuthResponse,
  LoginCredentials,
  Medico,
  MedicoPayload,
  MedicoUpdatePayload,
  Paciente,
  PacientePayload,
  PacienteUpdatePayload,
  Consulta,
  ConsultaPayload,
  CancelamentoPayload,
  ApiError,
  PaginatedResponse,
} from './types'
import { normalizeResponse } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Token management
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('medpro_token')
}

export function setToken(token: string): void {
  localStorage.setItem('medpro_token', token)
}

export function removeToken(): void {
  localStorage.removeItem('medpro_token')
}

// Fetch wrapper com interceptors
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
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
    throw { message: 'Sessão expirada', status: 401 } as ApiError
  }

  // Handle 403 - Forbidden
  if (response.status === 403) {
    throw { message: 'Você não tem permissão para realizar esta ação', status: 403 } as ApiError
  }

  // Handle other errors
  if (!response.ok) {
    let errorData: Partial<ApiError> = {}
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: 'Erro desconhecido' }
    }
    throw {
      message: errorData.message || getErrorMessage(response.status),
      errors: errorData.errors,
      status: response.status,
    } as ApiError
  }

  // Handle empty response
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

function getErrorMessage(status: number): string {
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
  login: (credentials: LoginCredentials) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
}

// Médicos API
export const medicosApi = {
  list: async () => {
    const data = await apiFetch<Medico[] | PaginatedResponse<Medico>>('/medicos')
    return normalizeResponse(data)
  },
  create: (data: MedicoPayload) =>
    apiFetch<Medico>('/medicos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: MedicoUpdatePayload) =>
    apiFetch<Medico>('/medicos', {
      method: 'PUT',
      body: JSON.stringify({ ...data, id }),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/medicos/${id}`, {
      method: 'DELETE',
    }),
}

// Pacientes API
export const pacientesApi = {
  list: async () => {
    const data = await apiFetch<Paciente[] | PaginatedResponse<Paciente>>('/pacientes')
    return normalizeResponse(data)
  },
  create: (data: PacientePayload) =>
    apiFetch<Paciente>('/pacientes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: PacienteUpdatePayload) =>
    apiFetch<Paciente>('/pacientes', {
      method: 'PUT',
      body: JSON.stringify({ ...data, id }),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/pacientes/${id}`, {
      method: 'DELETE',
    }),
}

// Consultas API
export const consultasApi = {
  list: async () => {
    const data = await apiFetch<Consulta[] | PaginatedResponse<Consulta>>('/consultas')
    return normalizeResponse(data)
  },
  create: (data: ConsultaPayload) =>
    apiFetch<Consulta>('/consultas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (data: CancelamentoPayload) =>
    apiFetch<void>('/consultas', {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),
}

// Dashboard API (mock - ajustar conforme backend)
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
