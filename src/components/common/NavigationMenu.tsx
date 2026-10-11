import { NavLink } from 'react-router-dom'
import { cn } from '@/utils'
import { Badge } from '@/components/ui'
import type { NavItem } from '@/types'

export interface NavigationMenuProps {
  items: NavItem[]
  orientation?: 'horizontal' | 'vertical'
  className?: string
  onItemClick?: () => void
}

export function NavigationMenu({
  items,
  orientation = 'horizontal',
  className,
  onItemClick,
}: NavigationMenuProps) {
  const isVertical = orientation === 'vertical'

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        isVertical ? 'flex flex-col gap-0.5' : 'flex items-center gap-0.5',
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isHashLink = item.href.startsWith('/#')

        if (isHashLink) {
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'inline-flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-150',
                'text-text-muted hover:bg-background hover:text-text',
                !isVertical && 'px-3',
              )}
            >
              {isVertical && <Icon className="size-4 shrink-0 opacity-70" aria-hidden="true" />}
              {item.label}
              {item.badge && (
                <Badge variant="accent" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </a>
          )
        }

        return (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-text-muted hover:bg-background hover:text-text',
                !isVertical && 'px-3',
              )
            }
          >
            {isVertical && <Icon className="size-4 shrink-0 opacity-70" aria-hidden="true" />}
            {item.label}
            {item.badge && (
              <Badge variant="accent" className={isVertical ? 'ml-auto' : ''}>
                {item.badge}
              </Badge>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
