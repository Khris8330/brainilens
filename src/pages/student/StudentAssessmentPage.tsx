import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Send,
  XCircle,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, CardContent, EmptyState, LoadingOverlay } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { getStudentAssignment, type StudentAssignmentDetail } from '@/lib/learning-data'
import {
  getAssessableSections,
  parseLessonContent,
  type LessonSection,
} from '@/lib/lesson-content'
import { submitAssessment, getSubmissionSummary } from '@/lib/assessment'
import { routes } from '@/routes'
import { supabase } from '@/lib/supabase'

function isAnswerCorrect(
  section: LessonSection,
  answer: string,
  serverIsCorrect: boolean | null | undefined,
): boolean {
  if (typeof serverIsCorrect === 'boolean') return serverIsCorrect

  const assessment = section.assessment
  if (!assessment) return false

  // Open-ended answers are reviewed later; treat as not auto-scored
  if (assessment.type === 'open_ended') return false

  const normalized = answer.trim().toLowerCase()
  if (!normalized) return false

  if (assessment.acceptedAnswers?.length) {
    return assessment.acceptedAnswers.some(
      (item) => String(item).trim().toLowerCase() === normalized,
    )
  }

  const correct = assessment.correctAnswer
  if (typeof correct === 'boolean') return normalized === String(correct)
  if (typeof correct === 'number') {
    const value = Number(answer)
    const tolerance = assessment.tolerance ?? 0
    return Number.isFinite(value) && Math.abs(value - correct) <= tolerance
  }
  return String(correct ?? '')
    .trim()
    .toLowerCase() === normalized
}

function formatCorrectAnswer(section: LessonSection): string {
  const assessment = section.assessment
  if (!assessment) return '\u2014'
  if (assessment.acceptedAnswers?.length) return assessment.acceptedAnswers.join(', ')
  const correct = assessment.correctAnswer
  if (typeof correct === 'boolean') return correct ? 'true' : 'false'
  if (correct === undefined || correct === null) return '\u2014'
  return String(correct)
}

