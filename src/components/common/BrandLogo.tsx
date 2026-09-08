import { Link } from 'react-router-dom'
import { cn } from '@/utils'

export interface BrandLogoProps {
  /** Show the BrainiLens wordmark next to the icon */
  showWordmark?: boolean
  /** Layout: horizontal (default) or stacked icon-over-wordmark */
  variant?: 'horizontal' | 'stacked'
  to?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const markSize = {
  sm: 'size-7',
  md: 'size-8',
  lg: 'size-12',
} as const

const wordSize = {
  sm: 'text-[13px]',
  md: 'text-sm',
  lg: 'text-xl',
} as const

/** Brand colors from the approved mark */
const NAVY = '#0B2140'
const AMBER = '#E8A317'

/**
 * Parent (navy) + child (amber) mark.
 * Geometric figures: head circles + rounded bodies.
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
      viewBox="0 0 96 110"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
      fill="none"
    >
      {/* Adult / parent — navy */}
      <circle cx="36" cy="24" r="20" fill={NAVY} />
      <rect x="14" y="40" width="44" height="64" rx="22" fill={NAVY} />

      {/* Child — amber (overlaps parent on the right) */}
      <circle cx="66" cy="38" r="14" fill={AMBER} />
      <rect x="52" y="48" width="28" height="48" rx="14" fill={AMBER} />
    </svg>
  )
}

export function BrandLogo({
  showWordmark = true,
  variant = 'horizontal',
  to = '/',
  size = 'md',
  className,
}: BrandLogoProps) {
  const wordmark = showWordmark ? (
    <span className={cn('font-semibold tracking-tight leading-none', wordSize[size])}>
      <span className="text-accent">B</span>
      <span className="text-primary">rainiLens</span>
    </span>
  ) : null

  const content =
    variant === 'stacked' ? (
      <>
        <BrandMark size={size} />
        {wordmark}
      </>
    ) : (
      <>
        <BrandMark size={size} />
        {wordmark}
      </>
    )

  const layoutClass =
    variant === 'stacked'
      ? 'inline-flex flex-col items-center gap-2'
      : 'inline-flex items-center gap-1.5'

  if (to === null) {
    return <span className={cn(layoutClass, className)}>{content}</span>
  }

  return (
    <Link to={to} className={cn(layoutClass, className)}>
      {content}
    </Link>
  )
}
