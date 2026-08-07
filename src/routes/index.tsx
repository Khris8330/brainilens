import { createBrowserRouter } from 'react-router-dom'
import {
  LandingLayout,
  AuthLayout,
  DashboardLayout,
} from '@/layouts'
import { LandingPage } from '@/pages/landing/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ParentDashboardPage } from '@/pages/parent/ParentDashboardPage'
import { ChildProgressPage } from '@/pages/child/ChildProgressPage'
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
    element: <DashboardLayout />,
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
  reports: '/reports',
  settings: '/settings',
  ai: '/ai',
} as const
