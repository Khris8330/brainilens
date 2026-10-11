import { useEffect, useState } from 'react'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, EmptyState, LoadingOverlay } from '@/components/ui'
import { AssessmentReviewList, type AssessmentReviewItem } from '@/components/learning/AssessmentReviewList'
import { useAuth } from '@/contexts/AuthContext'
import {
  formatLearningError,
  getAssessmentReviewForContent,
  type AssessmentReviewPayload,
} from '@/lib/learning-data'
import { routes } from '@/routes'

export function StudentProgressReviewPage() {
  const { user } = useAuth()
  const { learningContentId } = useParams<{ learningContentId: string }>()
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading')
  const [payload, setPayload] = useState<AssessmentReviewPayload | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!user?.id || !learningContentId) return
    void getAssessmentReviewForContent(user.id, learningContentId).then(({ data, error }) => {
      if (error) {
        setErrorMessage(formatLearningError(error))
        setState('error')
        return
      }
      if (!data) {
        setState('empty')
        return
      }
      setPayload(data)
      setState('ready')
    })
  }, [learningContentId, user?.id])

  if (state === 'loading') return <LoadingOverlay label="Loading question review" />
  if (state === 'error') {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Review unavailable"
        description={errorMessage || 'We could not load this assessment review.'}
      />
    )
  }
  if (state === 'empty' || !payload) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No review yet"
        description="Complete an assessment for this topic to see which questions you got right or wrong."
      />
    )
  }

  const items: AssessmentReviewItem[] = payload.items
  const correctCount = items.filter((item) => item.isCorrect && !item.isOpenEnded).length
  const scoredCount = items.filter((item) => !item.isOpenEnded).length
  const percentage =
    scoredCount > 0 ? Math.round((correctCount / scoredCount) * 100) : payload.score ?? 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={routes.studentProgress}
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft className="size-4" />
        Back to My Progress
      </Link>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-sm font-medium text-primary">{payload.subject}</p>
            <h1 className="mt-1 text-2xl font-semibold text-text">{payload.title}</h1>
            <p className="mt-2 text-sm text-text-muted">
              Review of your answered assessment questions for this topic.
            </p>
          </div>
          <div className="rounded-xl bg-background p-5">
            <p className="text-sm text-text-muted">Score</p>
            <p className="mt-1 text-3xl font-semibold text-text">
              {correctCount} / {scoredCount || items.length}
            </p>
            <p className="mt-1 text-lg font-medium text-primary">{percentage}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <AssessmentReviewList items={items} />
        </CardContent>
      </Card>
    </div>
  )
}
