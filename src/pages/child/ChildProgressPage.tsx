import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { BarChart3, ClipboardList, Clock, LockKeyhole } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, EmptyState, LoadingOverlay, ProgressBar } from '@/components/ui'
import { routes } from '@/routes'
import { getChildActivity, getChildAssignments, getChildProgress, type LearningActivityRecord, type StudentAssignmentRecord, type StudentProgressRecord } from '@/lib/learning-data'
import { supabase } from '@/lib/supabase'

export function ChildProgressPage() {
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get('studentId')
  const [child, setChild] = useState<{ full_name: string; grade: string | null } | null>(null)
  const [assignments, setAssignments] = useState<StudentAssignmentRecord[]>([])
  const [progress, setProgress] = useState<StudentProgressRecord[]>([])
  const [activity, setActivity] = useState<LearningActivityRecord[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>(studentId ? 'loading' : 'empty')
  useEffect(() => {
    if (!studentId) return
    void Promise.all([supabase.from('students').select('full_name,grade').eq('id', studentId).maybeSingle(), getChildAssignments(studentId), getChildProgress(studentId), getChildActivity(studentId)]).then(([childResult, assignmentResult, progressResult, activityResult]) => {
      if (childResult.error || assignmentResult.error || progressResult.error || activityResult.error) { setState('error'); return }
      setChild(childResult.data)
      setAssignments(assignmentResult.data)
      setProgress(progressResult.data)
      setActivity(activityResult.data)
      setState('ready')
    })
  }, [studentId])
  if (state === 'loading') return <LoadingOverlay label="Loading child progress" />
  if (state === 'empty' || !child) return <EmptyState icon={BarChart3} title="Student profile not found" description="Select a child profile from the parent dashboard." />
  if (state === 'error') return <EmptyState icon={BarChart3} title="Child progress unavailable" description="Persisted child learning data could not be loaded. Please try again." />
  const totalMinutes = activity.reduce((sum, item) => sum + item.minutes, 0)
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">{child.full_name}&apos;s progress</h1><p className="mt-1 text-sm text-text-muted">Grade {child.grade ?? 'Not assigned'} · persisted learning records only.</p></div><div className="grid gap-4 sm:grid-cols-3"><Card><CardContent className="p-5"><Clock className="size-5 text-primary" /><p className="mt-3 text-2xl font-semibold text-text">{totalMinutes} min</p><p className="text-sm text-text-muted">Recorded activity</p></CardContent></Card><Card><CardContent className="p-5"><ClipboardList className="size-5 text-secondary" /><p className="mt-3 text-2xl font-semibold text-text">{assignments.length}</p><p className="text-sm text-text-muted">Assignments</p></CardContent></Card><Card><CardContent className="p-5"><BarChart3 className="size-5 text-accent-hover" /><p className="mt-3 text-2xl font-semibold text-text">{progress.length}</p><p className="text-sm text-text-muted">Progress records</p></CardContent></Card></div><Card><CardHeader><CardTitle>Learning progress</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{progress.length === 0 ? <EmptyState icon={BarChart3} title="No progress records yet" description="Progress will appear when trusted learning flows record it." /> : progress.map((record) => record.content && <div key={record.id} className="rounded-lg border border-border p-4"><div className="flex justify-between gap-3"><p className="font-medium text-text">{record.content.title}</p><span className="text-sm text-secondary">{record.progress}%</span></div><p className="mt-1 text-xs text-text-muted">{record.content.subject}</p><ProgressBar className="mt-3" label="Progress" value={record.progress} showValue variant={record.completed ? 'success' : 'primary'} /></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Assignments</CardTitle></CardHeader><CardContent className="space-y-3">{assignments.length === 0 ? <EmptyState icon={ClipboardList} title="No assignments yet" description="No persisted assignments are linked to this child." /> : assignments.map((record) => record.assignment && <div key={record.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"><div><p className="font-medium text-text">{record.assignment.title}</p><p className="text-xs text-text-muted">{record.assignment.subject} · {record.status}</p></div>{record.score !== null && <span className="text-sm font-medium text-secondary">{record.score}%</span>}</div>)}</CardContent></Card><Link to={routes.ai} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><LockKeyhole className="size-4" />Ask Lens for study support</Link></div>
}
