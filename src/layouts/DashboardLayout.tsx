import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Header, Sidebar } from '@/components/common'
import { parentNavItems, childNavItems } from '@/data/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navItems = user?.role === 'child' ? childNavItems : parentNavItems

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
          onLogout={logout}
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
