import { cn } from '@/utils'

export interface BarChartData {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarChartData[]
  maxValue?: number
  height?: number
  className?: string
  showValues?: boolean
}

export function BarChart({
  data,
  maxValue,
  height = 160,
  className,
  showValues = true,
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={cn('flex items-end justify-between gap-2', className)} style={{ height }}>
      {data.map((item) => {
        const pct = (item.value / max) * 100
        return (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            {showValues && (
              <span className="text-xs font-medium text-text-muted">{item.value}%</span>
            )}
            <div className="relative w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${pct}%`,
                  backgroundColor: item.color ?? '#2563eb',
                  minHeight: 4,
                }}
              />
            </div>
            <span className="text-xs text-text-muted text-center truncate w-full">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
