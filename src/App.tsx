import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { InstallPrompt } from '@/components/common'

function hideBootSplash() {
  const splash = document.getElementById('boot-splash')
  if (!splash) return
  splash.classList.add('is-hidden')
  window.setTimeout(() => splash.remove(), 350)
}

function AppShell() {
  const { isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) hideBootSplash()
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
