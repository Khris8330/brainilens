import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import type { User } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function mapUser(session: Session | null): Promise<User | null> {
  const authUser = session?.user
  if (!authUser) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url, role')
    .eq('id', authUser.id)
    .maybeSingle()

  return {
    id: authUser.id,
    name: profile?.full_name ?? authUser.user_metadata?.full_name ?? 'Parent',
    email: profile?.email ?? authUser.email ?? '',
    avatarUrl: profile?.avatar_url ?? undefined,
    role:
      profile?.role === 'admin'
        ? 'admin'
        : profile?.role === 'student'
          ? 'student'
          : profile?.role === 'child'
            ? 'child'
            : 'parent',
  }
}

function authErrorMessage(error: { message: string }) {
  const message = error.message.toLowerCase()
  if (message.includes('invalid login credentials') || message.includes('user already registered')) {
    return 'Invalid email or password.'
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email before logging in.'
  }
  if (message.includes('password')) return 'Please choose a stronger password.'
  if (message.includes('rate limit')) return 'Too many attempts. Please try again later.'
  return 'We could not complete that request. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (mounted) {
        setUser(await mapUser(data.session))
        setIsLoading(false)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void mapUser(session).then((nextUser) => {
        if (mounted) {
          setUser(nextUser)
          setIsLoading(false)
        }
      })
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error(authErrorMessage(error))
  }

  async function register(fullName: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), role: 'parent' },
        emailRedirectTo:
          import.meta.env.VITE_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw new Error(authErrorMessage(error))
    if (!data.session) throw new Error('Account created. Check your email to confirm your account before logging in.')
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error('We could not log you out. Please try again.')
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
