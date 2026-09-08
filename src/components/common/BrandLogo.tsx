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
  sm: 'h-7 w-auto',
  md: 'h-8 w-auto',
  lg: 'h-12 w-auto',
} as const

const wordSize = {
  sm: 'text-[13px]',
  md: 'text-sm',
  lg: 'text-xl',
} as const

/** Exact colors from approved SVG mark */
const NAVY = '#14274E'
const AMBER = '#E3A13D'

/**
 * Parent (navy) + child (amber) mark.
 * Geometry taken directly from brainilens-logo-icon-only.svg
 * (viewBox cropped to the figures).
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
      viewBox="58 30 86 142"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
      fill="none"
    >
      {/* Parent — navy body then head (same order as source SVG) */}
      <rect x="60" y="80" width="55" height="88" rx="27" fill={NAVY} />
      <circle cx="87" cy="55" r="23" fill={NAVY} />

      {/* Child — amber body then head */}
      <rect x="105" y="98" width="36" height="70" rx="18" fill={AMBER} />
      <circle cx="123" cy="78" r="15" fill={AMBER} />
    </svg>
  )
}

function Wordmark({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'font-extrabold tracking-tight leading-none',
        wordSize[size],
      )}
    >
      <span style={{ color: AMBER }}>B</span>
      <span style={{ color: NAVY }}>rainiLens</span>
    </span>
  )
}

export function BrandLogo({
  showWordmark = true,
  variant = 'horizontal',
  to = '/',
  size = 'md',
  className,
}: BrandLogoProps) {
  const content = (
    <>
      <BrandMark size={size} />
      {showWordmark ? <Wordmark size={size} /> : null}
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
