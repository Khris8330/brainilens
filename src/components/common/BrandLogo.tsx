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
  md: 'size-9',
  lg: 'size-11',
} as const

const wordSize = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-lg',
} as const

/** Solid navy B with amber lightning bolt — primary brand mark */
export function BrandMark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
    >
      <path
        d="M12 8c0-2.2 1.8-4 4-4h28c10.5 0 18 7.2 18 17 0 5.8-2.8 10.6-7.4 13.6 6.2 2.8 10.2 9 10.2 16.2 0 11-8.4 18.2-20.6 18.2H16c-2.2 0-4-1.8-4-4V8z"
        fill="#0B2140"
      />
      <path
        d="M28 20h12c4.4 0 7 2.4 7 6.2S44.4 32.4 40 32.4H28V20z"
        fill="#ffffff"
      />
      <path
        d="M28 42h14c5 0 8 2.8 8 7s-3 7-8 7H28V42z"
        fill="#ffffff"
      />
      <path
        d="M38 16 24 42h10l-4 22 28-34H44l8-14H38z"
        fill="#E8A317"
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
        <span className={cn('font-semibold tracking-tight', wordSize[size])}>
          <span className="text-accent">B</span>
          <span className="text-primary">rainiLens</span>
        </span>
      )}
    </>
  )

  if (to === null) {
    return (
      <span className={cn('inline-flex items-center gap-2.5', className)}>{content}</span>
    )
  }

  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)}>
      {content}
    </Link>
  )
}
