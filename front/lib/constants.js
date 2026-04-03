// Especialidades médicas disponíveis
export const ESPECIALIDADES = [
  { value: 'CARDIOLOGIA', label: 'Cardiologia' },
  { value: 'DERMATOLOGIA', label: 'Dermatologia' },
  { value: 'GINECOLOGIA', label: 'Ginecologia' },
  { value: 'ORTOPEDIA', label: 'Ortopedia' },
]

// Motivos de cancelamento de consulta
export const MOTIVOS_CANCELAMENTO = [
  { value: 'PACIENTE_DESISTIU', label: 'Paciente desistiu' },
  { value: 'MEDICO_CANCELOU', label: 'Médico cancelou' },
  { value: 'OUTROS', label: 'Outros' },
]

// Status de consulta
export const STATUS_CONSULTA = {
  ATIVA: 'ATIVA',
  CANCELADA: 'CANCELADA',
  FINALIZADA: 'FINALIZADA',
}

// Roles de usuário
export const ROLES = {
  ADMIN: 'ADMIN',
  RECEPCIONISTA: 'RECEPCIONISTA',
}

// Helper para normalizar resposta (paginada ou array)
export function normalizeResponse(data) {
  if (Array.isArray(data)) {
    return data
  }
  return data.content || []
}