function questionLabel(section: LessonSection, index: number): string {
  const text = section.question?.trim() || section.title?.trim() || section.content?.trim()
  return text || `Question ${index + 1}`
}

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
  const [result, setResult] = useState<{
    responses: unknown[]
    correct: number
    total: number
  } | null>(null)

  useEffect(() => {
    if (!user?.id || !assignmentId) return
    void getStudentAssignment(user.id, assignmentId).then(({ data, error }) => {
      setRecord(data)
      setState(error ? 'error' : data ? 'ready' : 'empty')
    })
  }, [assignmentId, user?.id])

  const parsed = parseLessonContent(record?.assignment?.learningContent?.content)
  const sections = useMemo(
    () => (parsed.lesson ? getAssessableSections(parsed.lesson) : []),
    [parsed.lesson],
  )
  const current = sections[currentIndex]
  const answeredCount = sections.filter((section) => answers[section.id]?.trim()).length

  if (state === 'loading') return <LoadingOverlay label="Loading assessment" />
  if (state === 'error') {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Assessment unavailable"
        description="We could not load this assessment. Please try again."
      />
    )
  }
  if (state === 'empty' || !record?.assignment) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Assessment not found"
        description="This assessment is not available for your student account."
      />
    )
  }
  if (parsed.error) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Assessment content unavailable"
        description={parsed.error}
      />
    )
  }
  if (!sections.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No assessment questions yet"
        description="This assignment does not have any assessable questions available."
      />
    )
  }

  const assignment = record.assignment
  const lesson = assignment.learningContent
  if (!lesson) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Assessment content unavailable"
        description="Learning content has not been added for this assignment yet."
      />
    )
  }

  async function handleSubmit() {
    if (isSubmitting || !assignmentId) return
    const missing = sections.find((section) => !answers[section.id]?.trim())
    if (missing) {
      setSubmissionError(
        `Please answer question ${sections.indexOf(missing) + 1} before submitting.`,
      )
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
        const { data, error } = await submitAssessment({
          assignmentId: assignment.id,
          sectionId: section.id,
          answer: answers[section.id],
        })
        if (error) throw error
        responses.push(data)
      }
      const summaries = responses.map(getSubmissionSummary)
      const knownCorrect = summaries.reduce(
        (total, item, index) =>
          total +
          (isAnswerCorrect(sections[index], answers[sections[index].id] ?? '', item?.isCorrect)
            ? 1
            : 0),
        0,
      )
      setResult({ responses, correct: knownCorrect, total: sections.length })
    } catch (error) {
      if (import.meta.env.DEV) console.error('[v0] Assessment submission failed', error)
      setSubmissionError(
        error instanceof Error
          ? error.message
          : 'We could not submit the assessment. Your answers are still here; please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    return (
      <AssessmentResult
        assignmentTitle={assignment.title}
        result={result}
        sections={sections}
        answers={answers}
      />
    )
  }

  if (!started) {
    return (
      <StartScreen
        assignment={assignment}
        lessonTitle={lesson.title}
        questionCount={sections.length}
        estimatedMinutes={parsed.lesson?.estimated_minutes ?? null}
        onStart={() => setStarted(true)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">{assignment.subject}</p>
          <h1 className="text-2xl font-semibold text-text">{assignment.title}</h1>
        </div>
        <p className="text-sm text-text-muted">
          {answeredCount} of {sections.length} answered
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-text-muted">
              Question {currentIndex + 1} of {sections.length}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">
              {questionLabel(current, currentIndex)}
            </h2>
            {current.content && current.question && (
              <p className="mt-2 text-sm leading-6 text-text-muted">{current.content}</p>
            )}
          </div>
          <QuestionInput
            section={current}
            value={answers[current.id] ?? ''}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [current.id]: value }))}
          />
          <div className="flex flex-wrap justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              disabled={currentIndex === 0}
              leftIcon={<ChevronLeft className="size-4" />}
            >
              Previous
            </Button>
            {currentIndex < sections.length - 1 ? (
              <Button
                onClick={() =>
                  setCurrentIndex((index) => Math.min(sections.length - 1, index + 1))
                }
                rightIcon={<ChevronRight className="size-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() => void handleSubmit()}
                isLoading={isSubmitting}
                leftIcon={<Send className="size-4" />}
              >
                Submit Assessment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {submissionError && (
        <div
          className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-text"
          role="alert"
        >
          {submissionError}
        </div>
      )}

      <div className="flex flex-wrap gap-2" aria-label="Question navigation">
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to question ${index + 1}`}
            className={`flex size-10 items-center justify-center rounded-lg border text-sm font-medium ${
              index === currentIndex
                ? 'border-primary bg-primary text-white'
                : answers[section.id]
                  ? 'border-secondary bg-secondary-light text-text'
                  : 'border-border bg-surface text-text-muted'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

function QuestionInput({
  section,
  value,
  onChange,
}: {
  section: LessonSection
  value: string
  onChange: (value: string) => void
}) {
  const assessment = section.assessment
  if (!assessment) return null
  if (assessment.type === 'multiple_choice' || assessment.type === 'true_false') {
    const options =
      assessment.type === 'true_false' ? ['true', 'false'] : (section.options ?? [])
    return (
      <div className="grid gap-3" role="radiogroup" aria-label="Answer options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            onClick={() => onChange(option)}
            className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm ${
              value === option
                ? 'border-primary bg-primary-light text-text'
                : 'border-border bg-surface text-text hover:border-primary'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    )
  }
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Type your answer"
      rows={assessment.type === 'open_ended' ? 5 : 2}
      className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  )
}

function StartScreen({
  assignment,
  lessonTitle,
  questionCount,
  estimatedMinutes,
  onStart,
}: {
  assignment: NonNullable<StudentAssignmentDetail['assignment']>
  lessonTitle: string
  questionCount: number
  estimatedMinutes: number | null
  onStart: () => void
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={routes.studentAssignments}
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft className="size-4" />
        Back to assignments
      </Link>
      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div>
            <p className="text-sm font-medium text-primary">{assignment.subject}</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">{assignment.title}</h1>
            <p className="mt-2 text-text-muted">{lessonTitle}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-background p-4">
              <p className="text-xs text-text-muted">Questions</p>
              <p className="mt-1 font-semibold text-text">{questionCount}</p>
            </div>
            <div className="rounded-lg bg-background p-4">
              <p className="text-xs text-text-muted">Estimated time</p>
              <p className="mt-1 font-semibold text-text">
                {estimatedMinutes ? `${estimatedMinutes} minutes` : 'Not provided'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-semibold text-text">Instructions</h2>
            <p className="text-sm leading-6 text-text-muted">
              Answer every question, use the question navigator to review your work, then submit
              when you are ready. Your results will be evaluated and saved securely.
            </p>
          </div>
          <Button size="lg" onClick={onStart} className="w-full">
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AssessmentResult({
  assignmentTitle,
  result,
  sections,
  answers,
}: {
  assignmentTitle: string
  result: { responses: unknown[]; correct: number; total: number }
  sections: LessonSection[]
  answers: Record<string, string>
}) {
  const summaries = result.responses.map(getSubmissionSummary)
  const score = summaries.find((item) => item?.score !== null)?.score
  const percentage = score ?? Math.round((result.correct / Math.max(result.total, 1)) * 100)

  const reviewItems = sections.map((section, index) => {
    const answer = answers[section.id] ?? ''
    const correct = isAnswerCorrect(section, answer, summaries[index]?.isCorrect)
    return {
      id: section.id,
      index,
      question: questionLabel(section, index),
      answer: answer || '(no answer)',
      correctAnswer: formatCorrectAnswer(section),
      isCorrect: correct,
      isOpenEnded: section.assessment?.type === 'open_ended',
    }
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="space-y-6 p-6 text-center sm:p-8">
          <CheckCircle2 className="mx-auto size-12 text-secondary" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-secondary">Assessment Complete</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">{assignmentTitle}</h1>
            <p className="mt-2 text-text-muted">Your assessment has been submitted successfully.</p>
          </div>
          <div className="rounded-xl bg-background p-6">
            <p className="text-sm text-text-muted">Score</p>
            <p className="mt-1 text-4xl font-semibold text-text">
              {result.correct} / {result.total}
            </p>
            <p className="mt-2 text-lg font-medium text-primary">{percentage}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold text-text">Question review</h2>
            <p className="mt-1 text-sm text-text-muted">
              Green means correct. Red means incorrect. Review each one below.
            </p>
          </div>

          <ol className="space-y-3">
            {reviewItems.map((item) => {
              const tone = item.isOpenEnded
                ? 'border-border bg-background'
                : item.isCorrect
                  ? 'border-success/40 bg-success/10'
                  : 'border-error/40 bg-error/10'
              const labelColor = item.isOpenEnded
                ? 'text-text-muted'
                : item.isCorrect
                  ? 'text-success'
                  : 'text-error'

              return (
                <li key={item.id} className={`rounded-xl border p-4 text-left ${tone}`}>
                  <div className="flex items-start gap-3">
                    {item.isOpenEnded ? (
                      <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-text-muted" />
                    ) : item.isCorrect ? (
                      <CheckCircle2 className={`mt-0.5 size-5 shrink-0 ${labelColor}`} />
                    ) : (
                      <XCircle className={`mt-0.5 size-5 shrink-0 ${labelColor}`} />
                    )}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                          Question {item.index + 1}
                        </span>
                        <span className={`text-xs font-semibold ${labelColor}`}>
                          {item.isOpenEnded
                            ? 'Submitted'
                            : item.isCorrect
                              ? 'Correct'
                              : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-6 text-text">{item.question}</p>
                      <p className="text-sm text-text">
                        <span className="text-text-muted">Your answer: </span>
                        {item.answer}
                      </p>
                      {!item.isCorrect && !item.isOpenEnded && (
                        <p className="text-sm text-text">
                          <span className="text-text-muted">Correct answer: </span>
                          {item.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      <div className="flex justify-center pb-4">
        <Link
          to={routes.studentAssignments}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Back to Assignments
        </Link>
      </div>
    </div>
  )
}
