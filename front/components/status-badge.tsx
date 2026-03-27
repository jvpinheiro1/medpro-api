import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-sky-100 text-sky-800 border-sky-200',
  default: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {status}
    </Badge>
  )
}

// Helpers para status específicos
export function ConsultaStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; variant: StatusVariant }> = {
    ATIVA: { label: 'Ativa', variant: 'info' },
    FINALIZADA: { label: 'Finalizada', variant: 'success' },
    CANCELADA: { label: 'Cancelada', variant: 'error' },
  }

  const config = variants[status] || { label: status, variant: 'default' }
  return <StatusBadge status={config.label} variant={config.variant} />
}

export function AtivoStatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <StatusBadge
      status={ativo ? 'Ativo' : 'Inativo'}
      variant={ativo ? 'success' : 'error'}
    />
  )
}
