import { UserRound } from 'lucide-react'
import { Card, CardContent, Avatar, Badge } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export function StudentProfilePage() {
  const { user } = useAuth()
  const name = user?.name ?? 'Student'

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-text">My Profile</h1><p className="mt-1 text-sm text-text-muted">Your authenticated student identity and account details.</p></div>
      <Card><CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left"><Avatar name={name} size="lg" /><div><h2 className="text-xl font-semibold text-text">{name}</h2><p className="text-sm text-text-muted">Grade {user?.grade ?? 'Not assigned'}</p><Badge variant="secondary" className="mt-2">{user?.studentId ?? 'Student ID unavailable'}</Badge></div></CardContent></Card>
      <Card><CardContent className="grid gap-4 p-6 sm:grid-cols-3"><div><UserRound className="size-5 text-primary" /><p className="mt-2 text-xs text-text-muted">Student ID</p><p className="font-medium text-text">{user?.studentId ?? 'Unavailable'}</p></div><div><p className="text-xs text-text-muted">Account role</p><p className="text-xl font-semibold text-text">Student</p></div><div><p className="text-xs text-text-muted">Learning records</p><p className="text-xl font-semibold text-text">Not connected</p></div></CardContent></Card>
    </div>
  )
}
