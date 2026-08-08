import { useMemo, useState, type FormEvent } from 'react'
import {
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Select,
  TextArea,
  Modal,
  EmptyState,
} from '@/components/ui'
import { initialAssignments, subjects } from '@/data/mockData'
import type {
  Assignment,
  AssignmentDifficulty,
  AssignmentStatus,
} from '@/types'

const subjectOptions = subjects.map((s) => ({ value: s.name, label: s.name }))
const difficultyOptions: { value: AssignmentDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const statusVariant: Record<AssignmentStatus, 'warning' | 'primary' | 'success'> = {
  pending: 'warning',
  'in-progress': 'primary',
  completed: 'success',
}

const difficultyVariant: Record<AssignmentDifficulty, 'success' | 'warning' | 'error'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
}

type FormState = Omit<Assignment, 'id' | 'status' | 'score'>

const emptyForm: FormState = {
  subject: subjects[0].name,
  title: '',
  description: '',
  dueDate: new Date().toISOString().slice(0, 10),
  difficulty: 'medium',
}

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(
    initialAssignments,
  )
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [detailsAssignment, setDetailsAssignment] = useState<Assignment | null>(
    null,
  )
  const [form, setForm] = useState<FormState>(emptyForm)

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        !search.trim() ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.subject.toLowerCase().includes(search.toLowerCase())
      const matchesSubject =
        subjectFilter === 'all' || a.subject === subjectFilter
      const matchesStatus =
        statusFilter === 'all' || a.status === statusFilter
      return matchesSearch && matchesSubject && matchesStatus
    })
  }, [assignments, search, subjectFilter, statusFilter])

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) return
    setAssignments((prev) => [
      {
        ...form,
        id: `as-${Date.now()}`,
        status: 'pending',
      },
      ...prev,
    ])
    setForm(emptyForm)
    setIsCreateOpen(false)
  }

  function completeAssignment(id: string, score: number) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'completed', score } : a,
      ),
    )
    setDetailsAssignment(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Assignments</h1>
          <p className="mt-1 text-sm text-text-muted">
            Track what&apos;s due, in progress, and completed.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Create assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <Input
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All subjects' },
            ...subjectOptions,
          ]}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'In progress' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments match"
          description="Try adjusting your filters or search term."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Card
              key={a.id}
              className="cursor-pointer transition-shadow hover:shadow-elevated"
              onClick={() => setDetailsAssignment(a)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="primary">{a.subject}</Badge>
                  <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold text-text">
                  {a.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">
                  {a.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5" aria-hidden="true" />
                    Due{' '}
                    {new Date(a.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <Badge variant={difficultyVariant[a.difficulty]}>
                    {a.difficulty}
                  </Badge>
                </div>
                {a.score !== undefined && (
                  <p className="mt-2 text-sm font-medium text-secondary">
                    Scored {a.score}%
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create assignment modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create assignment"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              options={subjectOptions}
            />
            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={(e) =>
                setForm({
                  ...form,
                  difficulty: e.target.value as AssignmentDifficulty,
                })
              }
              options={difficultyOptions}
            />
          </div>
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Fractions Practice Set 5"
            required
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="What should this assignment cover?"
          />
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create assignment</Button>
          </div>
        </form>
      </Modal>

      {/* Details modal */}
      <Modal
        isOpen={!!detailsAssignment}
        onClose={() => setDetailsAssignment(null)}
        title={detailsAssignment?.title}
        size="md"
      >
        {detailsAssignment && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">{detailsAssignment.subject}</Badge>
              <Badge variant={statusVariant[detailsAssignment.status]}>
                {detailsAssignment.status}
              </Badge>
              <Badge variant={difficultyVariant[detailsAssignment.difficulty]}>
                {detailsAssignment.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-text">
              {detailsAssignment.description}
            </p>
            <p className="text-sm text-text-muted">
              Due{' '}
              {new Date(detailsAssignment.dueDate).toLocaleDateString(
                undefined,
                { month: 'long', day: 'numeric', year: 'numeric' },
              )}
            </p>
            {detailsAssignment.score !== undefined && (
              <p className="text-sm font-medium text-secondary">
                Scored {detailsAssignment.score}%
              </p>
            )}
            {detailsAssignment.status !== 'completed' && (
              <Button
                className="w-full"
                onClick={() =>
                  completeAssignment(
                    detailsAssignment.id,
                    Math.floor(75 + Math.random() * 20),
                  )
                }
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Mark as complete
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
