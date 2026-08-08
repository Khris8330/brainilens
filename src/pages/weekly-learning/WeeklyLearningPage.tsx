import { useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Clock, X } from 'lucide-react'
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
import { initialWeeklyLearning, subjects } from '@/data/mockData'
import type { WeeklyLearningEntry } from '@/types'

const subjectOptions = subjects.map((s) => ({ value: s.name, label: s.name }))
const understandingLabels = [
  '1 — Struggling',
  '2 — Needs practice',
  '3 — Getting there',
  '4 — Confident',
  '5 — Mastered',
]

type FormState = Omit<WeeklyLearningEntry, 'id'>

const emptyForm: FormState = {
  week: 'Week of Aug 10',
  subject: subjects[0].name,
  topic: '',
  description: '',
  hours: 1,
  understanding: 3,
  notes: '',
}

export function WeeklyLearningPage() {
  const [entries, setEntries] = useState<WeeklyLearningEntry[]>(
    initialWeeklyLearning,
  )
  const [selectedWeek, setSelectedWeek] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const weeks = Array.from(new Set(entries.map((e) => e.week)))
  const visibleEntries =
    selectedWeek === 'all'
      ? entries
      : entries.filter((e) => e.week === selectedWeek)

  function openAddModal() {
    setEditingId(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  function openEditModal(entry: WeeklyLearningEntry) {
    setEditingId(entry.id)
    setForm({
      week: entry.week,
      subject: entry.subject,
      topic: entry.topic,
      description: entry.description,
      hours: entry.hours,
      understanding: entry.understanding,
      notes: entry.notes,
    })
    setIsModalOpen(true)
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.topic.trim()) return

    if (editingId) {
      setEntries((prev) =>
        prev.map((e) => (e.id === editingId ? { ...form, id: editingId } : e)),
      )
    } else {
      setEntries((prev) => [
        { ...form, id: `wl-${Date.now()}` },
        ...prev,
      ])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Weekly Learning
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Log what was studied each week and track understanding over
            time.
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="size-4" aria-hidden="true" />
          Add learning entry
        </Button>
      </div>

      <div className="max-w-xs">
        <Select
          label="Week"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          options={[
            { value: 'all', label: 'All weeks' },
            ...weeks.map((w) => ({ value: w, label: w })),
          ]}
        />
      </div>

      {visibleEntries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No learning entries yet"
          description="Add your first weekly learning entry to start building a history."
          action={{ label: 'Add learning entry', onClick: openAddModal }}
        />
      ) : (
        <div className="space-y-4">
          {visibleEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary">{entry.subject}</Badge>
                      <span className="text-xs text-text-muted">
                        {entry.week}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-text">
                      {entry.topic}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${entry.topic}`}
                      onClick={() => openEditModal(entry)}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${entry.topic}`}
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="size-4 text-error" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <p className="mt-2 text-sm text-text-muted">
                  {entry.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {entry.hours}h studied
                  </span>
                  <span>
                    Understanding:{' '}
                    <span className="font-medium text-text">
                      {entry.understanding}/5
                    </span>
                  </span>
                </div>

                {entry.notes && (
                  <p className="mt-3 rounded-lg bg-background p-3 text-sm text-text">
                    {entry.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit learning entry' : 'Add learning entry'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Week"
              value={form.week}
              onChange={(e) => setForm({ ...form, week: e.target.value })}
              placeholder="Week of Aug 10"
            />
            <Select
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              options={subjectOptions}
            />
          </div>

          <Input
            label="Topic learned"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="e.g. Multiplying Fractions"
            required
          />

          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="What did they work on this week?"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Hours studied"
              type="number"
              min={0}
              step={0.5}
              value={form.hours}
              onChange={(e) =>
                setForm({ ...form, hours: Number(e.target.value) })
              }
            />
            <Select
              label="Understanding score"
              value={String(form.understanding)}
              onChange={(e) =>
                setForm({ ...form, understanding: Number(e.target.value) })
              }
              options={understandingLabels.map((label, i) => ({
                value: String(i + 1),
                label,
              }))}
            />
          </div>

          <TextArea
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Anything worth remembering for next week?"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="size-4" aria-hidden="true" />
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Save changes' : 'Add entry'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
