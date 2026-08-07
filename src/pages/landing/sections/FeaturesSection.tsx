import { motion } from 'framer-motion'
import {
  Calendar,
  Bot,
  ListChecks,
  BarChart3,
  FileText,
  Bell,
  type LucideIcon,
} from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  accent: 'primary' | 'secondary' | 'accent'
}

const features: Feature[] = [
  {
    icon: Calendar,
    title: 'Weekly Learning Tracker',
    description:
      'Log study time, topics covered, and completed work in minutes each week, and watch a clear timeline build automatically.',
    accent: 'primary',
  },
  {
    icon: Bot,
    title: 'AI Study Companion',
    description:
      'An always-available tutor that answers questions in your child\u2019s own words and gently checks their understanding.',
    accent: 'secondary',
  },
  {
    icon: ListChecks,
    title: 'Assignment Management',
    description:
      'Assignments are generated from what your child is actually learning, with due dates and reminders handled for you.',
    accent: 'accent',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description:
      'Subject-by-subject charts show mastery over time, so you can spot a slump or a breakthrough the week it happens.',
    accent: 'primary',
  },
  {
    icon: FileText,
    title: 'Performance Reports',
    description:
      'Clear, shareable monthly reports summarize strengths, growth areas, and recommended next steps.',
    accent: 'secondary',
  },
  {
    icon: Bell,
    title: 'Parent Notifications',
    description:
      'Get nudged only when it matters \u2014 a milestone reached, an assignment overdue, or a topic that needs support.',
    accent: 'accent',
  },
]

const accentStyles = {
  primary: 'bg-primary-light text-primary',
  secondary: 'bg-secondary-light text-secondary',
  accent: 'bg-accent-light text-accent-hover',
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl">
            Everything you need to stay close to their learning
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Six tools that work together so tracking growth feels like a
            five-minute weekly check-in, not a second job.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
              whileHover={{ y: -6 }}
              className="group rounded-xl border border-border bg-surface p-6 shadow-card transition-shadow duration-300 hover:shadow-elevated"
            >
              <div
                className={`flex size-11 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${accentStyles[feature.accent]}`}
              >
                <feature.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
