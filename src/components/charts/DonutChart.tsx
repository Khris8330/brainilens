import { cn } from '@/utils'

export interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutSegment[]
  size?: number
  className?: string
}

export function DonutChart({ data, size = 140, className }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className={cn('flex flex-col items-center gap-4 sm:flex-row sm:gap-6', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          {data.map((segment) => {
            const pct = segment.value / total
            const dash = pct * circumference
            const currentOffset = offset
            offset += dash
            return (
              <circle
                key={segment.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-currentOffset}
                className="transition-all duration-500"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text">{total}%</span>
          <span className="text-xs text-text-muted">Overall</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {data.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2 text-sm">
            <span
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-text-muted">{segment.label}</span>
            <span className="font-medium text-text ml-auto">{segment.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
