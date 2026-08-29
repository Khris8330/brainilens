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
  sm: 'text-[13px]',
  md: 'text-sm',
  lg: 'text-lg',
} as const

/**
 * Exact approved mark: solid navy block letter B with amber lightning bolt.
 * Single compound path (evenodd) so counters are transparent, not painted white.
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
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
    >
      {/* Solid B with transparent counters (matches approved logo silhouette) */
      }
      <path
        fill="#0B2140"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 6c0-1.66 1.34-3 3-3h18.5c7.4 0 12.5 4.55 12.5 11.2 0 3.7-1.7 6.75-4.55 8.7 3.85 1.85 6.3 5.55 6.3 10.15C44 42.9 38.1 48 29.2 48H11c-1.66 0-3-1.34-3-3V6zm11 8.5v8.2h8.4c2.85 0 4.55-1.55 4.55-4.1s-1.7-4.1-4.55-4.1H19zm0 13.1v9.4h9.5c3.2 0 5.15-1.8 5.15-4.7s-1.95-4.7-5.15-4.7H19z"
      />
      {/* Amber bolt — positioned like the approved mark */
      }
      <path
        fill="#E8A317"
        d="M27.2 11.2 16.5 28.8h7.1l-2.7 15.2 16.8-21.2h-7.1l2.9-11.6h-5.3z"
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
      <span className={cn('inline-flex items-center gap-1', className)}>{content}</span>
    )
  }

  return (
    <Link to={to} className={cn('inline-flex items-center gap-1', className)}>
      {content}
    </Link>
  )
}
