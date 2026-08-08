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
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
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
} from '@/data/mockData'

const statusVariant: Record<string, 'warning' | 'primary' | 'success'> = {
  pending: 'warning',
  'in-progress': 'primary',
  completed: 'success',
}

export function ParentDashboardPage() {
  const { user } = useAuth()
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
          Here&apos;s how {mockChild.name.split(' ')[0]} is doing this week.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar name={mockChild.name} size="lg" />
            <h3 className="mt-3 text-base font-semibold text-text">
              {mockChild.name}
            </h3>
            <p className="text-sm text-text-muted">{mockChild.grade}</p>
            <Badge variant="secondary" className="mt-3">
              {mockChild.streakDays}-day streak
            </Badge>
            <Link
              to={routes.child}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View {mockChild.name.split(' ')[0]}&apos;s dashboard
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>

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
