import type { GameCatalogEntry } from './types'

/** Static catalog. Status may be overridden by game-status payload. */
export const GAME_CATALOG: GameCatalogEntry[] = [
  {
    key: 'word_rush',
    title: 'Word Rush',
    description: 'Fast vocabulary challenges. Score, streaks, and XP stay in the Games Layer.',
    status: 'available',
  },
  {
    key: 'math_sprint',
    title: 'Math Sprint',
    description: 'Fast number challenges. Shares the same daily game time.',
    status: 'available',
  },
  {
    key: 'color_block',
    title: 'Color Block',
    description: 'Place colorful blocks. Clear full rows and columns. Classic puzzle fun.',
    status: 'available',
  },
  {
    key: 'crossmath',
    title: 'Crossmath',
    description: 'Fill blanks so every equation is true. Number crossword puzzles.',
    status: 'available',
  },
]
