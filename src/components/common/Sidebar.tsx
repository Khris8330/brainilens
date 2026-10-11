import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils'
import { BrandLogo } from './BrandLogo'
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
            className="fixed inset-0 z-40 bg-text/20 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-surface transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <BrandLogo to="/parent" size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted hover:bg-background lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5">
          <NavigationMenu items={items} orientation="vertical" onItemClick={onClose} />
        </div>
      </aside>
    </>
  )
}
