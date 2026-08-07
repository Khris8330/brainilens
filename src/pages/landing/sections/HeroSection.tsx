import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { routes } from '@/routes'
import { GrowthArc } from '../components/GrowthArc'
import { HeroIllustration } from '../components/HeroIllustration'

export function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      <GrowthArc className="absolute -top-6 left-1/2 hidden w-[900px] -translate-x-1/2 opacity-40 lg:block" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Weekly insights, not year-end surprises
          </span>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Track Your Child&apos;s Learning Growth with AI
          </h1>

          <p className="mt-5 max-w-xl text-lg text-text-muted">
            See exactly how your child is progressing, every week. Growth
            Tracker AI turns assignments, study sessions, and quiz results
            into a clear picture of what they&apos;ve mastered and what
            needs more practice &mdash; so you always know how to help.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={routes.register}>
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
            No credit card required &middot; Free for your first child&apos;s
            profile
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <HeroIllustration />
        </motion.div>
      </div>

      <Modal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        title="See Growth Tracker AI in action"
        description="A 3-minute walkthrough of weekly tracking, AI evaluation, and monthly reports."
        size="md"
      >
        <div className="flex aspect-video items-center justify-center rounded-lg bg-background text-text-muted">
          <div className="text-center">
            <Play className="mx-auto size-8 text-primary" aria-hidden="true" />
            <p className="mt-2 text-sm">
              Demo video coming soon &mdash; in the meantime, create a free
              account to explore the product yourself.
            </p>
          </div>
        </div>
      </Modal>
    </section>
  )
}
