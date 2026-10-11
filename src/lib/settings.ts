import { supabase } from '@/lib/supabase'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ReportFrequency = 'weekly' | 'monthly' | 'quarterly'

export interface UserSettings {
  userId: string
  emailNotifications: boolean
  weeklyProgressDigest: boolean
  assignmentDueAlerts: boolean
  language: string
  reportFrequency: ReportFrequency
  theme: ThemePreference
}

const DEFAULTS: Omit<UserSettings, 'userId'> = {
  emailNotifications: true,
  weeklyProgressDigest: true,
  assignmentDueAlerts: false,
  language: 'en',
  reportFrequency: 'monthly',
  theme: 'system',
}

function mapSettings(row: Record<string, unknown> | null, userId: string): UserSettings {
  if (!row) return { userId, ...DEFAULTS }
  return {
    userId,
    emailNotifications: Boolean(row.email_notifications ?? DEFAULTS.emailNotifications),
    weeklyProgressDigest: Boolean(row.weekly_progress_digest ?? DEFAULTS.weeklyProgressDigest),
    assignmentDueAlerts: Boolean(row.assignment_due_alerts ?? DEFAULTS.assignmentDueAlerts),
    language: String(row.language ?? DEFAULTS.language),
    reportFrequency: (row.report_frequency as ReportFrequency) ?? DEFAULTS.reportFrequency,
    theme: (row.theme as ThemePreference) ?? DEFAULTS.theme,
  }
}

export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select(
      'user_id,email_notifications,weekly_progress_digest,assignment_due_alerts,language,report_frequency,theme',
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return { data: null as UserSettings | null, error }
  return { data: mapSettings(data as Record<string, unknown> | null, userId), error: null }
}

export async function upsertUserSettings(
  userId: string,
  patch: Partial<Omit<UserSettings, 'userId'>>,
) {
  const payload = {
    user_id: userId,
    email_notifications: patch.emailNotifications,
    weekly_progress_digest: patch.weeklyProgressDigest,
    assignment_due_alerts: patch.assignmentDueAlerts,
    language: patch.language,
    report_frequency: patch.reportFrequency,
    theme: patch.theme,
  }

  // Drop undefined keys so we don't overwrite with null
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined),
  )

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(cleaned, { onConflict: 'user_id' })
    .select(
      'user_id,email_notifications,weekly_progress_digest,assignment_due_alerts,language,report_frequency,theme',
    )
    .single()

  if (error) return { data: null as UserSettings | null, error }
  return { data: mapSettings(data as Record<string, unknown>, userId), error: null }
}

export async function updateProfile(userId: string, fullName: string, email: string) {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim(), email: email.trim() })
    .eq('id', userId)

  if (profileError) return { error: profileError }

  // Keep auth email in sync when it changed (may require confirmation depending on project settings)
  const { data: sessionData } = await supabase.auth.getUser()
  const currentEmail = sessionData.user?.email ?? ''
  if (email.trim() && email.trim().toLowerCase() !== currentEmail.toLowerCase()) {
    const { error: authError } = await supabase.auth.updateUser({ email: email.trim() })
    if (authError) return { error: authError }
  }

  return { error: null }
}

export async function updateChildInfo(
  studentId: string,
  fullName: string,
  grade: string,
) {
  const { error } = await supabase
    .from('students')
    .update({ full_name: fullName.trim(), grade: grade.trim() || null })
    .eq('id', studentId)
  return { error }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user?.email) {
    return { error: userError ?? new Error('Not signed in') }
  }

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword,
  })
  if (signInError) {
    return { error: new Error('Current password is incorrect.') }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error: error ? new Error(error.message) : null }
}

/** Apply theme to <html> and persist locally for fast boot. */
export function applyTheme(theme: ThemePreference) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
  root.classList.toggle('dark', resolved === 'dark')
  root.dataset.theme = resolved
  try {
    localStorage.setItem('brainilens-theme', theme)
  } catch {
    /* ignore */
  }
}

export function readStoredTheme(): ThemePreference {
  try {
    const v = localStorage.getItem('brainilens-theme')
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* ignore */
  }
  return 'system'
}
