import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { homePathForRole, isParentRole, isStudentRole } from '@/lib/auth-roles'
import { routes } from '@/routes'

export function LoginPage() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requestedPath =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both an email and a password.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      const mapped = await login(email, password)

      // Parent form must not admit student sessions even if credentials exist.
      if (isStudentRole(mapped.role)) {
        await logout()
        setError('This is a student account. Use Student sign in with your Student ID.')
        return
      }

      if (!isParentRole(mapped.role)) {
        await logout()
        setError('This account cannot use parent sign in.')
        return
      }

      const target =
        requestedPath && !requestedPath.startsWith('/student') && requestedPath.startsWith('/')
          ? requestedPath
          : homePathForRole(mapped.role)

      navigate(target, { replace: true })
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : 'We could not log you in. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-text">Welcome back</h2>
        <p className="mt-1 text-sm text-text-muted">
          Parent / guardian sign in with email and password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-text-muted">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary/30"
              />
              Remember me
            </label>
            <span className="text-text-muted">Email + password</span>
          </div>

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            {!isSubmitting && <LogIn className="size-4" aria-hidden="true" />}
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Student?{' '}
          <Link to={routes.studentLogin} className="font-medium text-primary hover:underline">
            Sign in with Student ID
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <Link to={routes.register} className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
