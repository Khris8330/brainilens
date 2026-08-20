export type LessonSectionType = 'introduction' | 'explanation' | 'example' | 'practice' | 'summary'

export type AssessmentType = 'multiple_choice' | 'true_false' | 'numeric' | 'short_answer' | 'open_ended'

export interface LessonAssessment {
  type: AssessmentType
  correctAnswer?: string | number | boolean
  tolerance?: number
  acceptedAnswers?: string[]
}

export interface LessonSection {
  id: string
  type: LessonSectionType
  title: string
  content: string
  question?: string
  options?: string[]
  correct_answer?: string
  explanation?: string
  assessment?: LessonAssessment
}

export interface ParsedLessonContent {
  version: number
  lesson_type: string
  estimated_minutes: number | null
  sections: LessonSection[]
}

export function parseLessonContent(raw: string | null | undefined): { lesson: ParsedLessonContent | null; error: string | null } {
  if (!raw?.trim()) return { lesson: null, error: null }
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || !Array.isArray(value.sections)) return { lesson: null, error: 'This lesson content is not in a supported format.' }
    const sections = value.sections.filter(isLessonSection)
    return { lesson: { version: Number(value.version) || 1, lesson_type: String(value.lesson_type ?? 'lesson'), estimated_minutes: toMinutes(value.estimated_minutes), sections }, error: null }
  } catch {
    return { lesson: null, error: 'This lesson content could not be read.' }
  }
}

export function getAssessableSections(lesson: ParsedLessonContent) {
  return lesson.sections.filter((section) => section.type === 'practice' && Boolean(section.assessment))
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null }
function toMinutes(value: unknown) { const minutes = Number(value); return Number.isFinite(minutes) && minutes > 0 ? minutes : null }
function isAssessment(value: unknown): value is LessonAssessment {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  const types: AssessmentType[] = ['multiple_choice', 'true_false', 'numeric', 'short_answer', 'open_ended']
  return types.includes(value.type as AssessmentType)
}
function isLessonSection(value: unknown): value is LessonSection {
  if (!isRecord(value)) return false
  const types: LessonSectionType[] = ['introduction', 'explanation', 'example', 'practice', 'summary']
  if (typeof value.id !== 'string' || !types.includes(value.type as LessonSectionType) || typeof value.title !== 'string' || typeof value.content !== 'string') return false
  if (value.options !== undefined && (!Array.isArray(value.options) || !value.options.every((item) => typeof item === 'string'))) return false
  if (value.assessment !== undefined && !isAssessment(value.assessment)) return false
  return true
}
