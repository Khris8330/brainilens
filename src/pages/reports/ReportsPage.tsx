import { Download, Sparkles, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from '@/components/ui'
import { BarChart, LineChart, DonutChart } from '@/components/charts'
import { useAuth } from '@/contexts/AuthContext'
import {
  subjectPerformanceChart,
  weeklyTrend,
  monthlyTrend,
  assignmentCompletionDonut,
  aiRecommendations,
  getMockStudents,
  initialAssignments,
} from '@/data/mockData'

export function ReportsPage() {
  const { user } = useAuth()
  const child = getMockStudents().find((student) => student.parentId === user?.id)
  const totalHours = child ? (child.progress / 10) * 4 : 0
  const completedCount = initialAssignments.filter(
    (a) => a.status === 'completed',
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-text">Reports</h1>
          <p className="mt-1 text-sm text-text-muted">
            A full picture of {child?.firstName ?? 'your child'}&apos;s growth
            this month.
          </p>
        </div>
        <Button onClick={() => window.print()}>
          <Download className="size-4" aria-hidden="true" />
          Download report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryStat
          icon={Clock}
          label="Learning hours this month"
          value={`${totalHours.toFixed(1)}h`}
        />
        <SummaryStat
          icon={CheckCircle2}
          label="Assignments completed"
          value={String(completedCount)}
        />
        <SummaryStat
          icon={TrendingUp}
          label="Growth vs. last month"
          value="+8 pts"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly performance</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={monthlyTrend} color="#2563eb" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly performance</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={weeklyTrend} color="#14b8a6" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject performance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={subjectPerformanceChart} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignment completion</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={assignmentCompletionDonut} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Sparkles className="size-4 text-secondary" aria-hidden="true" />
          <CardTitle>AI recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiRecommendations.map((rec, i) => (
            <p
              key={i}
              className="rounded-lg bg-secondary-light p-3 text-sm text-text"
            >
              {rec}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xl font-semibold text-text">{value}</p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
