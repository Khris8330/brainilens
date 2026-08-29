import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const points = [
  {
    title: 'Explains concepts in plain language',
    description:
      'When something doesn’t click the first time, Lens breaks it down with grade-level examples.',
  },
  {
    title: 'Answers questions, patiently',
    description:
      'Your child can ask follow-ups anytime — without feeling rushed or judged.',
  },
  {
    title: 'Feeds the parent view',
    description:
      'Study sessions and assessments flow into the progress you see each week.',
  },
]

export function AIHighlightSection() {
  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="order-2 flex justify-center lg:order-1"
        >
          <img
            src="/images/brainilens-lens.png"
            alt="Lens, the BrainiLens AI learning companion"
            className="h-auto w-full max-w-md rounded-2xl border border-border object-cover shadow-soft lg:max-w-none"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="order-1 lg:order-2"
        >
          <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent-light px-3 py-1 text-xs font-medium text-accent-hover">
            Meet Lens
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            A patient tutor that stays in the room
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Lens works beside your child during study — not to do the work for them, but to help ideas stick.
          </p>

          <ul className="mt-8 space-y-5">
            {points.map((point) => (
              <li key={point.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium text-text">{point.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{point.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
