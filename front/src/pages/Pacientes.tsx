import React, { useEffect, useState } from 'react';
import { getPacientes, createPaciente, updatePaciente, deletePaciente } from '../api/pacientes';
import { Paciente } from '../types';
import { StatusPill } from '../components/StatusPill';
import { Drawer } from '../components/Drawer';

export const Pacientes: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', cpf: '',
    endereco: { logradouro: '', bairro: '', cep: '', cidade: '', uf: '', numero: '', complemento: '' }
  });

  const fetchPacientes = async () => {
    try {
      const data = await getPacientes(0, 50);
      setPacientes(data.content || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const openDrawer = (paciente?: Paciente) => {
    if (paciente) {
      setEditingId(paciente.id);
      setFormData({
        nome: paciente.nome, email: paciente.email, telefone: paciente.telefone, cpf: paciente.cpf,
        endereco: { ...paciente.endereco }
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '', email: '', telefone: '', cpf: '',
        endereco: { logradouro: '', bairro: '', cep: '', cidade: '', uf: '', numero: '', complemento: '' }
      });
    }
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updatePaciente(editingId, formData);
      } else {
        await createPaciente(formData);
      }
      setDrawerOpen(false);
      fetchPacientes();
    } catch (error) {
      alert('Erro ao salvar paciente. Verifique os dados e tente novamente.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja inativar/excluir este paciente?')) {
      try {
        await deletePaciente(id);
        fetchPacientes();
      } catch (error) {
        alert('Erro ao inativar paciente.');
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[1.5rem] font-medium text-[#09090b]">Pacientes</h2>
          <p className="text-[0.875rem] text-[#71717a] mt-1">Gerencie os registros de pacientes do sistema.</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="bg-[#000000] text-[#ffffff] px-4 py-2 text-[0.875rem] font-medium hover:bg-black/80 transition-colors"
        >
          + Novo Paciente
        </button>
      </div>

      <div className="bg-[#ffffff] border border-[rgba(0,0,0,0.08)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.08)] bg-[#f4f4f5]/50">
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">Nome</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">Email</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">CPF</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">Telefone</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em]">Status</th>
              <th className="px-6 py-4 text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,0,0,0.08)]">
            {pacientes.map(p => (
              <tr key={p.id} className="hover:bg-[#f4f4f5]/50 transition-colors">
                <td className="px-6 py-4 text-[0.875rem] font-medium text-[#09090b]">{p.nome}</td>
                <td className="px-6 py-4 text-[0.875rem] text-[#71717a]">{p.email}</td>
                <td className="px-6 py-4 text-[0.875rem] text-[#71717a]">{p.cpf}</td>
                <td className="px-6 py-4 text-[0.875rem] text-[#71717a]">{p.telefone}</td>
                <td className="px-6 py-4"><StatusPill status={p.ativo ? 'ATIVA' : 'CANCELADA'} /></td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openDrawer(p)} className="text-[0.875rem] font-medium text-[#09090b] hover:underline">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-[0.875rem] font-medium text-[#ba1a1a] hover:underline">Desativar</button>
                </td>
              </tr>
            ))}
            {pacientes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#71717a] text-[0.875rem]">Nenhum paciente cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title={editingId ? 'Editar Paciente' : 'Novo Paciente'}
        onConfirm={handleSave}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Nome Completo</label>
            <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
          </div>
          <div>
            <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">CPF</label>
              <input type="text" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
            </div>
            <div>
              <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Telefone</label>
              <input type="text" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
            </div>
          </div>
          
          <h3 className="text-[0.875rem] font-semibold text-[#09090b] mt-6 mb-2 border-b border-[rgba(0,0,0,0.08)] pb-2">Endereço</h3>
          <div>
            <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">CEP</label>
            <input type="text" value={formData.endereco.cep} onChange={e => setFormData({...formData, endereco: {...formData.endereco, cep: e.target.value}})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
          </div>
          <div>
            <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Logradouro</label>
            <input type="text" value={formData.endereco.logradouro} onChange={e => setFormData({...formData, endereco: {...formData.endereco, logradouro: e.target.value}})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Número</label>
              <input type="text" value={formData.endereco.numero} onChange={e => setFormData({...formData, endereco: {...formData.endereco, numero: e.target.value}})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
            </div>
            <div>
              <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Complemento</label>
              <input type="text" value={formData.endereco.complemento} onChange={e => setFormData({...formData, endereco: {...formData.endereco, complemento: e.target.value}})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
            </div>
          </div>
          <div>
            <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Bairro</label>
            <input type="text" value={formData.endereco.bairro} onChange={e => setFormData({...formData, endereco: {...formData.endereco, bairro: e.target.value}})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">Cidade</label>
              <input type="text" value={formData.endereco.cidade} onChange={e => setFormData({...formData, endereco: {...formData.endereco, cidade: e.target.value}})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
            </div>
            <div>
              <label className="block text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-1">UF</label>
              <input type="text" value={formData.endereco.uf} onChange={e => setFormData({...formData, endereco: {...formData.endereco, uf: e.target.value}})} className="w-full border border-[rgba(0,0,0,0.08)] p-2 text-[0.875rem] outline-none focus:border-[#000000]" />
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};
