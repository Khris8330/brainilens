import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { routes } from '@/routes'
import { GrowthArc } from '../components/GrowthArc'

export function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary px-6 py-16 text-center shadow-elevated sm:px-12 sm:py-20"
        >
          <GrowthArc className="absolute -bottom-6 left-1/2 w-[700px] -translate-x-1/2 opacity-30" />

          <div className="relative">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Start Tracking Learning Progress Today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
              Join families and classrooms already using weekly insights to
              help kids build lasting momentum.
            </p>
            <Link to={routes.roleSelection} className="mt-8 inline-block">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
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
