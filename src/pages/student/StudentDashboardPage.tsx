import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ClipboardList,
  Gamepad2,
  TrendingUp,
  UserRound,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { useAuth } from '@/contexts/AuthContext'
import { routes } from '@/routes'
import { getAppGreeting } from '@/lib/time'
import {
  getStudentAssignments,
  getStudentActivity,
  getStudentProgress,
  type StudentAssignmentRecord,
  type LearningActivityRecord,
  type StudentProgressRecord,
} from '@/lib/learning-data'
import { lensMascot } from '@/assets/landing'

type DashCard = {
  to: string
  title: string
  subtitle: string
  bg: string
  text: string
  iconBg: string
  icon: ReactNode
  arrowColor: string
  count?: number
}

export function StudentDashboardPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<StudentAssignmentRecord[]>([])
  const [activity, setActivity] = useState<LearningActivityRecord[]>([])
  const [progress, setProgress] = useState<StudentProgressRecord[]>([])

  useEffect(() => {
    if (!user?.id) return
    void Promise.all([
      getStudentAssignments(user.id),
      getStudentActivity(user.id),
      getStudentProgress(user.id),
    ]).then(([assignmentResult, activityResult, progressResult]) => {
      setAssignments(assignmentResult.data ?? [])
      setActivity(activityResult.data ?? [])
      setProgress(progressResult.data ?? [])
    })
  }, [user?.id])

  const pendingCount = useMemo(
    () =>
      assignments.filter(
        (item) =>
          item.status === 'assigned' ||
          item.status === 'in_progress' ||
          item.status === 'overdue',
      ).length,
    [assignments],
  )

  // Real streak: consecutive days ending today (or most recent activity day)
  const streakDays = useMemo(() => {
    if (activity.length === 0) return 0
    const daySet = new Set<string>()
    for (const item of activity) {
      if (item.activityDate) {
        daySet.add(new Date(item.activityDate).toDateString())
      }
    }
    if (daySet.size === 0) return 0

    const sorted = Array.from(daySet)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime())

    let streak = 1
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      const diffDays = Math.round(
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (diffDays === 1) {
        streak += 1
      } else {
        break
      }
    }
    return streak
  }, [activity])

  // Continue Learning: first incomplete progress item, or fallback
  const continueItem = useMemo(() => {
    const incomplete = progress.find((p) => !p.completed && p.progress < 100)
    if (incomplete?.content) {
      return {
        title: incomplete.content.title,
        progress: Math.round(incomplete.progress),
        to: routes.studentLearning,
      }
    }
    return {
      title: 'Start your next lesson',
      progress: 0,
      to: routes.studentLearning,
    }
  }, [progress])

  const firstName = user?.name?.split(' ')[0] ?? 'Student'

  const cards: DashCard[] = [
    {
      to: routes.studentLearning,
      title: "Today's Learning",
      subtitle: 'Your daily lesson plan.',
      bg: 'bg-sky-50',
      text: 'text-sky-900',
      iconBg: 'bg-sky-500',
      icon: <BookOpen className="size-5 text-white" strokeWidth={2} />,
      arrowColor: 'text-sky-500',
    },
    {
      to: routes.studentAssignments,
      title: 'Assignments',
      subtitle: pendingCount > 0 ? `Due soon, ${pendingCount}` : 'All caught up',
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      iconBg: 'bg-rose-400',
      icon: <ClipboardList className="size-5 text-white" strokeWidth={2} />,
      arrowColor: 'text-rose-400',
      count: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      to: routes.studentGames,
      title: 'Games',
      subtitle: 'Learn through play!',
      bg: 'bg-violet-50',
      text: 'text-violet-900',
      iconBg: 'bg-violet-500',
      icon: <Gamepad2 className="size-5 text-white" strokeWidth={2} />,
      arrowColor: 'text-violet-500',
    },
    {
      to: routes.studentAi,
      title: 'Lens AI',
      subtitle: 'Your smart learning companion.',
      bg: 'bg-cyan-50',
      text: 'text-cyan-900',
      iconBg: 'bg-cyan-500',
      icon: <Sparkles className="size-5 text-white" strokeWidth={2} />,
      arrowColor: 'text-cyan-500',
    },
    {
      to: routes.studentProgress,
      title: 'My Progress',
      subtitle: 'Track your growth.',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      iconBg: 'bg-emerald-500',
      icon: <TrendingUp className="size-5 text-white" strokeWidth={2} />,
      arrowColor: 'text-emerald-500',
    },
    {
      to: routes.studentProfile,
      title: 'Profile',
      subtitle: 'Your learning journey.',
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      iconBg: 'bg-purple-500',
      icon: <UserRound className="size-5 text-white" strokeWidth={2} />,
      arrowColor: 'text-purple-500',
    },
  ]

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col px-3 pb-8 sm:max-w-2xl">
      {/* Greeting + Streak */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#14274E] sm:text-3xl">
            {getAppGreeting()},{' '}
            <span className="text-sky-600">{firstName}!</span>
          </h1>
          <p className="mt-1 text-sm text-text-muted sm:text-base">
            Ready to learn something today?
          </p>
        </div>
        <div className="shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-center shadow-sm">
          <p className="flex items-center justify-center gap-1 text-sm font-bold text-amber-700">
            <Flame className="size-4 text-orange-500" aria-hidden />
            {streakDays}-day streak
          </p>
          <p className="text-[11px] font-medium text-amber-600/80">
            {streakDays > 0 ? 'Keep it up!' : 'Start today!'}
          </p>
        </div>
      </div>

      {/* Continue Learning card — mascot on the right */}
      <Link
        to={continueItem.to}
        className="mb-5 block overflow-hidden rounded-3xl bg-sky-50 p-4 shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-amber-400">
                <div className="size-5 rounded-full border-2 border-white/80" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Continue Learning
              </span>
            </div>
            <h2 className="text-lg font-extrabold leading-tight text-[#14274E] sm:text-xl">
              {continueItem.title}
            </h2>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-text-muted">
                <span>Progress</span>
                <span>{continueItem.progress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, continueItem.progress))}%` }}
                />
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-sm">
                Resume
                <ArrowRight className="size-4" />
              </span>
            </div>
          </div>

          {/* Official BrainiLens mascot — right side */}
          <div className="shrink-0">
            <img
              src={lensMascot}
              alt="Lens"
              className="h-24 w-24 object-contain drop-shadow-md sm:h-28 sm:w-28"
              draggable={false}
            />
          </div>
        </div>
      </Link>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className={`group relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-3xl ${card.bg} p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:min-h-[11rem] sm:p-5`}
          >
            {card.count != null && card.count > 0 && (
              <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow">
                {card.count > 9 ? '9+' : card.count}
              </span>
            )}

            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
            >
              {card.icon}
            </div>

            <div className={`mt-3 ${card.text}`}>
              <h2 className="text-base font-extrabold leading-tight sm:text-lg">{card.title}</h2>
              <p className="mt-0.5 text-xs font-medium opacity-80 sm:text-sm">{card.subtitle}</p>
            </div>

            <div className={`mt-2 ${card.arrowColor}`}>
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Brand footer */}
      <div className="mt-auto flex flex-col items-center gap-1 pt-10">
        <BrandLogo to={null} size="md" variant="horizontal" />
        <p className="text-[11px] font-medium tracking-wide text-text-muted">
          Learn · Explore · Grow
        </p>
      </div>
    </div>
  )
}
