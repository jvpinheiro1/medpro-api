import { api } from './axios';
import { Page, Medico } from '../types';

export const getMedicos = async (page = 0, size = 10, sort = 'nome') => {
  const response = await api.get<Page<Medico>>(`/medicos?page=${page}&size=${size}&sort=${sort}`);
  return response.data;
};

export const createMedico = async (data: Omit<Medico, 'id' | 'ativo'>) => {
  const response = await api.post<Medico>('/medicos', data);
  return response.data;
};

export const updateMedico = async (id: number, data: Partial<Medico>) => {
  const response = await api.put<Medico>(`/medicos/${id}`, data);
  return response.data;
};

export const deleteMedico = async (id: number) => {
  await api.delete(`/medicos/${id}`);
};
