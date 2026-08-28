import { Bell, Menu, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils'
import { Avatar, Button } from '@/components/ui'
import { BrandLogo } from './BrandLogo'
import { NavigationMenu } from './NavigationMenu'
import type { NavItem, User } from '@/types'

export interface HeaderProps {
  variant?: 'landing' | 'dashboard'
  navItems?: NavItem[]
  user?: User
  onMenuClick?: () => void
  onLogout?: () => void
  className?: string
}

export function Header({
  variant = 'landing',
  navItems = [],
  user,
  onMenuClick,
  onLogout,
  className,
}: HeaderProps) {
  const isDashboard = variant === 'dashboard'

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
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

          {!isDashboard && <BrandLogo to="/" size="sm" />}
        </div>

        {!isDashboard && navItems.length > 0 && (
          <NavigationMenu
            items={navItems}
            orientation="horizontal"
            className="hidden md:flex"
          />
        )}

        <div className="flex items-center gap-1.5">
          {isDashboard && user ? (
            <>
              <Button variant="ghost" size="sm" aria-label="Notifications">
                <Bell className="size-4.5" />
              </Button>
              <div className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
              <div className="flex items-center gap-2 pl-1">
                <Avatar name={user.name} size="sm" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-tight text-text">{user.name}</p>
                  <p className="text-[11px] capitalize leading-tight text-text-muted">{user.role}</p>
                </div>
              </div>
              {onLogout && (
                <Button variant="ghost" size="sm" onClick={onLogout} aria-label="Log out">
                  <LogOut className="size-4" aria-hidden="true" />
                </Button>
              )}
            </>
          ) : (
            <>
              <Link to="/auth/role">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/auth/role">
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
