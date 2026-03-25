import { api } from './axios';
import { Page, Paciente } from '../types';

export const getPacientes = async (page = 0, size = 10, sort = 'nome') => {
  const response = await api.get<Page<Paciente>>(`/pacientes?page=${page}&size=${size}&sort=${sort}`);
  return response.data;
};

export const createPaciente = async (data: Omit<Paciente, 'id' | 'ativo'>) => {
  const response = await api.post<Paciente>('/pacientes/cadastro', data);
  return response.data;
};

export const updatePaciente = async (id: number, data: Partial<Paciente>) => {
  const response = await api.put<Paciente>(`/pacientes/${id}`, data);
  return response.data;
};

export const deletePaciente = async (id: number) => {
  await api.delete(`/pacientes/${id}`);
};
