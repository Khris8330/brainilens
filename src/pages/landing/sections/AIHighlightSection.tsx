import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const points = [
  {
    title: 'Explains concepts in plain language',
    description:
      'When a concept doesn\u2019t click the first time, the companion breaks it down a different way , with examples suited to your child\u2019s grade level.',
  },
  {
    title: 'Answers questions, patiently',
    description:
      'Your child can ask follow-up questions any time, without feeling rushed or judged for not knowing yet.',
  },
  {
    title: 'Recommends what to focus on next',
    description:
      'Based on real answers and study sessions, it flags specific topics worth another look before the next assignment.',
  },
]

export function AIHighlightSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="order-2 flex justify-center lg:order-1"
        >
          <img
            src="/images/lens-mascot.png"
            alt="Lens, the BrainiLens AI learning companion, in a bright classroom"
            className="h-auto min-h-[28rem] w-full rounded-3xl object-cover shadow-soft sm:min-h-[34rem] lg:min-h-[42rem]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="order-1 lg:order-2"
        >
          <span className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary-light px-3 py-1 text-xs font-medium text-secondary">
            Meet Lens, your AI learning companion
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl">
            A patient tutor that&apos;s always in the room
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Lens works alongside your child during study sessions , not to do the work for them, but to help ideas
            actually stick.
          </p>

          <ul className="mt-8 space-y-6">
            {points.map((point) => (
              <li key={point.title} className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-secondary"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-text">{point.title}</p>
                  <p className="mt-1 text-sm text-text-muted">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
