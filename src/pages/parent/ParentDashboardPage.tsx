import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  NotebookPen,
  ClipboardList,
  Bot,
  FileBarChart,
  Plus,
  Copy,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
  Button,
  Input,
  Modal,
} from '@/components/ui'
import { BarChart, LineChart } from '@/components/charts'
import { useAuth } from '@/contexts/AuthContext'
import { routes } from '@/routes'
import {
  mockChild,
  subjectPerformanceChart,
  weeklyTrend,
  recentActivity,
  aiRecommendations,
  initialAssignments,
  mockStudents,
} from '@/data/mockData'

const statusVariant: Record<string, 'warning' | 'primary' | 'success'> = {
  pending: 'warning',
  'in-progress': 'primary',
  completed: 'success',
}

export function ParentDashboardPage() {
  const { user } = useAuth()
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)
  const [childForm, setChildForm] = useState({ firstName: '', lastName: '', grade: '' })
  const [createdCredentials, setCreatedCredentials] = useState<{ studentId: string; pin: string } | null>(null)
  const [createdChildren, setCreatedChildren] = useState<typeof mockStudents>([])
  const children = [...mockStudents, ...createdChildren]
  const childrenNames = children.map((child) => child.firstName).join(' and ')
  const childrenVerb = children.length === 1 ? 'is' : 'are'
  const updateChildForm = (field: keyof typeof childForm, value: string) =>
    setChildForm((current) => ({ ...current, [field]: value }))
  const closeChildModal = () => {
    setIsAddChildOpen(false)
    setCreatedCredentials(null)
    setChildForm({ firstName: '', lastName: '', grade: '' })
  }
  const createChild = () => {
    if (!childForm.firstName.trim() || !childForm.lastName.trim() || !childForm.grade.trim()) return
    const nextNumber = 1001 + children.length
    const newChild = {
      id: `student-${nextNumber}`,
      studentId: `STU-${nextNumber}`,
      pin: String(1000 + Math.floor(Math.random() * 9000)),
      firstName: childForm.firstName.trim(),
      lastName: childForm.lastName.trim(),
      grade: Number(childForm.grade),
      parentId: user?.id ?? 'mock-user-1',
      streakDays: 0,
      progress: 0,
    }
    setCreatedChildren((current) => [...current, newChild])
    setCreatedCredentials({ studentId: newChild.studentId, pin: newChild.pin })
  }

  const completed = initialAssignments.filter(
    (a) => a.status === 'completed',
  ).length
  const pending = initialAssignments.filter(
    (a) => a.status !== 'completed',
  ).length
  const avgPerformance = Math.round(
    subjectPerformanceChart.reduce((sum, s) => sum + s.value, 0) /
      subjectPerformanceChart.length,
  )
  const upcoming = initialAssignments
    .filter((a) => a.status !== 'completed')
    .slice(0, 3)

  const quickActions = [
    { label: 'Log weekly learning', href: routes.weeklyLearning, icon: NotebookPen },
    { label: 'View assignments', href: routes.assignments, icon: ClipboardList },
    { label: 'Ask AI companion', href: routes.ai, icon: Bot },
    { label: 'Open reports', href: routes.reports, icon: FileBarChart },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">
          Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {childrenNames ? `Here’s how ${childrenNames} ${childrenVerb} doing this week.` : 'Add a child profile to start tracking learning progress.'}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>My Children</CardTitle>
            <p className="mt-1 text-sm text-text-muted">Manage profiles and share secure login details.</p>
          </div>
          <Button size="sm" onClick={() => setIsAddChildOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Add Child
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {children.map((child) => (
            <div key={child.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={`${child.firstName} ${child.lastName}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">{child.firstName} {child.lastName}</p>
                  <p className="text-xs text-text-muted">Grade {child.grade} · {child.studentId}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-text">{child.progress}%</p>
                <p className="text-xs text-text-muted">{child.streakDays}-day streak</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="grid gap-4 lg:col-span-1">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Avatar name={`${child.firstName} ${child.lastName}`} size="lg" />
                <h3 className="mt-3 text-base font-semibold text-text">
                  {child.firstName} {child.lastName}
                </h3>
                <p className="text-sm text-text-muted">Grade {child.grade}</p>
                <Badge variant="secondary" className="mt-3">
                  {child.streakDays}-day streak
                </Badge>
                <Link
                  to={`${routes.child}?studentId=${child.studentId}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View {child.firstName}&apos;s dashboard
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3">
          <StatCard
            icon={Clock}
            label="Weekly learning hours"
            value={`${mockChild.weeklyHoursCompleted}h`}
            sub={`of ${mockChild.weeklyHoursGoal}h goal`}
            accent="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Average performance"
            value={`${avgPerformance}%`}
            sub="across all subjects"
            accent="secondary"
          />
          <StatCard
            icon={CheckCircle2}
            label="Assignments completed"
            value={String(completed)}
            sub={`${pending} still pending`}
            accent="accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progress over time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={weeklyTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subject performance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={subjectPerformanceChart} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex gap-3 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-text">{item.description}</p>
                  <p className="text-xs text-text-muted">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Upcoming assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {a.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    Due{' '}
                    {new Date(a.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
              </div>
            ))}
            <Link
              to={routes.assignments}
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="flex items-center gap-2.5 rounded-lg border border-border p-3 text-sm font-medium text-text transition-colors hover:bg-background"
              >
                <action.icon
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isAddChildOpen}
        onClose={closeChildModal}
        title={createdCredentials ? 'Child profile created' : 'Add a child'}
        description={createdCredentials ? 'Give these credentials to your child so they can log in.' : 'Create a profile for your child to access the student portal.'}
      >
        {createdCredentials ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Credential label="Student ID" value={createdCredentials.studentId} />
              <Credential label="PIN" value={createdCredentials.pin} />
            </div>
            <Button onClick={closeChildModal}>Done</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First name" value={childForm.firstName} onChange={(event) => updateChildForm('firstName', event.target.value)} />
              <Input label="Last name" value={childForm.lastName} onChange={(event) => updateChildForm('lastName', event.target.value)} />
            </div>
            <Input label="Grade" type="number" min="1" max="12" placeholder="6" value={childForm.grade} onChange={(event) => updateChildForm('grade', event.target.value)} />
            <p className="text-xs leading-relaxed text-text-muted">Student ID and PIN will be generated automatically after you create the profile.</p>
            <Button onClick={createChild} disabled={!childForm.firstName.trim() || !childForm.lastName.trim() || !childForm.grade.trim()}>Create Child Profile</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Credential({ label, value }: { label: string; value: string }) {
  const copyCredential = () => void navigator.clipboard?.writeText(value)
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <button type="button" onClick={copyCredential} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm font-semibold text-text hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        {value}
        <Copy className="size-4 text-text-muted" aria-hidden="true" />
      </button>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Clock
  label: string
  value: string
  sub: string
  accent: 'primary' | 'secondary' | 'accent'
}) {
  const accentStyles = {
    primary: 'bg-primary-light text-primary',
    secondary: 'bg-secondary-light text-secondary',
    accent: 'bg-accent-light text-accent-hover',
  }
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-5">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accentStyles[accent]}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">{label}</p>
          <p className="mt-0.5 text-xl font-semibold text-text">{value}</p>
          <p className="text-xs text-text-muted">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}
