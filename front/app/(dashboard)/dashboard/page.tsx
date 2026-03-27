'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Stethoscope, Users, CalendarDays, CalendarCheck } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { MetricCard } from '@/components/metric-card'
import { DataTable, type Column } from '@/components/data-table'
import { ConsultaStatusBadge } from '@/components/status-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { consultasApi, medicosApi, pacientesApi } from '@/lib/api'
import type { Consulta, Medico, Paciente, DashboardMetrics } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'

async function fetchDashboardData() {
  const [medicos, pacientes, consultas] = await Promise.all([
    medicosApi.list(),
    pacientesApi.list(),
    consultasApi.list(),
  ])

  const hoje = new Date().toISOString().split('T')[0]
  const consultasHoje = consultas.filter(
    (c) => c.data.startsWith(hoje) && c.status === 'ATIVA'
  )

  return {
    metrics: {
      totalMedicos: medicos.length,
      totalPacientes: pacientes.length,
      totalConsultas: consultas.length,
      consultasHoje: consultasHoje.length,
    },
    consultasHoje,
    proximasConsultas: consultas
      .filter((c) => c.status === 'ATIVA' && new Date(c.data) >= new Date())
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 5),
    medicos,
    pacientes,
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error } = useSWR('dashboard', fetchDashboardData, {
    revalidateOnFocus: false,
  })

  const medicosMap = new Map(data?.medicos?.map((m) => [m.id, m]) || [])
  const pacientesMap = new Map(data?.pacientes?.map((p) => [p.id, p]) || [])

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

  const consultaColumns: Column<Consulta>[] = [
    {
      key: 'data',
      header: 'Data/Hora',
      cell: (consulta) => formatDate(consulta.data),
    },
    {
      key: 'paciente',
      header: 'Paciente',
      cell: (consulta) =>
        pacientesMap.get(consulta.idPaciente)?.nome || `ID: ${consulta.idPaciente}`,
    },
    {
      key: 'medico',
      header: 'Médico',
      cell: (consulta) =>
        medicosMap.get(consulta.idMedico)?.nome || `ID: ${consulta.idMedico}`,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (consulta) => <ConsultaStatusBadge status={consulta.status} />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Olá, ${user?.nome?.split(' ')[0] || 'Usuário'}`}
        description="Acompanhe as principais métricas da clínica"
      />

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Médicos"
          value={data?.metrics.totalMedicos ?? 0}
          icon={Stethoscope}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total de Pacientes"
          value={data?.metrics.totalPacientes ?? 0}
          icon={Users}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total de Consultas"
          value={data?.metrics.totalConsultas ?? 0}
          icon={CalendarDays}
          isLoading={isLoading}
        />
        <MetricCard
          title="Consultas Hoje"
          value={data?.metrics.consultasHoje ?? 0}
          icon={CalendarCheck}
          isLoading={isLoading}
        />
      </div>

      {/* Próximas Consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Consultas</CardTitle>
          <CardDescription>
            Consultas agendadas para os próximos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={consultaColumns}
            data={data?.proximasConsultas || []}
            isLoading={isLoading}
            emptyMessage="Nenhuma consulta agendada"
            emptyDescription="Não há consultas agendadas para os próximos dias."
          />
        </CardContent>
      </Card>
    </div>
  )
}
