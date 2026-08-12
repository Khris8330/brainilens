import { motion } from 'framer-motion'
import {
  UserPlus,
  NotebookPen,
  ListChecks,
  Bot,
  FileBarChart,
} from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: 'Parent creates account',
    description:
      'Sign up and add a profile for each child in under two minutes.',
  },
  {
    icon: NotebookPen,
    title: 'Child records weekly learning',
    description:
      'A short weekly check-in captures what was studied and how it went.',
  },
  {
    icon: ListChecks,
    title: 'Assignments generated',
    description:
      'BrainiLens builds a short list of relevant practice for the week ahead.',
  },
  {
    icon: Bot,
    title: 'AI evaluates performance',
    description:
      'Responses are reviewed for mastery, effort, and areas that need reinforcement.',
  },
  {
    icon: FileBarChart,
    title: 'Monthly reports generated',
    description:
      'A clear summary lands in your inbox, ready to share or save.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl">How it works</h2>
          <p className="mt-4 text-lg text-text-muted">
            Five steps take you from sign-up to your first real picture of
            progress.
          </p>
        </div>

        <div className="relative mt-16">
          <div
            className="absolute top-8 right-8 left-8 hidden h-px bg-border lg:block"
            aria-hidden="true"
          />
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {steps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex size-16 items-center justify-center rounded-full border-2 border-primary bg-surface shadow-soft">
                  <step.icon className="size-6 text-primary" aria-hidden="true" />
                  <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-text">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  {step.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
