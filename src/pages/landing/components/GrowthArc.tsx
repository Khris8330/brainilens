import { cn } from '@/utils'

/**
 * Signature motif: a gently rising arc with week markers.
 * Echoes the product's core idea — visible, steady weekly growth —
 * and reappears (in varying scale/opacity) across the page instead
 * of a generic gradient blob or dot-grid.
 */
export function GrowthArc({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 160"
      fill="none"
      className={cn('pointer-events-none', className)}
      aria-hidden="true"
    >
      <path
        d="M4 140C90 140 110 40 200 40C260 40 260 90 320 90C355 90 370 60 396 20"
        stroke="url(#growth-arc-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 10"
      />
      <path
        d="M4 140C90 140 110 40 200 40C260 40 260 90 320 90C355 90 370 60 396 20"
        stroke="url(#growth-arc-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {[
        [4, 140],
        [110, 78],
        [200, 40],
        [290, 78],
        [396, 20],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={i === 4 ? 6 : 4}
          fill={i === 4 ? '#f59e0b' : '#2563eb'}
          opacity={i === 4 ? 1 : 0.6}
        />
      ))}
      <defs>
        <linearGradient id="growth-arc-gradient" x1="0" y1="0" x2="400" y2="0">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="55%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  )
}
