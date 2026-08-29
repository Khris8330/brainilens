import { Link } from 'react-router-dom'
import { cn } from '@/utils'

export interface BrandLogoProps {
  showWordmark?: boolean
  /** Link target; null renders without a link */
  to?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const markSize = {
  sm: 'size-7',
  md: 'size-8',
  lg: 'size-10',
} as const

const wordSize = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-lg',
} as const

/**
 * Approved primary mark: solid navy block letter B with amber lightning bolt.
 * Matches the designed logo (filled B glyph + bolt), not a plain square.
 */
export function BrandMark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
    >
      {/* Outer B body */
      }
      <path
        fill="#0B2140"
        d="M10 8c0-2.2 1.8-4 4-4h22c8.8 0 15 5.8 15 14 0 4.5-2.1 8.3-5.6 10.7 4.6 2.2 7.6 6.8 7.6 12.3 0 8.8-7 14-16.8 14H14c-2.2 0-4-1.8-4-4V8z"
      />
      {/* Upper bowl cutout */
      }
      <path
        fill="#ffffff"
        d="M24 16h10c3.6 0 5.8 2 5.8 5.1S37.6 26.2 34 26.2H24V16z"
      />
      {/* Lower bowl cutout */
      }
      <path
        fill="#ffffff"
        d="M24 32h11.5c4 0 6.5 2.3 6.5 5.8s-2.5 5.8-6.5 5.8H24V32z"
      />
      {/* Amber lightning bolt */
      }
      <path
        fill="#E8A317"
        d="M32 12 20 32h8.5l-3.2 18 19.5-25h-8.2L40 12H32z"
      />
    </svg>
  )
}

export function BrandLogo({
  showWordmark = true,
  to = '/',
  size = 'md',
  className,
}: BrandLogoProps) {
  const content = (
    <>
      <BrandMark size={size} />
      {showWordmark && (
        <span className={cn('font-semibold tracking-tight leading-none', wordSize[size])}>
          <span className="text-accent">B</span>
          <span className="text-primary">rainiLens</span>
        </span>
      )}
    </>
  )

  if (to === null) {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>{content}</span>
    )
  }

  return (
    <Link to={to} className={cn('inline-flex items-center gap-1.5', className)}>
      {content}
    </Link>
  )
}
