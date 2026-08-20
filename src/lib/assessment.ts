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
  const nested = source.data && typeof source.data === 'object' ? source.data as Record<string, unknown> : source
  const score = typeof nested.score === 'number' ? nested.score : null
  const percentage = typeof nested.percentage === 'number' ? nested.percentage : score
  const correct = typeof nested.correct === 'number' ? nested.correct : typeof nested.correctAnswers === 'number' ? nested.correctAnswers : null
  const total = typeof nested.total === 'number' ? nested.total : typeof nested.totalQuestions === 'number' ? nested.totalQuestions : null
  const isCorrect = typeof nested.isCorrect === 'boolean' ? nested.isCorrect : typeof nested.is_correct === 'boolean' ? nested.is_correct : null
  return { score, percentage, correct, total, isCorrect }
}
