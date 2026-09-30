import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Timer } from 'lucide-react'
import { Card, CardContent, Button, Badge, LoadingOverlay } from '@/components/ui'
import { endGameSession, formatRemainingTime, startGameSession } from '@/games/session-api'
import { WORD_RUSH_ROUND_TARGET_MS } from '@/games/types'
import {
  adjustDifficulty,
  selectChallenge,
  validateAnswer,
  scoreCorrectAnswer,
  xpForCorrect,
  type Challenge,
  type RoundState,
  type WordRushTier,
} from '@/games/word-rush/engine'
import { routes } from '@/routes'

type Phase = 'loading' | 'playing' | 'feedback' | 'round_end' | 'error'

export function WordRushPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [selected, setSelected] = useState('')
  const [feedback, setFeedback] = useState<{
    correct: boolean
    points: number
    streak: number
    explanation?: string
    correctAnswer: string
  } | null>(null)
  const [round, setRound] = useState<RoundState>({
    currentScore: 0,
    currentStreak: 0,
    bestRoundStreak: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    difficulty: 2,
    recentChallengeIds: [],
    recentTypes: [],
    roundStartTime: Date.now(),
    xpGained: 0,
  })
  const [roundLeftMs, setRoundLeftMs] = useState(WORD_RUSH_ROUND_TARGET_MS)
  const promptShownAt = useRef(Date.now())
  const endingRef = useRef(false)
  const sessionIdRef = useRef<string | null>(null)
  const roundRef = useRef(round)
  roundRef.current = round

  const loadNext = useCallback((state: RoundState) => {
    const next = selectChallenge({
      tier: 'starter' as WordRushTier,
      difficulty: state.difficulty,
      recentIds: state.recentChallengeIds.slice(-8),
      recentTypes: state.recentTypes.slice(-4),
    })
    setChallenge(next)
    setSelected('')
    setFeedback(null)
    promptShownAt.current = Date.now()
    setPhase('playing')
  }, [])

  const finishSession = useCallback(
    async (state: RoundState) => {
      if (endingRef.current) return
      endingRef.current = true
      const sid = sessionIdRef.current ?? sessionId
      if (!sid) {
        setPhase('round_end')
        return
      }
      const accuracy =
        state.questionsAnswered > 0
          ? Math.round((state.correctAnswers / state.questionsAnswered) * 100)
          : 0
      const { data, error: endError } = await endGameSession({
        sessionId: sid,
        score: state.currentScore,
        accuracy,
        bestStreak: state.bestRoundStreak,
        questionsAnswered: state.questionsAnswered,
        correctAnswers: state.correctAnswers,
        wordRush: {
          current_tier: 'starter',
          current_level: 1,
          xp_gained: state.xpGained,
          round_score: state.currentScore,
          round_best_streak: state.bestRoundStreak,
        },
      })
      if (endError) setError(endError)
      if (data) setRemainingSeconds(data.remainingSeconds)
      setPhase('round_end')
    },
    [sessionId],
  )

  useEffect(() => {
    void (async () => {
      const { data, error: startError } = await startGameSession('word_rush')
      if (startError || !data) {
        setError(startError ?? 'Could not start Word Rush.')
        setPhase('error')
        return
      }
      sessionIdRef.current = data.sessionId
      setSessionId(data.sessionId)
      setRemainingSeconds(data.remainingSeconds)
      const initial: RoundState = {
        currentScore: 0,
        currentStreak: 0,
        bestRoundStreak: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        difficulty: 2,
        recentChallengeIds: [],
        recentTypes: [],
        roundStartTime: Date.now(),
        xpGained: 0,
      }
      setRound(initial)
      loadNext(initial)
    })()

    return () => {
      const sid = sessionIdRef.current
      if (sid && !endingRef.current) {
        endingRef.current = true
        void endGameSession({
          sessionId: sid,
          score: roundRef.current.currentScore,
          bestStreak: roundRef.current.bestRoundStreak,
          questionsAnswered: roundRef.current.questionsAnswered,
          correctAnswers: roundRef.current.correctAnswers,
          wordRush: {
            xp_gained: roundRef.current.xpGained,
            round_score: roundRef.current.currentScore,
            round_best_streak: roundRef.current.bestRoundStreak,
          },
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'feedback') return
    const id = window.setInterval(() => {
      const elapsed = Date.now() - round.roundStartTime
      setRoundLeftMs(Math.max(0, WORD_RUSH_ROUND_TARGET_MS - elapsed))
    }, 250)
    return () => window.clearInterval(id)
  }, [phase, round.roundStartTime])

  useEffect(() => {
    if (phase === 'error' || phase === 'round_end' || phase === 'loading') return
    const id = window.setInterval(() => {
      setRemainingSeconds((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase])

  function submitAnswer(raw: string) {
    if (!challenge || phase !== 'playing') return
    const responseMs = Date.now() - promptShownAt.current
    const correct = validateAnswer(challenge, raw)
    const next = { ...round }
    next.questionsAnswered += 1
    next.recentChallengeIds = [...next.recentChallengeIds, challenge.id].slice(-12)
    next.recentTypes = [...next.recentTypes, challenge.type].slice(-6)

    let points = 0
    if (correct) {
      next.correctAnswers += 1
      next.currentStreak += 1
      next.bestRoundStreak = Math.max(next.bestRoundStreak, next.currentStreak)
      points = scoreCorrectAnswer(challenge.difficulty, next.currentStreak, responseMs)
      next.currentScore += points
      next.xpGained += xpForCorrect(challenge.difficulty)
    } else {
      next.incorrectAnswers += 1
      next.currentStreak = 0
    }
    next.difficulty = adjustDifficulty(next.difficulty, correct)
    setRound(next)
    setFeedback({
      correct,
      points,
      streak: next.currentStreak,
      explanation: challenge.explanation,
      correctAnswer: challenge.answer,
    })
    setPhase('feedback')

    const roundExpired = Date.now() - next.roundStartTime >= WORD_RUSH_ROUND_TARGET_MS
    const dailyExpired = remainingSeconds <= 5

    window.setTimeout(() => {
      if (roundExpired || dailyExpired || remainingSeconds <= 0) {
        void finishSession(next)
      } else {
        loadNext(next)
      }
    }, correct ? 900 : 1600)
  }

  async function handleEndRound() {
    await finishSession(round)
  }

  if (phase === 'loading') return <LoadingOverlay label="Starting Word Rush" />

  if (phase === 'error') {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <p className="text-sm text-error" role="alert">
          {error || 'Word Rush could not start.'}
        </p>
        <Link to={routes.studentGames}>
          <Button variant="outline">
            <ArrowLeft className="size-4" /> Back to Games Hub
          </Button>
        </Link>
      </div>
    )
  }

  if (phase === 'round_end') {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <h1 className="text-2xl font-semibold text-text">Round complete</h1>
            <p className="text-sm text-text-muted">Great effort. Game time is saved on the server.</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-background p-3">
                <p className="text-text-muted">Score</p>
                <p className="text-xl font-semibold text-text">{round.currentScore}</p>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-text-muted">Best streak</p>
                <p className="text-xl font-semibold text-text">{round.bestRoundStreak}</p>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-text-muted">Correct</p>
                <p className="text-xl font-semibold text-text">
                  {round.correctAnswers}/{round.questionsAnswered}
                </p>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-text-muted">Time left today</p>
                <p className="text-xl font-semibold text-text">
                  {formatRemainingTime(remainingSeconds)}
                </p>
              </div>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => navigate(routes.studentGames)}>Games Hub</Button>
              {remainingSeconds > 30 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    endingRef.current = false
                    setPhase('loading')
                    void (async () => {
                      const { data, error: startError } = await startGameSession('word_rush')
                      if (startError || !data) {
                        setError(startError ?? 'Could not start another round.')
                        setPhase('error')
                        return
                      }
                      sessionIdRef.current = data.sessionId
                      setSessionId(data.sessionId)
                      setRemainingSeconds(data.remainingSeconds)
                      const initial: RoundState = {
                        currentScore: 0,
                        currentStreak: 0,
                        bestRoundStreak: 0,
                        questionsAnswered: 0,
                        correctAnswers: 0,
                        incorrectAnswers: 0,
                        difficulty: 2,
                        recentChallengeIds: [],
                        recentTypes: [],
                        roundStartTime: Date.now(),
                        xpGained: 0,
                      }
                      setRound(initial)
                      loadNext(initial)
                    })()
                  }}
                >
                  Play another round
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={routes.studentGames} className="text-sm text-primary hover:underline">
          ← Games Hub
        </Link>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">
            <Timer className="size-3" /> Round {Math.ceil(roundLeftMs / 1000)}s
          </Badge>
          <Badge variant="default">Today {formatRemainingTime(remainingSeconds)}</Badge>
          <Badge>Score {round.currentScore}</Badge>
          <Badge variant="secondary">Streak {round.currentStreak}</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          {challenge && (
            <>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {challenge.type.replace(/_/g, ' ')} · difficulty {challenge.difficulty}
                </p>
                <h1 className="mt-2 text-xl font-semibold text-text">{challenge.prompt}</h1>
              </div>

              {phase === 'feedback' && feedback && (
                <div
                  className={`rounded-xl border p-4 text-sm ${
                    feedback.correct
                      ? 'border-success/40 bg-success/10 text-success'
                      : 'border-border bg-background text-text'
                  }`}
                  role="status"
                >
                  {feedback.correct ? (
                    <p className="font-semibold">
                      Correct! +{feedback.points}
                      {feedback.streak > 1 ? ` · Streak ×${feedback.streak}` : ''}
                    </p>
                  ) : (
                    <>
                      <p className="font-semibold text-text">Not quite!</p>
                      <p className="mt-1 text-text-muted">
                        Answer: <strong className="text-text">{feedback.correctAnswer}</strong>
                      </p>
                      {feedback.explanation && (
                        <p className="mt-1 text-text-muted">{feedback.explanation}</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {phase === 'playing' && challenge.options && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {challenge.options.map((opt) => (
                    <Button
                      key={opt}
                      variant={selected === opt ? 'primary' : 'outline'}
                      className="h-auto min-h-11 justify-center whitespace-normal py-3"
                      onClick={() => {
                        setSelected(opt)
                        submitAnswer(opt)
                      }}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}

          <Button variant="ghost" size="sm" onClick={() => void handleEndRound()}>
            End round
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default WordRushPage
