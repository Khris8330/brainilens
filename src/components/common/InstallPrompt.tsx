import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui'

const DISMISS_KEY = 'brainilens-install-dismissed'

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<{ prompt: () => Promise<void> } | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch {
      // ignore storage errors
    }

    if (isIosDevice()) {
      setIosHint(true)
      setVisible(true)
      return
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      const e = event as Event & { prompt?: () => Promise<void> }
      if (typeof e.prompt === 'function') {
        setDeferred({ prompt: () => e.prompt!() })
        setVisible(true)
      }
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore
    }
  }

  async function handleInstall() {
    if (!deferred) return
    try {
      await deferred.prompt()
    } catch {
      // user dismissed native dialog
    }
    setDeferred(null)
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md sm:left-auto sm:right-6">
      <div className="flex items-start gap-3 rounded-2xl border border-[#14274E]/15 bg-white p-4 shadow-lg ring-1 ring-black/5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#14274E]">
          <Download className="size-5 text-white" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#14274E]">Install BrainiLens</p>
          {iosHint ? (
            <p className="mt-0.5 text-xs text-text-muted">
              Tap <span className="font-semibold">Share</span> then{' '}
              <span className="font-semibold">Add to Home Screen</span>
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-text-muted">
              Add to your home screen for a faster, app-like experience.
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            {!iosHint && (
              <Button size="sm" variant="primary" onClick={() => void handleInstall()}>
                Install
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1 text-text-muted hover:bg-background"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
