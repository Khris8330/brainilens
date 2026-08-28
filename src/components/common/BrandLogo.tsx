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

/**
 * Primary mark matching the approved logo:
 * solid navy letter B (rounded block style) with amber lightning bolt.
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
      {/* Rounded square container — matches productized mark */
      }
      <rect width="64" height="64" rx="14" fill="#0B2140" />
      {/* Bold capital B */
      }
      <path
        d="M18 14h18.5c6.4 0 11.2 3.6 11.2 9.2 0 3.4-1.7 6.1-4.6 7.6 3.5 1.4 5.7 4.5 5.7 8.4 0 6-4.7 10-11.8 10H18V14zm8.5 5.4v8.2h8.2c3 0 4.8-1.5 4.8-4.1 0-2.6-1.8-4.1-4.8-4.1h-8.2zm0 13.2v9.2h9.4c3.4 0 5.5-1.7 5.5-4.6 0-2.8-2.1-4.6-5.5-4.6h-9.4z"
        fill="#0B2140"
      />
      {/* Re-draw B in white then we use navy bg — actually B should be navy shape on transparent OR bolt on navy B.
          Approved mark: the whole glyph is a navy B; bolt is yellow on top.
          So: no container rect needed if B is the mark; OR container + bolt only if B fills it.
          Use filled B as the mark shape (no outer square), matching the uploaded logo closely. */
      }
    </svg>
  )
}

function MarkSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Solid navy B — block/rounded letterform */
      }
      <path
        d="M12 8c0-2.2 1.8-4 4-4h28c10.5 0 18 7.2 18 17 0 5.8-2.8 10.6-7.4 13.6 6.2 2.8 10.2 9 10.2 16.2 0 11-8.4 18.2-20.6 18.2H16c-2.2 0-4-1.8-4-4V8z"
        fill="#0B2140"
      />
      {/* Inner counters (cutouts) to form the letter B bowls */
      }
      <path
        d="M28 20h12c4.4 0 7 2.4 7 6.2S44.4 32.4 40 32.4H28V20z"
        fill="#ffffff"
      />
      <path
        d="M28 42h14c5 0 8 2.8 8 7s-3 7-8 7H28V42z"
        fill="#ffffff"
      />
      {/* Amber lightning bolt over the B */
      }
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
      <MarkSvg className={cn(markSize[size], 'shrink-0')} />
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

export { MarkSvg as BrandMark }
