import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BrandLogo } from '@/components/common/BrandLogo'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo to="/" size="lg" />
          <p className="mt-3 text-sm text-text-muted">
            Track progress. Accelerate growth.
          </p>
        </div>
        <Outlet />
      </motion.div>
    </div>
  )
}
