import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { routes } from '@/routes'

export function CTASection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center shadow-elevated sm:px-12 sm:py-20"
        >
          <div className="relative">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Start tracking learning progress today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
              Create a free parent account and see weekly clarity for your first child profile.
            </p>
            <Link to={routes.roleSelection} className="mt-8 inline-block">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Started Free
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
