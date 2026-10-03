import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Download, Clock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, EmptyState, Select } from '@/components/ui'
import { BarChart, DonutChart } from '@/components/charts'
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
  const avg = report.averageScore ?? 0

  if (avg >= 80) {
    tips.push(
      `Strong overall score (${avg}%). Keep momentum with slightly harder topics in Weekly Learning.`,
    )
  } else if (avg >= 60) {
    tips.push(
      `${name}'s overall score is ${avg}%. A short daily practice block can push this higher.`,
    )
  } else if (avg > 0) {
    tips.push(
      `Overall score is ${avg}%. Focus on fewer subjects this week and celebrate small wins.`,
    )
  }

  if (weakest && weakest.value < 75) {
    tips.push(
      `${weakest.label} is currently the weakest subject (${weakest.value}%). Add a Weekly Learning focus area there this week.`,
    )
  }

  if (strongest && strongest.value >= 90 && strongest.label !== weakest?.label) {
    tips.push(
      `${strongest.label} looks strong (${strongest.value}%). Use that confidence to coach peers or explore a related challenge topic.`,
    )
  }

  if (pending > 0) {
    tips.push(
      `There ${pending === 1 ? 'is' : 'are'} ${pending} assignment${pending === 1 ? '' : 's'} still open. Clearing them soon will keep the completion chart healthy.`,
    )
  }

  if (tips.length === 0) {
    tips.push('Complete a few assessments to unlock personalized recommendations.')
  }

  return tips.slice(0, 4)
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [report, setReport] = useState<ChildReportSummary>(emptyReport)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const kids = await getParentChildren(user.id)
        if (cancelled) return
        setChildren(kids.map((k) => ({ id: k.id, name: k.name })))
        const firstId = kids[0]?.id ?? ''
        setSelectedChildId((prev) => prev || firstId)
        const childId = selectedChildId || firstId
        if (childId) {
          const summary = await getChildReportSummary(childId)
          if (!cancelled) setReport(summary)
        }
      } catch {
        if (!cancelled) setError('Could not load report data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    let cancelled = false
    async function loadChild() {
      if (!selectedChildId) return
      setLoading(true)
      setError(null)
      try {
        const summary = await getChildReportSummary(selectedChildId)
        if (!cancelled) setReport(summary)
      } catch {
        if (!cancelled) setError('Could not load report data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void loadChild()
    return () => {
      cancelled = true
    }
  }, [selectedChildId])

  const counts = report.assignmentCounts
  const childName = children.find((c) => c.id === selectedChildId)?.name ?? ''
  const recommendations = useMemo(
    () => buildRecommendations(report, childName),
    [report, childName],
  )

  if (loading && children.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-text">Reports</h1>
        <p className="text-sm text-text-muted">Loading report…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Reports</h1>
          <p className="mt-1 text-sm text-text-muted">
            Scores, completion, and focus tips for each child.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {children.length > 0 && (
            <Select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              aria-label="Select child"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
          <Button variant="outline" type="button" disabled>
            <Download className="size-4" aria-hidden="true" />
            Export
          </Button>
        </div>
      </div>

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
                <BarChart
                  data={report.monthlyTrend}
                  maxValue={100}
                  color="#2563eb"
                  height={200}
                />
              ) : (
                <EmptyState
                  title="No monthly performance yet"
                  description="Monthly performance appears after assessments are completed."
                />
              )}
            </ChartCard>
            <ChartCard title="Weekly performance">
              {report.weeklyActivity.length ? (
                <BarChart
                  data={report.weeklyActivity}
                  maxValue={100}
                  color="#14b8a6"
                  height={200}
                />
              ) : (
                <EmptyState
                  title="No weekly activity yet"
                  description="Weekly activity appears after learning activity is recorded."
                />
              )}
            </ChartCard>
            <ChartCard title="Subject performance">
              <BarChart
                data={report.subjectPerformance}
                maxValue={100}
                color="#6366f1"
                height={200}
              />
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
