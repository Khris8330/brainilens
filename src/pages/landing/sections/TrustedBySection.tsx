import { motion } from 'framer-motion'
import {
  School,
  Users,
  GraduationCap,
  BookOpen,
  Landmark,
  Award,
} from 'lucide-react'

const trusted = [
  { name: 'Lincoln Elementary', icon: School },
  { name: 'ParentCircle Community', icon: Users },
  { name: 'BrightPath Academy', icon: GraduationCap },
  { name: 'Homeroom Network', icon: BookOpen },
  { name: 'Riverside Unified', icon: Landmark },
  { name: 'EduConnect Platform', icon: Award },
]

export function TrustedBySection() {
  return (
    <section className="border-y border-border bg-surface/60 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-text-muted">
          Trusted by families, schools, and learning communities
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6"
        >
          {trusted.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 grayscale opacity-60 transition-all duration-200 hover:opacity-100 hover:grayscale-0"
            >
              <Icon className="size-6 text-text-muted" aria-hidden="true" />
              <span className="text-center text-xs font-medium text-text-muted">
                {name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
