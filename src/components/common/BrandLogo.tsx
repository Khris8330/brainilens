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
 * Primary mark matching the approved logo:
 * solid navy block letter B with amber lightning bolt.
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
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
    >
      {/* Solid navy B (block letterform, matches approved mark) */
      }
      <path
        d="M8 6c0-1.1.9-2 2-2h15.5c6.9 0 12 4.6 12 11 0 3.6-1.7 6.6-4.5 8.5 3.6 1.7 5.9 5.3 5.9 9.7 0 6.9-5.5 11.8-13.6 11.8H10c-1.1 0-2-.9-2-2V6z"
        fill="#0B2140"
      />
      {/* Counter cutouts so the B reads clearly at small sizes */
      }
      <path
        d="M18 12.5h7.2c3.1 0 5 1.7 5 4.3s-1.9 4.3-5 4.3H18v-8.6z"
        fill="#ffffff"
      />
      <path
        d="M18 26h8.2c3.5 0 5.6 1.9 5.6 4.8S29.7 35.6 26.2 35.6H18V26z"
        fill="#ffffff"
      />
      {/* Amber bolt */
      }
      <path
        d="M24.5 10.5 15.5 26h6.2l-2.4 13 15.2-19.5h-6.4l3.4-9h-6.5z"
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
