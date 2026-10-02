import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, Lock, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, LoadingOverlay } from '@/components/ui'
import { fetchGameStatus, formatRemainingTime } from '@/games/session-api'
import type { GameStatusPayload } from '@/games/types'
import { routes } from '@/routes'

export function GamesHubPage() {
  const [status, setStatus] = useState<GameStatusPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const { data, error: statusError } = await fetchGameStatus()
      if (statusError) setError(statusError)
      else setStatus(data)
      setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingOverlay label="Loading Games Hub" />

  const unlocked = status?.gamesUnlocked ?? false
  const remaining = status?.remainingSeconds ?? 0
  const limit = status?.dailyLimitSeconds ?? 7200

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-text">
            <Gamepad2 className="size-6 text-secondary" aria-hidden="true" />
            Games Hub
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Play after you finish today's learning assessment. All games share one daily time
            limit.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-text">
            <Clock className="size-4 text-primary" aria-hidden="true" />
            Daily game time
          </div>
          <p className="mt-1 text-text-muted">
            {formatRemainingTime(remaining)} left of {formatRemainingTime(limit)}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Resets at midnight ({status?.timezone ?? 'UTC+1'})
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {!unlocked && (
        <Card>
          <CardContent className="flex items-start gap-3 p-5">
            <Lock className="mt-0.5 size-5 shrink-0 text-text-muted" aria-hidden="true" />
            <div>
              <p className="font-medium text-text">Games are locked for now</p>
              <p className="mt-1 text-sm text-text-muted">
                {status?.unlockReason ??
                  "Complete today's learning assessment to unlock the Games Hub."}
              </p>
              <Link to={routes.studentAssignments} className="mt-3 inline-block">
                <Button size="sm">Go to assignments</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {(status?.games ?? []).map((game) => {
          const isAvailable = game.status === 'available' && unlocked && remaining > 0
          const lockedByTime = unlocked && remaining <= 0
          return (
            <Card key={game.key} className={!isAvailable ? 'opacity-90' : undefined}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  {game.status === 'coming_soon' ? (
                    <Badge variant="secondary">Coming soon</Badge>
                  ) : !unlocked ? (
                    <Badge variant="default">Locked</Badge>
                  ) : lockedByTime ? (
                    <Badge variant="default">Time used up</Badge>
                  ) : (
                    <Badge variant="secondary">Ready</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-text-muted">{game.description}</p>
                {game.key === 'word_rush' && status?.wordRush && (
                  <p className="text-xs text-text-muted">
                    Best score {status.wordRush.best_score} · Streak {status.wordRush.best_streak} ·
                    Level {status.wordRush.current_level} ({status.wordRush.current_tier})
                  </p>
                )}
                {game.key === 'math_sprint' && status?.mathSprint && (
                  <p className="text-xs text-text-muted">
                    Best score {status.mathSprint.best_score} · Streak {status.mathSprint.best_streak} ·
                    Level {status.mathSprint.current_level} ({status.mathSprint.current_tier})
                  </p>
                )}
                {game.key === 'word_rush' ? (
                  isAvailable ? (
                    <Link to={routes.studentWordRush}>
                      <Button className="w-full sm:w-auto">
                        <Sparkles className="size-4" aria-hidden="true" />
                        Play Word Rush
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full sm:w-auto">
                      {lockedByTime ? 'Come back tomorrow' : 'Locked'}
                    </Button>
                  )
                ) : game.key === 'math_sprint' ? (
                  isAvailable ? (
                    <Link to={routes.studentMathSprint}>
                      <Button className="w-full sm:w-auto">
                        <Sparkles className="size-4" aria-hidden="true" />
                        Play Math Sprint
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full sm:w-auto">
                      {lockedByTime ? 'Come back tomorrow' : 'Locked'}
                    </Button>
                  )
                ) : (
                  <Button disabled variant="outline" className="w-full sm:w-auto">
                    Not available yet
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default GamesHubPage
