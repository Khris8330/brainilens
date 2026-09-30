import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingOverlay } from '@/components/ui'
import { homePathForRole, isParentRole, isStudentRole } from '@/lib/auth-roles'

/**
 * Protects routes using the real Supabase session via AuthContext.
 * Parent-only and student-only trees are strictly separated by role.
 */
export function RequireAuth({
  children,
  role,
}: {
  children: ReactNode
  role?: 'parent' | 'student'
}) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingOverlay label="Loading your dashboard" />

  if (!user) {
    return <Navigate to="/auth/role" replace state={{ from: location }} />
  }

  if (role === 'parent' && !isParentRole(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  if (role === 'student' && !isStudentRole(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return <>{children}</>
}
