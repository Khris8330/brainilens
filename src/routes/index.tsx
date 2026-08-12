import { createBrowserRouter } from 'react-router-dom'
import {
  LandingLayout,
  AuthLayout,
  DashboardLayout,
} from '@/layouts'
import { RequireAuth } from '@/components/common/RequireAuth'
import { LandingPage } from '@/pages/landing/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage'
import { ParentDashboardPage } from '@/pages/parent/ParentDashboardPage'
import { ChildProgressPage } from '@/pages/child/ChildProgressPage'
import { WeeklyLearningPage } from '@/pages/weekly-learning/WeeklyLearningPage'
import { AssignmentsPage } from '@/pages/assignments/AssignmentsPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { AIInsightsPage } from '@/pages/ai/AIInsightsPage'
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage'
import { StudentLearningPage } from '@/pages/student/StudentLearningPage'
import { StudentAssignmentsPage } from '@/pages/student/StudentAssignmentsPage'
import { StudentProgressPage } from '@/pages/student/StudentProgressPage'
import { StudentAIPage } from '@/pages/student/StudentAIPage'
import { StudentProfilePage } from '@/pages/student/StudentProfilePage'

export const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/auth/login',
        element: <LoginPage />,
      },
      {
        path: '/auth/register',
        element: <RegisterPage />,
      },
      {
        path: '/auth/callback',
        element: <AuthCallbackPage />,
      },
    ],
  },
  {
    element: (
      <RequireAuth role="parent">
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '/parent',
        element: <ParentDashboardPage />,
      },
      {
        path: '/child',
        element: <ChildProgressPage />,
      },
      {
        path: '/weekly-learning',
        element: <WeeklyLearningPage />,
      },
      {
        path: '/assignments',
        element: <AssignmentsPage />,
      },
      {
        path: '/reports',
        element: <ReportsPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/ai',
        element: <AIInsightsPage />,
      },
    ],
  },
  {
    element: (
      <RequireAuth role="student">
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '/student',
        element: <StudentDashboardPage />,
      },
      {
        path: '/student/learning',
        element: <StudentLearningPage />,
      },
      {
        path: '/student/assignments',
        element: <StudentAssignmentsPage />,
      },
      {
        path: '/student/progress',
        element: <StudentProgressPage />,
      },
      {
        path: '/student/ai',
        element: <StudentAIPage />,
      },
      {
        path: '/student/profile',
        element: <StudentProfilePage />,
      },
    ],
  },
])

export const routes = {
  landing: '/',
  login: '/auth/login',
  register: '/auth/register',
  parent: '/parent',
  child: '/child',
  weeklyLearning: '/weekly-learning',
  assignments: '/assignments',
  reports: '/reports',
  settings: '/settings',
  ai: '/ai',
  student: '/student',
  studentLearning: '/student/learning',
  studentAssignments: '/student/assignments',
  studentProgress: '/student/progress',
  studentAi: '/student/ai',
  studentProfile: '/student/profile',
} as const
