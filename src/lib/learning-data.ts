import { supabase } from '@/lib/supabase'

export interface StudentAssignmentRecord {
  id: string
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue'
  score: number | null
  submittedAt: string | null
  assignment: {
    id: string
    title: string
    description: string | null
    subject: string
    grade: string | null
    dueDate: string | null
    difficulty: string | null
    learningContent: LearningContentRecord | null
  } | null
}

export interface StudentAssignmentDetail extends StudentAssignmentRecord {
  assignment: NonNullable<StudentAssignmentRecord['assignment']> & {
    learningContent: {
      id: string
      title: string
      description: string | null
      subject: string
      grade: string | null
      content: string | null
    } | null
  }
}

export interface LearningContentRecord {
  id: string
  title: string
  subject: string
  description: string | null
  content: string | null
}

export async function getLearningContent() {
  const { data, error } = await supabase
    .from('learning_content')
    .select('id,title,subject,description,content')
    .order('title')
  return { data: (data ?? []) as LearningContentRecord[], error }
}

export interface StudentProgressRecord {
  id: string
  progress: number
  completed: boolean
  score: number | null
  lastActivityAt: string | null
  content: { id: string; title: string; subject: string; description: string | null } | null
}

export interface LearningActivityRecord {
  id: string
  activityDate: string
  minutes: number
  lessonsCompleted: number
  assignmentsCompleted: number
}

export async function getStudentAssignments(studentUserId: string) {
  const { data, error } = await supabase
    .from('student_assignments')
    .select('id,status,score,submitted_at,assignments(id,title,description,subject,grade,due_date,difficulty,learning_content(id,title,description,subject,grade,content))')
    .eq('student_id', (await getStudentId(studentUserId)) ?? '')
    .order('created_at', { ascending: false })
  return { data: (data ?? []).map(mapAssignment) as StudentAssignmentRecord[], error }
}

export async function getStudentAssignment(studentUserId: string, studentAssignmentId: string) {
  const studentId = await getStudentId(studentUserId)
  if (!studentId) return { data: null, error: null }

  const { data, error } = await supabase
    .from('student_assignments')
    .select('id,status,score,submitted_at,assignments(id,title,description,subject,grade,due_date,difficulty,learning_content(id,title,description,subject,grade,content))')
    .eq('id', studentAssignmentId)
    .eq('student_id', studentId)
    .maybeSingle()

  return { data: data ? mapAssignmentDetail(data as Record<string, unknown>) : null, error }
}

export async function getStudentProgress(studentUserId: string) {
  const { data, error } = await supabase
    .from('student_progress')
    .select('id,progress,completed,score,last_activity_at,learning_content(id,title,subject,description)')
    .eq('student_id', (await getStudentId(studentUserId)) ?? '')
    .order('updated_at', { ascending: false })
  return { data: (data ?? []).map(mapProgress) as StudentProgressRecord[], error }
}

export async function getStudentActivity(studentUserId: string) {
  const { data, error } = await supabase
    .from('learning_activity')
    .select('id,activity_date,minutes,lessons_completed,assignments_completed')
    .eq('student_id', (await getStudentId(studentUserId)) ?? '')
    .order('activity_date', { ascending: false })
  return { data: (data ?? []).map(mapActivity), error }
}

export async function getParentChildren(parentId: string) {
  return supabase.from('students').select('id,student_id,full_name,grade,user_id,parent_id').eq('parent_id', parentId).order('full_name')
}

export async function getChildAssignments(studentId: string) {
  const { data, error } = await supabase.from('student_assignments').select('id,status,score,submitted_at,assignments(id,title,description,subject,grade,due_date,difficulty)').eq('student_id', studentId).order('created_at', { ascending: false })
  return { data: (data ?? []).map(mapAssignment) as StudentAssignmentRecord[], error }
}

export async function getChildProgress(studentId: string) {
  const { data, error } = await supabase.from('student_progress').select('id,progress,completed,score,last_activity_at,learning_content(id,title,subject,description)').eq('student_id', studentId).order('updated_at', { ascending: false })
  return { data: (data ?? []).map(mapProgress) as StudentProgressRecord[], error }
}

export async function getChildActivity(studentId: string) {
  const { data, error } = await supabase.from('learning_activity').select('id,activity_date,minutes,lessons_completed,assignments_completed').eq('student_id', studentId).order('activity_date', { ascending: false })
  return { data: (data ?? []).map(mapActivity), error }
}

export interface ChildReportSummary {
  assignmentCounts: { completed: number; inProgress: number; pending: number }
  averageScore: number
  subjectPerformance: Array<{ label: string; value: number; color?: string }>
  weeklyActivity: Array<{ label: string; value: number }>
  monthlyTrend: Array<{ label: string; value: number }>
  recentActivity: Array<{ id: string; description: string; timestamp: string }>
}

export async function getChildReportSummary(studentId: string) {
  const { data, error } = await supabase.rpc('get_child_report_summary', { p_student_id: studentId })
  return { data: mapReportSummary(data), error }
}

