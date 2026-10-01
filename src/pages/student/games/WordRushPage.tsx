import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Flame, Star, Timer, Volume2, VolumeX, Zap } from 'lucide-react'
import { Button, LoadingOverlay } from '@/components/ui'
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
import {
  initSoundMuteFromStorage,
  isSoundMuted,
  playCorrect,
  playRoundEnd,
  playStreak,
  playWrong,
  setSoundMuted,
} from '@/games/word-rush/sounds'
import { routes } from '@/routes'

type Phase = 'loading' | 'playing' | 'feedback' | 'round_end' | 'error'

const TILE_STYLES = [
  'from-sky-400 to-blue-600 shadow-sky-200',
  'from-violet-400 to-purple-600 shadow-violet-200',
  'from-amber-400 to-orange-500 shadow-amber-200',
  'from-emerald-400 to-teal-600 shadow-emerald-200',
]

function mascotFor(phase: Phase, feedback: { correct: boolean } | null): string {
  if (phase === 'loading') return '🤖'
  if (phase === 'round_end') return '🎉'
  if (phase === 'error') return '😅'
  if (phase === 'feedback' && feedback) return feedback.correct ? '🤩' : '💭'
  return '🤖'
}

function mascotLine(phase: Phase, feedback: { correct: boolean; streak: number } | null): string {
  if (phase === 'loading') return 'Getting your words ready...'
  if (phase === 'round_end') return 'Awesome round! Look at those stars.'
  if (phase === 'error') return 'Hmm, something went wrong. Try again?'
  if (phase === 'feedback' && feedback) {
    if (feedback.correct && feedback.streak >= 3) return 'On fire! Keep the streak going!'
    if (feedback.correct) return 'Yes! You got it!'
    return 'Almost! You will get the next one.'
  }
  return 'Pick the best answer!'
}

