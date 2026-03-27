'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Plus, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { DataTable, type Column } from '@/components/data-table'
import { ConsultaStatusBadge } from '@/components/status-badge'
import { ConsultaForm } from '@/components/consulta-form'
import { CancelarConsultaDialog } from '@/components/cancelar-consulta-dialog'
import { consultasApi, medicosApi, pacientesApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Consulta, ConsultaPayload, MotivoCancelamento, Medico, Paciente, ApiError } from '@/lib/types'

async function fetchConsultasData() {
  const [consultas, medicos, pacientes] = await Promise.all([
    consultasApi.list(),
    medicosApi.list(),
    pacientesApi.list(),
  ])
  return { consultas, medicos, pacientes }
}

export default function ConsultasPage() {
  const { hasRole } = useAuth()
  const canEdit = hasRole(['ADMIN', 'RECEPCIONISTA'])

  const { data, isLoading, mutate } = useSWR('consultas-data', fetchConsultasData)

  const consultas = data?.consultas || []
  const medicos = data?.medicos || []
  const pacientes = data?.pacientes || []

  const medicosMap = new Map<number, Medico>(medicos.map((m) => [m.id, m]))
  const pacientesMap = new Map<number, Paciente>(pacientes.map((p) => [p.id, p]))

  const [formOpen, setFormOpen] = useState(false)
  const [cancelingConsulta, setCancelingConsulta] = useState<Consulta | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const handleCreate = async (data: ConsultaPayload) => {
    setIsSubmitting(true)
    try {
      await consultasApi.create(data)
      toast.success('Consulta agendada com sucesso!')
      setFormOpen(false)
      mutate()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.message || 'Erro ao agendar consulta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async (idConsulta: number, motivo: MotivoCancelamento) => {
    setIsSubmitting(true)
    try {
      await consultasApi.cancel({ idConsulta, motivo })
      toast.success('Consulta cancelada com sucesso!')
      setCancelingConsulta(null)
      mutate()
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.message || 'Erro ao cancelar consulta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<Consulta>[] = [
    {
      key: 'data',
      header: 'Data/Hora',
      cell: (consulta) => formatDate(consulta.data),
    },
    {
      key: 'paciente',
      header: 'Paciente',
      cell: (consulta) => {
        return <span className="font-medium">{consulta.nomePaciente || `ID: ${consulta.idPaciente}`}</span>
      },
    },
    {
      key: 'medico',
      header: 'Médico',
      cell: (consulta) => {
        return consulta.nomeMedico || `ID: ${consulta.idMedico}`
      },
    },
    {
      key: 'especialidade',
      header: 'Especialidade',
      cell: (consulta) => {
        return consulta.especialidade || '-'
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (consulta) => <ConsultaStatusBadge status={consulta.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[100px]',
      cell: (consulta) => (
        <div className="flex items-center justify-end gap-1">
          {canEdit && consulta.status === 'ATIVA' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCancelingConsulta(consulta)}
              title="Cancelar consulta"
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  // Ordenar consultas: agendadas primeiro, depois por data
  const sortedConsultas = [...consultas].sort((a, b) => {
    // Priorizar agendadas
    if (a.status === 'ATIVA' && b.status !== 'ATIVA') return -1
    if (a.status !== 'ATIVA' && b.status === 'ATIVA') return 1
    // Depois ordenar por data
    return new Date(b.data).getTime() - new Date(a.data).getTime()
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Consultas"
        description="Gerencie os agendamentos de consultas"
      >
        {canEdit && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4 mr-2" />
            Agendar Consulta
          </Button>
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={sortedConsultas}
        isLoading={isLoading}
        emptyMessage="Nenhuma consulta encontrada"
        emptyDescription="Clique em 'Agendar Consulta' para criar o primeiro agendamento."
      />

      <ConsultaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        medicos={medicos}
        pacientes={pacientes}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      />

      <CancelarConsultaDialog
        open={!!cancelingConsulta}
        onOpenChange={(open) => !open && setCancelingConsulta(null)}
        consulta={cancelingConsulta}
        onConfirm={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}
