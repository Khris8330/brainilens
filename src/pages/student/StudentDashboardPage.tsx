import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Flame, Play } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, ProgressBar, Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { getStudentForUser, type StudentRecord } from '@/lib/students'
import { routes } from '@/routes'
import { getNigeriaGreeting } from '@/lib/time'

export function StudentDashboardPage() {
  const { user } = useAuth()
  const [student, setStudent] = useState<StudentRecord | null>(null)
  useEffect(() => { if (user?.id) void getStudentForUser(user.id).then(setStudent) }, [user?.id])
  const name = student?.firstName ?? user?.name?.split(' ')[0] ?? 'Student'
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold text-text">{getNigeriaGreeting()}, {name}!</h1><p className="mt-1 text-sm text-text-muted">Ready to keep growing?</p></div>
    <div className="grid gap-4 sm:grid-cols-3">
      <Card><CardContent className="flex items-center gap-3 p-5"><div className="flex size-11 items-center justify-center rounded-lg bg-accent-light"><Flame className="size-5 text-accent-hover" /></div><div><p className="text-xl font-semibold text-text">{student?.streakDays ?? 0} days</p><p className="text-xs text-text-muted">Current streak</p></div></CardContent></Card>
      <Card><CardContent className="p-5"><ProgressBar label="Weekly progress" value={student?.progress ?? 0} showValue variant="secondary" /><p className="mt-2 text-xs text-text-muted">Keep going!</p></CardContent></Card>
      <Card><CardContent className="p-5"><Link to={routes.studentAi} className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-lg bg-secondary-light"><Bot className="size-5 text-secondary" /></div><div><p className="text-sm font-semibold text-text">Need help?</p><p className="text-xs text-primary">Ask your AI companion</p></div></Link></CardContent></Card>
    </div>
    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Today&apos;s learning</CardTitle><Link to={routes.studentLearning} className="text-sm font-medium text-primary hover:underline">View all</Link></CardHeader><CardContent className="flex flex-col gap-3">{['Mathematics · Fractions','Science · The Solar System','English · Reading Practice'].map((topic) => <div key={topic} className="flex items-center justify-between rounded-lg border border-border p-3"><p className="text-sm font-medium text-text">{topic}</p><Button size="sm" variant="outline"><Play className="size-4" />Start</Button></div>)}</CardContent></Card>
  </div>
}