export function WordRushPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [selected, setSelected] = useState('')
  const [muted, setMuted] = useState(true)
  const [shake, setShake] = useState(false)
  const [popPoints, setPopPoints] = useState<number | null>(null)
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

  useEffect(() => {
    setMuted(initSoundMuteFromStorage())
  }, [])

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
    setPopPoints(null)
    setShake(false)
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
        playRoundEnd()
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
      playRoundEnd()
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
      if (next.currentStreak >= 3) playStreak()
      else playCorrect()
      setPopPoints(points)
    } else {
      next.incorrectAnswers += 1
      next.currentStreak = 0
      playWrong()
      setShake(true)
      window.setTimeout(() => setShake(false), 500)
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

  function toggleMute() {
    const next = !isSoundMuted()
    setSoundMuted(next)
    setMuted(next)
  }

  const roundPct = Math.max(0, Math.min(100, (roundLeftMs / WORD_RUSH_ROUND_TARGET_MS) * 100))
  const roundSec = Math.ceil(roundLeftMs / 1000)

  if (phase === 'loading') return <LoadingOverlay label="Starting Word Rush" />

  if (phase === 'error') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl" aria-hidden>
          {mascotFor('error', null)}
        </div>
        <p className="text-base font-medium text-text">{error || 'Word Rush could not start.'}</p>
        <p className="text-sm text-text-muted">{mascotLine('error', null)}</p>
        <Link to={routes.studentGames}>
          <Button variant="outline">
            <ArrowLeft className="size-4" /> Back to Games Hub
          </Button>
        </Link>
      </div>
    )
  }

  if (phase === 'round_end') {
    const accuracy =
      round.questionsAnswered > 0
        ? Math.round((round.correctAnswers / round.questionsAnswered) * 100)
        : 0
    return (
      <div className="relative mx-auto max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-amber-400 p-[2px] shadow-xl">
        <div className="rounded-[1.4rem] bg-white px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-violet-100 text-5xl shadow-inner">
            {mascotFor('round_end', null)}
          </div>
          <h1 className="text-2xl font-bold text-primary">Round complete!</h1>
          <p className="mt-1 text-sm text-text-muted">{mascotLine('round_end', null)}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatTile icon={<Star className="size-4 text-amber-500" />} label="Score" value={String(round.currentScore)} accent="bg-amber-50" />
            <StatTile icon={<Flame className="size-4 text-orange-500" />} label="Best streak" value={String(round.bestRoundStreak)} accent="bg-orange-50" />
            <StatTile icon={<Zap className="size-4 text-violet-500" />} label="Accuracy" value={`${accuracy}%`} accent="bg-violet-50" />
            <StatTile icon={<Timer className="size-4 text-sky-500" />} label="Today left" value={formatRemainingTime(remainingSeconds)} accent="bg-sky-50" />
          </div>

          {error && <p className="mt-3 text-sm text-error">{error}</p>}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
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
                Play again
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-4 -mt-2 min-h-[70vh] bg-gradient-to-b from-sky-100 via-violet-50 to-amber-50 px-4 py-4 sm:-mx-6">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={routes.studentGames}
            className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur hover:bg-white"
          >
            <ArrowLeft className="size-4" /> Games
          </Link>
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex size-10 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm backdrop-blur hover:bg-white"
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <HudChip label="Score" value={String(round.currentScore)} icon={<Star className="size-3.5 text-amber-500" />} />
          <HudChip
            label="Streak"
            value={String(round.currentStreak)}
            icon={<Flame className={`size-3.5 ${round.currentStreak >= 3 ? 'text-orange-500' : 'text-text-muted'}`} />}
            highlight={round.currentStreak >= 3}
          />
          <HudChip label="Round" value={`${roundSec}s`} icon={<Timer className="size-3.5 text-sky-600" />} />
          <HudChip label="Today" value={formatRemainingTime(remainingSeconds)} icon={<Zap className="size-3.5 text-violet-500" />} />
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-white/70 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              roundPct < 20 ? 'bg-rose-400' : 'bg-gradient-to-r from-sky-400 to-violet-500'
            }`}
            style={{ width: `${roundPct}%` }}
          />
        </div>

        <div
          className={`relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur sm:p-7 ${
            shake ? 'animate-[wr-shake_0.45s_ease-in-out]' : ''
          }`}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-3xl shadow-md">
              {mascotFor(phase, feedback)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Lens says</p>
              <p className="text-sm font-medium text-text">{mascotLine(phase, feedback)}</p>
            </div>
          </div>

          {challenge && (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {challenge.type.replace(/_/g, ' ')} · level {challenge.difficulty}
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-snug text-primary sm:text-3xl">
                {challenge.prompt}
              </h1>

              {phase === 'feedback' && feedback && (
                <div
                  className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                    feedback.correct
                      ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                      : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'
                  }`}
                  role="status"
                >
                  {feedback.correct ? (
                    <p>
                      Correct! +{feedback.points} points
                      {feedback.streak > 1 ? ` · Streak x${feedback.streak}` : ''}
                    </p>
                  ) : (
                    <>
                      <p>
                        Not quite. The answer is <strong>{feedback.correctAnswer}</strong>.
                      </p>
                      {feedback.explanation && (
                        <p className="mt-1 font-normal opacity-90">{feedback.explanation}</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {popPoints !== null && phase === 'feedback' && feedback?.correct && (
                <div className="pointer-events-none absolute right-6 top-8 animate-[wr-float_0.9s_ease-out_forwards] text-2xl font-black text-amber-500">
                  +{popPoints}
                </div>
              )}

              {phase === 'playing' && challenge.options && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {challenge.options.map((opt, index) => {
                    const isSelected = selected === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={phase !== 'playing'}
                        onClick={() => {
                          setSelected(opt)
                          submitAnswer(opt)
                        }}
                        className={`min-h-[3.25rem] rounded-2xl bg-gradient-to-br px-4 py-3 text-center text-lg font-bold text-white shadow-lg transition active:scale-[0.97] disabled:opacity-70 ${
                          TILE_STYLES[index % TILE_STYLES.length]
                        } ${isSelected ? 'ring-4 ring-white/80 scale-[0.98]' : 'hover:brightness-110'}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => void handleEndRound()}
              className="text-sm font-medium text-text-muted underline-offset-2 hover:text-text hover:underline"
            >
              End round
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wr-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes wr-float {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-28px); }
        }
      `}</style>
    </div>
  )
}

function HudChip({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: string
  icon: ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl px-2 py-2 text-center shadow-sm ${
        highlight ? 'bg-orange-100 ring-1 ring-orange-300' : 'bg-white/85 backdrop-blur'
      }`}
    >
      <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-sm font-bold text-primary sm:text-base">{value}</p>
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode
  label: string
  value: string
  accent: string
}) {
  return (
    <div className={`rounded-2xl ${accent} p-3 text-left`}>
      <div className="flex items-center gap-1 text-xs font-medium text-text-muted">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-xl font-bold text-primary">{value}</p>
    </div>
  )
}

export default WordRushPage
