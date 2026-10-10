import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'brainilens-install-dismissed'

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed === '1') return

    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream

    if (isIos) {
      // iOS has no beforeinstallprompt — show Share hint instead
      setIosHint(true)
      setVisible(true)
      return
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  async function handleInstall() {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    setVisible(false)
    if (choice.outcome === 'accepted') {
      localStorage.setItem(DISMISS_KEY, '1')
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
              <Button size="sm" variant="primary" onClick={handleInstall}>
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
