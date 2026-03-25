import React, { useEffect, useState } from 'react';
import { getConsultas, createConsulta, cancelConsulta } from '../api/consultas';
import { getPacientes } from '../api/pacientes';
import { getMedicos } from '../api/medicos';
import { Consulta, Paciente, Medico } from '../types';
import { StatusPill } from '../components/StatusPill';
import { Drawer } from '../components/Drawer';

export const Consultas: React.FC = () => {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isCancelDrawerOpen, setCancelDrawerOpen] = useState(false);
  const [selectedConsultaId, setSelectedConsultaId] = useState<number | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('PACIENTE_DESISTIU');
  
  const [formData, setFormData] = useState({
    idPaciente: '', idMedico: '', especialidade: '', data: '', hora: ''
  });

  const especialidades = ['CARDIOLOGIA', 'ORTOPEDIA', 'GINECOLOGIA', 'DERMATOLOGIA', 'NEUROLOGIA', 'PEDIATRIA'];

  const fetchConsultas = async () => {
    try {
      const data = await getConsultas(0, 50);
      setConsultas(data.content || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchConsultas();
    getPacientes(0, 100).then(data => setPacientes(data.content || []));
    getMedicos(0, 100).then(data => setMedicos(data.content || []));
  }, []);

  const handleCreate = async () => {
    if (!formData.data || !formData.hora || !formData.idPaciente) {
      alert("Preencha data, hora e paciente.");
      return;
    }

    try {
      const isoDateTime = new Date(`${formData.data}T${formData.hora}`).toISOString();
      await createConsulta({
        idPaciente: Number(formData.idPaciente),
        idMedico: formData.idMedico ? Number(formData.idMedico) : undefined,
        especialidade: formData.especialidade || undefined,
        data: isoDateTime
      });
      setDrawerOpen(false);
      fetchConsultas();
    } catch (error) {
      alert('Erro ao agendar consulta. Verifique regras de negócio (conflitos de horário, antecedência, etc).');
    }
  };

  const promptCancel = (id: number) => {
    setSelectedConsultaId(id);
    setMotivoCancelamento('PACIENTE_DESISTIU');
    setCancelDrawerOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedConsultaId) return;
    try {
      await cancelConsulta({ idConsulta: selectedConsultaId, motivo: motivoCancelamento });
      setCancelDrawerOpen(false);
      fetchConsultas();
    } catch (error) {
      alert('Erro ao cancelar consulta.');
    }
  };

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[1.5rem] font-medium text-[#09090b]">Consultas</h2>
          <p className="text-[0.875rem] text-[#71717a] mt-1">Acompanhe e agende novos atendimentos.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ idPaciente: '', idMedico: '', especialidade: '', data: '', hora: '' });
            setDrawerOpen(true);
          }}
          className="bg-[#000000] text-[#ffffff] px-4 py-2 text-[0.875rem] font-medium hover:bg-black/80 transition-colors"
        >
          + Nova Consulta
        </button>
      </div>

      <div className="bg-[#ffffff] border border-[rgba(0,0,0,0.08)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.08)] bg-[#f4f4f5]/50">
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">ID</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">Data/Hora</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">Paciente</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">Médico</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">Status</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,0,0,0.08)]">
            {consultas.map(c => (
              <tr key={c.id} className="hover:bg-[#f4f4f5]/50 transition-colors">
                <td className="px-6 py-4 text-[0.875rem] font-mono text-[#71717a]">#{c.id}</td>
                <td className="px-6 py-4 text-[0.875rem] text-[#09090b]">{new Date(c.dataConsulta).toLocaleString('pt-BR')}</td>
                <td className="px-6 py-4 text-[0.875rem] font-medium text-[#09090b]">{c.paciente.nome}</td>
                <td className="px-6 py-4 text-[0.875rem] text-[#71717a]">{c.medico.nome} <br/><span className="text-[0.6875rem] uppercase">{c.medico.especialidade}</span></td>
                <td className="px-6 py-4"><StatusPill status={c.status} /></td>
                <td className="px-6 py-4 text-right space-x-3">
                  {c.status === 'ATIVA' && (
                    <button onClick={() => promptCancel(c.id)} className="text-[0.875rem] font-medium text-[#ba1a1a] hover:underline">Cancelar</button>
                  )}
                </td>
              </tr>
            ))}
            {consultas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#71717a] text-[0.875rem]">Nenhuma consulta agendada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title="Nova Consulta"
        onConfirm={handleCreate}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Paciente *</label>
            <select value={formData.idPaciente} onChange={e => setFormData({...formData, idPaciente: e.target.value})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000] bg-white">
              <option value="">Selecione um paciente...</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.nome} - CPF: {p.cpf}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Médico</label>
            <select value={formData.idMedico} onChange={e => setFormData({...formData, idMedico: e.target.value, especialidade: ''})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000] bg-white">
              <option value="">Qualquer médico (definir por especialidade)</option>
              {medicos.map(m => (
                <option key={m.id} value={m.id}>{m.nome} - {m.especialidade}</option>
              ))}
            </select>
          </div>

          {!formData.idMedico && (
            <div>
              <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Especialidade *</label>
              <select value={formData.especialidade} onChange={e => setFormData({...formData, especialidade: e.target.value})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000] bg-white">
                <option value="">Selecione uma especialidade...</option>
                {especialidades.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Data *</label>
              <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000] bg-white" />
            </div>
            <div>
              <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Hora *</label>
              <input type="time" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000] bg-white" />
            </div>
          </div>
        </div>
      </Drawer>

      <Drawer 
        isOpen={isCancelDrawerOpen} 
        onClose={() => setCancelDrawerOpen(false)} 
        title="Cancelar Consulta"
        onConfirm={handleCancel}
        confirmText="Confirmar Cancelamento"
      >
        <div className="space-y-4">
          <p className="text-[0.875rem] text-[#09090b]">Por favor, informe o motivo do cancelamento:</p>
          <select value={motivoCancelamento} onChange={e => setMotivoCancelamento(e.target.value)} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#ba1a1a] bg-white">
            <option value="PACIENTE_DESISTIU">Paciente desistiu</option>
            <option value="MEDICO_CANCELOU">Médico cancelou</option>
            <option value="OUTROS">Outros</option>
          </select>
        </div>
      </Drawer>
    </>
  );
};
