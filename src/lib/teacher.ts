import { supabase } from '@/lib/supabase'

export const SCHOOL_MAX_STUDENTS = 30

export interface TeacherClassroom {
  id: string
  teacherId: string
  teacherDisplayName: string
  grade: string
  expectedPupils: number
}

export async function getTeacherClassroom(teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_classrooms')
    .select('id, teacher_id, teacher_display_name, grade, expected_pupils')
    .eq('teacher_id', teacherId)
    .maybeSingle()
  if (error) return { data: null as TeacherClassroom | null, error: error.message }
  if (!data) return { data: null, error: null }
  return {
    data: {
      id: String(data.id),
      teacherId: String(data.teacher_id),
      teacherDisplayName: String(data.teacher_display_name),
      grade: String(data.grade),
      expectedPupils: Number(data.expected_pupils ?? 0),
    } satisfies TeacherClassroom,
    error: null as string | null,
  }
}

export async function upsertTeacherClassroom(input: {
  teacherDisplayName: string
  grade: string
  expectedPupils: number
}) {
  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id
  if (!uid) return { data: null, error: 'Not signed in' }

  const payload = {
    teacher_id: uid,
    teacher_display_name: input.teacherDisplayName.trim(),
    grade: input.grade.trim(),
    expected_pupils: Math.min(SCHOOL_MAX_STUDENTS, Math.max(0, input.expectedPupils)),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('teacher_classrooms')
    .upsert(payload, { onConflict: 'teacher_id' })
    .select('id, teacher_id, teacher_display_name, grade, expected_pupils')
    .single()

  if (error) return { data: null, error: error.message }
  return {
    data: {
      id: String(data.id),
      teacherId: String(data.teacher_id),
      teacherDisplayName: String(data.teacher_display_name),
      grade: String(data.grade),
      expectedPupils: Number(data.expected_pupils ?? 0),
    } satisfies TeacherClassroom,
    error: null as string | null,
  }
}

export async function getTeacherStudents(teacherId: string) {
  return supabase
    .from('students')
    .select('id, student_id, full_name, grade, user_id, teacher_id')
    .eq('teacher_id', teacherId)
    .order('full_name')
}