export interface LearningPlanItemRecord {
  id: string
  studentId: string
  subject: string
  topic: string
  description: string | null
  weekStartDate: string
  status: 'pending' | 'generating' | 'ready' | 'failed'
  generatedAssignmentId: string | null
  errorMessage: string | null
}

export async function getLearningPlanItems(studentId: string) {
  const { data, error } = await supabase
    .from('learning_plan_items')
    .select('id,student_id,subject,topic,description,week_start_date,status,generated_assignment_id,error_message')
    .eq('student_id', studentId)
    .order('week_start_date', { ascending: false })
    .order('created_at', { ascending: false })
  return {
    data: (data ?? []).map((row) => ({
      id: String(row.id),
      studentId: String(row.student_id),
      subject: String(row.subject),
      topic: String(row.topic),
      description: row.description as string | null,
      weekStartDate: String(row.week_start_date),
      status: (row.status as LearningPlanItemRecord['status']) ?? 'pending',
      generatedAssignmentId: row.generated_assignment_id ? String(row.generated_assignment_id) : null,
      errorMessage: row.error_message as string | null,
    })) as LearningPlanItemRecord[],
    error,
  }
}

export async function createLearningPlanItem(
  studentId: string,
  subject: string,
  topic: string,
  description: string,
) {
  return supabase.rpc('create_learning_plan_item', {
    p_student_id: studentId,
    p_subject: subject,
    p_topic: topic,
    p_description: description || null,
    p_week_start_date: new Date().toISOString().slice(0, 10),
  })
}

export async function deleteLearningPlanItem(itemId: string) {
  return supabase.rpc('delete_learning_plan_item', { p_item_id: itemId })
}

export async function getParentAssignments(studentIds: string[]) {
  if (studentIds.length === 0) return { data: [] as StudentAssignmentRecord[], error: null }
  const { data, error } = await supabase
    .from('student_assignments')
    .select(
      'id,status,score,submitted_at,assignments(id,title,description,subject,grade,due_date,difficulty)',
    )
    .in('student_id', studentIds)
    .order('created_at', { ascending: false })
  return { data: (data ?? []).map(mapAssignment) as StudentAssignmentRecord[], error }
}

function mapReportSummary(value: unknown): ChildReportSummary {
  const summary = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const counts = (
    summary.assignmentCounts && typeof summary.assignmentCounts === 'object'
      ? summary.assignmentCounts
      : {}
  ) as Record<string, unknown>
  const toChart = (items: unknown) =>
    Array.isArray(items)
      ? items.map((item, index) => {
          const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
          return {
            label: String(row.label ?? row.subject ?? row.month ?? row.week ?? `Item ${index + 1}`),
            value: Number(row.value ?? row.score ?? row.average ?? 0),
            color: typeof row.color === 'string' ? row.color : undefined,
          }
        })
      : []
  const recent = Array.isArray(summary.recentActivity)
    ? summary.recentActivity.map((item, index) => {
        const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
        return {
          id: String(row.id ?? index),
          description: String(row.description ?? row.activity ?? ''),
          timestamp: String(row.timestamp ?? row.created_at ?? ''),
        }
      })
    : []
  return {
    assignmentCounts: {
      completed: Number(counts.completed ?? 0),
      inProgress: Number(counts.inProgress ?? counts.in_progress ?? 0),
      pending: Number(counts.pending ?? 0),
    },
    averageScore: Number(summary.averageScore ?? summary.average_score ?? 0),
    subjectPerformance: toChart(summary.subjectPerformance),
    weeklyActivity: toChart(summary.weeklyActivity),
    monthlyTrend: toChart(summary.monthlyTrend),
    recentActivity: recent,
  }
}

async function getStudentId(userId: string) {
  const { data } = await supabase.from('students').select('id').eq('user_id', userId).maybeSingle()
  return data?.id ?? null
}

function mapAssignment(row: Record<string, unknown>): StudentAssignmentRecord {
  const assignment = row.assignments as Record<string, unknown> | null
  const content = assignment?.learning_content as Record<string, unknown> | null
  return {
    id: String(row.id),
    status: row.status as StudentAssignmentRecord['status'],
    score: row.score as number | null,
    submittedAt: row.submitted_at as string | null,
    assignment: assignment
      ? {
          id: String(assignment.id),
          title: String(assignment.title),
          description: assignment.description as string | null,
          subject: String(assignment.subject),
          grade: assignment.grade as string | null,
          dueDate: assignment.due_date as string | null,
          difficulty: assignment.difficulty as string | null,
          learningContent: content
            ? {
                id: String(content.id),
                title: String(content.title),
                subject: String(content.subject),
                description: content.description as string | null,
                content: content.content as string | null,
              }
            : null,
        }
      : null,
  }
}

