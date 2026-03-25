import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { StatusPill } from '../components/StatusPill';
import { getPacientes } from '../api/pacientes';
import { getMedicos } from '../api/medicos';
import { getConsultas } from '../api/consultas';
import { Consulta } from '../types';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({ pacientes: 0, medicos: 0, consultas: 0 });
  const [proximasConsultas, setProximasConsultas] = useState<Consulta[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pacientesData, medicosData, consultasData] = await Promise.all([
          getPacientes(0, 1),
          getMedicos(0, 1),
          getConsultas(0, 5, 'dataConsulta')
        ]);
        
        setMetrics({
          pacientes: pacientesData.totalElements || 0,
          medicos: medicosData.totalElements || 0,
          consultas: consultasData.totalElements || 0
        });
        
        setProximasConsultas(consultasData.content || []);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[1.5rem] font-medium text-[#09090b]">Painel de Controle</h2>
          <p className="text-[0.875rem] text-[#71717a] mt-1">Resumo operacional de hoje.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total Pacientes" value={metrics.pacientes} subtitle="Base ativa" />
        <MetricCard title="Consultas Hoje" value={metrics.consultas} subtitle="Total agendado" />
        <MetricCard title="Médicos Ativos" value={metrics.medicos} subtitle="Profissionais cadastrados" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-[#ffffff] border border-[rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
            <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#09090b]">Próximas Consultas</h3>
          </div>
          <div className="divide-y divide-[rgba(0,0,0,0.08)]">
            {proximasConsultas.length > 0 ? proximasConsultas.map(consulta => (
              <div key={consulta.id} className="p-4 flex items-center justify-between hover:bg-[#f4f4f5] transition-colors">
                <div>
                  <p className="text-[0.875rem] font-medium text-[#09090b]">{consulta.paciente.nome}</p>
                  <p className="text-[0.6875rem] text-[#71717a] uppercase tracking-widest mt-0.5">
                    {new Date(consulta.dataConsulta).toLocaleString('pt-BR')} • {consulta.medico.nome}
                  </p>
                </div>
                <StatusPill status={consulta.status} />
              </div>
            )) : (
              <div className="p-6 text-center text-[#71717a] text-[0.875rem]">Nenhuma consulta encontrada.</div>
            )}
          </div>
        </div>

        <div className="bg-[#ffffff] border border-[rgba(0,0,0,0.08)] p-6">
          <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-[#09090b] mb-6">Distribuição por Especialidade</h3>
          <div className="space-y-4">
            {['CARDIOLOGIA', 'ORTOPEDIA', 'PEDIATRIA'].map((esp, i) => {
              const percentages = [42, 28, 15]; // Mock visual para o chart de barras
              return (
                <div key={esp} className="space-y-2">
                  <div className="flex justify-between text-[0.6875rem] font-medium uppercase tracking-widest text-[#71717a]">
                    <span>{esp}</span>
                    <span>{percentages[i]}%</span>
                  </div>
                  <div className="h-2 bg-[#f4f4f5] w-full">
                    <div className="h-full bg-[#000000]" style={{ width: `${percentages[i]}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
