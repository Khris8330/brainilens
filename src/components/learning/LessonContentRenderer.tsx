import { useState } from 'react'
import { CheckCircle2, CircleHelp, Lightbulb, ListChecks, XCircle } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import type { LessonSection, ParsedLessonContent } from '@/lib/lesson-content'

export function LessonContentRenderer({ lesson }: { lesson: ParsedLessonContent }) {
  return <div className="space-y-5">
    {lesson.sections.map((section, index) => <LessonSectionCard key={section.id || `${section.type}-${index}`} section={section} />)}
  </div>
}

function LessonSectionCard({ section }: { section: LessonSection }) {
  const icon = section.type === 'practice' ? CircleHelp : section.type === 'example' ? Lightbulb : section.type === 'summary' ? ListChecks : CheckCircle2
  const Icon = icon
  return <Card><CardContent className="space-y-3 p-5">
    <div className="flex items-center gap-2"><Icon className="size-5 text-primary" aria-hidden="true" /><h3 className="font-semibold capitalize text-text">{section.title || section.type}</h3></div>
    {section.type === 'practice' ? <PracticeSection section={section} /> : <p className="whitespace-pre-wrap text-sm leading-6 text-text">{section.content}</p>}
  </CardContent></Card>
}

function PracticeSection({ section }: { section: LessonSection }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const options = section.options ?? []
  const isCorrect = submitted && selected !== null && selected === section.correct_answer
  return <div className="space-y-4">
    <p className="text-sm leading-6 text-text">{section.question || section.content}</p>
    {options.length > 0 ? <div className="grid gap-2" role="radiogroup" aria-label={section.question || 'Practice answer options'}>
      {options.map((option) => { const active = selected === option; return <button key={option} type="button" role="radio" aria-checked={active} onClick={() => { setSelected(option); setSubmitted(false) }} className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${active ? 'border-primary bg-primary-light text-text' : 'border-border bg-surface text-text hover:border-primary'}`}>{option}</button> })}
    </div> : <p className="text-sm text-text-muted">No answer options are available for this practice question.</p>}
    {options.length > 0 && <Button type="button" onClick={() => setSubmitted(true)} disabled={!selected}>Check answer</Button>}
    {submitted && selected && <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${isCorrect ? 'bg-secondary-light text-text' : 'bg-danger-light text-text'}`} role="status">{isCorrect ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}<div><p className="font-medium">{isCorrect ? 'Correct answer' : 'Not quite'}</p>{section.explanation && <p className="mt-1 leading-6">{section.explanation}</p>}</div></div>}
  </div>
}
