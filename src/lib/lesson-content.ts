export type LessonSectionType = 'introduction' | 'explanation' | 'example' | 'practice' | 'summary'

export interface LessonSection {
  id: string
  type: LessonSectionType
  title: string
  content: string
  question?: string
  options?: string[]
  correct_answer?: string
  explanation?: string
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

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null }
function toMinutes(value: unknown) { const minutes = Number(value); return Number.isFinite(minutes) && minutes > 0 ? minutes : null }
function isLessonSection(value: unknown): value is LessonSection {
  if (!isRecord(value)) return false
  const types: LessonSectionType[] = ['introduction', 'explanation', 'example', 'practice', 'summary']
  return typeof value.id === 'string' && types.includes(value.type as LessonSectionType) && typeof value.title === 'string' && typeof value.content === 'string'
}
