import { supabase } from '@/lib/supabase'

export interface StudentRecord {
  id: string
  parentId: string
  userId: string | null
  studentId: string
  fullName: string
  firstName: string
  lastName: string
  grade: string
  progress: number
  streakDays: number
}

function mapStudent(row: {
  id: string
  parent_id: string
  user_id: string | null
  student_id: string
  full_name: string
  grade: string | null
}): StudentRecord {
  const parts = row.full_name.trim().split(/\s+/)
  return {
    id: row.id,
    parentId: row.parent_id,
    userId: row.user_id,
    studentId: row.student_id,
    fullName: row.full_name,
    firstName: parts[0] ?? 'Student',
    lastName: parts.slice(1).join(' '),
    grade: row.grade ?? '',
    progress: 0,
    streakDays: 0,
  }
}

export async function getStudentsForParent(parentId: string) {
  const { data, error } = await supabase
    .from('students')
    .select('id, parent_id, user_id, student_id, full_name, grade')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapStudent)
}

export async function getStudentForUser(userId: string) {
  const { data, error } = await supabase
    .from('students')
    .select('id, parent_id, user_id, student_id, full_name, grade')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ? mapStudent(data) : null
}

export { mapStudent }
 export type StudentRow = Parameters<typeof mapStudent>[0]
 
