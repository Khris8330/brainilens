import { cn } from '@/utils'

export interface BarChartData {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarChartData[]
  /** Cap for bar height. Defaults to max data value (min 1). Use 100 for score %. */
  maxValue?: number
  height?: number
  className?: string
  showValues?: boolean
  /** Append % to value labels (default true when maxValue is 100). */
  valueSuffix?: string
  /** Default bar color when item.color is omitted. */
  color?: string
  /** Draw a line connecting bar tops (default: true when 2+ points). */
  showTrend?: boolean
  /** Trend line / dot color (defaults to bar color). */
  trendColor?: string
}

export function BarChart({
  data,
  maxValue,
  height = 200,
  className,
  showValues = true,
  valueSuffix,
  color = '#2563eb',
  showTrend,
  trendColor,
}: BarChartProps) {
  if (!data.length) return null

  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1)
  const suffix = valueSuffix ?? (maxValue === 100 ? '%' : '')
  const withTrend = showTrend ?? data.length >= 2
  const lineColor = trendColor ?? color

  // SVG coords: x centered on each bar column; y from top of plot area
  const plotPoints = data.map((item, i) => {
    const x = ((i + 0.5) / data.length) * 100
    const ratio = Math.max(0, Math.min(1, item.value / max))
    // y: 0 at top of plot, 100 at bottom — invert so high scores sit high
    const y = 100 - ratio * 100
    return { x, y, value: item.value, label: item.label }
  })

  const pathD = plotPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-col" style={{ height }} role="img" aria-label="Bar chart with trend">
        {/* Value labels */}
        {showValues && (
          <div className="mb-1 flex shrink-0 justify-between gap-1">
            {data.map((item) => (
              <span
                key={`v-${item.label}`}
                className="min-w-0 flex-1 truncate text-center text-[11px] font-semibold tabular-nums text-text"
              >
                {Number.isInteger(item.value) ? item.value : item.value.toFixed(1)}
                {suffix}
              </span>
            ))}
          </div>
        )}

        {/* Plot: bars + trend overlay */}
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0 flex items-end justify-between gap-1.5 sm:gap-2">
            {data.map((item) => {
              const pct = Math.max(0, Math.min(100, (item.value / max) * 100))
              const barColor = item.color ?? color
              return (
                <div
                  key={item.label}
                  className="relative flex h-full min-w-0 flex-1 items-end justify-center"
                >
                  <div className="absolute inset-x-1 bottom-0 top-0 rounded-t-md bg-surface-muted/50 sm:inset-x-2" />
                  <div
                    className="relative z-[1] w-[70%] max-w-12 rounded-t-md opacity-90 transition-all duration-500 ease-out sm:w-[60%]"
                    style={{
                      height: `${Math.max(pct, item.value > 0 ? 4 : 0)}%`,
                      backgroundColor: barColor,
                      minHeight: item.value > 0 ? 6 : 0,
                    }}
                    title={`${item.label}: ${item.value}${suffix}`}
                  />
                </div>
              )
            })}
          </div>

          {withTrend && (
            <svg
              className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d={pathD}
                fill="none"
                stroke={lineColor}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.95}
              />
              {plotPoints.map((p) => (
                <circle
                  key={`dot-${p.label}`}
                  cx={p.x}
                  cy={p.y}
                  r="1.6"
                  fill="#fff"
                  stroke={lineColor}
                  strokeWidth="1.25"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          )}
        </div>

        {/* Category labels */}
        <div className="mt-2 flex shrink-0 justify-between gap-1">
          {data.map((item) => (
            <span
              key={`l-${item.label}`}
              className="min-w-0 flex-1 truncate text-center text-[10px] leading-tight text-text-muted sm:text-xs"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
