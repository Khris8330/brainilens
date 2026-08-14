import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { Card, CardContent, ProgressBar } from '@/components/ui'
import { getStudentsForParent, type StudentRecord } from '@/lib/students'
import { useAuth } from '@/contexts/AuthContext'

export function ChildProgressPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [student, setStudent] = useState<StudentRecord | null>(null)
  useEffect(() => {
    if (!user?.id) return
    void getStudentsForParent(user.id).then((children) => setStudent(children.find((child) => child.studentId === searchParams.get('studentId')) ?? null))
  }, [user?.id, searchParams])
  if (!student) return <div className="rounded-lg border border-border p-6 text-sm text-text-muted">Student profile not found.</div>
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">Hi {student.firstName}!</h1><p className="mt-1 text-sm text-text-muted">Let&apos;s see how learning is going this week.</p></div><div className="grid gap-4 sm:grid-cols-2"><Card><CardContent className="flex items-center gap-4 p-5"><Flame className="size-6 text-accent-hover" /><div><p className="text-2xl font-semibold text-text">{student.streakDays} days</p><p className="text-xs text-text-muted">Learning streak</p></div></CardContent></Card><Card><CardContent className="p-5"><ProgressBar label="Overall progress" value={student.progress} showValue variant="secondary" /></CardContent></Card></div></div>
}
