import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, KeyRound, Loader2, User } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Select,
} from '@/components/ui'
import { StudentCredentialsPanel } from '@/components/parent/StudentCredentialsPanel'
import { useAuth } from '@/contexts/AuthContext'
import { getParentChildren } from '@/lib/learning-data'
import { regenerateStudentPassword, type CreatedStudentCredentials } from '@/lib/students'
import { updateChildInfo } from '@/lib/settings'
import { routes } from '@/routes'

export function ChildSettingsPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('2nd Grade')
  const [studentLoginId, setStudentLoginId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [credentials, setCredentials] = useState<CreatedStudentCredentials | null>(null)

  useEffect(() => {
    if (!user?.id || !studentId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const { data, error: childError } = await getParentChildren(user.id)
      if (cancelled) return
      if (childError) {
        setError('Could not load this child profile.')
        setLoading(false)
        return
      }
      const child = (data ?? []).find((row) => row.id === studentId)
      if (!child) {
        setError('Child not found for this account.')
        setLoading(false)
        return
      }
      setName(child.full_name ?? '')
      setGrade(child.grade || '2nd Grade')
      setStudentLoginId(child.student_id ?? '')
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id, studentId])

  async function handleSave() {
    if (!studentId) return
    setSaving(true)
    setError('')
    const { error: updateError } = await updateChildInfo(studentId, name, grade)
    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleRegenerate() {
    if (!studentId) return
    const confirmed = window.confirm(
      'Generate a new password for this student? The old password will stop working immediately.',
    )
    if (!confirmed) return
    setRegenerating(true)
    setError('')
    setCredentials(null)
    const { data, error: regenError } = await regenerateStudentPassword(studentId)
    setRegenerating(false)
    if (regenError || !data) {
      setError(regenError ?? 'Could not regenerate password.')
      return
    }
    setCredentials(data)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-text-muted">
        <Loader2 className="size-6 animate-spin" />
        <span className="ml-2 text-sm">Loading child settings…</span>
      </div>
    )
  }

  if (error && !name) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <EmptyState title="Child settings unavailable" description={error} />
        <div className="text-center">
          <Link to={routes.settings} className="text-sm font-medium text-primary hover:underline">
            Back to Settings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to={routes.settings}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft className="size-4" />
          Back to Settings
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-text">Child settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Profile and login credentials for this child only.
        </p>
      </div>

      {credentials && (
        <StudentCredentialsPanel
          credentials={credentials}
          title="New password generated"
          onDismiss={() => setCredentials(null)}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <User className="size-4 text-primary" />
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Name and grade for this child.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select
            label="Grade level"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            options={[
              { value: '2nd Grade', label: '2nd Grade' },
              { value: '3rd Grade', label: '3rd Grade' },
              { value: '4th Grade', label: '4th Grade' },
              { value: '5th Grade', label: '5th Grade' },
              { value: '6th Grade', label: '6th Grade' },
            ]}
          />
          <div className="rounded-lg border border-border bg-background p-3 text-sm">
            <p className="text-xs text-text-muted">Student ID</p>
            <p className="mt-1 font-semibold text-text">{studentLoginId || '-'}</p>
            <p className="mt-1 text-xs text-text-muted">
              Student ID does not change. Only the password can be regenerated.
            </p>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save profile'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <KeyRound className="size-4 text-error" />
          <div>
            <CardTitle>Student password</CardTitle>
            <CardDescription>
              Issues a new random password and invalidates the old one immediately. The new password
              is shown only once.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-text-muted">
          We never store a recoverable copy of the student password. Regeneration is logged for your
          account security history.
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => void handleRegenerate()} disabled={regenerating}>
            {regenerating ? 'Generating…' : 'Regenerate password'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
