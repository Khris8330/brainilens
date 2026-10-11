import { useEffect, useState } from 'react'
import { ClipboardList, LockKeyhole } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, EmptyState, LoadingOverlay } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { formatAssignmentStatus, formatLearningError, getStudentAssignments, type StudentAssignmentRecord } from '@/lib/learning-data'
import { routes } from '@/routes'

export function StudentAssignmentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [records, setRecords] = useState<StudentAssignmentRecord[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => { if (!user?.id) return; void getStudentAssignments(user.id).then(({ data, error }) => { setRecords(data); setState(error ? 'error' : 'ready') }) }, [user?.id])
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">Assignments</h1><p className="mt-1 text-sm text-text-muted">Your persisted assignments, scoped to your authenticated student account.</p></div>{state === 'loading' ? <LoadingOverlay label="Loading assignments" /> : state === 'error' ? <EmptyState icon={ClipboardList} title="Assignments unavailable" description={formatLearningError({ message: 'query failed' })} /> : records.length === 0 ? <EmptyState icon={ClipboardList} title="No saved assignments yet" description="There are no persisted assignments for your student profile yet." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{records.map((record) => record.assignment && <Card key={record.id} onClick={() => navigate(`${routes.studentAssignments}/${record.id}`)} className="cursor-pointer transition-shadow hover:shadow-md" role="link" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(`${routes.studentAssignments}/${record.id}`) } }}><CardContent className="p-5"><div className="flex items-start justify-between gap-2"><span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">{record.assignment.subject}</span><span className="text-xs text-text-muted">{formatAssignmentStatus(record.status)}</span></div><h2 className="mt-3 font-semibold text-text">{record.assignment.title}</h2><p className="mt-1 text-sm text-text-muted">{record.assignment.description ?? 'No description provided.'}</p>{record.assignment.dueDate && <p className="mt-4 text-xs text-text-muted">Due {new Date(record.assignment.dueDate).toLocaleDateString()}</p>}{record.score !== null && <p className="mt-2 text-sm font-medium text-secondary">Score {record.score}%</p>}</CardContent></Card>)}</div>}<div className="flex items-center gap-2 text-xs text-text-muted"><LockKeyhole className="size-4" />No client-side assignment write actions are enabled.</div></div>
}
