'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { DataTable, type Column } from '@/components/data-table'
import { AtivoStatusBadge } from '@/components/status-badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PacienteForm } from '@/components/paciente-form'
import { pacientesApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Paciente, PacientePayload, ApiError } from '@/lib/types'

export default function PacientesPage() {
  const { hasRole } = useAuth()
  const isAdmin = hasRole(['ADMIN'])
  const canEdit = hasRole(['ADMIN', 'RECEPCIONISTA'])

  const { data: pacientes = [], isLoading, mutate } = useSWR('pacientes', pacientesApi.list)

  const [formOpen, setFormOpen] = useState(false)
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null)
  const [deletingPaciente, setDeletingPaciente] = useState<Paciente | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatCpf = (cpf: string) => {
    if (cpf.length !== 11) return cpf
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
  }

  const handleCreate = () => {
    setEditingPaciente(null)
    setFormOpen(true)
  }

  const handleEdit = (paciente: Paciente) => {
    setEditingPaciente(paciente)
    setFormOpen(true)
  }

  const handleSubmit = async (data: PacientePayload) => {
    setIsSubmitting(true)
    try {
      if (editingPaciente) {
        await pacientesApi.update(editingPaciente.id, data)
        toast.success('Paciente atualizado com sucesso!')
      } else {
        await pacientesApi.create(data)
        toast.success('Paciente cadastrado com sucesso!')
      }
      setFormOpen(false)
      mutate()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.message || 'Erro ao salvar paciente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingPaciente) return

    setIsSubmitting(true)
    try {
      await pacientesApi.delete(deletingPaciente.id)
      toast.success('Paciente excluído com sucesso!')
      setDeletingPaciente(null)
      mutate()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.message || 'Erro ao excluir paciente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<Paciente>[] = [
    {
      key: 'nome',
      header: 'Nome',
      cell: (paciente) => <span className="font-medium">{paciente.nome}</span>,
    },
    {
      key: 'email',
      header: 'E-mail',
      cell: (paciente) => paciente.email,
    },
    {
      key: 'telefone',
      header: 'Telefone',
      cell: (paciente) => paciente.telefone || '-',
    },
    {
      key: 'cpf',
      header: 'CPF',
      cell: (paciente) => formatCpf(paciente.cpf),
    },
    {
      key: 'ativo',
      header: 'Status',
      cell: (paciente) => paciente.ativo != null ? <AtivoStatusBadge ativo={paciente.ativo} /> : '-',
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[100px]',
      cell: (paciente) => (
        <div className="flex items-center justify-end gap-1">
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(paciente)}
              title="Editar"
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingPaciente(paciente)}
              title="Excluir"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pacientes"
        description="Gerencie os pacientes cadastrados na clínica"
      >
        {canEdit && (
          <Button onClick={handleCreate}>
            <Plus className="size-4 mr-2" />
            Novo Paciente
          </Button>
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={pacientes}
        isLoading={isLoading}
        emptyMessage="Nenhum paciente cadastrado"
        emptyDescription="Clique em 'Novo Paciente' para cadastrar o primeiro paciente."
      />

      <PacienteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        paciente={editingPaciente}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={!!deletingPaciente}
        onOpenChange={(open) => !open && setDeletingPaciente(null)}
        title="Excluir Paciente"
        description={`Tem certeza que deseja excluir o paciente "${deletingPaciente?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
