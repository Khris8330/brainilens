import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Header, Sidebar, BrandLogo } from '@/components/common'
import { Button } from '@/components/ui'
import { parentNavItems, teacherNavItems, childNavItems } from '@/data/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isStudentRole } from '@/lib/auth-roles'
import { routes } from '@/routes'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const isStudent = isStudentRole(user?.role)
  const isStudentHome = isStudent && location.pathname === routes.student

  async function handleLogout() {
    await logout()
    navigate('/auth/role', { replace: true })
  }

  const navItems =
    isStudent
      ? childNavItems
      : user?.role === 'teacher'
        ? teacherNavItems
        : parentNavItems

  // Kids: no sidebar — card home + simple top bar
  if (isStudent) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FBF8F1]">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-[#FBF8F1]/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              {!isStudentHome && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(routes.student)}
                  aria-label="Back to home"
                  className="mr-1"
                >
                  <ArrowLeft className="size-5" />
                </Button>
              )}
              <BrandLogo to={routes.student} size="sm" />
            </div>
            <div className="flex items-center gap-1">
              {user && (
                <span className="hidden text-sm font-medium text-text sm:inline">
                  {user.name?.split(' ')[0]}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
                Log out
              </Button>
            </div>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-4 sm:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col lg:pl-0">
        <Header
          variant="dashboard"
          user={user ?? undefined}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  )
}
