import { supabase } from '@/lib/supabase'

export interface SubmitAssessmentPayload {
  assignmentId: string
  sectionId: string
  answer: unknown
}

export interface AssessmentSubmissionResult {
  success: boolean
  data: unknown
}

export async function submitAssessment(payload: SubmitAssessmentPayload) {
  const { data, error } = await supabase.functions.invoke<AssessmentSubmissionResult>('submit-assessment', {
    body: payload,
  })
  return { data, error }
}

export function getSubmissionSummary(data: unknown) {
  if (!data || typeof data !== 'object') return null
  const source = data as Record<string, unknown>
  const nested =
    source.data && typeof source.data === 'object'
      ? (source.data as Record<string, unknown>)
      : source
  const score = typeof nested.score === 'number' ? nested.score : null
  const percentage = typeof nested.percentage === 'number' ? nested.percentage : score
  const correct =
    typeof nested.correct === 'number'
      ? nested.correct
      : typeof nested.correctAnswers === 'number'
        ? nested.correctAnswers
        : null
  const total =
    typeof nested.total === 'number'
      ? nested.total
      : typeof nested.totalQuestions === 'number'
        ? nested.totalQuestions
        : null
  const isCorrect =
    typeof nested.isCorrect === 'boolean'
      ? nested.isCorrect
      : typeof nested.is_correct === 'boolean'
        ? nested.is_correct
        : null
  return { score, percentage, correct, total, isCorrect }
}

export const MAX_ASSESSMENT_ATTEMPTS = 3

export interface AssessmentAttemptSummary {
  /** Highest attempt_number used for any section on this learning content */
  maxAttemptUsed: number
  /** Attempts still available for a full re-submit (0–3) */
  remaining: number
  /** Per-section latest attempt number */
  bySection: Record<string, number>
  locked: boolean
}

/** Load attempt usage for this student + learning content (scoped via students.user_id). */
export async function getAssessmentAttemptSummary(
  studentUserId: string,
  learningContentId: string,
): Promise<{ data: AssessmentAttemptSummary | null; error: { message: string } | null }> {
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', studentUserId)
    .maybeSingle()

  if (studentError) return { data: null, error: studentError }
  if (!student?.id) {
    return { data: null, error: { message: 'Student profile not found.' } }
  }

  const { data: rows, error } = await supabase
    .from('student_assessment_attempts')
    .select('section_id, attempt_number')
    .eq('student_id', student.id)
    .eq('learning_content_id', learningContentId)

  if (error) return { data: null, error }

  const bySection: Record<string, number> = {}
  let maxAttemptUsed = 0
  for (const row of rows ?? []) {
    const sectionId = String(row.section_id)
    const n = Number(row.attempt_number ?? 0)
    bySection[sectionId] = Math.max(bySection[sectionId] ?? 0, n)
    maxAttemptUsed = Math.max(maxAttemptUsed, n)
  }

  const remaining = Math.max(0, MAX_ASSESSMENT_ATTEMPTS - maxAttemptUsed)
  return {
    data: {
      maxAttemptUsed,
      remaining,
      bySection,
      locked: remaining <= 0,
    },
    error: null,
  }
}

export function formatAssessmentSubmitError(error: unknown): string {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : typeof error === 'string'
        ? error
        : ''

  if (
    message.includes('MAX_ATTEMPTS_REACHED') ||
    message.toLowerCase().includes('maximum of 3') ||
    message.toLowerCase().includes('max attempts')
  ) {
    return 'You have used all 3 attempts for this assessment. No more submissions are allowed.'
  }
  if (message.includes('ASSIGNMENT_NOT_ASSIGNED')) {
    return 'This assignment is not assigned to your account.'
  }
  if (message.includes('ATTEMPT_CONFLICT')) {
    return 'Another submission was in progress. Please try again.'
  }
  if (message) return message
  return 'We could not submit the assessment. Your answers are still here; please try again.'
}
