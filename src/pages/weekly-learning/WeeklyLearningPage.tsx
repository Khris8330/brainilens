import { useEffect, useState } from 'react'
import { Clock, LockKeyhole } from 'lucide-react'
import { Card, CardContent, EmptyState, LoadingOverlay } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { getStudentActivity, type LearningActivityRecord } from '@/lib/learning-data'

export function WeeklyLearningPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<LearningActivityRecord[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => { if (!user?.id) return; void getStudentActivity(user.id).then(({ data, error }) => { setRecords(data); setState(error ? 'error' : 'ready') }) }, [user?.id])
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">Weekly Learning</h1><p className="mt-1 text-sm text-text-muted">Persisted learning activity for {user?.name ?? 'your account'}.</p></div>{state === 'loading' ? <LoadingOverlay label="Loading learning activity" /> : state === 'error' ? <EmptyState icon={Clock} title="Learning activity unavailable" description="Saved learning activity could not be loaded. Please try again." /> : records.length === 0 ? <EmptyState icon={Clock} title="No saved learning entries yet" description="No persisted learning activity is available for your student profile yet." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{records.map((record) => <Card key={record.id}><CardContent className="p-5"><p className="text-sm font-semibold text-text">{new Date(record.activityDate).toLocaleDateString()}</p><p className="mt-3 text-2xl font-semibold text-primary">{record.minutes} min</p><p className="mt-1 text-sm text-text-muted">{record.lessonsCompleted} lessons · {record.assignmentsCompleted} assignments completed</p></CardContent></Card>)}</div>}<div className="flex items-center gap-2 text-xs text-text-muted"><LockKeyhole className="size-4" />Activity is scoped to your authenticated student identity.</div></div>
}
