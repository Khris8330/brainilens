import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary shadow-soft">
              <GraduationCap className="size-6 text-white" aria-hidden="true" />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-text">
            BrainiLens
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Track progress. Accelerate growth.
          </p>
        </div>
        <Outlet />
      </motion.div>
    </div>
  )
}
