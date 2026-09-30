import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Select,
} from '@/components/ui'
import { StudentCredentialsPanel } from '@/components/parent/StudentCredentialsPanel'
import { useAuth } from '@/contexts/AuthContext'
import {
  getChildReportSummary,
  getParentChildren,
  type ChildReportSummary,
} from '@/lib/learning-data'
import { createStudent, type CreatedStudentCredentials } from '@/lib/students'
import { routes } from '@/routes'

const emptyReport: ChildReportSummary = {
  assignmentCounts: { completed: 0, inProgress: 0, pending: 0 },
  averageScore: 0,
  subjectPerformance: [],
  weeklyActivity: [],
  monthlyTrend: [],
  recentActivity: [],
}

type ChildRow = { id: string; studentId: string; name: string; grade: string }

function plainLanguageStatus(averageScore: number, completed: number, pending: number) {
  if (completed === 0 && pending === 0) return { label: 'Getting started', tone: 'text-text-muted' }
  if (averageScore >= 80) return { label: 'On track', tone: 'text-success' }
  if (averageScore >= 60) return { label: 'Steady progress', tone: 'text-primary' }
  if (completed > 0) return { label: 'Needs attention', tone: 'text-error' }
  return { label: 'Waiting on first results', tone: 'text-text-muted' }
}

export function ParentDashboardPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<ChildRow[]>([])
  const [reports, setReports] = useState<Record<string, ChildReportSummary>>({})
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [fullName, setFullName] = useState('')
  const [grade, setGrade] = useState('4th Grade')
  const [creating, setCreating] = useState(false)
  const [credentials, setCredentials] = useState<CreatedStudentCredentials | null>(null)

  async function loadChildren() {
    if (!user?.id) return
    const { data, error: childError } = await getParentChildren(user.id)
    if (childError) {
      setError('Child profiles could not be loaded.')
      return
    }
    const next = (data ?? []).map((child) => ({
      id: child.id,
      studentId: child.student_id,
      name: child.full_name,
      grade: child.grade ?? 'Not assigned',
    }))
    setChildren(next)

    const entries = await Promise.all(
      next.map(async (child) => {
        const { data: report } = await getChildReportSummary(child.id)
        return [child.id, report ?? emptyReport] as const
      }),
    )
    setReports(Object.fromEntries(entries))
  }

  useEffect(() => {
    void loadChildren()
  }, [user?.id])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!fullName.trim()) return
    setCreating(true)
    setError('')
    const { data, error: createError } = await createStudent(fullName, grade)
    setCreating(false)
    if (createError || !data) {
      setError(createError ?? 'Could not create child profile.')
      return
    }
    setCredentials(data)
    setFullName('')
    setShowCreate(false)
    await loadChildren()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            A quick view of each child. Open Reports for deeper analysis.
          </p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)} leftIcon={<UserPlus className="size-4" />}>
          Add child
        </Button>
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {credentials && (
        <StudentCredentialsPanel
          credentials={credentials}
          onDismiss={() => setCredentials(null)}
        />
      )}

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create child profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => void handleCreate(e)}>
              <Input
                label="Child's full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
                required
              />
              <Select
                label="Grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                options={[
                  { value: '2nd Grade', label: '2nd Grade' },
                  { value: '3rd Grade', label: '3rd Grade' },
                  { value: '4th Grade', label: '4th Grade' },
                  { value: '5th Grade', label: '5th Grade' },
                  { value: '6th Grade', label: '6th Grade' },
                ]}
              />
              <div className="sm:col-span-2">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating…' : 'Create profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {children.length === 0 ? (
        <EmptyState
          title="No child profiles yet"
          description="Create a child profile to start tracking learning progress. You will receive a Student ID and one-time password."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => {
            const report = reports[child.id] ?? emptyReport
            const status = plainLanguageStatus(
              report.averageScore,
              report.assignmentCounts.completed,
              report.assignmentCounts.pending,
            )
            const trend =
              report.monthlyTrend.length >= 2
                ? report.monthlyTrend[report.monthlyTrend.length - 1].value -
                  report.monthlyTrend[report.monthlyTrend.length - 2].value
                : null

            return (
              <Card key={child.id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={child.name} />
                    <div className="min-w-0">
                      <p className="font-semibold text-text">{child.name}</p>
                      <p className="text-xs text-text-muted">
                        {child.grade} · {child.studentId}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-background p-4">
                    <p className="text-xs text-text-muted">Average score</p>
                    <p className="mt-1 text-3xl font-semibold text-text">{report.averageScore}%</p>
                    <p className={`mt-1 text-sm font-medium ${status.tone}`}>{status.label}</p>
                    {trend !== null && (
                      <p className="mt-1 text-xs text-text-muted">
                        {trend >= 0 ? 'Up' : 'Down'} {Math.abs(Math.round(trend))} pts vs prior month
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg border border-border p-3">
                      <CheckCircle2 className="size-4 text-secondary" />
                      <p className="mt-2 font-semibold text-text">
                        {report.assignmentCounts.completed}
                      </p>
                      <p className="text-xs text-text-muted">Completed</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <ClipboardList className="size-4 text-primary" />
                      <p className="mt-2 font-semibold text-text">
                        {report.assignmentCounts.pending +
                          report.assignmentCounts.inProgress}
                      </p>
                      <p className="text-xs text-text-muted">Open</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={routes.reports}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Full report <ArrowRight className="size-3.5" />
                    </Link>
                    <Link
                      to={`/settings/children/${child.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text"
                    >
                      Child settings
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-primary" />
            Quick links
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to={routes.weeklyLearning}>
            <Button variant="outline" size="sm">
              Weekly learning
            </Button>
          </Link>
          <Link to={routes.assignments}>
            <Button variant="outline" size="sm">
              Assignments
            </Button>
          </Link>
          <Link to={routes.reports}>
            <Button variant="outline" size="sm">
              Reports
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
