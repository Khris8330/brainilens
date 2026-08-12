import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? '/parent'

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
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'We could not log you in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-text">Welcome back</h2>
        <p className="mt-1 text-sm text-text-muted">
          Log in to see this week&apos;s progress.
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
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() =>
                setError('Password reset is a demo action in this milestone.')
              }
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
          >
            {!isSubmitting && <LogIn className="size-4" aria-hidden="true" />}
            Log in
          </Button>

          <div className="relative py-2 text-center text-xs text-text-muted">
            <span className="relative bg-surface px-2">or</span>
            <div
              className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border"
              aria-hidden="true"
            />
          </div>

        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <Link
            to="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
