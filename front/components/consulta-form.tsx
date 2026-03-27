'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import type { ConsultaPayload, Medico, Paciente, Especialidade } from '@/lib/types'
import { ESPECIALIDADES } from '@/lib/types'

const consultaSchema = z.object({
  idPaciente: z.string().min(1, 'Paciente é obrigatório'),
  idMedico: z.string().min(1, 'Médico é obrigatório'),
  data: z.string().min(1, 'Data é obrigatória'),
  hora: z.string().min(1, 'Hora é obrigatória'),
}).refine((data) => {
  const dateTime = new Date(`${data.data}T${data.hora}`)
  return dateTime > new Date()
}, {
  message: 'A data e hora devem ser no futuro',
  path: ['data'],
})

type ConsultaFormData = z.infer<typeof consultaSchema>

interface ConsultaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicos: Medico[]
  pacientes: Paciente[]
  onSubmit: (data: ConsultaPayload) => Promise<void>
  isLoading?: boolean
}

export function ConsultaForm({
  open,
  onOpenChange,
  medicos,
  pacientes,
  onSubmit,
  isLoading = false,
}: ConsultaFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConsultaFormData>({
    resolver: zodResolver(consultaSchema),
    defaultValues: {
      idPaciente: '',
      idMedico: '',
      data: '',
      hora: '',
    },
  })

  const selectedMedicoId = watch('idMedico')
  const selectedPacienteId = watch('idPaciente')
  
  const selectedMedico = medicos.find(m => m.id.toString() === selectedMedicoId)

  const handleFormSubmit = async (data: ConsultaFormData) => {
    const dateTime = `${data.data}T${data.hora}:00`
    
    await onSubmit({
      idPaciente: parseInt(data.idPaciente),
      idMedico: parseInt(data.idMedico),
      data: dateTime,
      especialidade: selectedMedico?.especialidade,
    })
    reset()
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  // Filtrar apenas médicos e pacientes ativos
  const medicosAtivos = medicos.filter(m => m.ativo)
  const pacientesAtivos = pacientes.filter(p => p.ativo)

  const getEspecialidadeLabel = (value: string) => {
    return ESPECIALIDADES.find(e => e.value === value)?.label || value
  }

  // Data mínima: hoje
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Consulta</DialogTitle>
          <DialogDescription>
            Preencha os dados para agendar uma nova consulta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="idPaciente">Paciente</FieldLabel>
              <Select
                value={selectedPacienteId}
                onValueChange={(value) => setValue('idPaciente', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientesAtivos.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id.toString()}>
                      {paciente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idPaciente && (
                <FieldError>{errors.idPaciente.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="idMedico">Médico</FieldLabel>
              <Select
                value={selectedMedicoId}
                onValueChange={(value) => setValue('idMedico', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um médico" />
                </SelectTrigger>
                <SelectContent>
                  {medicosAtivos.map((medico) => (
                    <SelectItem key={medico.id} value={medico.id.toString()}>
                      {medico.nome} - {getEspecialidadeLabel(medico.especialidade)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idMedico && (
                <FieldError>{errors.idMedico.message}</FieldError>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="data">Data</FieldLabel>
                <Input
                  id="data"
                  type="date"
                  min={today}
                  {...register('data')}
                />
                {errors.data && <FieldError>{errors.data.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="hora">Hora</FieldLabel>
                <Input
                  id="hora"
                  type="time"
                  {...register('hora')}
                />
                {errors.hora && <FieldError>{errors.hora.message}</FieldError>}
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner className="size-4" /> : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
