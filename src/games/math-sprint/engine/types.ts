/** Math Sprint engine types. Games Layer only — not academic reports. */

export type MathSprintMode =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'mixed'

export type MathOp = '+' | '-' | '×' | '÷'

export interface MathChallenge {
  id: string
  mode: MathSprintMode
  op: MathOp
  difficulty: 1 | 2 | 3 | 4 | 5
  prompt: string
  answer: number
  options: number[]
  a: number
  b: number
}

export interface MathRoundState {
  currentScore: number
  currentStreak: number
  bestRoundStreak: number
  questionsAnswered: number
  correctAnswers: number
  incorrectAnswers: number
  difficulty: 1 | 2 | 3 | 4 | 5
  mode: MathSprintMode
  roundStartTime: number
  xpGained: number
  recentPrompts: string[]
}

export interface MathModeInfo {
  key: MathSprintMode
  title: string
  description: string
  emoji: string
  color: string
}

export const MATH_SPRINT_MODES: MathModeInfo[] = [
  {
    key: 'addition',
    title: 'Addition',
    description: 'Add numbers quickly and accurately.',
    emoji: '➕',
    color: 'from-sky-400 to-blue-600',
  },
  {
    key: 'subtraction',
    title: 'Subtraction',
    description: 'Find the difference between numbers.',
    emoji: '➖',
    color: 'from-violet-400 to-purple-600',
  },
  {
    key: 'multiplication',
    title: 'Multiplication',
    description: 'Times tables and bigger products.',
    emoji: '✖️',
    color: 'from-amber-400 to-orange-500',
  },
  {
    key: 'division',
    title: 'Division',
    description: 'Share fairly - exact whole answers.',
    emoji: '➗',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    key: 'mixed',
    title: 'Mixed Sprint',
    description: 'A little of everything. Surprise!',
    emoji: '🎲',
    color: 'from-fuchsia-400 to-pink-600',
  },
]
