import { Bell, Menu, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils'
import { Avatar, Button } from '@/components/ui'
import { NavigationMenu } from './NavigationMenu'
import type { NavItem, User } from '@/types'

export interface HeaderProps {
  variant?: 'landing' | 'dashboard'
  navItems?: NavItem[]
  user?: User
  onMenuClick?: () => void
  className?: string
}

export function Header({
  variant = 'landing',
  navItems = [],
  user,
  onMenuClick,
  className,
}: HeaderProps) {
  const isDashboard = variant === 'dashboard'

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {isDashboard && onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          )}

          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="size-5 text-white" aria-hidden="true" />
            </div>
            <span className="hidden text-sm font-semibold text-text sm:inline">
              Learning Growth Tracker AI
            </span>
          </Link>
        </div>

        {!isDashboard && navItems.length > 0 && (
          <NavigationMenu
            items={navItems}
            orientation="horizontal"
            className="hidden md:flex"
          />
        )}

        <div className="flex items-center gap-2">
          {isDashboard && user ? (
            <>
              <Button variant="ghost" size="sm" aria-label="Notifications">
                <Bell className="size-5" />
              </Button>
              <div className="flex items-center gap-2.5 pl-2">
                <Avatar name={user.name} size="sm" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-text">{user.name}</p>
                  <p className="text-xs text-text-muted capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
