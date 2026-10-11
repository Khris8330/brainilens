import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { routes } from '@/routes'

const CONSENT_VERSION = '2026-09'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const accountRole: 'parent' | 'teacher' =
    (location.state as { role?: string } | null)?.role === 'teacher' ? 'teacher' : 'parent'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [parentalConsent, setParentalConsent] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in every field.')
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
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (accountRole === 'parent' && !parentalConsent) {
      setError('Please confirm parental consent before creating an account.')
      return
    }

    setIsSubmitting(true)
    try {
      await register(fullName, email, password, accountRole === 'parent' ? parentalConsent : true, accountRole)
      navigate(accountRole === 'teacher' ? routes.teacher : routes.parent, { replace: true })
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : 'We could not create your account. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-text">
          {accountRole === 'teacher' ? 'Create teacher account' : 'Create your account'}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          {accountRole === 'teacher'
            ? 'School plan: register your class and manage up to 30 students.'
            : "Free for your first child's profile. No credit card required."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Jordan Lee"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {accountRole === 'parent' && (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-border text-primary focus:ring-primary/30"
                checked={parentalConsent}
                onChange={(e) => setParentalConsent(e.target.checked)}
                required
              />
              <span className="text-sm leading-6 text-text">
                I am a parent or legal guardian. I consent to brainilens collecting and processing
                learning data for my child under 13 solely to provide educational features, progress
                tracking, and parental insights, as described in the{' '}
                <Link to={routes.privacy} className="font-medium text-primary hover:underline">
                  Privacy Policy
                </Link>
                . Consent version {CONSENT_VERSION}.
              </span>
            </label>
          )}

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            {!isSubmitting && <UserPlus className="size-4" aria-hidden="true" />}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to={routes.roleSelection} className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
