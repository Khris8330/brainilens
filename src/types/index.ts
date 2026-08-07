import type { LucideIcon } from 'lucide-react'

export type Size = 'sm' | 'md' | 'lg'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'parent' | 'child' | 'admin'
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
