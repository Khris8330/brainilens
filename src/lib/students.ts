import { supabase } from '@/lib/supabase'

export interface CreatedStudentCredentials {
  studentRowId?: string
  studentId: string
  fullName: string
  grade: string
  temporaryPassword: string
}

export async function createStudent(fullName: string, grade: string) {
  const { data, error } = await supabase.functions.invoke('create-student', {
    body: { full_name: fullName.trim(), grade: grade.trim() },
  })

  if (error) {
    return { data: null as CreatedStudentCredentials | null, error: error.message }
  }

  if (data?.error) {
    return {
      data: null as CreatedStudentCredentials | null,
      error: typeof data.error === 'string' ? data.error : 'Unable to create student',
    }
  }

  const student = data?.student
  const password = data?.temporary_credential
  if (!student?.student_id || typeof password !== 'string') {
    return { data: null as CreatedStudentCredentials | null, error: 'Unexpected create-student response' }
  }

  return {
    data: {
      studentRowId: student.id ? String(student.id) : undefined,
      studentId: String(student.student_id),
      fullName: String(student.full_name ?? fullName),
      grade: String(student.grade ?? grade),
      temporaryPassword: password,
    } satisfies CreatedStudentCredentials,
    error: null as string | null,
  }
}

export async function regenerateStudentPassword(studentRowId: string) {
  const { data, error } = await supabase.functions.invoke('regenerate-student-password', {
    body: { student_row_id: studentRowId },
  })

  if (error) {
    return { data: null as CreatedStudentCredentials | null, error: error.message }
  }
  if (data?.error) {
    return {
      data: null as CreatedStudentCredentials | null,
      error: typeof data.error === 'string' ? data.error : 'Unable to regenerate password',
    }
  }

  const student = data?.student
  const password = data?.temporary_credential
  if (!student?.student_id || typeof password !== 'string') {
    return { data: null as CreatedStudentCredentials | null, error: 'Unexpected regenerate response' }
  }

  return {
    data: {
      studentRowId: student.id ? String(student.id) : studentRowId,
      studentId: String(student.student_id),
      fullName: String(student.full_name ?? ''),
      grade: '',
      temporaryPassword: password,
    } satisfies CreatedStudentCredentials,
    error: null as string | null,
  }
}
