import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import type { CreatedStudentCredentials } from '@/lib/students'

export function StudentCredentialsPanel({
  credentials,
  onDismiss,
  title = 'Save these credentials now',
}: {
  credentials: CreatedStudentCredentials
  onDismiss?: () => void
  title?: string
}) {
  const [copied, setCopied] = useState<'id' | 'password' | 'both' | null>(null)

  async function copy(text: string, key: 'id' | 'password' | 'both') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* ignore */
    }
  }

  const both = `Student ID: ${credentials.studentId}\nPassword: ${credentials.temporaryPassword}`

  return (
    <Card className="border-primary/40 bg-primary-light/30">
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            This is the <strong className="text-text">only time</strong> the full password is shown.
            It cannot be viewed again later. You can only generate a new one from the child&apos;s
            settings page.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CredentialRow
            label="Student ID"
            value={credentials.studentId}
            copied={copied === 'id' || copied === 'both'}
            onCopy={() => void copy(credentials.studentId, 'id')}
          />
          <CredentialRow
            label="Password"
            value={credentials.temporaryPassword}
            copied={copied === 'password' || copied === 'both'}
            onCopy={() => void copy(credentials.temporaryPassword, 'password')}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void copy(both, 'both')}
          >
            {copied === 'both' ? (
              <>
                <Check className="size-4" /> Copied both
              </>
            ) : (
              <>
                <Copy className="size-4" /> Copy both
              </>
            )}
          </Button>
          {onDismiss && (
            <Button type="button" size="sm" onClick={onDismiss}>
              I have saved these
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CredentialRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs text-text-muted">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <code className="break-all text-sm font-semibold text-text">{value}</code>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text-muted hover:text-text"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
