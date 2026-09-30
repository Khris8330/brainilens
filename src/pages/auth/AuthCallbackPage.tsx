import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { homePathForRole } from '@/lib/auth-roles'
import { supabase } from '@/lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  useEffect(() => {
    let cancelled = false

    async function completeAuth() {
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      const mapped = await refreshUser()
      if (cancelled) return

      if (!mapped) {
        navigate('/auth/login', { replace: true })
        return
      }

      navigate(homePathForRole(mapped.role), { replace: true })
    }

    void completeAuth()
    return () => {
      cancelled = true
    }
  }, [navigate, refreshUser])

  return <p className="p-8 text-center text-text-muted">Completing sign-in…</p>
}
