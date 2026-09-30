import { useCallback, useEffect, useState } from 'react'
import { Check, User, Bell, Sliders, Shield, Palette, Loader2, Trash2 } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Select,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { getParentChildren } from '@/lib/learning-data'
import {
  applyTheme,
  changePassword,
  getUserSettings,
  readStoredTheme,
  updateChildInfo,
  updateProfile,
  upsertUserSettings,
  type ReportFrequency,
  type ThemePreference,
} from '@/lib/settings'

function SaveButton({
  saved,
  loading,
  onClick,
  disabled,
}: {
  saved: boolean
  loading?: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Button
      onClick={onClick}
      variant={saved ? 'secondary' : 'primary'}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Saving
        </>
      ) : saved ? (
        <>
          <Check className="size-4" aria-hidden="true" />
          Saved
        </>
      ) : (
        'Save changes'
      )}
    </Button>
  )
}

function SectionError({ message }: { message: string | null }) {
  if (!message) return null
  return <p className="text-sm text-error">{message}</p>
}

function useSectionSave() {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (action: () => Promise<void>) => {
    setLoading(true)
    setError(null)
    try {
      await action()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { saved, loading, error, run, setError }
}

export function SettingsPage() {
  const { user, refreshUser } = useAuth()

  const [loading, setLoading] = useState(true)

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const profileSave = useSectionSave()

  const [studentRowId, setStudentRowId] = useState<string | null>(null)
  const [childName, setChildName] = useState('')
  const [grade, setGrade] = useState('2nd Grade')
  const childSave = useSectionSave()

  const [emailNotifs, setEmailNotifs] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [assignmentAlerts, setAssignmentAlerts] = useState(false)
  const notificationsSave = useSectionSave()

  const [language, setLanguage] = useState('en')
  const [reportFrequency, setReportFrequency] = useState<ReportFrequency>('monthly')
  const preferencesSave = useSectionSave()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const securitySave = useSectionSave()

  const [theme, setTheme] = useState<ThemePreference>(readStoredTheme())
  const appearanceSave = useSectionSave()

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setName(user.name ?? '')
      setEmail(user.email ?? '')

      const [{ data: settings }, childrenResult] = await Promise.all([
        getUserSettings(user.id),
        user.role === 'parent'
          ? getParentChildren(user.id)
          : Promise.resolve({ data: null, error: null }),
      ])

      if (cancelled) return

      if (settings) {
        setEmailNotifs(settings.emailNotifications)
        setWeeklyDigest(settings.weeklyProgressDigest)
        setAssignmentAlerts(settings.assignmentDueAlerts)
        setLanguage(settings.language)
        setReportFrequency(settings.reportFrequency)
        setTheme(settings.theme)
        applyTheme(settings.theme)
      }

      const children = (childrenResult.data ?? []) as Array<{
        id: string
        full_name: string
        grade: string | null
      }>
      if (children.length > 0) {
        const first = children[0]
        setStudentRowId(first.id)
        setChildName(first.full_name ?? '')
        setGrade(first.grade || '2nd Grade')
      }

      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id, user?.name, user?.email, user?.role])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-text-muted">
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        <span className="ml-2 text-sm">Loading settings…</span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your account, child profile, and preferences.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <User className="size-4 text-primary" aria-hidden="true" />
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <SectionError message={profileSave.error} />
        </CardContent>
        <CardFooter>
          <SaveButton
            saved={profileSave.saved}
            loading={profileSave.loading}
            onClick={() =>
              profileSave.run(async () => {
                if (!user?.id) throw new Error('Not signed in')
                if (!name.trim()) throw new Error('Full name is required.')
                if (!email.trim()) throw new Error('Email is required.')
                const { error } = await updateProfile(user.id, name, email)
                if (error) throw new Error(error.message)
                await refreshUser()
              })
            }
          />
        </CardFooter>
      </Card>

      {user?.role === 'parent' && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="size-4 text-secondary" aria-hidden="true" />
            <div>
              <CardTitle>Child information</CardTitle>
              <CardDescription>Details used across the dashboard.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Child's name"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              disabled={!studentRowId}
            />
            <Select
              label="Grade level"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={!studentRowId}
              options={[
                { value: '2nd Grade', label: '2nd Grade' },
                { value: '3rd Grade', label: '3rd Grade' },
                { value: '4th Grade', label: '4th Grade' },
                { value: '5th Grade', label: '5th Grade' },
                { value: '6th Grade', label: '6th Grade' },
              ]}
            />
            {!studentRowId && (
              <p className="text-sm text-text-muted">
                No child profile found yet. Create one from Weekly Learning or the parent
                dashboard first.
              </p>
            )}
            <SectionError message={childSave.error} />
          </CardContent>
          <CardFooter>
            <SaveButton
              saved={childSave.saved}
              loading={childSave.loading}
              disabled={!studentRowId}
              onClick={() =>
                childSave.run(async () => {
                  if (!studentRowId) throw new Error('No child profile to update.')
                  if (!childName.trim()) throw new Error("Child's name is required.")
                  const { error } = await updateChildInfo(studentRowId, childName, grade)
                  if (error) throw new Error(error.message)
                })
              }
            />
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="size-4 text-accent-hover" aria-hidden="true" />
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what you want to hear about.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            label="Email notifications"
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <ToggleRow
            label="Weekly progress digest"
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
          />
          <ToggleRow
            label="Assignment due-date alerts"
            checked={assignmentAlerts}
            onChange={setAssignmentAlerts}
          />
          <SectionError message={notificationsSave.error} />
        </CardContent>
        <CardFooter>
          <SaveButton
            saved={notificationsSave.saved}
            loading={notificationsSave.loading}
            onClick={() =>
              notificationsSave.run(async () => {
                if (!user?.id) throw new Error('Not signed in')
                const { error } = await upsertUserSettings(user.id, {
                  emailNotifications: emailNotifs,
                  weeklyProgressDigest: weeklyDigest,
                  assignmentDueAlerts: assignmentAlerts,
                })
                if (error) throw new Error(error.message)
              })
            }
          />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Sliders className="size-4 text-primary" aria-hidden="true" />
          <div>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>General app preferences.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'French' },
              { value: 'es', label: 'Spanish' },
            ]}
          />
          <Select
            label="Report frequency"
            value={reportFrequency}
            onChange={(e) => setReportFrequency(e.target.value as ReportFrequency)}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
            ]}
          />
          <SectionError message={preferencesSave.error} />
        </CardContent>
        <CardFooter>
          <SaveButton
            saved={preferencesSave.saved}
            loading={preferencesSave.loading}
            onClick={() =>
              preferencesSave.run(async () => {
                if (!user?.id) throw new Error('Not signed in')
                const { error } = await upsertUserSettings(user.id, {
                  language,
                  reportFrequency,
                })
                if (error) throw new Error(error.message)
              })
            }
          />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield className="size-4 text-error" aria-hidden="true" />
          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <SectionError message={securitySave.error} />
        </CardContent>
        <CardFooter>
          <SaveButton
            saved={securitySave.saved}
            loading={securitySave.loading}
            onClick={() =>
              securitySave.run(async () => {
                if (!currentPassword) throw new Error('Enter your current password.')
                if (newPassword.length < 8) {
                  throw new Error('New password must be at least 8 characters.')
                }
                const { error } = await changePassword(currentPassword, newPassword)
                if (error) throw error
                setCurrentPassword('')
                setNewPassword('')
              })
            }
          />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Palette className="size-4 text-primary" aria-hidden="true" />
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>How brainilens looks to you.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTheme(option)
                  applyTheme(option)
                }}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  theme === option
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border text-text-muted hover:bg-background'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <SectionError message={appearanceSave.error} />
        </CardContent>
        <CardFooter>
          <SaveButton
            saved={appearanceSave.saved}
            loading={appearanceSave.loading}
            onClick={() =>
              appearanceSave.run(async () => {
                if (!user?.id) throw new Error('Not signed in')
                applyTheme(theme)
                const { error } = await upsertUserSettings(user.id, { theme })
                if (error) throw new Error(error.message)
              })
            }
          />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Trash2 className="size-4 text-error" aria-hidden="true" />
          <div>
            <CardTitle>Account &amp; data</CardTitle>
            <CardDescription>
              Request deletion of your parent account and linked child learning data.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-text-muted">
          <p>
            Under our retention policy, a verified deletion request removes your profile, linked
            student profiles, assignments, progress, and assessment history for children under this
            account. Processing is completed within 30 days.
          </p>
          <p>
            To request deletion, email{' '}
            <a
              className="font-medium text-primary hover:underline"
              href="mailto:privacy@brainilens.app?subject=Account%20deletion%20request"
            >
              privacy@brainilens.app
            </a>{' '}
            from the same address on your account, or use the button below to open a pre-filled
            message.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => {
              const subject = encodeURIComponent('brainilens account deletion request')
              const body = encodeURIComponent(
                `Please delete my brainilens parent account and all linked child learning data.\n\nAccount email: ${user?.email ?? ''}\nFull name: ${user?.name ?? ''}\n\nI confirm I am the account owner.`,
              )
              window.location.href = `mailto:privacy@brainilens.app?subject=${subject}&body=${body}`
            }}
          >
            Request account deletion
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm text-text">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-border text-primary focus:ring-primary/30"
      />
    </label>
  )
}
