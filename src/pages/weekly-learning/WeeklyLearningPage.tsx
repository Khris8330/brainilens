import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { BookOpen, LockKeyhole, Plus, Trash2 } from 'lucide-react'
import { Button, Card, CardContent, EmptyState, Input, LoadingOverlay, Select, TextArea } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  createLearningPlanItem,
  deleteLearningPlanItem,
  getLearningPlanItems,
  getOwnedChildren,
  type LearningPlanItemRecord,
} from '@/lib/learning-data'

interface Child {
  id: string
  name: string
}

function StatusBadge({ status }: { status: LearningPlanItemRecord['status'] }) {
  const styles: Record<LearningPlanItemRecord['status'], string> = {
    pending: 'bg-background text-text-muted border border-border',
    generating: 'bg-primary-light text-primary',
    ready: 'bg-secondary-light text-secondary',
    failed: 'bg-error/10 text-error',
  }
  const labels: Record<LearningPlanItemRecord['status'], string> = {
    pending: 'Pending',
    generating: 'Generating…',
    ready: 'Ready',
    failed: 'Failed',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function plainGenerationError(code: string | null) {
  if (!code) return 'Generation failed. You can try again.'
  const map: Record<string, string> = {
    AI_NOT_CONFIGURED: 'AI is not configured. Please try again later.',
    AI_TIMEOUT: 'The AI took too long. Please try again.',
    AI_OUTPUT_INVALID: 'The AI returned an unexpected format. Please try again.',
    ALREADY_GENERATING: 'Generation is already in progress.',
    PERSIST_FAILED: 'Could not save the lesson. Please try again.',
  }
  return map[code] ?? 'Generation failed. You can try again.'
}

export function WeeklyLearningPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [items, setItems] = useState<LearningPlanItemRecord[]>([])
  const [form, setForm] = useState({ subject: '', topic: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingItemId, setGeneratingItemId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const selectedChildIdRef = useRef(selectedChildId)
  selectedChildIdRef.current = selectedChildId

  const loadItems = useCallback(async (studentId: string, opts?: { quiet?: boolean }) => {
    const result = await getLearningPlanItems(studentId)
    if (result.error && !opts?.quiet) {
      setError('Weekly learning items could not be loaded.')
    }
    setItems(result.data)
    return result.data
  }, [])

  useEffect(() => {
    if (!user?.id) return

    void (async () => {
      setLoading(true)
      const { data, error: childError } = await getOwnedChildren(user.id, user.role)
      if (childError) setError('Child profiles could not be loaded.')

      const next = (data ?? []).map((child) => ({ id: child.id, name: child.full_name }))
      setChildren(next)

      const initialChildId = next[0]?.id ?? ''
      setSelectedChildId(initialChildId)

      if (initialChildId) {
        await loadItems(initialChildId)
      } else {
        setItems([])
      }

      setLoading(false)
    })()
  }, [user?.id, user?.role, loadItems])

  useEffect(() => {
    if (!selectedChildId) return
    const hasGenerating = items.some((item) => item.status === 'generating') || generatingItemId
    if (!hasGenerating) return

    const interval = window.setInterval(() => {
      void loadItems(selectedChildId, { quiet: true }).then((data) => {
        const stillGenerating = data.some((item) => item.status === 'generating')
        if (!stillGenerating) {
          setGeneratingItemId(null)
        }
      })
    }, 2500)

    return () => window.clearInterval(interval)
  }, [selectedChildId, items, generatingItemId, loadItems])

  useEffect(() => {
    if (!selectedChildId) return

    const channel = supabase
      .channel(`learning-plan-${selectedChildId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learning_plan_items',
          filter: `student_id=eq.${selectedChildId}`,
        },
        () => {
          void loadItems(selectedChildId, { quiet: true }).then((data) => {
            const stillGenerating = data.some((item) => item.status === 'generating')
            if (!stillGenerating) setGeneratingItemId(null)
          })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [selectedChildId, loadItems])

  async function handleChildChange(studentId: string) {
    setSelectedChildId(studentId)
    setLoading(true)
    setError('')
    await loadItems(studentId)
    setLoading(false)
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    const isTeacher = user?.role === 'teacher'
    if (!form.subject.trim() || !form.topic.trim()) return
    if (!isTeacher && !selectedChildId) return
    if (isTeacher && children.length === 0) {
      setError('Register students before assigning class learning.')
      return
    }
    setSaving(true)
    setError('')
    const targets = isTeacher ? children.map((c) => c.id) : [selectedChildId]
    let failed = 0
    for (const studentId of targets) {
      const result = await createLearningPlanItem(
        studentId,
        form.subject.trim(),
        form.topic.trim(),
        form.description.trim(),
      )
      if (result.error) failed += 1
    }
    if (failed === targets.length) setError('Weekly learning item could not be added.')
    else if (failed > 0) setError(`Assigned to class with ${failed} error(s).`)
    else {
      setForm({ subject: '', topic: '', description: '' })
      if (selectedChildId) await loadItems(selectedChildId)
    }
    setSaving(false)
  }

  async function handleDelete(itemId: string) {
    const result = await deleteLearningPlanItem(itemId)
    if (result.error) setError('Weekly learning item could not be deleted.')
    else setItems((current) => current.filter((item) => item.id !== itemId))
  }

  async function handleGenerate(itemId: string) {
    setGeneratingItemId(itemId)
    setError('')
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, status: 'generating', errorMessage: null } : item,
      ),
    )

    void supabase.functions
      .invoke('generate-learning-content', {
        body: { learningPlanItemId: itemId },
      })
      .then(async ({ data, error: generationError }) => {
        if (selectedChildIdRef.current) {
          await loadItems(selectedChildIdRef.current, { quiet: true })
        }
        if (generationError) {
          const msg = generationError.message || ''
          if (!/timeout|Failed to fetch|network/i.test(msg)) {
            setError(msg)
          }
        } else if (data?.error) {
          const code =
            typeof data.error === 'object' && data.error?.code
              ? String(data.error.code)
              : typeof data.error === 'string'
                ? data.error
                : 'Generation failed'
          if (code !== 'ALREADY_GENERATING' && code !== 'ALREADY_GENERATED') {
            setError(plainGenerationError(code))
          }
        }
        setGeneratingItemId(null)
      })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Weekly Learning</h1>
        <p className="mt-1 text-sm text-text-muted">
          Plan focus areas for each child. Generate lessons when ready.
        </p>
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {children.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No child profiles yet"
          description="Create a child profile on the parent dashboard to plan weekly learning."
        />
      ) : (
        <>
          <div className="max-w-sm">
            <Select
              value={selectedChildId}
              onChange={(event) => void handleChildChange(event.target.value)}
              options={children.map((child) => ({ value: child.id, label: child.name }))}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
            <Card>
              <CardContent className="p-5">
                {loading ? (
                  <LoadingOverlay label="Loading weekly learning" />
                ) : items.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No focus areas yet"
                    description="Add a learning focus for this child to get started."
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-primary">
                              {item.subject}
                            </p>
                            <StatusBadge status={item.status} />
                          </div>
                          <h2 className="mt-1 font-semibold text-text">{item.topic}</h2>
                          {item.description && (
                            <p className="mt-2 text-sm leading-6 text-text-muted">{item.description}</p>
                          )}
                          {item.status === 'generating' && (
                            <p className="mt-2 text-sm text-primary">
                              Lens is writing the lesson. This can take a minute. Status updates
                              automatically when it finishes.
                            </p>
                          )}
                          {item.status === 'ready' && item.generatedAssignmentId && (
                            <p className="mt-2 text-sm text-secondary">
                              Lesson is ready for your child on Assignments.
                            </p>
                          )}
                          {item.status === 'failed' && (
                            <p className="mt-2 text-sm text-error">
                              {plainGenerationError(item.errorMessage)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleDelete(item.id)}
                            aria-label={`Delete ${item.topic}`}
                            disabled={item.status === 'generating'}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                          {(item.status === 'pending' || item.status === 'failed') && (
                            <Button
                              size="sm"
                              onClick={() => void handleGenerate(item.id)}
                              disabled={generatingItemId !== null}
                            >
                              {generatingItemId === item.id
                                ? 'Generating…'
                                : item.status === 'failed'
                                  ? 'Retry'
                                  : 'Generate lesson'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-text">Add focus area</h2>
                <form className="mt-4 flex flex-col gap-4" onSubmit={handleCreate}>
                  <label className="flex flex-col gap-1 text-sm font-medium text-text">
                    Subject
                    <Input
                      value={form.subject}
                      onChange={(event) => setForm({ ...form, subject: event.target.value })}
                      placeholder="e.g. Geography"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-text">
                    Topic
                    <Input
                      value={form.topic}
                      onChange={(event) => setForm({ ...form, topic: event.target.value })}
                      placeholder="What should they focus on?"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-text">
                    Description{' '}
                    <span className="text-xs font-normal text-text-muted">Optional</span>
                    <TextArea
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      placeholder="Add context or encouragement"
                    />
                  </label>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      'Adding…'
                    ) : (
                      <>
                        <Plus className="size-4" aria-hidden="true" />
                        {user?.role === 'teacher' ? 'Assign to whole class' : 'Add focus area'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <LockKeyhole className="size-4" aria-hidden="true" />
        Weekly learning is scoped to your authenticated account.
      </div>
    </div>
  )
}

export default WeeklyLearningPage
