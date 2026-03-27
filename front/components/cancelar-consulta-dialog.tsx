'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { MOTIVOS_CANCELAMENTO, type MotivoCancelamento, type Consulta } from '@/lib/types'

interface CancelarConsultaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consulta: Consulta | null
  onConfirm: (idConsulta: number, motivo: MotivoCancelamento) => Promise<void>
  isLoading?: boolean
}

export function CancelarConsultaDialog({
  open,
  onOpenChange,
  consulta,
  onConfirm,
  isLoading = false,
}: CancelarConsultaDialogProps) {
  const [motivo, setMotivo] = useState<MotivoCancelamento | ''>('')
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (!motivo) {
      setError('Selecione um motivo para o cancelamento')
      return
    }

    if (consulta) {
      await onConfirm(consulta.id, motivo)
      setMotivo('')
      setError('')
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMotivo('')
      setError('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar Consulta</DialogTitle>
          <DialogDescription>
            Selecione o motivo do cancelamento da consulta
          </DialogDescription>
        </DialogHeader>

        <Field className="py-4">
          <FieldLabel htmlFor="motivo">Motivo do Cancelamento</FieldLabel>
          <Select
            value={motivo}
            onValueChange={(value) => {
              setMotivo(value as MotivoCancelamento)
              setError('')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um motivo" />
            </SelectTrigger>
            <SelectContent>
              {MOTIVOS_CANCELAMENTO.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <FieldError>{error}</FieldError>}
        </Field>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? <Spinner className="size-4" /> : 'Cancelar Consulta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
