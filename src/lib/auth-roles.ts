import type { User } from '@/types'
import { routes } from '@/routes'

export function isStudentRole(role: User['role'] | null | undefined): boolean {
  return role === 'student' || role === 'child'
}

export function isParentRole(role: User['role'] | null | undefined): boolean {
  return role === 'parent' || role === 'admin'
}

export function homePathForRole(role: User['role'] | null | undefined): string {
  if (isStudentRole(role)) return routes.student
  if (isParentRole(role)) return routes.parent
  return routes.roleSelection
}
