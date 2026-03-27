// Tipos base
export type Role = 'ADMIN' | 'RECEPCIONISTA'

export interface User {
  id: number
  nome: string
  email: string
  role: Role
}

export interface AuthResponse {
  token: string
  user?: User
}

export interface LoginCredentials {
  email: string
  senha: string
}

// Endereço (obrigatório no cadastro de médico e paciente)
export interface Endereco {
  logradouro: string
  bairro: string
  cep: string
  cidade: string
  uf: string
  numero?: string
  complemento?: string
}

// Médicos - Listagem retorna: id, nome, email, crm, especialidade
export interface Medico {
  id: number
  nome: string
  email: string
  telefone?: string
  crm: string
  especialidade: Especialidade
  ativo?: boolean
  endereco?: Endereco
}

export interface MedicoPayload {
  nome: string
  email: string
  telefone: string
  crm: string
  especialidade: Especialidade
  endereco: Endereco
}

export interface MedicoUpdatePayload {
  id: number
  nome?: string
  telefone?: string
  endereco?: Endereco
}

export type Especialidade =
  | 'CARDIOLOGIA'
  | 'DERMATOLOGIA'
  | 'GINECOLOGIA'
  | 'ORTOPEDIA'

export const ESPECIALIDADES: { value: Especialidade; label: string }[] = [
  { value: 'CARDIOLOGIA', label: 'Cardiologia' },
  { value: 'DERMATOLOGIA', label: 'Dermatologia' },
  { value: 'GINECOLOGIA', label: 'Ginecologia' },
  { value: 'ORTOPEDIA', label: 'Ortopedia' },
]

// Pacientes - Listagem retorna: nome, email, cpf (sem id, telefone, ativo)
export interface Paciente {
  id?: number
  nome: string
  email: string
  telefone?: string
  cpf: string
  ativo?: boolean
  endereco?: Endereco
}

export interface PacientePayload {
  nome: string
  email: string
  telefone: string
  cpf: string
  endereco: Endereco
}

export interface PacienteUpdatePayload {
  id: number
  nome?: string
  telefone?: string
  endereco?: Endereco
}

// Consultas
export type StatusConsulta = 'ATIVA' | 'CANCELADA' | 'FINALIZADA'

export type MotivoCancelamento =
  | 'PACIENTE_DESISTIU'
  | 'MEDICO_CANCELOU'
  | 'OUTROS'

export interface Consulta {
  id: number
  idMedico: number
  idPaciente: number
  nomePaciente?: string
  nomeMedico?: string
  especialidade?: Especialidade
  data: string
  status: StatusConsulta
  motivoCancelamento?: MotivoCancelamento
}

export interface ConsultaPayload {
  idPaciente: number
  idMedico: number
  data: string
  especialidade?: Especialidade
}

export interface CancelamentoPayload {
  idConsulta: number
  motivo: MotivoCancelamento
}

export const MOTIVOS_CANCELAMENTO: { value: MotivoCancelamento; label: string }[] = [
  { value: 'PACIENTE_DESISTIU', label: 'Paciente desistiu' },
  { value: 'MEDICO_CANCELOU', label: 'Médico cancelou' },
  { value: 'OUTROS', label: 'Outros' },
]

// Dashboard
export interface DashboardMetrics {
  totalMedicos: number
  totalPacientes: number
  totalConsultas: number
  consultasHoje: number
}

// API Response helpers
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Helper para normalizar resposta (paginada ou array)
export function normalizeResponse<T>(data: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(data)) {
    return data
  }
  return data.content
}
