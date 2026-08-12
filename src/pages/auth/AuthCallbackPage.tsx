import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    async function completeAuth() {
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }
      const { data } = await supabase.auth.getSession()
      if (!cancelled) {
        navigate(data.session ? '/parent' : '/auth/login', { replace: true })
      }
    }

    void completeAuth()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return <p className="p-8 text-center text-text-muted">Completing sign-in…</p>
}
