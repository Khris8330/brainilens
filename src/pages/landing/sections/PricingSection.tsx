import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { cn } from '@/utils'
import { routes } from '@/routes'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    description: 'Try weekly tracking with a single child profile.',
    features: [
      '1 child profile',
      'Weekly learning tracker',
      'Basic progress analytics',
      'Monthly report (email)',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Family',
    price: '$12',
    period: '/ month',
    description: 'Full AI tracking and reporting for the whole household.',
    features: [
      'Up to 4 child profiles',
      'Lens AI Companion',
      'Assignment management',
      'Advanced progress analytics',
      'Monthly PDF reports',
      'Parent notifications',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'School',
    price: 'Custom',
    period: 'per classroom',
    description: 'Rollout across classrooms with teacher-facing tools.',
    features: [
      'Unlimited student profiles',
      'Everything in Family',
      'Teacher dashboard',
      'District-level reporting',
      'Priority support',
      'Onboarding assistance',
    ],
    cta: 'Talk to Us',
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl">
            Simple pricing that grows with your family
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Start free, upgrade when you&apos;re ready for AI-powered
            tracking, no long-term contracts.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                'relative flex flex-col rounded-2xl border p-8',
                plan.highlighted
                  ? 'border-primary bg-surface shadow-elevated lg:-translate-y-3'
                  : 'border-border bg-surface shadow-card',
              )}
            >
              {plan.highlighted && (
                <Badge
                  variant="primary"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  Most popular
                </Badge>
              )}

              <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
              <p className="mt-1 text-sm text-text-muted">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-text">
                  {plan.price}
                </span>
                <span className="text-sm text-text-muted">{plan.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-secondary"
                      aria-hidden="true"
                    />
                    <span className="text-text">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={routes.register} className="mt-8">
                <Button
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
