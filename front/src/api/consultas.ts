import { api } from './axios';
import { Page, Consulta } from '../types';

export const getConsultas = async (page = 0, size = 10, sort = 'dataConsulta') => {
  const response = await api.get<Page<Consulta>>(`/consultas?page=${page}&size=${size}&sort=${sort}`);
  return response.data;
};

export const createConsulta = async (data: { idPaciente: number; idMedico?: number; especialidade?: string; data: string }) => {
  const response = await api.post<Consulta>('/consultas', data);
  return response.data;
};

export const cancelConsulta = async (data: { idConsulta: number; motivo: string }) => {
  await api.delete('/consultas', { data });
};
