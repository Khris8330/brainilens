import { Link } from 'react-router-dom'
import { Flame, Bot, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  ProgressBar,
  Button,
} from '@/components/ui'
import { routes } from '@/routes'
import {
  mockChild,
  subjects,
  achievements,
  initialAssignments,
} from '@/data/mockData'

export function ChildProgressPage() {
  const currentAssignments = initialAssignments.filter(
    (a) => a.status !== 'completed',
  )
  const completedAssignments = initialAssignments.filter(
    (a) => a.status === 'completed',
  )
  const weeklyPct = Math.round(
    (mockChild.weeklyHoursCompleted / mockChild.weeklyHoursGoal) * 100,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">
          Hi {mockChild.name.split(' ')[0]}! 👋
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Let&apos;s see how your learning is going this week.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-accent-light">
              <Flame className="size-6 text-accent-hover" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text">
                {mockChild.streakDays} days
              </p>
              <p className="text-xs text-text-muted">Learning streak</p>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <ProgressBar
              label="Weekly progress"
              value={mockChild.weeklyHoursCompleted}
              max={mockChild.weeklyHoursGoal}
              showValue
              variant="secondary"
            />
            <p className="mt-2 text-xs text-text-muted">
              {mockChild.weeklyHoursCompleted}h of {mockChild.weeklyHoursGoal}h
              this week ({weeklyPct}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Link to={routes.ai} className="block">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-secondary-light">
                  <Bot className="size-6 text-secondary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text">
                    Need help studying?
                  </p>
                  <p className="text-xs text-primary">
                    Ask your AI Study Companion
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjects.map((s) => (
              <ProgressBar
                key={s.name}
                label={s.name}
                value={s.mastery}
                showValue
                variant={
                  s.mastery >= 80
                    ? 'success'
                    : s.mastery >= 60
                      ? 'primary'
                      : 'accent'
                }
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Trophy className="size-4 text-accent-hover" aria-hidden="true" />
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.title}
                className={`rounded-lg border p-3 text-center ${
                  a.earned
                    ? 'border-accent/30 bg-accent-light'
                    : 'border-border bg-background opacity-60'
                }`}
              >
                <Trophy
                  className={`mx-auto size-5 ${a.earned ? 'text-accent-hover' : 'text-text-muted'}`}
                  aria-hidden="true"
                />
                <p className="mt-1.5 text-xs font-semibold text-text">
                  {a.title}
                </p>
                <p className="text-[11px] text-text-muted">
                  {a.earned ? `Earned ${a.date}` : 'Not yet earned'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current assignments</CardTitle>
            <Link
              to={routes.assignments}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentAssignments.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-border p-3"
              >
                <p className="text-sm font-medium text-text">{a.title}</p>
                <p className="text-xs text-text-muted">{a.subject}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle2
              className="size-4 text-secondary"
              aria-hidden="true"
            />
            <CardTitle>Completed assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedAssignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-text">{a.title}</p>
                  <p className="text-xs text-text-muted">{a.subject}</p>
                </div>
                {a.score !== undefined && (
                  <Badge variant="success">{a.score}%</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary to-secondary text-white">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="text-lg font-semibold">
              Stuck on something this week?
            </h3>
            <p className="mt-1 text-sm text-white/85">
              Your AI Study Companion is ready to help, any time.
            </p>
          </div>
          <Link to={routes.ai}>
            <Button className="bg-white text-primary hover:bg-white/90">
              <Bot className="size-4" aria-hidden="true" />
              Start a session
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
