import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, Send } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, CardContent, EmptyState, LoadingOverlay } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { getStudentAssignment, type StudentAssignmentDetail } from '@/lib/learning-data'
import { getAssessableSections, parseLessonContent, type LessonSection } from '@/lib/lesson-content'
import { submitAssessment, getSubmissionSummary } from '@/lib/assessment'
import { routes } from '@/routes'
import { supabase } from '@/lib/supabase'

export function StudentAssessmentPage() {
  const { user } = useAuth()
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const [record, setRecord] = useState<StudentAssignmentDetail | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading')
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [result, setResult] = useState<{ responses: unknown[]; correct: number; total: number } | null>(null)

  useEffect(() => {
    if (!user?.id || !assignmentId) return
    void getStudentAssignment(user.id, assignmentId).then(({ data, error }) => {
      setRecord(data)
      setState(error ? 'error' : data ? 'ready' : 'empty')
    })
  }, [assignmentId, user?.id])

  const parsed = parseLessonContent(record?.assignment?.learningContent?.content)
  const sections = useMemo(() => parsed.lesson ? getAssessableSections(parsed.lesson) : [], [parsed.lesson])
  const current = sections[currentIndex]
  const answeredCount = sections.filter((section) => answers[section.id]?.trim()).length

  if (state === 'loading') return <LoadingOverlay label="Loading assessment" />
  if (state === 'error') return <EmptyState icon={ClipboardCheck} title="Assessment unavailable" description="We could not load this assessment. Please try again." />
  if (state === 'empty' || !record?.assignment) return <EmptyState icon={ClipboardCheck} title="Assessment not found" description="This assessment is not available for your student account." />
  if (parsed.error) return <EmptyState icon={ClipboardCheck} title="Assessment content unavailable" description={parsed.error} />
  if (!sections.length) return <EmptyState icon={ClipboardCheck} title="No assessment questions yet" description="This assignment does not have any assessable questions available." />

  const assignment = record.assignment
  const lesson = assignment.learningContent
  if (!lesson) return <EmptyState icon={ClipboardCheck} title="Assessment content unavailable" description="Learning content has not been added for this assignment yet." />

  async function handleSubmit() {
    if (isSubmitting || !assignmentId) return
    const missing = sections.find((section) => !answers[section.id]?.trim())
    if (missing) {
      setSubmissionError(`Please answer question ${sections.indexOf(missing) + 1} before submitting.`)
      setCurrentIndex(sections.indexOf(missing))
      return
    }
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session?.user) {
      setSubmissionError('Your session has expired. Please sign in again before submitting.')
      return
    }
    setIsSubmitting(true)
    setSubmissionError('')
    try {
      const responses: unknown[] = []
      for (const section of sections) {
        const { data, error } = await submitAssessment({ assignmentId: assignment.id, sectionId: section.id, answer: answers[section.id] })
        if (error) throw error
        responses.push(data)
      }
      const summaries = responses.map(getSubmissionSummary)
      const knownCorrect = summaries.reduce((total, item) => total + (item?.isCorrect ? 1 : 0), 0)
      setResult({ responses, correct: knownCorrect, total: sections.length })
    } catch (error) {
      if (import.meta.env.DEV) console.error('[v0] Assessment submission failed', error)
      setSubmissionError(error instanceof Error ? error.message : 'We could not submit the assessment. Your answers are still here; please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) return <AssessmentResult assignmentTitle={assignment.title} result={result} />
  if (!started) return <StartScreen assignment={assignment} lessonTitle={lesson.title} questionCount={sections.length} estimatedMinutes={parsed.lesson?.estimated_minutes ?? null} onStart={() => setStarted(true)} />

  return <div className="space-y-6">
    <Link to={`${routes.studentAssignments}/${assignmentId}`} className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"><ArrowLeft className="size-4" />Back to instructions</Link>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-medium text-primary">{assignment.subject}</p><h1 className="mt-1 text-2xl font-semibold text-text">{assignment.title}</h1></div><p className="text-sm text-text-muted">{answeredCount} of {sections.length} answered</p></div>
    <div className="h-2 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answeredCount / sections.length) * 100}%` }} /></div>
    <Card><CardContent className="space-y-5 p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-primary">Question {currentIndex + 1} of {sections.length}</p><Clock3 className="size-4 text-text-muted" aria-hidden="true" /></div><h2 className="text-xl font-semibold leading-7 text-text">{current.question || current.content}</h2><QuestionInput section={current} value={answers[current.id] ?? ''} onChange={(value) => { setAnswers((items) => ({ ...items, [current.id]: value })); setSubmissionError('') }} /><div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between"><Button variant="outline" onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} disabled={currentIndex === 0} leftIcon={<ChevronLeft className="size-4" />}>Previous</Button>{currentIndex < sections.length - 1 ? <Button onClick={() => setCurrentIndex((index) => Math.min(sections.length - 1, index + 1))} rightIcon={<ChevronRight className="size-4" />}>Next</Button> : <Button onClick={() => void handleSubmit()} isLoading={isSubmitting} leftIcon={<Send className="size-4" />}>Submit Assessment</Button>}</div></CardContent></Card>
    {submissionError && <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-text" role="alert">{submissionError}</div>}
    <div className="flex flex-wrap gap-2" aria-label="Question navigation">{sections.map((section, index) => <button key={section.id} type="button" onClick={() => setCurrentIndex(index)} aria-label={`Go to question ${index + 1}`} className={`flex size-10 items-center justify-center rounded-lg border text-sm font-medium ${index === currentIndex ? 'border-primary bg-primary text-white' : answers[section.id] ? 'border-secondary bg-secondary-light text-text' : 'border-border bg-surface text-text-muted'}`}>{index + 1}</button>)}</div>
  </div>
}

function QuestionInput({ section, value, onChange }: { section: LessonSection; value: string; onChange: (value: string) => void }) {
  const assessment = section.assessment
  if (!assessment) return null
  if (assessment.type === 'multiple_choice' || assessment.type === 'true_false') {
    const options = assessment.type === 'true_false' ? ['true', 'false'] : section.options ?? []
    return <div className="grid gap-3" role="radiogroup" aria-label="Answer options">{options.map((option) => <button key={option} type="button" role="radio" aria-checked={value === option} onClick={() => onChange(option)} className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm ${value === option ? 'border-primary bg-primary-light text-text' : 'border-border bg-surface text-text hover:border-primary'}`}>{option}</button>)}</div>
  }
  return <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="Type your answer" rows={assessment.type === 'open_ended' ? 5 : 2} className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
}

function StartScreen({ assignment, lessonTitle, questionCount, estimatedMinutes, onStart }: { assignment: NonNullable<StudentAssignmentDetail['assignment']>; lessonTitle: string; questionCount: number; estimatedMinutes: number | null; onStart: () => void }) {
  return <div className="mx-auto max-w-2xl space-y-6"><Link to={routes.studentAssignments} className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"><ArrowLeft className="size-4" />Back to assignments</Link><Card><CardContent className="space-y-6 p-6 sm:p-8"><div><p className="text-sm font-medium text-primary">{assignment.subject}</p><h1 className="mt-2 text-3xl font-semibold text-text">{assignment.title}</h1><p className="mt-2 text-text-muted">{lessonTitle}</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-lg bg-background p-4"><p className="text-xs text-text-muted">Questions</p><p className="mt-1 font-semibold text-text">{questionCount}</p></div><div className="rounded-lg bg-background p-4"><p className="text-xs text-text-muted">Estimated time</p><p className="mt-1 font-semibold text-text">{estimatedMinutes ? `${estimatedMinutes} minutes` : 'Not provided'}</p></div></div><div className="space-y-2"><h2 className="font-semibold text-text">Instructions</h2><p className="text-sm leading-6 text-text-muted">Answer every question, use the question navigator to review your work, then submit when you are ready. Your results will be evaluated and saved securely.</p></div><Button size="lg" onClick={onStart} className="w-full">Start Assessment</Button></CardContent></Card></div>
}

function AssessmentResult({ assignmentTitle, result }: { assignmentTitle: string; result: { responses: unknown[]; correct: number; total: number } }) {
  const summaries = result.responses.map(getSubmissionSummary)
  const score = summaries.find((item) => item?.score !== null)?.score
  const percentage = score ?? Math.round((result.correct / result.total) * 100)
  return <div className="mx-auto max-w-2xl"><Card><CardContent className="space-y-6 p-6 text-center sm:p-8"><CheckCircle2 className="mx-auto size-12 text-secondary" aria-hidden="true" /><div><p className="text-sm font-medium text-secondary">Assessment Complete</p><h1 className="mt-2 text-3xl font-semibold text-text">{assignmentTitle}</h1><p className="mt-2 text-text-muted">Your assessment has been submitted successfully.</p></div><div className="rounded-xl bg-background p-6"><p className="text-sm text-text-muted">Score</p><p className="mt-1 text-4xl font-semibold text-text">{result.correct} / {result.total}</p><p className="mt-2 text-lg font-medium text-primary">{percentage}%</p></div><Link to={routes.studentAssignments} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover">Back to Assignments</Link></CardContent></Card></div>
}
