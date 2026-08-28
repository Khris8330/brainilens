import { Link } from 'react-router-dom'
import { cn } from '@/utils'

export interface BrandLogoProps {
  /** Show wordmark next to the mark */
  showWordmark?: boolean
  /** Link target; set null to render without a link */
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

/** Primary brand mark: navy B with amber lightning bolt */
export function BrandMark({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#0B2140" />
      <path
        d="M12 8h11.2c5.4 0 9.3 3.2 9.3 8.1 0 3.4-1.9 5.9-4.8 7.1L32 32h-6.2l-3.7-7.8H18V32h-6V8zm6 4.1v8.1h4.6c2.6 0 4.1-1.3 4.1-3.9s-1.5-4.2-4.1-4.2H18z"
        fill="#0B2140"
      />
      {/* Simplified B silhouette cut by bolt — solid B shape with bolt overlay */
      }
      <path
        d="M13 9h10.5c4.6 0 7.8 2.6 7.8 6.6 0 2.6-1.4 4.7-3.7 5.7L31 31h-5.2l-3.2-6.6H18.5V31H13V9zm5.5 3.6v6.6h3.8c2.2 0 3.5-1.1 3.5-3.3s-1.3-3.3-3.5-3.3h-3.8z"
        fill="#0B2140"
      />
      {/* Cleaner geometric B + bolt matching the approved mark */
      }
      <path
        d="M11 8c0-1.1.9-2 2-2h10.2c5.1 0 8.8 3.1 8.8 7.5 0 2.9-1.5 5.2-4 6.5 2.9 1.1 4.7 3.6 4.7 6.7 0 4.7-3.7 7.9-9.2 7.9H13c-1.1 0-2-.9-2-2V8z"
        fill="#0B2140"
      />
      <path
        d="M14 9.5h9c3.9 0 6.5 2.2 6.5 5.4 0 2.2-1.2 3.9-3.2 4.8l4.4 7.8H25l-3.6-6.6H18.5v6.6H14V9.5zm4.5 3.2v5.2H22c1.9 0 3-1 3-2.6s-1.1-2.6-3-2.6h-3.5z"
        fill="#0B2140"
      />
      {/* Final simple mark: rounded square already drawn; bolt on navy B */
      }
      <path
        d="M12.5 10.5h9.2c3.2 0 5.3 1.7 5.3 4.3 0 1.7-.9 3-2.4 3.7l3.6 6.5h-3.9l-3.1-5.6h-3.2v5.6h-5.5V10.5zm5.5 2.6v4.1h2.9c1.5 0 2.4-.7 2.4-1.9s-.9-2.2-2.4-2.2H18z"
        fill="#0B2140"
      />
      <path
        d="M18.2 12.2 14.5 21h3.2l-1.1 6.3 8.4-10.6h-3.6l2.2-4.5h-5.4z"
        fill="#E8A317"
      />
    </svg>
  )
}

/**
 * Cleaner SVG: solid navy rounded-square B with amber bolt cut through the letter.
 * Uses a single cohesive path composition.
 */
export function BrandMarkClean({
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
      <rect width="48" height="48" rx="12" fill="#0B2140" />
      {/* Letter B */
      }
      <path
        d="M15 12h11.5c4.8 0 8 2.9 8 7 0 2.6-1.3 4.7-3.5 5.9 2.6 1.1 4.2 3.4 4.2 6.3 0 4.5-3.5 7.5-8.8 7.5H15V12zm6.5 4.2v5.8H25c2.2 0 3.5-1.1 3.5-2.9S27.2 16.2 25 16.2h-3.5zm0 9.8v6.2H26c2.5 0 4-1.3 4-3.2s-1.5-3-4-3h-4.5z"
        fill="#0B2140"
      />
      {/* Amber lightning over B */
      }
      <path
        d="M22.5 14.5 17 26.5h4.2l-1.6 8.5 11.2-14.2h-4.8l2.9-6.3h-6.4z"
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
      <BrandMarkClean size={size} />
      {showWordmark && (
        <span className={cn('font-semibold tracking-tight text-text', wordSize[size])}>
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
