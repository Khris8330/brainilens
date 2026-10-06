import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ClipboardList,
  Gamepad2,
  TrendingUp,
  UserRound,
  Flame,
  Sparkles,
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { useAuth } from '@/contexts/AuthContext'
import { routes } from '@/routes'
import { getAppGreeting } from '@/lib/time'
import {
  getStudentAssignments,
  getStudentActivity,
  type StudentAssignmentRecord,
  type LearningActivityRecord,
} from '@/lib/learning-data'
import { lensMascot } from '@/assets/landing'

type DashCard = {
  to: string
  title: string
  subtitle: string
  bg: string
  text: string
  badge?: string
  badgeTone?: string
  icon?: ReactNode
  imageSrc?: string
  count?: number
}

export function StudentDashboardPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<StudentAssignmentRecord[]>([])
  const [activity, setActivity] = useState<LearningActivityRecord[]>([])

  useEffect(() => {
    if (!user?.id) return
    void Promise.all([
      getStudentAssignments(user.id),
      getStudentActivity(user.id),
    ]).then(([assignmentResult, activityResult]) => {
      setAssignments(assignmentResult.data ?? [])
      setActivity(activityResult.data ?? [])
    })
  }, [user?.id])

  const pendingCount = useMemo(
    () =>
      assignments.filter(
        (item) => item.status === 'assigned' || item.status === 'in_progress' || item.status === 'overdue',
      ).length,
    [assignments],
  )

  const streakDays = useMemo(() => {
    if (activity.length === 0) return 0
    const days = new Set(
      activity
        .map((item) => (item.activityDate ? new Date(item.activityDate).toDateString() : null))
        .filter(Boolean),
    )
    return Math.min(days.size, 30)
  }, [activity])

  const firstName = user?.name?.split(' ')[0] ?? 'Student'

  const cards: DashCard[] = [
    {
      to: routes.studentLearning,
      title: "Today's Learning",
      subtitle: "Let's explore and discover!",
      bg: 'bg-sky-100',
      text: 'text-sky-900',
      icon: <BookOpen className="size-14 text-sky-500 drop-shadow-sm" strokeWidth={1.5} />,
    },
    {
      to: routes.studentAssignments,
      title: 'Assignments',
      subtitle: pendingCount > 0 ? 'You have pending work' : 'All caught up for now',
      bg: 'bg-rose-100',
      text: 'text-rose-900',
      count: pendingCount > 0 ? pendingCount : undefined,
      icon: <ClipboardList className="size-14 text-rose-400 drop-shadow-sm" strokeWidth={1.5} />,
    },
    {
      to: routes.studentGames,
      title: 'Games',
      subtitle: 'Play, learn, and have fun!',
      bg: 'bg-violet-100',
      text: 'text-violet-900',
      icon: <Gamepad2 className="size-14 text-violet-500 drop-shadow-sm" strokeWidth={1.5} />,
    },
    {
      to: routes.studentAi,
      title: 'Lens AI',
      subtitle: 'Ask anything. Discover more.',
      bg: 'bg-cyan-100',
      text: 'text-cyan-900',
      badge: 'New',
      badgeTone: 'bg-white/90 text-cyan-700',
      imageSrc: lensMascot,
    },
    {
      to: routes.studentProgress,
      title: 'My Progress',
      subtitle: "See how you're growing!",
      bg: 'bg-emerald-100',
      text: 'text-emerald-900',
      icon: <TrendingUp className="size-14 text-emerald-500 drop-shadow-sm" strokeWidth={1.5} />,
    },
    {
      to: routes.studentProfile,
      title: 'Profile',
      subtitle: 'Your avatar, achievements & more',
      bg: 'bg-purple-100',
      text: 'text-purple-900',
      icon: <UserRound className="size-14 text-purple-400 drop-shadow-sm" strokeWidth={1.5} />,
    },
  ]

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col px-1 pb-8 sm:max-w-2xl">
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#14274E] sm:text-4xl">
            {getAppGreeting().replace(/!$/, '')}, {firstName}!
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted sm:text-base">
            Ready to learn something cool today?
            <Sparkles className="size-4 text-amber-400" aria-hidden />
          </p>
        </div>
        {streakDays > 0 && (
          <div className="shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-center shadow-sm">
            <p className="flex items-center justify-center gap-1 text-sm font-bold text-amber-700">
              <Flame className="size-4 text-orange-500" aria-hidden />
              {streakDays}-day streak
            </p>
            <p className="text-[11px] font-medium text-amber-600/80">Keep it up!</p>
          </div>
        )}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className={`group relative flex min-h-[11.5rem] flex-col justify-between overflow-hidden rounded-3xl ${card.bg} p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:min-h-[13rem] sm:p-5`}
          >
            {card.badge && (
              <span
                className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-bold ${card.badgeTone ?? 'bg-white text-text'}`}
              >
                ★ {card.badge}
              </span>
            )}
            {card.count != null && card.count > 0 && (
              <span className="absolute bottom-16 right-4 flex size-7 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow">
                {card.count > 9 ? '9+' : card.count}
              </span>
            )}
            <div className={`pr-6 ${card.text}`}>
              <h2 className="text-lg font-extrabold leading-tight sm:text-xl">{card.title}</h2>
              <p className="mt-1 text-xs font-medium opacity-80 sm:text-sm">{card.subtitle}</p>
            </div>
            <div className="mt-3 flex justify-end">
              {card.imageSrc ? (
                <img
                  src={card.imageSrc}
                  alt=""
                  className="h-16 w-16 object-contain drop-shadow-md transition group-hover:scale-105 sm:h-20 sm:w-20"
                  draggable={false}
                />
              ) : (
                <div className="transition group-hover:scale-105">{card.icon}</div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Official brand footer */}
      <div className="mt-auto flex flex-col items-center gap-1 pt-10">
        <BrandLogo to={null} size="md" variant="horizontal" />
        <p className="text-[11px] font-medium tracking-wide text-text-muted">
          Learn · Explore · Grow
        </p>
      </div>
    </div>
  )
}
