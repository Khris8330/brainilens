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
import { ParentDashboardPage } from '@/pages/parent/ParentDashboardPage'
import { ChildProgressPage } from '@/pages/child/ChildProgressPage'
import { WeeklyLearningPage } from '@/pages/weekly-learning/WeeklyLearningPage'
import { AssignmentsPage } from '@/pages/assignments/AssignmentsPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { AIInsightsPage } from '@/pages/ai/AIInsightsPage'

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
    ],
  },
  {
    element: (
      <RequireAuth>
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
} as const
