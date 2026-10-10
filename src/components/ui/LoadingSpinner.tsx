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

/** Full-screen loading that matches the boot splash design */
export function LoadingOverlay({
  label = 'Loading',
}: {
  label?: string
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FBF8F1] px-6">
      <img
        src="/brand/logo-icon.svg?v=embrace3"
        alt=""
        width={72}
        height={113}
        className="h-auto w-[72px]"
        draggable={false}
      />
      <p className="mt-3.5 text-2xl font-extrabold lowercase leading-tight tracking-tight">
        <span className="text-[#DC9F42]">b</span>
        <span className="text-[#14274E]">rainilens</span>
      </p>
      <p className="mt-2 text-sm font-medium text-gray-500">Learn · Explore · Grow</p>
      <div className="mt-7">
        <LoadingSpinner size="md" label={label} />
      </div>
    </div>
  )
}
