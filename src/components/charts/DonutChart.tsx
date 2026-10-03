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
  /**
   * Value shown in the center ring. Defaults to the first segment's share of the total
   * (useful for "completion" style charts). Pass explicitly when needed.
   */
  centerValue?: number
  centerLabel?: string
  /**
   * How to format legend values.
   * - 'percent' — show each segment as % of total (default)
   * - 'count' — show raw values
   * - 'both' — "count (pct%)"
   */
  legendFormat?: 'percent' | 'count' | 'both'
}

export function DonutChart({
  data,
  size = 140,
  className,
  centerValue,
  centerLabel = 'Overall',
  legendFormat = 'percent',
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offsets = data.reduce<number[]>((values, segment) => {
    const previous = values.at(-1) ?? 0
    const pct = total > 0 ? segment.value / total : 0
    return [...values, previous + pct * circumference]
  }, [])

  const completedShare =
    total > 0 && data[0] ? Math.round((data[0].value / total) * 100) : 0
  const displayCenter =
    centerValue !== undefined ? Math.round(centerValue) : completedShare

  const formatLegendValue = (segment: DonutSegment) => {
    const pct = total > 0 ? Math.round((segment.value / total) * 100) : 0
    if (legendFormat === 'count') return String(segment.value)
    if (legendFormat === 'both') return `${segment.value} (${pct}%)`
    return `${pct}%`
  }

  return (
    <div className={cn('flex flex-col items-center gap-4 sm:flex-row sm:gap-6', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          {total === 0 ? (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
            />
          ) : (
            data.map((segment, index) => {
              const pct = segment.value / total
              const dash = pct * circumference
              const currentOffset = index === 0 ? 0 : offsets[index - 1]
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
                  strokeDashoffset={-(currentOffset ?? 0)}
                  className="transition-all duration-500"
                />
              )
            })
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text">{displayCenter}%</span>
          <span className="text-xs text-text-muted">{centerLabel}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {data.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2 text-sm">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-text-muted">{segment.label}</span>
            <span className="ml-auto font-medium text-text">{formatLegendValue(segment)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
