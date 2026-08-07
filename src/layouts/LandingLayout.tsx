import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Header, Footer } from '@/components/common'
import { landingNavItems } from '@/data/navigation'

export function LandingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header variant="landing" navItems={landingNavItems} />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  )
}
