import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { routes } from '@/routes'
import { HeroCarousel } from '../components/HeroCarousel'

export function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary-light px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Weekly insights for parents
          </span>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text sm:text-5xl lg:text-[3.15rem] lg:leading-[1.12]">
            Know how your child is learning — every week
          </h1>

          <p className="mt-5 max-w-xl text-lg text-text-muted">
            BrainiLens turns topics, lessons, and assessments into a clear picture of
            progress, so you can support them before small gaps become big ones.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={routes.roleSelection}>
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setDemoOpen(true)}
            >
              <Play className="size-4" aria-hidden="true" />
              Watch Demo
            </Button>
          </div>

          <p className="mt-6 text-sm text-text-muted">
            No credit card required · Free for your first child profile
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="mx-auto w-full max-w-md lg:max-w-none"
        >
          <HeroCarousel />
        </motion.div>
      </div>

      <Modal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        title="See BrainiLens in action"
        description="A short walkthrough of weekly tracking, Lens AI, and parent reports."
        size="md"
      >
        <div className="flex aspect-video items-center justify-center rounded-lg bg-background text-text-muted">
          <div className="text-center px-6">
            <Play className="mx-auto size-8 text-primary" aria-hidden="true" />
            <p className="mt-2 text-sm">
              Demo video coming soon. Create a free account to explore the product yourself.
            </p>
          </div>
        </div>
      </Modal>
    </section>
  )
}
