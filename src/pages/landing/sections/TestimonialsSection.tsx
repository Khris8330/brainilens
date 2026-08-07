import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { Avatar } from '@/components/ui'

const testimonials = [
  {
    quote:
      'I used to find out my son was behind in math only at conference time. Now I see it building week by week, so we can fix it before it becomes a bigger problem.',
    name: 'Maria Gonzalez',
    role: 'Parent of a 4th grader',
  },
  {
    quote:
      'The weekly check-ins take my daughter about five minutes, and the monthly report is the clearest summary of her progress I\u2019ve ever gotten from any tool.',
    name: 'David Okafor',
    role: 'Parent of a 6th grader',
  },
  {
    quote:
      'We rolled this out across three homerooms as a pilot. Families engaged more with weekly tracking than with any report card we\u2019ve sent home.',
    name: 'Priya Ramanathan',
    role: 'Elementary Teacher, Lincoln Elementary',
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl">
            Families and teachers see the difference
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Real feedback from parents and educators using Growth Tracker AI
            each week.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col rounded-xl border border-border bg-background p-6 shadow-card"
            >
              <Quote className="size-6 text-primary/40" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-text">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar name={t.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-text">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
