/** Shared Games Layer types. Not academic progress. */

export type GameKey =
  | 'word_rush'
  | 'math_sprint'
  | 'color_block'
  | 'crossmath'
  | 'sudoku'
  | 'chess'

export type GameCatalogStatus = 'available' | 'coming_soon'

export interface GameCatalogEntry {
  key: GameKey
  title: string
  description: string
  status: GameCatalogStatus
}

export interface GameStatusPayload {
  studentId: string
  gamesUnlocked: boolean
  unlockReason: string
  dailyLimitSeconds: number
  secondsUsed: number
  remainingSeconds: number
  usageDate: string
  timezone: string
  activeSession: null
  wordRush: WordRushProgress | null
  mathSprint: MathSprintProgress | null
  games: GameCatalogEntry[]
}

export interface GameSessionStartPayload {
  sessionId: string
  gameKey: string
  startedAt: string
  remainingSeconds: number
  dailyLimitSeconds: number
  usageDate: string
  timezone: string
}

export interface GameSessionEndPayload {
  sessionId: string
  durationSeconds?: number
  remainingSeconds: number
  dailyLimitSeconds: number
  secondsUsed?: number
  alreadyEnded?: boolean
}

export interface MathSprintProgress {
  current_tier: string
  current_level: number
  xp: number
  best_score: number
  best_streak: number
  total_rounds: number
  total_questions: number
  total_correct: number
  last_played_at: string | null
}

export interface WordRushProgress {
  current_tier: string
  current_level: number
  xp: number
  best_score: number
  best_streak: number
  total_rounds: number
  total_questions: number
  total_correct: number
  last_played_at: string | null
}

export const DAILY_GAME_LIMIT_SECONDS = 120 * 60
export const WORD_RUSH_ROUND_TARGET_MS = 5 * 60 * 1000
export const MATH_SPRINT_ROUND_TARGET_MS = 5 * 60 * 1000
