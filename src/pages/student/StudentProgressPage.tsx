import { BarChart3, LockKeyhole } from 'lucide-react'
import { Card, CardContent, EmptyState } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export function StudentProgressPage() {
  const { user } = useAuth()
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">My Progress</h1><p className="mt-1 text-sm text-text-muted">Progress summaries for {user?.name ?? 'your account'} will appear here.</p></div><Card><CardContent className="p-6"><EmptyState icon={BarChart3} title="No progress data yet" description="Progress is calculated from persisted assignments and learning records. No saved records are available for this account yet." /></CardContent></Card><div className="flex items-center gap-2 text-xs text-text-muted"><LockKeyhole className="size-4" />Progress is scoped to your authenticated student identity.</div></div>
}
