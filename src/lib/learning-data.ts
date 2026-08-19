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
    .select('id,status,score,submitted_at,assignments(id,title,description,subject,grade,due_date,difficulty)')
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

async function getStudentId(userId: string) {
  const { data } = await supabase.from('students').select('id').eq('user_id', userId).maybeSingle()
  return data?.id ?? null
}

function mapAssignment(row: Record<string, unknown>): StudentAssignmentRecord {
  const assignment = row.assignments as Record<string, unknown> | null
  return { id: String(row.id), status: row.status as StudentAssignmentRecord['status'], score: row.score as number | null, submittedAt: row.submitted_at as string | null, assignment: assignment ? { id: String(assignment.id), title: String(assignment.title), description: assignment.description as string | null, subject: String(assignment.subject), grade: assignment.grade as string | null, dueDate: assignment.due_date as string | null, difficulty: assignment.difficulty as string | null } : null }
}

function mapAssignmentDetail(row: Record<string, unknown>): StudentAssignmentDetail {
  const record = mapAssignment(row)
  const assignment = row.assignments as Record<string, unknown>
  const content = assignment.learning_content as Record<string, unknown> | null
  return { ...record, assignment: { ...record.assignment!, learningContent: content ? { id: String(content.id), title: String(content.title), description: content.description as string | null, subject: String(content.subject), grade: content.grade as string | null, content: content.content as string | null } : null } }
}

function mapActivity(row: Record<string, unknown>): LearningActivityRecord {
  return { id: String(row.id), activityDate: String(row.activity_date), minutes: Number(row.minutes), lessonsCompleted: Number(row.lessons_completed), assignmentsCompleted: Number(row.assignments_completed) }
}

function mapProgress(row: Record<string, unknown>): StudentProgressRecord {
  const content = row.learning_content as Record<string, unknown> | null
  return { id: String(row.id), progress: Number(row.progress), completed: Boolean(row.completed), score: row.score as number | null, lastActivityAt: row.last_activity_at as string | null, content: content ? { id: String(content.id), title: String(content.title), subject: String(content.subject), description: content.description as string | null } : null }
}

export function formatLearningError(error: { message: string } | null) { return error?.message ? 'Learning data could not be loaded. Please try again.' : '' }
export function formatAssignmentStatus(status: StudentAssignmentRecord['status']) { return status === 'in_progress' ? 'in-progress' : status }
