import { Clock, LockKeyhole } from 'lucide-react'
import { Card, CardContent, EmptyState } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export function WeeklyLearningPage() {
  const { user } = useAuth()
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">Weekly Learning</h1><p className="mt-1 text-sm text-text-muted">Learning records for {user?.name ?? 'your account'} will appear here.</p></div><Card><CardContent className="p-6"><EmptyState icon={Clock} title="No saved learning entries yet" description="Weekly learning data is not connected for this account yet. Existing presentation data is not shown as if it were persisted." /></CardContent></Card><div className="flex items-center gap-2 text-xs text-text-muted"><LockKeyhole className="size-4" />Only records belonging to your authenticated student identity can appear here.</div></div>
}
