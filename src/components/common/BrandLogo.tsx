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

/** Primary mark: navy rounded square with amber lightning bolt */
export function BrandMark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="currentColor" className="text-primary" />
      {/* Stylized B */
      }
      <path
        d="M15 11h12c4.6 0 7.8 2.8 7.8 6.8 0 2.5-1.3 4.5-3.4 5.6 2.6 1.1 4.2 3.3 4.2 6.2 0 4.4-3.4 7.4-8.6 7.4H15V11zm6.2 4.1v5.5H26c2.1 0 3.4-1.1 3.4-2.8 0-1.7-1.3-2.7-3.4-2.7h-4.8zm0 9.4v6.1H27c2.4 0 3.8-1.2 3.8-3.1 0-1.8-1.4-3-3.8-3h-5.8z"
        fill="currentColor"
        className="text-primary"
      />
      {/* Amber bolt */
      }
      <path
        d="M23.2 14 17 27h4.5l-1.8 9 12-15.2h-5.1L29.2 14H23.2z"
        fill="currentColor"
        className="text-accent"
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
      <span className="relative inline-flex shrink-0">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(markSize[size], 'shrink-0')}
          aria-hidden="true"
        >
          <rect width="48" height="48" rx="12" fill="#0B2140" />
          <path
            d="M22.8 13.5 16.2 27.5h4.6l-1.9 9.5 12.4-15.8h-5.2l2.6-7.7h-5.9z"
            fill="#E8A317"
          />
        </svg>
      </span>
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
