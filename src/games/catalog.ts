import type { GameCatalogEntry } from './types'

/** Static catalog. Math Sprint is a placeholder until implemented. */
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
    description: 'Coming soon. Number challenges under the same daily time.',
    status: 'coming_soon',
  },
]
