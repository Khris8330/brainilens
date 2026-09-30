export type WordRushTier = 'starter' | 'explorer' | 'challenger' | 'advanced' | 'master'

export type ChallengeType =
  | 'missing_letter'
  | 'word_builder'
  | 'picture_word'
  | 'word_scramble'
  | 'spelling'
  | 'synonym'
  | 'antonym'
  | 'definition'
  | 'context'
  | 'sentence_completion'

export interface Challenge {
  id: string
  tier: WordRushTier
  type: ChallengeType
  difficulty: 1 | 2 | 3 | 4 | 5
  prompt: string
  answer: string
  options?: string[]
  explanation?: string
  word: string
  metadata?: Record<string, unknown>
}

export interface RoundState {
  currentScore: number
  currentStreak: number
  bestRoundStreak: number
  questionsAnswered: number
  correctAnswers: number
  incorrectAnswers: number
  difficulty: 1 | 2 | 3 | 4 | 5
  recentChallengeIds: string[]
  recentTypes: ChallengeType[]
  roundStartTime: number
  xpGained: number
}

export interface AnswerResult {
  correct: boolean
  points: number
  streak: number
  explanation?: string
  correctAnswer: string
}
