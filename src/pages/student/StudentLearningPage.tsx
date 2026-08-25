import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, BookOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, EmptyState } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { routes } from '@/routes'
import { getStudentAssignments, type StudentAssignmentRecord } from '@/lib/learning-data'

export function StudentLearningPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<StudentAssignmentRecord[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return
    void getStudentAssignments(user.id).then(({ data, error: queryError }) => {
      setAssignments(data ?? [])
      if (queryError) setError('Today\'s learning could not be loaded.')
    })
  }, [user?.id])

  const learningItems = assignments.filter((item) => item.assignment).slice(0, 6)

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold text-text">Today&apos;s Learning</h1><p className="mt-1 text-sm text-text-muted">Continue with your assigned learning content.</p></div>
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    <Card><CardHeader><CardTitle>Learning activities</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">
      {learningItems.length === 0 ? <EmptyState icon={BookOpen} title="No learning activities yet" description="Assigned learning content will appear here." /> : learningItems.map((item) => {
        const assignment = item.assignment!
        let sectionCount = 0
        if (assignment.learningContent?.content) {
          try {
            const parsed = JSON.parse(assignment.learningContent.content) as { sections?: unknown[] }
            sectionCount = Array.isArray(parsed.sections) ? parsed.sections.length : 0
          } catch { sectionCount = 0 }
        }
        return <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><Badge variant="secondary">{assignment.subject}</Badge><h2 className="mt-2 text-sm font-semibold text-text">{assignment.title}</h2><p className="text-xs text-text-muted">{sectionCount > 0 ? `${sectionCount} lesson sections` : 'Assignment content'}</p></div><Link to={`${routes.studentAssignments}/${item.id}`}><Button size="sm"><Play className="size-4" />Start</Button></Link></div>
      })}
    </CardContent></Card>
  </div>
}
