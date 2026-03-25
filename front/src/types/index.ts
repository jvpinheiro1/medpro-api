export interface Endereco {
  logradouro: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  numero: string;
  complemento?: string;
}

export interface Paciente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  ativo: boolean;
  endereco: Endereco;
}

export type Especialidade = 'CARDIOLOGIA' | 'ORTOPEDIA' | 'GINECOLOGIA' | 'DERMATOLOGIA' | 'NEUROLOGIA' | 'PEDIATRIA';

export interface Medico {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  crm: string;
  especialidade: Especialidade;
  ativo: boolean;
  endereco: Endereco;
}

export interface Consulta {
  id: number;
  paciente: Paciente;
  medico: Medico;
  dataConsulta: string;
  status: 'ATIVA' | 'CANCELADA';
  motivoCancelamento?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
