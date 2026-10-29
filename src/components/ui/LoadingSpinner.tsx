import { cn } from '@/utils'
import type { Size } from '@/types'

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

/** Full-screen loading — cream mascot only (matches boot splash) */
export function LoadingOverlay({
  label = 'Loading',
}: {
  label?: string
}) {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-[#FBF8F1] px-6"
      role="status"
      aria-label={label}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/lens-mascot.png`}
        alt="BrainiLens"
        width={280}
        height={350}
        className="block w-[min(72vw,280px)] h-auto"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
