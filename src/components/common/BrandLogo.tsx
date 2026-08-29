import { Link } from 'react-router-dom'
import { cn } from '@/utils'

export interface BrandLogoProps {
  showWordmark?: boolean
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

/** Approved mark: solid navy B + amber bolt (inline SVG — always loads) */
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
      xmlns="http://www.w3.org/2000/svg"
      className={cn(markSize[size], 'shrink-0', className)}
      aria-hidden="true"
    >
      <path
        fill="#0B2140"
        d="M14 10c0-2.76 2.24-5 5-5h26c10.5 0 18 7 18 16.5 0 5.2-2.4 9.6-6.4 12.4 5.2 2.6 8.6 7.8 8.6 14.3 0 10.8-8.2 17.8-20.2 17.8H19c-2.76 0-5-2.24-5-5V10z"
      />
      <path fill="#ffffff" d="M30 20h12c4.2 0 6.8 2.3 6.8 5.8S46.2 31.6 42 31.6H30V20z" />
      <path fill="#ffffff" d="M30 37h13.5c4.7 0 7.6 2.7 7.6 6.6s-2.9 6.6-7.6 6.6H30V37z" />
      <path fill="#E8A317" d="M39 15 24 38h9.2l-3.4 21 21.2-27h-8.6L47 15H39z" />
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
