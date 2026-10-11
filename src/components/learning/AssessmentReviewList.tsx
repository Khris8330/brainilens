import { CheckCircle2, ClipboardCheck, XCircle } from 'lucide-react'

export interface AssessmentReviewItem {
  id: string
  index: number
  question: string
  answer: string
  correctAnswer?: string
  isCorrect: boolean
  isOpenEnded?: boolean
}

export function AssessmentReviewList({
  items,
  title = 'Question review',
  description = 'Green means correct. Red means incorrect. Review each one below.',
}: {
  items: AssessmentReviewItem[]
  title?: string
  description?: string
}) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-border bg-background p-4 text-sm text-text-muted">
        No answered questions are available for this topic yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
      <ol className="space-y-3">
        {items.map((item) => {
          const tone = item.isOpenEnded
            ? 'border-border bg-background'
            : item.isCorrect
              ? 'border-success/40 bg-success/10'
              : 'border-error/40 bg-error/10'
          const labelColor = item.isOpenEnded
            ? 'text-text-muted'
            : item.isCorrect
              ? 'text-success'
              : 'text-error'

          return (
            <li key={item.id} className={`rounded-xl border p-4 text-left ${tone}`}>
              <div className="flex items-start gap-3">
                {item.isOpenEnded ? (
                  <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-text-muted" />
                ) : item.isCorrect ? (
                  <CheckCircle2 className={`mt-0.5 size-5 shrink-0 ${labelColor}`} />
                ) : (
                  <XCircle className={`mt-0.5 size-5 shrink-0 ${labelColor}`} />
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Question {item.index + 1}
                    </span>
                    <span className={`text-xs font-semibold ${labelColor}`}>
                      {item.isOpenEnded ? 'Submitted' : item.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-6 text-text">{item.question}</p>
                  <p className="text-sm text-text">
                    <span className="text-text-muted">Your answer: </span>
                    {item.answer}
                  </p>
                  {!item.isCorrect && !item.isOpenEnded && item.correctAnswer ? (
                    <p className="text-sm text-text">
                      <span className="text-text-muted">Correct answer: </span>
                      {item.correctAnswer}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
