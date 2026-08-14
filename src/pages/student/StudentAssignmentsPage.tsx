import { ClipboardList, LockKeyhole } from 'lucide-react'
import { Card, CardContent, EmptyState } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export function StudentAssignmentsPage() {
  const { user } = useAuth()
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">Assignments</h1><p className="mt-1 text-sm text-text-muted">Work assigned to {user?.name ?? 'you'} will appear here.</p></div><Card><CardContent className="p-6"><EmptyState icon={ClipboardList} title="No saved assignments yet" description="There are no persisted assignments for your authenticated student account yet. This page will never load another student's work." /></CardContent></Card><div className="flex items-center gap-2 text-xs text-text-muted"><LockKeyhole className="size-4" />Your assignments are scoped to your authenticated student identity.</div></div>
}
