import { useEffect, useRef } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { InstallPrompt } from '@/components/common'

const MIN_SPLASH_MS = 2000

function hideBootSplash() {
  const splash = document.getElementById('boot-splash')
  if (!splash) return
  splash.classList.add('is-hidden')
  window.setTimeout(() => splash.remove(), 350)
}

function AppShell() {
  const { isLoading } = useAuth()
  const shownAt = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now())

  useEffect(() => {
    if (isLoading) return

    const elapsed =
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
      shownAt.current
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed)

    const t = window.setTimeout(() => hideBootSplash(), remaining)
    return () => window.clearTimeout(t)
  }, [isLoading])

  return (
    <>
      <RouterProvider router={router} />
      <InstallPrompt />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App
