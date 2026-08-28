import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Download, Clock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, EmptyState, Select } from '@/components/ui'
import { BarChart, LineChart, DonutChart } from '@/components/charts'
import { useAuth } from '@/contexts/AuthContext'
import { getChildReportSummary, getParentChildren, type ChildReportSummary } from '@/lib/learning-data'

const emptyReport: ChildReportSummary = {
  assignmentCounts: { completed: 0, inProgress: 0, pending: 0 },
  averageScore: 0,
  subjectPerformance: [],
  weeklyActivity: [],
  monthlyTrend: [],
  recentActivity: [],
}

function buildRecommendations(report: ChildReportSummary, childName: string): string[] {
  const tips: string[] = []
  const name = childName || 'Your child'
  const subjects = [...(report.subjectPerformance ?? [])].sort(
    (a, b) => (a.value ?? 0) - (b.value ?? 0),
  )
  const weakest = subjects[0]
  const strongest = subjects[subjects.length - 1]
  const pending = report.assignmentCounts.pending + report.assignmentCounts.inProgress

  if (report.averageScore > 0 && report.averageScore < 60) {
    tips.push(
      `${name}'s average score is ${report.averageScore}%. Focus on shorter daily practice sessions and review missed questions together.`,
    )
  } else if (report.averageScore >= 85) {
    tips.push(
      `Strong overall score (${report.averageScore}%). Keep momentum with slightly harder topics in Weekly Learning.`,
    )
  } else if (report.averageScore > 0) {
    tips.push(
      `Solid progress at ${report.averageScore}% average. A few targeted review sessions can push scores higher.`,
    )
  }

  if (weakest && typeof weakest.value === 'number' && weakest.label) {
    tips.push(
      `${weakest.label} is currently the weakest subject (${weakest.value}%). Add a Weekly Learning focus area there this week.`,
    )
  }

  if (
    strongest &&
    weakest &&
    strongest.label !== weakest.label &&
    typeof strongest.value === 'number'
  ) {
    tips.push(
      `${strongest.label} looks strong (${strongest.value}%). Use that confidence to coach peers or explore a related challenge topic.`,
    )
  }

  if (pending > 0) {
    tips.push(
      `There ${pending === 1 ? 'is' : 'are'} ${pending} assignment${pending === 1 ? '' : 's'} still open. Clearing them soon will keep the completion chart healthy.`,
    )
  }

  if (report.assignmentCounts.completed === 0) {
    tips.push(
      'No completed assignments yet. Generate a Weekly Learning topic and have the student finish the lesson plus assessment to unlock richer insights.',
    )
  }

  if (tips.length === 0) {
    tips.push(
      'Keep assigning Weekly Learning topics. Recommendations improve as more assessments are completed.',
    )
  }

  return tips.slice(0, 4)
}

export function ReportsPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [selected, setSelected] = useState('')
  const [report, setReport] = useState(emptyReport)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return
    void getParentChildren(user.id).then(({ data, error: childError }) => {
      if (childError) {
        setError('Children could not be loaded.')
        return
      }
      const next = (data ?? []).map((child) => ({ id: child.id, name: child.full_name }))
      setChildren(next)
      setSelected(next[0]?.id ?? '')
    })
  }, [user?.id])

  useEffect(() => {
    if (!selected) return
    void getChildReportSummary(selected).then(({ data, error: reportError }) => {
      if (reportError) setError('Report data could not be loaded.')
      setReport(data ?? emptyReport)
    })
  }, [selected])

  const selectedName = children.find((c) => c.id === selected)?.name ?? 'Your child'
  const recommendations = useMemo(
    () => buildRecommendations(report, selectedName),
    [report, selectedName],
  )

  const counts = report.assignmentCounts

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-text">Reports</h1>
          <p className="mt-1 text-sm text-text-muted">Live progress reports from completed learning.</p>
        </div>
        <Button onClick={() => window.print()}>
          <Download className="size-4" aria-hidden="true" />
          Download report
        </Button>
      </div>

      {children.length > 0 && (
        <Select
          aria-label="Select child"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          options={children.map((child) => ({ value: child.id, label: child.name }))}
        />
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {children.length === 0 ? (
        <EmptyState title="No child profiles" description="Create a child profile before viewing reports." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryStat icon={Clock} label="Average score" value={`${report.averageScore}%`} />
            <SummaryStat
              icon={CheckCircle2}
              label="Assignments completed"
              value={String(counts.completed)}
            />
            <SummaryStat
              icon={TrendingUp}
              label="Assignments pending"
              value={String(counts.pending + counts.inProgress)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Monthly performance">
              {report.monthlyTrend.length ? (
                <LineChart data={report.monthlyTrend} color="#2563eb" />
              ) : (
                <EmptyState
                  title="No monthly performance yet"
                  description="Monthly performance appears after assessments are completed."
                />
              )}
            </ChartCard>
            <ChartCard title="Weekly performance">
              {report.weeklyActivity.length ? (
                <LineChart data={report.weeklyActivity} color="#14b8a6" />
              ) : (
                <EmptyState
                  title="No weekly activity yet"
                  description="Weekly activity appears after learning activity is recorded."
                />
              )}
            </ChartCard>
            <ChartCard title="Subject performance">
              <BarChart data={report.subjectPerformance} />
            </ChartCard>
            <ChartCard title="Assignment completion">
              <DonutChart
                data={[
                  { label: 'Completed', value: counts.completed, color: '#14b8a6' },
                  { label: 'In progress', value: counts.inProgress, color: '#f59e0b' },
                  { label: 'Pending', value: counts.pending, color: '#e2e8f0' },
                ]}
              />
            </ChartCard>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Sparkles className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>AI recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recommendations.map((tip) => (
                  <li
                    key={tip}
                    className="rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 text-text"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-text-muted">
                Tips are generated from this child's live scores and completion data.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
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
        <Icon className="size-5 text-primary" aria-hidden="true" />
        <div>
          <p className="text-xl font-semibold text-text">{value}</p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
