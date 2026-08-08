import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingOverlay } from '@/components/ui'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingOverlay label="Loading your dashboard" />
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
