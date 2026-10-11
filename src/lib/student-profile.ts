import { supabase } from '@/lib/supabase'

export interface AuthenticatedStudent {
  id: string
  studentId: string
  userId: string
  parentId: string
  fullName: string
  grade: string | null
}

export async function getAuthenticatedStudent(userId: string): Promise<AuthenticatedStudent | null> {
  const { data, error } = await supabase
    .from('students')
    .select('id, student_id, user_id, parent_id, full_name, grade')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    studentId: data.student_id,
    userId: data.user_id,
    parentId: data.parent_id,
    fullName: data.full_name,
    grade: data.grade,
  }
}
