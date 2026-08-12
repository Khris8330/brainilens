import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      navigate(data.session ? '/parent' : '/auth/login', { replace: true })
    })
  }, [navigate])

  return <p className="p-8 text-center text-text-muted">Completing sign-in…</p>
}
