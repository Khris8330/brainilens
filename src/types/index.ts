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
  role: 'parent' | 'student' | 'child' | 'admin'
  studentId?: string
  grade?: string | null
  pin?: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface Subject {
  name: string
  mastery: number
  color: string
}

export interface WeeklyLearningEntry {
  id: string
  week: string
  subject: string
  topic: string
  description: string
  hours: number
  understanding: number
  notes: string
}

export type AssignmentStatus = 'pending' | 'in-progress' | 'completed'
export type AssignmentDifficulty = 'easy' | 'medium' | 'hard'

export interface Assignment {
  id: string
  subject: string
  title: string
  description: string
  dueDate: string
  difficulty: AssignmentDifficulty
  status: AssignmentStatus
  score?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Achievement {
  title: string
  description: string
  earned: boolean
  date?: string
}

export interface ActivityItem {
  id: string
  description: string
  timestamp: string
}
