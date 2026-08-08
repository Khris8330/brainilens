import { useState } from 'react'
import { Check, User, Bell, Sliders, Shield, Palette } from 'lucide-react'
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
import { mockChild } from '@/data/mockData'

function useSavedFeedback() {
  const [saved, setSaved] = useState(false)
  function trigger() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  return { saved, trigger }
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <Button onClick={onClick} variant={saved ? 'secondary' : 'primary'}>
      {saved ? (
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

export function SettingsPage() {
  const { user } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const profile = useSavedFeedback()

  const [childName, setChildName] = useState(mockChild.name)
  const [grade, setGrade] = useState(mockChild.grade)
  const childInfo = useSavedFeedback()

  const [emailNotifs, setEmailNotifs] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [assignmentAlerts, setAssignmentAlerts] = useState(false)
  const notifications = useSavedFeedback()

  const [language, setLanguage] = useState('en')
  const [reportFrequency, setReportFrequency] = useState('monthly')
  const preferences = useSavedFeedback()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const security = useSavedFeedback()

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const appearance = useSavedFeedback()

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
        </CardContent>
        <CardFooter>
          <SaveButton saved={profile.saved} onClick={profile.trigger} />
        </CardFooter>
      </Card>

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
          />
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
        </CardContent>
        <CardFooter>
          <SaveButton saved={childInfo.saved} onClick={childInfo.trigger} />
        </CardFooter>
      </Card>

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
        </CardContent>
        <CardFooter>
          <SaveButton saved={notifications.saved} onClick={notifications.trigger} />
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
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Français' },
            ]}
          />
          <Select
            label="Report frequency"
            value={reportFrequency}
            onChange={(e) => setReportFrequency(e.target.value)}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
          />
        </CardContent>
        <CardFooter>
          <SaveButton saved={preferences.saved} onClick={preferences.trigger} />
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
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <SaveButton saved={security.saved} onClick={security.trigger} />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Palette className="size-4 text-secondary" aria-hidden="true" />
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>How Growth Tracker AI looks to you.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(['light', 'dark', 'system'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
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
        </CardContent>
        <CardFooter>
          <SaveButton saved={appearance.saved} onClick={appearance.trigger} />
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
