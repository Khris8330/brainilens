import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, LogIn } from 'lucide-react'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { routes } from '@/routes'

const invalidCredentialsMessage = 'Invalid Student ID or password.'

export function StudentLoginPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    const normalizedStudentId = studentId.trim().toUpperCase()
    if (!/^STU-[A-Z0-9]{6}$/.test(normalizedStudentId) || !password) {
      setError(invalidCredentialsMessage)
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error: functionError } = await supabase.functions.invoke('student-login', {
        body: { student_id: normalizedStudentId, password },
      })
      if (functionError || !data?.session?.access_token || !data?.session?.refresh_token) {
        throw new Error(invalidCredentialsMessage)
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
      if (sessionError) throw new Error(invalidCredentialsMessage)

      // Ensure AuthContext has mapped the student before navigating
      const mapped = await refreshUser()
      if (!mapped || mapped.role !== 'student') {
        throw new Error(invalidCredentialsMessage)
      }

      navigate(routes.student, { replace: true })
    } catch {
      setError(invalidCredentialsMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-secondary-light text-secondary">
            <GraduationCap className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text">Student sign in</h2>
            <p className="text-sm text-text-muted">Sign in to your BrainiLens student account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Student ID"
            type="text"
            autoComplete="username"
            placeholder="STU-ABC123"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value.toUpperCase())}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            {!isSubmitting && <LogIn className="size-4" aria-hidden="true" />}
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Need a different sign-in path?{' '}
          <Link to={routes.roleSelection} className="font-medium text-primary hover:underline">
            Choose a role
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
