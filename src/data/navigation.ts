import {
  BarChart3,
  Bot,
  Home,
  Settings,
  Users,
  NotebookPen,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'
import type { NavItem, User } from '@/types'

export const mockUser: User = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  role: 'parent',
}

export const parentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/parent', icon: Home },
  { label: 'Weekly Learning', href: '/weekly-learning', icon: NotebookPen },
  { label: 'Assignments', href: '/assignments', icon: ClipboardList },
  { label: 'AI Study Companion', href: '/ai', icon: Bot, badge: 'New' },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export const childNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: Home },
  { label: "Today's Learning", href: '/student/learning', icon: NotebookPen },
  { label: 'Assignments', href: '/student/assignments', icon: ClipboardList },
  { label: 'AI Companion', href: '/student/ai', icon: Bot, badge: 'New' },
  { label: 'Progress', href: '/student/progress', icon: TrendingUp },
  { label: 'Profile', href: '/student/profile', icon: Settings },
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
