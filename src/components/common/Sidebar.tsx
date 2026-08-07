import { AnimatePresence, motion } from 'framer-motion'
import { GraduationCap, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils'
import { NavigationMenu } from './NavigationMenu'
import type { NavItem } from '@/types'

export interface SidebarProps {
  items: NavItem[]
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function Sidebar({ items, isOpen, onClose, className }: SidebarProps) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-text/30 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/parent" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="size-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-text">
              Growth Tracker
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-background lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <NavigationMenu
            items={items}
            orientation="vertical"
            onItemClick={onClose}
          />
        </div>
      </aside>
    </>
  )
}
