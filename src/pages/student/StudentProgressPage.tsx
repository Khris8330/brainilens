import { useEffect, useState } from 'react'
import { BarChart3, LockKeyhole } from 'lucide-react'
import { Card, CardContent, EmptyState, LoadingOverlay, ProgressBar } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { formatLearningError, getStudentProgress, type StudentProgressRecord } from '@/lib/learning-data'

export function StudentProgressPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<StudentProgressRecord[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => { if (!user?.id) return; void getStudentProgress(user.id).then(({ data, error }) => { setRecords(data); setState(error ? 'error' : 'ready') }) }, [user?.id])
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">My Progress</h1><p className="mt-1 text-sm text-text-muted">Progress from your persisted learning content.</p></div>{state === 'loading' ? <LoadingOverlay label="Loading progress" /> : state === 'error' ? <EmptyState icon={BarChart3} title="Progress unavailable" description={formatLearningError({ message: 'query failed' })} /> : records.length === 0 ? <EmptyState icon={BarChart3} title="No progress data yet" description="No saved progress records are available for your student profile yet." /> : <div className="grid gap-4 sm:grid-cols-2">{records.map((record) => record.content && <Card key={record.id}><CardContent className="p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-text">{record.content.title}</h2><span className="text-sm font-medium text-secondary">{record.progress}%</span></div><p className="mt-1 text-sm text-text-muted">{record.content.subject}</p><ProgressBar className="mt-4" label="Progress" value={record.progress} showValue variant={record.completed ? 'success' : 'primary'} />{record.score !== null && <p className="mt-3 text-sm text-text-muted">Score: {record.score}%</p>}</CardContent></Card>)}</div>}<div className="flex items-center gap-2 text-xs text-text-muted"><LockKeyhole className="size-4" />Progress is read-only and scoped to your authenticated student identity.</div></div>
}
