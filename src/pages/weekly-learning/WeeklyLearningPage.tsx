import { useEffect, useState, type FormEvent } from 'react'
import { BookOpen, LockKeyhole, Plus, Trash2 } from 'lucide-react'
import { Button, Card, CardContent, EmptyState, Input, LoadingOverlay, Select, TextArea } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { createLearningPlanItem, deleteLearningPlanItem, getLearningPlanItems, getParentChildren, type LearningPlanItemRecord } from '@/lib/learning-data'

interface Child { id: string; name: string }

export function WeeklyLearningPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [items, setItems] = useState<LearningPlanItemRecord[]>([])
  const [form, setForm] = useState({ subject: '', topic: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadItems(studentId: string) {
    const result = await getLearningPlanItems(studentId)
    if (result.error) setError('Weekly learning items could not be loaded.')
    setItems(result.data)
  }

  useEffect(() => {
    if (!user?.id) return
    void getParentChildren(user.id).then(({ data, error: childError }) => {
      if (childError) setError('Child profiles could not be loaded.')
      const next = (data ?? []).map((child) => ({ id: child.id, name: child.full_name }))
      setChildren(next)
      setSelectedChildId(next[0]?.id ?? '')
      setLoading(false)
    })
  }, [user?.id])

  async function handleChildChange(studentId: string) {
    setSelectedChildId(studentId)
    setLoading(true)
    await loadItems(studentId)
    setLoading(false)
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!selectedChildId || !form.subject.trim() || !form.topic.trim()) return
    setSaving(true)
    setError('')
    const result = await createLearningPlanItem(selectedChildId, form.subject.trim(), form.topic.trim(), form.description.trim())
    if (result.error) setError('Weekly learning item could not be added.')
    else { setForm({ subject: '', topic: '', description: '' }); await loadItems(selectedChildId) }
    setSaving(false)
  }

  async function handleDelete(itemId: string) {
    const result = await deleteLearningPlanItem(itemId)
    if (result.error) setError('Weekly learning item could not be deleted.')
    else setItems((current) => current.filter((item) => item.id !== itemId))
  }

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold text-text">Weekly Learning</h1><p className="mt-1 text-sm text-text-muted">Plan focus areas for each child. These are guidance items, not assignments.</p></div>
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    {children.length === 0 ? <EmptyState icon={BookOpen} title="No child profiles yet" description="Create a child profile to plan weekly learning." /> : <>
      <div className="max-w-sm"><Select value={selectedChildId} onChange={(event) => void handleChildChange(event.target.value)} options={children.map((child) => ({ value: child.id, label: child.name }))} /></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <Card><CardContent className="p-5">{loading ? <LoadingOverlay label="Loading weekly learning" /> : items.length === 0 ? <EmptyState icon={BookOpen} title="No focus areas yet" description="Add a learning focus for this child to get started." /> : <div className="flex flex-col gap-3">{items.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"><div><p className="text-xs font-medium uppercase tracking-wide text-primary">{item.subject}</p><h2 className="mt-1 font-semibold text-text">{item.topic}</h2>{item.description && <p className="mt-2 text-sm leading-6 text-text-muted">{item.description}</p>}</div><Button variant="ghost" size="sm" onClick={() => void handleDelete(item.id)} aria-label={`Delete ${item.topic}`}><Trash2 className="size-4" aria-hidden="true" /></Button></div>)}</div>}</CardContent></Card>
        <Card><CardContent className="p-5"><h2 className="font-semibold text-text">Add focus area</h2><form className="mt-4 flex flex-col gap-4" onSubmit={handleCreate}><label className="flex flex-col gap-1 text-sm font-medium text-text">Subject<Input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="e.g. Geography" required /></label><label className="flex flex-col gap-1 text-sm font-medium text-text">Topic<Input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} placeholder="What should they focus on?" required /></label><label className="flex flex-col gap-1 text-sm font-medium text-text">Description <span className="text-xs font-normal text-text-muted">Optional</span><TextArea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add context or encouragement" /></label><Button type="submit" disabled={saving}>{saving ? 'Adding…' : <><Plus className="size-4" aria-hidden="true" />Add focus area</>}</Button></form></CardContent></Card>
      </div>
    </>}
    <div className="flex items-center gap-2 text-xs text-text-muted"><LockKeyhole className="size-4" aria-hidden="true" />Weekly learning is scoped to your authenticated parent account.</div>
  </div>
}

export default WeeklyLearningPage
