import {
  BarChart3,
  Bot,
  Home,
  Settings,
  Users,
  GraduationCap,
} from 'lucide-react'
import type { NavItem, User } from '@/types'

export const mockUser: User = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  role: 'parent',
}

export const dashboardNavItems: NavItem[] = [
  { label: 'Parent Dashboard', href: '/parent', icon: Home },
  { label: 'Child Progress', href: '/child', icon: GraduationCap },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'AI Insights', href: '/ai', icon: Bot, badge: 'New' },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export const landingNavItems: NavItem[] = [
  { label: 'Features', href: '/#features', icon: Home },
  { label: 'Pricing', href: '/#pricing', icon: BarChart3 },
  { label: 'About', href: '/#about', icon: Users },
]

export const footerLinks = {
  features: [
    { label: 'Weekly Tracker', href: '/#features' },
    { label: 'AI Study Companion', href: '/#features' },
    { label: 'Progress Analytics', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
  ],
  company: [
    { label: 'About', href: '/#about' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  resources: [
    { label: 'Help Center', href: '#' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Guides for Parents', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
}
