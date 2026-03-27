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
import { ESPECIALIDADES, type Medico, type MedicoPayload, type MedicoUpdatePayload, type Especialidade } from '@/lib/types'

const medicoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  crm: z.string().min(1, 'CRM é obrigatório'),
  especialidade: z.string().min(1, 'Especialidade é obrigatória'),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  uf: z.string().min(1, 'UF é obrigatória').max(2, 'UF deve ter 2 caracteres'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
})

type MedicoFormData = z.infer<typeof medicoSchema>

interface MedicoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medico?: Medico | null
  onSubmit: (data: MedicoPayload) => Promise<void>
  isLoading?: boolean
}

export function MedicoForm({
  open,
  onOpenChange,
  medico,
  onSubmit,
  isLoading = false,
}: MedicoFormProps) {
  const isEditing = !!medico

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MedicoFormData>({
    resolver: zodResolver(medicoSchema),
    defaultValues: {
      nome: medico?.nome || '',
      email: medico?.email || '',
      telefone: medico?.telefone || '',
      crm: medico?.crm || '',
      especialidade: medico?.especialidade || '',
    },
  })

  const especialidade = watch('especialidade')

  const handleFormSubmit = async (data: MedicoFormData) => {
    const { logradouro, bairro, cep, cidade, uf, numero, complemento, ...rest } = data
    await onSubmit({
      ...rest,
      especialidade: rest.especialidade as Especialidade,
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Médico' : 'Novo Médico'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do médico'
              : 'Preencha os dados para cadastrar um novo médico'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input
                id="nome"
                placeholder="Dr. João Silva"
                {...register('nome')}
              />
              {errors.nome && <FieldError>{errors.nome.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="joao@clinica.com"
                {...register('email')}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                {...register('telefone')}
              />
              {errors.telefone && (
                <FieldError>{errors.telefone.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="crm">CRM</FieldLabel>
              <Input id="crm" placeholder="123456" {...register('crm')} />
              {errors.crm && <FieldError>{errors.crm.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="especialidade">Especialidade</FieldLabel>
              <Select
                value={especialidade}
                onValueChange={(value) => setValue('especialidade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {ESPECIALIDADES.map((esp) => (
                    <SelectItem key={esp.value} value={esp.value}>
                      {esp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.especialidade && (
                <FieldError>{errors.especialidade.message}</FieldError>
              )}
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
