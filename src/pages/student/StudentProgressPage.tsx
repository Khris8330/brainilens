import { useEffect, useState } from 'react'
import { Flame, Trophy } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, ProgressBar } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { getStudentForUser, type StudentRecord } from '@/lib/students'

export function StudentProgressPage() {
  const { user } = useAuth()
  const [student, setStudent] = useState<StudentRecord | null>(null)
  useEffect(() => { if (user?.id) void getStudentForUser(user.id).then(setStudent) }, [user?.id])
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">My Progress</h1><p className="mt-1 text-sm text-text-muted">See how your learning is growing.</p></div><div className="grid gap-4 sm:grid-cols-3"><Card><CardContent className="p-5"><p className="text-xs text-text-muted">Overall progress</p><p className="mt-1 text-3xl font-semibold text-text">{student?.progress ?? 0}%</p></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-5"><Flame className="size-6 text-accent-hover" /><div><p className="text-2xl font-semibold text-text">{student?.streakDays ?? 0} days</p><p className="text-xs text-text-muted">Current streak</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-5"><Trophy className="size-6 text-secondary" /><div><p className="text-2xl font-semibold text-text">0 days</p><p className="text-xs text-text-muted">Best streak</p></div></CardContent></Card></div><Card><CardHeader><CardTitle>Weekly progress</CardTitle></CardHeader><CardContent><ProgressBar label="Completed tasks" value={0} max={5} showValue variant="secondary" /><p className="mt-2 text-xs text-text-muted">No assignment metrics are stored yet.</p></CardContent></Card></div>
}
