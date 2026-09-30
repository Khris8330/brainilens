import { supabase } from '@/lib/supabase'
import type {
  GameKey,
  GameSessionEndPayload,
  GameSessionStartPayload,
  GameStatusPayload,
} from './types'

function unwrapError(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const err = (data as { error?: { message?: string; code?: string } | string }).error
    if (typeof err === 'string') return err
    if (err && typeof err === 'object' && err.message) return err.message
  }
  return fallback
}

export async function fetchGameStatus() {
  const { data, error } = await supabase.functions.invoke('game-status', { method: 'POST' })
  if (error) return { data: null as GameStatusPayload | null, error: error.message }
  if (data?.error) return { data: null, error: unwrapError(data, 'Could not load games status.') }
  return { data: (data?.data ?? null) as GameStatusPayload | null, error: null as string | null }
}

export async function startGameSession(gameKey: GameKey) {
  const { data, error } = await supabase.functions.invoke('game-session-start', {
    body: { game_key: gameKey },
  })
  if (error) return { data: null as GameSessionStartPayload | null, error: error.message }
  if (data?.error) return { data: null, error: unwrapError(data, 'Could not start session.') }
  return {
    data: (data?.data ?? null) as GameSessionStartPayload | null,
    error: null as string | null,
  }
}

export interface EndSessionInput {
  sessionId: string
  score?: number
  accuracy?: number
  bestStreak?: number
  questionsAnswered?: number
  correctAnswers?: number
  wordRush?: {
    current_tier?: string
    current_level?: number
    xp_gained?: number
    round_score?: number
    round_best_streak?: number
  }
}

export async function endGameSession(input: EndSessionInput) {
  const { data, error } = await supabase.functions.invoke('game-session-end', {
    body: {
      session_id: input.sessionId,
      score: input.score,
      accuracy: input.accuracy,
      best_streak: input.bestStreak,
      questions_answered: input.questionsAnswered,
      correct_answers: input.correctAnswers,
      word_rush: input.wordRush,
    },
  })
  if (error) return { data: null as GameSessionEndPayload | null, error: error.message }
  if (data?.error) return { data: null, error: unwrapError(data, 'Could not end session.') }
  return {
    data: (data?.data ?? null) as GameSessionEndPayload | null,
    error: null as string | null,
  }
}

export function formatRemainingTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}
