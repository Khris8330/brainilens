import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils'

const slides = [
  {
    id: 'dashboard',
    src: '/images/brainilens-hero.png',
    alt: 'Parent dashboard showing weekly learning progress',
    caption: 'Weekly progress at a glance',
  },
  {
    id: 'lens',
    src: '/images/brainilens-lens.png',
    alt: 'Lens AI companion helping with a lesson',
    caption: 'Lens teaches alongside your child',
  },
  {
    id: 'mascot',
    src: '/images/lens-mascot.png',
    alt: 'Lens, the BrainiLens learning companion',
    caption: 'A calm companion for every study session',
  },
] as const

export function HeroCarousel({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [])

  function go(delta: number) {
    setIndex((current) => (current + delta + slides.length) % slides.length)
  }

  const slide = slides[index]

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated sm:aspect-[5/6] lg:aspect-[4/5]">
        <AnimatePresence mode="wait">
          <motion.img
            key={slide.id}
            src={slide.src}
            alt={slide.alt}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent p-4 pt-16">
          <p className="text-sm font-medium text-white">{slide.caption}</p>
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/90 text-primary shadow-soft backdrop-blur-sm transition hover:bg-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/90 text-primary shadow-soft backdrop-blur-sm transition hover:bg-white"
          aria-label="Next slide"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-primary' : 'w-1.5 bg-border hover:bg-text-muted',
            )}
          />
        ))}
      </div>
    </div>
  )
}
