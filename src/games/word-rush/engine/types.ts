export type WordRushTier = 'starter' | 'explorer' | 'challenger' | 'advanced' | 'master'

/** Play modes the student can pick before a round. */
export type WordRushMode =
  | 'word_completion'
  | 'synonyms'
  | 'antonyms'
  | 'idioms'
  | 'parts_of_speech'
  | 'spelling'
  | 'scramble'
  | 'mixed'

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
  | 'idiom'
  | 'part_of_speech'

export interface Challenge {
  id: string
  tier: WordRushTier
  type: ChallengeType
  modes: WordRushMode[]
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
  usedChallengeIds: string[]
  mode: WordRushMode
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

export interface ModeInfo {
  key: WordRushMode
  title: string
  description: string
  emoji: string
  color: string
}

export const WORD_RUSH_MODES: ModeInfo[] = [
  {
    key: 'word_completion',
    title: 'Word Completion',
    description: 'Fill missing letters and finish sentences.',
    emoji: '✏️',
    color: 'from-sky-400 to-blue-600',
  },
  {
    key: 'synonyms',
    title: 'Synonyms',
    description: 'Find words that mean almost the same.',
    emoji: '🔄',
    color: 'from-violet-400 to-purple-600',
  },
  {
    key: 'antonyms',
    title: 'Antonyms',
    description: 'Find words that mean the opposite.',
    emoji: '⚡',
    color: 'from-amber-400 to-orange-500',
  },
  {
    key: 'idioms',
    title: 'Idioms',
    description: 'Learn fun phrases kids use every day.',
    emoji: '💬',
    color: 'from-pink-400 to-rose-500',
  },
  {
    key: 'parts_of_speech',
    title: 'Parts of Speech',
    description: 'Nouns, verbs, adjectives, and more.',
    emoji: '📚',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    key: 'spelling',
    title: 'Spelling',
    description: 'Pick the correctly spelled word.',
    emoji: '🔤',
    color: 'from-cyan-400 to-sky-600',
  },
  {
    key: 'scramble',
    title: 'Word Scramble',
    description: 'Unscramble the letters to make a word.',
    emoji: '🧩',
    color: 'from-indigo-400 to-blue-700',
  },
  {
    key: 'mixed',
    title: 'Mixed Rush',
    description: 'A little bit of everything. Surprise!',
    emoji: '🎲',
    color: 'from-fuchsia-400 to-violet-600',
  },
]
