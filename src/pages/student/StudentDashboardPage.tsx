import { Link } from 'react-router-dom'
import { Bot, BookOpen, LockKeyhole, UserRound } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { routes } from '@/routes'
import { getNigeriaGreeting } from '@/lib/time'

export function StudentDashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0] ?? 'Student'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">{getNigeriaGreeting()}, {firstName}!</h1>
        <p className="mt-1 text-sm text-text-muted">Your account is connected. Learning records will appear here as they are added.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-5"><UserRound className="size-5 text-primary" /><div><p className="text-sm font-semibold text-text">{user?.studentId ?? 'Student account'}</p><p className="text-xs text-text-muted">Student ID</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><BookOpen className="size-5 text-secondary" /><div><p className="text-sm font-semibold text-text">No progress yet</p><p className="text-xs text-text-muted">No saved learning data</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><Bot className="size-5 text-secondary" /><div><p className="text-sm font-semibold text-text">Need help?</p><Link to={routes.studentAi} className="text-xs text-primary hover:underline">Open Lens companion</Link></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Student overview</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">Authenticated student</Badge><span className="text-sm text-text-muted">Grade {user?.grade ?? 'Not assigned'}</span></div>
          <div className="rounded-lg border border-border bg-background p-5"><LockKeyhole className="size-5 text-text-muted" /><p className="mt-3 font-medium text-text">Your dashboard is scoped to your account</p><p className="mt-1 text-sm text-text-muted">Assignments, weekly learning, and progress will be shown only when persisted records exist for your authenticated student profile.</p></div>
          <Link to={routes.studentAssignments}><Button variant="outline">View assignments</Button></Link>
        </CardContent>
      </Card>
    </div>
  )
}
