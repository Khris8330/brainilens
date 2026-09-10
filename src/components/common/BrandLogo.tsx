import { Link } from 'react-router-dom'
import { cn } from '@/utils'
import { MARK_PATH } from './markPath'

export interface BrandLogoProps {
  /** Show the brainilens wordmark next to the icon */
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

/** Brand colors from the approved mark */
const NAVY = '#14274E'
const GOLD = '#DC9F42'

/**
 * Parent + child embrace mark — inline SVG from the approved logo.
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
      viewBox="0 0 100 157.42"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
      fill="none"
    >
      <path d={MARK_PATH} fill={NAVY} />
      <circle cx="34.65" cy="16.38" r="11.31" fill={GOLD} />
      <circle cx="51.00" cy="66.16" r="11.33" fill={GOLD} />
    </svg>
  )
}

function Wordmark({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'font-extrabold tracking-tight leading-none lowercase',
        wordSize[size],
      )}
    >
      <span style={{ color: GOLD }}>b</span>
      <span style={{ color: NAVY }}>rainilens</span>
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
