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
import { MedicoForm } from '@/components/medico-form'
import { medicosApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { ESPECIALIDADES, type Medico, type MedicoPayload, type ApiError } from '@/lib/types'

export default function MedicosPage() {
  const { hasRole } = useAuth()
  const isAdmin = hasRole(['ADMIN'])

  const { data: medicos = [], isLoading, mutate } = useSWR('medicos', medicosApi.list)

  const [formOpen, setFormOpen] = useState(false)
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null)
  const [deletingMedico, setDeletingMedico] = useState<Medico | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getEspecialidadeLabel = (value: string) => {
    return ESPECIALIDADES.find((e) => e.value === value)?.label || value
  }

  const handleCreate = () => {
    setEditingMedico(null)
    setFormOpen(true)
  }

  const handleEdit = (medico: Medico) => {
    setEditingMedico(medico)
    setFormOpen(true)
  }

  const handleSubmit = async (data: MedicoPayload) => {
    setIsSubmitting(true)
    try {
      if (editingMedico) {
        await medicosApi.update(editingMedico.id, data)
        toast.success('Médico atualizado com sucesso!')
      } else {
        await medicosApi.create(data)
        toast.success('Médico cadastrado com sucesso!')
      }
      setFormOpen(false)
      mutate()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.message || 'Erro ao salvar médico')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingMedico) return

    setIsSubmitting(true)
    try {
      await medicosApi.delete(deletingMedico.id)
      toast.success('Médico excluído com sucesso!')
      setDeletingMedico(null)
      mutate()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.message || 'Erro ao excluir médico')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<Medico>[] = [
    {
      key: 'nome',
      header: 'Nome',
      cell: (medico) => <span className="font-medium">{medico.nome}</span>,
    },
    {
      key: 'email',
      header: 'E-mail',
      cell: (medico) => medico.email,
    },
    {
      key: 'telefone',
      header: 'Telefone',
      cell: (medico) => medico.telefone || '-',
    },
    {
      key: 'crm',
      header: 'CRM',
      cell: (medico) => medico.crm,
    },
    {
      key: 'especialidade',
      header: 'Especialidade',
      cell: (medico) => getEspecialidadeLabel(medico.especialidade),
    },
    {
      key: 'ativo',
      header: 'Status',
      cell: (medico) => medico.ativo != null ? <AtivoStatusBadge ativo={medico.ativo} /> : '-',
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[100px]',
      cell: (medico) => (
        <div className="flex items-center justify-end gap-1">
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(medico)}
                title="Editar"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingMedico(medico)}
                title="Excluir"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Médicos"
        description="Gerencie os médicos cadastrados na clínica"
      >
        {isAdmin && (
          <Button onClick={handleCreate}>
            <Plus className="size-4 mr-2" />
            Novo Médico
          </Button>
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={medicos}
        isLoading={isLoading}
        emptyMessage="Nenhum médico cadastrado"
        emptyDescription="Clique em 'Novo Médico' para cadastrar o primeiro médico."
      />

      <MedicoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        medico={editingMedico}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={!!deletingMedico}
        onOpenChange={(open) => !open && setDeletingMedico(null)}
        title="Excluir Médico"
        description={`Tem certeza que deseja excluir o médico "${deletingMedico?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
