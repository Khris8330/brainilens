import { cn } from '@/utils'
import type { Size } from '@/types'

export interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: Size
  className?: string
}

const sizeStyles: Record<Size, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function Avatar({
  src,
  alt,
  name = '',
  size = 'md',
  className,
}: AvatarProps) {
  const initials = getInitials(name)

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? name}
        className={cn(
          'shrink-0 rounded-full object-cover ring-2 ring-surface',
          sizeStyles[size],
          className,
        )}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={alt ?? name}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full',
        'bg-primary-light font-semibold text-primary ring-2 ring-surface',
        sizeStyles[size],
        className,
      )}
    >
      {initials || '?'}
    </div>
  )
}
