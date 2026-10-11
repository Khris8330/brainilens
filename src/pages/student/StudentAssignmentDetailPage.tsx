import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, ClipboardList } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, EmptyState, LoadingOverlay } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { formatAssignmentStatus, formatLearningError, getStudentAssignment, type StudentAssignmentDetail } from '@/lib/learning-data'
import { routes } from '@/routes'
import { LessonContentRenderer } from '@/components/learning/LessonContentRenderer'
import { getAssessableSections, parseLessonContent } from '@/lib/lesson-content'

export function StudentAssignmentDetailPage() {
  const { user } = useAuth()
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<StudentAssignmentDetail | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading')

  useEffect(() => {
    if (!user?.id || !assignmentId) return
    void getStudentAssignment(user.id, assignmentId).then(({ data, error }) => {
      console.debug('[v0] mapped assignment detail', {
        assignmentId: data?.assignment?.id ?? null,
        assignmentTitle: data?.assignment?.title ?? null,
        hasLearningContent: Boolean(data?.assignment?.learningContent),
        hasLearningContentContent: Boolean(data?.assignment?.learningContent?.content),
      })
      setRecord(data)
      setState(error ? 'error' : data ? 'ready' : 'empty')
    })
  }, [assignmentId, user?.id])

  if (state === 'loading') return <LoadingOverlay label="Loading assignment" />
  if (state === 'error') return <EmptyState icon={ClipboardList} title="Assignment unavailable" description={formatLearningError({ message: 'query failed' })} />
  if (state === 'empty' || !record?.assignment) return <EmptyState icon={ClipboardList} title="Assignment not found" description="This assignment is not available for your student account." />

  const { assignment } = record
  const parsedContent = parseLessonContent(assignment.learningContent?.content)
  console.debug('[v0] parsed lesson content', {
    hasLesson: parsedContent.lesson !== null,
    error: parsedContent.error,
  })
  console.debug('[v0] parsed lesson sections', {
    sections: parsedContent.lesson?.sections.map((section) => ({
      id: section.id,
      type: section.type,
      title: section.title,
      hasQuestion: 'question' in section,
      hasOptions: 'options' in section,
      hasCorrectAnswer: 'correct_answer' in section,
    })) ?? [],
  })
  const assessableSections = parsedContent.lesson ? getAssessableSections(parsedContent.lesson) : []
  console.debug('[v0] assessable sections', {
    count: assessableSections.length,
    ids: assessableSections.map((section) => section.id),
  })
  const shouldShowStartAssessment = assessableSections.length > 0
  console.debug('[v0] should show start assessment', shouldShowStartAssessment)
  return <div className="space-y-6">
    <button type="button" onClick={() => navigate(routes.studentAssignments)} className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"><ArrowLeft className="size-4" />Back to assignments</button>
    <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">{assignment.subject}</span><span className="text-xs text-text-muted">{formatAssignmentStatus(record.status)}</span></div><h1 className="mt-3 text-2xl font-semibold text-text">{assignment.title}</h1><p className="mt-1 text-sm text-text-muted">{assignment.description ?? 'No description provided.'}</p></div>
    <Card><CardContent className="space-y-5 p-5"><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-text-muted">Grade</p><p className="font-medium text-text">{assignment.grade ?? 'Not assigned'}</p></div><div><p className="text-xs text-text-muted">Difficulty</p><p className="font-medium text-text">{assignment.difficulty ?? 'Not assigned'}</p></div><div><p className="text-xs text-text-muted">Due date</p><p className="font-medium text-text">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</p></div></div>{record.score !== null && <p className="text-sm font-medium text-secondary">Score {record.score}%</p>}{assessableSections.length > 0 && <Link to={`${routes.studentAssignments}/${record.id}/assessment`} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover">{record.status === 'completed' ? 'Review Assessment' : 'Start Assessment'}</Link>}</CardContent></Card>
    {assignment.learningContent ? <div className="space-y-5"><Card><CardContent className="space-y-4 p-5"><div className="flex items-center gap-2"><BookOpen className="size-5 text-primary" /><h2 className="font-semibold text-text">{assignment.learningContent.title}</h2></div><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-text-muted">Subject</p><p className="font-medium text-text">{assignment.learningContent.subject}</p></div><div><p className="text-xs text-text-muted">Grade</p><p className="font-medium text-text">{assignment.learningContent.grade ?? 'Not assigned'}</p></div><div><p className="text-xs text-text-muted">Estimated time</p><p className="font-medium text-text">{parsedContent.lesson?.estimated_minutes ? `${parsedContent.lesson.estimated_minutes} minutes` : 'Not provided'}</p></div></div><p className="text-sm leading-6 text-text-muted">{assignment.learningContent.description ?? 'Learning content for this assignment.'}</p></CardContent></Card>{parsedContent.error ? <EmptyState icon={BookOpen} title="Lesson content unavailable" description={parsedContent.error} /> : parsedContent.lesson?.sections.length ? <LessonContentRenderer lesson={parsedContent.lesson} /> : <EmptyState icon={BookOpen} title="Lesson is empty" description="This lesson does not have any sections yet." />}</div> : <Card><CardContent className="p-5"><p className="text-sm text-text-muted">Learning content has not been added for this assignment yet. Your teacher can add it later.</p></CardContent></Card>}
    <Link to={routes.studentAssignments} className="text-sm text-primary hover:underline">Return to all assignments</Link>
  </div>
}
