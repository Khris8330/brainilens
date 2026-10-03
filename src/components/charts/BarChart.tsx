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
}

export function BarChart({
  data,
  maxValue,
  height = 180,
  className,
  showValues = true,
  valueSuffix,
  color = '#2563eb',
}: BarChartProps) {
  if (!data.length) return null

  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1)
  const suffix = valueSuffix ?? (maxValue === 100 ? '%' : '')

  return (
    <div className={cn('w-full', className)}>
      <div
        className="flex items-end justify-between gap-1.5 sm:gap-2"
        style={{ height }}
        role="img"
        aria-label="Bar chart"
      >
        {data.map((item) => {
          const pct = Math.max(0, Math.min(100, (item.value / max) * 100))
          const barColor = item.color ?? color
          return (
            <div
              key={item.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            >
              {showValues && (
                <span className="max-w-full truncate text-[11px] font-semibold tabular-nums text-text">
                  {Number.isInteger(item.value) ? item.value : item.value.toFixed(1)}
                  {suffix}
                </span>
              )}
              <div className="relative flex w-full flex-1 items-end justify-center">
                {/* Track so empty/low values stay readable */}
                <div className="absolute inset-x-1 bottom-0 top-0 rounded-t-md bg-surface-muted/60 sm:inset-x-2" />
                <div
                  className="relative z-[1] w-[70%] max-w-12 rounded-t-md transition-all duration-500 ease-out sm:w-[60%]"
                  style={{
                    height: `${Math.max(pct, item.value > 0 ? 4 : 0)}%`,
                    backgroundColor: barColor,
                    minHeight: item.value > 0 ? 6 : 0,
                  }}
                  title={`${item.label}: ${item.value}${suffix}`}
                />
              </div>
              <span className="w-full truncate text-center text-[10px] leading-tight text-text-muted sm:text-xs">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
