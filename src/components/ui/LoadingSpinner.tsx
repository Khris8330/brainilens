import { cn } from '@/utils'
import type { Size } from '@/types'
import { BrandLogo } from '@/components/common/BrandLogo'

export interface LoadingSpinnerProps {
  size?: Size
  label?: string
  className?: string
}

const sizeStyles: Record<Size, string> = {
  sm: 'size-4 border-2',
  md: 'size-8 border-[3px]',
  lg: 'size-12 border-4',
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading',
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-primary/20 border-t-primary',
          sizeStyles[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function LoadingOverlay({
  label = 'Loading',
}: {
  label?: string
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6">
      <BrandLogo to={null} size="lg" />
      <p className="text-sm font-medium tracking-wide text-text-muted">
        Learn · Explore · Grow
      </p>
      <LoadingSpinner size="md" label={label} />
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  )
}
