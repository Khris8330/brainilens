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
import { getAuthenticatedStudent } from '@/lib/student-profile'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Call after student-login setSession so user is mapped before navigate */
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function mapUser(session: Session | null): Promise<User | null> {
  const authUser = session?.user
  if (!authUser) return null

  const [{ data: profile }, student] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', authUser.id)
      .maybeSingle(),
    getAuthenticatedStudent(authUser.id),
  ])

  const role = student
    ? 'student'
    : profile?.role === 'admin'
      ? 'admin'
      : profile?.role === 'child'
        ? 'child'
        : profile?.role === 'parent'
          ? 'parent'
          : null

  if (!role) return null

  return {
    id: authUser.id,
    name: student?.fullName ?? profile?.full_name ?? authUser.user_metadata?.full_name ?? 'User',
    email: profile?.email ?? authUser.email ?? '',
    avatarUrl: undefined,
    role,
    studentId: student?.studentId,
    grade: student?.grade,
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

  async function login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw new Error(authErrorMessage(error))

    // Map user immediately so navigate does not race with onAuthStateChange
    const mapped = await mapUser(data.session)
    if (!mapped) {
      throw new Error('We could not load your profile. Please try again.')
    }
    setUser(mapped)
    setIsLoading(false)
    return mapped
  }

  async function refreshUser(): Promise<User | null> {
    const { data } = await supabase.auth.getSession()
    const mapped = await mapUser(data.session)
    setUser(mapped)
    setIsLoading(false)
    return mapped
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
    if (!data.session) {
      throw new Error(
        'Account created. Check your email to confirm your account before logging in.',
      )
    }
    const mapped = await mapUser(data.session)
    if (mapped) {
      setUser(mapped)
      setIsLoading(false)
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error('We could not log you out. Please try again.')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
