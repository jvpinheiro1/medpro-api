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
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import type { Paciente, PacientePayload } from '@/lib/types'

const pacienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{11}$/, 'CPF deve conter 11 dígitos numéricos'),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  uf: z.string().min(1, 'UF é obrigatória').max(2, 'UF deve ter 2 caracteres'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
})

type PacienteFormData = z.infer<typeof pacienteSchema>

interface PacienteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente?: Paciente | null
  onSubmit: (data: PacientePayload) => Promise<void>
  isLoading?: boolean
}

export function PacienteForm({
  open,
  onOpenChange,
  paciente,
  onSubmit,
  isLoading = false,
}: PacienteFormProps) {
  const isEditing = !!paciente

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      nome: paciente?.nome || '',
      email: paciente?.email || '',
      telefone: paciente?.telefone || '',
      cpf: paciente?.cpf || '',
    },
  })

  const handleFormSubmit = async (data: PacienteFormData) => {
    const { logradouro, bairro, cep, cidade, uf, numero, complemento, ...rest } = data
    await onSubmit({
      ...rest,
      endereco: { logradouro, bairro, cep, cidade, uf, numero, complemento },
    })
    reset()
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  const formatCpf = (value: string) => {
    // Remove tudo que não for número
    return value.replace(/\D/g, '').slice(0, 11)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do paciente'
              : 'Preencha os dados para cadastrar um novo paciente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input
                id="nome"
                placeholder="Maria da Silva"
                {...register('nome')}
              />
              {errors.nome && <FieldError>{errors.nome.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="maria@email.com"
                {...register('email')}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
              <Input
                id="telefone"
                placeholder="(11) 98888-7777"
                {...register('telefone')}
              />
              {errors.telefone && (
                <FieldError>{errors.telefone.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="cpf">CPF</FieldLabel>
              <Input
                id="cpf"
                placeholder="12345678901"
                maxLength={11}
                {...register('cpf', {
                  onChange: (e) => {
                    e.target.value = formatCpf(e.target.value)
                  },
                })}
              />
              <p className="text-xs text-muted-foreground">Apenas números, sem pontos ou traços</p>
              {errors.cpf && <FieldError>{errors.cpf.message}</FieldError>}
            </Field>

            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-3">Endereço</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="logradouro">Logradouro</FieldLabel>
                <Input id="logradouro" placeholder="Rua Exemplo" {...register('logradouro')} />
                {errors.logradouro && <FieldError>{errors.logradouro.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="numero">Número</FieldLabel>
                <Input id="numero" placeholder="123" {...register('numero')} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
              <Input id="complemento" placeholder="Apto 42" {...register('complemento')} />
            </Field>

            <Field>
              <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
              <Input id="bairro" placeholder="Centro" {...register('bairro')} />
              {errors.bairro && <FieldError>{errors.bairro.message}</FieldError>}
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field className="col-span-1">
                <FieldLabel htmlFor="cep">CEP</FieldLabel>
                <Input id="cep" placeholder="12345678" maxLength={8} {...register('cep')} />
                {errors.cep && <FieldError>{errors.cep.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
                <Input id="cidade" placeholder="São Paulo" {...register('cidade')} />
                {errors.cidade && <FieldError>{errors.cidade.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="uf">UF</FieldLabel>
                <Input id="uf" placeholder="SP" maxLength={2} {...register('uf')} />
                {errors.uf && <FieldError>{errors.uf.message}</FieldError>}
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
              {isLoading ? <Spinner className="size-4" /> : isEditing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
