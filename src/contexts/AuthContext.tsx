import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@/types'
import { mockStudents } from '@/data/mockData'

/**
 * MOCK AUTHENTICATION — MILESTONE 1 ONLY
 * ----------------------------------------------------
 * This is NOT real authentication. There is no backend, no password
 * hashing, and no session verification. Any "valid-looking" email and
 * password will succeed. The mock session is stored in localStorage
 * purely so the UI persists across refreshes during development.
 * This will be replaced by real Supabase auth in Milestone 2.
 */

const MOCK_SESSION_KEY = 'gta_mock_session'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginAsStudent: (studentId: string, pin: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readMockSession(): User | null {
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function writeMockSession(user: User) {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user))
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'Parent'
  return local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function parentIdFromEmail(email: string): string {
  return email.trim().toLowerCase() === 'parent@example.com'
    ? 'parent-001'
    : `parent-${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readMockSession())
  const [isLoading] = useState(false)

  async function login(email: string, password: string) {
    // Mock auth: any non-empty password is accepted. Referenced only to
    // keep the signature explicit about what a real login would need.
    void password
    await new Promise((resolve) => setTimeout(resolve, 900))
    const mockUser: User = {
      id: parentIdFromEmail(email),
      name: nameFromEmail(email) || 'Parent',
      email,
      role: 'parent',
    }
    writeMockSession(mockUser)
    setUser(mockUser)
  }

  async function loginAsStudent(studentId: string, pin: string) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const student = mockStudents.find(
      (candidate) => candidate.studentId.toLowerCase() === studentId.trim().toLowerCase() && candidate.pin === pin.trim(),
    )
    if (!student) throw new Error('Student ID or PIN is incorrect.')
    const mockUser: User = {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      email: '',
      role: 'student',
      studentId: student.studentId,
    }
    writeMockSession(mockUser)
    setUser(mockUser)
  }

  async function register(fullName: string, email: string, password: string) {
    void password
    await new Promise((resolve) => setTimeout(resolve, 900))
    const mockUser: User = {
      id: parentIdFromEmail(email),
      name: fullName,
      email,
      role: 'parent',
    }
    writeMockSession(mockUser)
    setUser(mockUser)
  }

  function logout() {
    localStorage.removeItem(MOCK_SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsStudent, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
