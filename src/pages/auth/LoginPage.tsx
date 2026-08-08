import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, LogIn, GraduationCap, Users } from 'lucide-react'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

type LoginRole = 'parent' | 'student' | null

export function LoginPage() {
  const { login, loginAsStudent } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<LoginRole>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [studentId, setStudentId] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTo = (location.state as { from?: { pathname: string } } | null)?.from?.pathname

  function chooseRole(nextRole: Exclude<LoginRole, null>) { setRole(nextRole); setError('') }
  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (role === 'student') {
      if (!studentId.trim() || !pin.trim()) { setError('Please enter your Student ID and PIN.'); return }
      setIsSubmitting(true)
      try { await loginAsStudent(studentId, pin); navigate(redirectTo?.startsWith('/student') ? redirectTo : '/student', { replace: true }) }
      catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : 'Student ID or PIN is incorrect.') }
      finally { setIsSubmitting(false) }
      return
    }
    if (!email.trim() || !password.trim()) { setError('Please enter both an email and a password.'); return }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Please enter a valid email address.'); return }
    setIsSubmitting(true); await login(email, password); navigate(redirectTo?.startsWith('/parent') ? redirectTo : '/parent', { replace: true }); setIsSubmitting(false)
  }
  function fillDemoAccount() { setStudentId('STU-1001'); setPin('1234'); setError('') }

  if (!role) return <Card><CardContent className="p-6 sm:p-8"><h2 className="text-xl font-semibold text-text">Who are you?</h2><p className="mt-1 text-sm text-text-muted">Choose your learning experience to continue.</p><div className="mt-6 grid gap-3"><button type="button" onClick={() => chooseRole('parent')} className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary hover:bg-primary-light"><span className="flex size-11 items-center justify-center rounded-lg bg-primary-light text-primary"><Users className="size-5" /></span><span><strong className="block text-sm text-text">Parent / Guardian</strong><span className="text-xs text-text-muted">Manage your children&apos;s learning progress.</span></span></button><button type="button" onClick={() => chooseRole('student')} className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary hover:bg-primary-light"><span className="flex size-11 items-center justify-center rounded-lg bg-secondary-light text-secondary"><GraduationCap className="size-5" /></span><span><strong className="block text-sm text-text">Student</strong><span className="text-xs text-text-muted">View assignments and learn with your AI companion.</span></span></button></div></CardContent></Card>

  const isStudent = role === 'student'
  return <Card><CardContent className="p-6 sm:p-8"><button type="button" onClick={() => setRole(null)} className="text-sm font-medium text-primary hover:underline">← Choose a different role</button><h2 className="mt-5 text-xl font-semibold text-text">{isStudent ? 'Student login' : 'Welcome back'}</h2><p className="mt-1 text-sm text-text-muted">{isStudent ? 'Your parent or guardian creates your profile and gives you these credentials.' : "Log in to see this week's progress."}</p>{isStudent && <button type="button" onClick={fillDemoAccount} className="mt-4 w-full rounded-lg border border-dashed border-primary/30 bg-primary-light px-3 py-2 text-left text-xs text-primary"><span className="font-semibold">Demo student:</span> STU-1001 · 1234 — tap to autofill</button>}<form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>{isStudent ? <><Input label="Student ID" autoComplete="username" placeholder="STU-1001" value={studentId} onChange={(e) => setStudentId(e.target.value)} /><Input label="PIN" type="password" inputMode="numeric" autoComplete="current-password" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} /></> : <><Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /><Input label="Password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></>}{error && <p className="text-sm text-error" role="alert">{error}</p>}<Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>{!isSubmitting && <LogIn className="size-4" />}Log in</Button>{!isStudent && <><div className="relative py-2 text-center text-xs text-text-muted"><span className="relative bg-surface px-2">or</span><div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" /></div><Button type="button" variant="outline" className="w-full" size="lg" onClick={() => setError('Google sign-in is a demo action in this milestone.')}><Mail className="size-4" />Continue with Google</Button></>}</form>{!isStudent && <p className="mt-6 text-center text-sm text-text-muted">Don&apos;t have an account? <Link to="/auth/register" className="font-medium text-primary hover:underline">Sign up</Link></p>}</CardContent></Card>
}