function mapAssignmentDetail(row: Record<string, unknown>): StudentAssignmentDetail {
  const record = mapAssignment(row)
  const assignment = row.assignments as Record<string, unknown>
  const content = assignment.learning_content as Record<string, unknown> | null
  return {
    ...record,
    assignment: {
      ...record.assignment!,
      learningContent: content
        ? {
            id: String(content.id),
            title: String(content.title),
            description: content.description as string | null,
            subject: String(content.subject),
            grade: content.grade as string | null,
            content: content.content as string | null,
          }
        : null,
    },
  }
}

function mapActivity(row: Record<string, unknown>): LearningActivityRecord {
  return {
    id: String(row.id),
    activityDate: String(row.activity_date),
    minutes: Number(row.minutes),
    lessonsCompleted: Number(row.lessons_completed),
    assignmentsCompleted: Number(row.assignments_completed),
  }
}

function mapProgress(row: Record<string, unknown>): StudentProgressRecord {
  const content = row.learning_content as Record<string, unknown> | null
  return {
    id: String(row.id),
    progress: Number(row.progress),
    completed: Boolean(row.completed),
    score: row.score as number | null,
    lastActivityAt: row.last_activity_at as string | null,
    content: content
      ? {
          id: String(content.id),
          title: String(content.title),
          subject: String(content.subject),
          description: content.description as string | null,
        }
      : null,
  }
}

export function formatLearningError(error: { message: string } | null) {
  return error?.message ? 'Learning data could not be loaded. Please try again.' : ''
}
export function formatAssignmentStatus(status: StudentAssignmentRecord['status']) {
  return status === 'in_progress' ? 'in-progress' : status
}

export interface AssessmentReviewPayload {
  title: string
  subject: string
  score: number | null
  items: Array<{
    id: string
    index: number
    question: string
    answer: string
    correctAnswer?: string
    isCorrect: boolean
    isOpenEnded?: boolean
  }>
}

/** Build a question-level review for a learning content item the student has attempted. */
export async function getAssessmentReviewForContent(
  studentUserId: string,
  learningContentId: string,
): Promise<{ data: AssessmentReviewPayload | null; error: { message: string } | null }> {
  const studentId = await getStudentId(studentUserId)
  if (!studentId) {
    return { data: null, error: { message: 'Student profile not found.' } }
  }

  const { data: content, error: contentError } = await supabase
    .from('learning_content')
    .select('id, title, subject, content')
    .eq('id', learningContentId)
    .maybeSingle()

  if (contentError) return { data: null, error: contentError }
  if (!content) return { data: null, error: null }

  const { data: attempts, error: attemptsError } = await supabase
    .from('student_assessment_attempts')
    .select('id, section_id, answer, is_correct, score, attempt_number, attempted_at')
    .eq('student_id', studentId)
    .eq('learning_content_id', learningContentId)
    .order('attempted_at', { ascending: true })

  if (attemptsError) return { data: null, error: attemptsError }
  if (!attempts || attempts.length === 0) return { data: null, error: null }

  const latestBySection = new Map<string, (typeof attempts)[number]>()
  for (const attempt of attempts) {
    const key = String(attempt.section_id)
    const existing = latestBySection.get(key)
    if (!existing || Number(attempt.attempt_number ?? 0) >= Number(existing.attempt_number ?? 0)) {
      latestBySection.set(key, attempt)
    }
  }

  let sections: Array<Record<string, unknown>> = []
  try {
    const parsed =
      typeof content.content === 'string' ? JSON.parse(content.content) : content.content
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { sections?: unknown }).sections)
    ) {
      sections = (parsed as { sections: Array<Record<string, unknown>> }).sections
    }
  } catch {
    sections = []
  }

  const practiceSections = sections.filter(
    (section) => section && typeof section === 'object' && section.type === 'practice',
  )
  const sectionOrder = new Map(practiceSections.map((s, i) => [String(s.id), i]))

  const items = Array.from(latestBySection.entries())
    .map(([sectionId, attempt]) => {
      const section =
        practiceSections.find((s) => String(s.id) === sectionId) ??
        sections.find((s) => String(s.id) === sectionId)

      const question =
        (section && typeof section.question === 'string' && section.question) ||
        (section && typeof section.title === 'string' && section.title) ||
        'Question'

      const correctAnswer =
        section && typeof section.correct_answer === 'string' ? section.correct_answer : undefined

      return {
        id: String(attempt.id),
        index: sectionOrder.get(sectionId) ?? 999,
        question: String(question),
        answer: String(attempt.answer ?? ''),
        correctAnswer,
        isCorrect: Boolean(attempt.is_correct),
        isOpenEnded: false as boolean | undefined,
      }
    })
    .sort((a, b) => a.index - b.index)
    .map((item, index) => ({ ...item, index }))

  const scored = items.filter((item) => !item.isOpenEnded)
  const correct = scored.filter((item) => item.isCorrect).length
  const score = scored.length > 0 ? Math.round((correct / scored.length) * 100) : null

  return {
    data: {
      title: String(content.title ?? 'Assessment review'),
      subject: String(content.subject ?? ''),
      score,
      items,
    },
    error: null,
  }
}
