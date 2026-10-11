import { motion } from 'framer-motion'
import {
  BarChart3,
  ListChecks,
  Bot,
  FileText,
  type LucideIcon,
} from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  span?: string
}

const features: Feature[] = [
  {
    icon: BarChart3,
    title: 'Progress analytics',
    description:
      'Subject-by-subject charts show mastery over time so you spot a slump or breakthrough the week it happens.',
    span: 'md:col-span-2',
  },
  {
    icon: ListChecks,
    title: 'Assignments',
    description:
      'Practice is generated from real topics, with clear status for parents and students.',
  },
  {
    icon: Bot,
    title: 'Lens AI',
    description:
      'A patient companion that explains concepts, answers questions, and supports study sessions.',
  },
  {
    icon: FileText,
    title: 'Parent reports',
    description:
      'Readable summaries of strengths, growth areas, and recommended next steps, ready to act on.',
    span: 'md:col-span-2',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to stay close to their learning
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            A focused toolkit, not another noisy dashboard.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: (index % 3) * 0.06 }}
              className={`rounded-xl border border-border bg-surface p-6 shadow-soft ${feature.span ?? ''}`}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                <feature.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-text">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
