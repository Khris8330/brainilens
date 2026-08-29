import { motion } from 'framer-motion'
import { BookOpen, Sparkles, LineChart } from 'lucide-react'

const steps = [
  {
    icon: BookOpen,
    title: 'Create a topic',
    description:
      'Parents set the subject, topic, and optional notes. BrainiLens takes it from there.',
  },
  {
    icon: Sparkles,
    title: 'Lens teaches',
    description:
      'The AI companion generates clear lessons and practice so your child can learn at their pace.',
  },
  {
    icon: LineChart,
    title: 'See progress',
    description:
      'Assignments, scores, and weekly insights show up on your parent dashboard automatically.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-4 text-lg text-text-muted">
            Three steps from a learning topic to a clear picture of progress.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="relative rounded-xl border border-border bg-background p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                <step.icon className="size-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-xs font-semibold tracking-wide text-accent uppercase">
                Step {index + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.description}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
