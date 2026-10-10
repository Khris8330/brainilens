import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { AuthProvider } from '@/contexts/AuthContext'
import { InstallPrompt } from '@/components/common'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <InstallPrompt />
    </AuthProvider>
  )
}

export default App
