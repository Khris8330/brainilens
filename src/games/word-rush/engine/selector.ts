import type { Challenge, ChallengeType, WordRushMode, WordRushTier } from './types'
import { CHALLENGE_BANK } from './content'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Select next challenge for a mode, avoiding IDs already used this round. */
export function selectChallenge(opts: {
  mode: WordRushMode
  tier: WordRushTier
  difficulty: 1 | 2 | 3 | 4 | 5
  usedIds: string[]
  recentTypes: ChallengeType[]
}): Challenge {
  const used = new Set(opts.usedIds)

  let pool = CHALLENGE_BANK.filter((c) => {
    if (opts.mode === 'mixed') return true
    return c.modes.includes(opts.mode)
  })

  let unused = pool.filter((c) => !used.has(c.id))
  if (unused.length === 0) {
    unused = pool.length > 0 ? pool : CHALLENGE_BANK
  }

  const lastType = opts.recentTypes[opts.recentTypes.length - 1]
  const prevType = opts.recentTypes[opts.recentTypes.length - 2]
  if (lastType && lastType === prevType) {
    const diversify = unused.filter((c) => c.type !== lastType)
    if (diversify.length > 0) unused = diversify
  }

  const near = unused.filter((c) => Math.abs(c.difficulty - opts.difficulty) <= 1)
  const candidates = near.length > 0 ? near : unused

  const shuffled = shuffle(candidates)
  return shuffled[0] ?? CHALLENGE_BANK[0]
}

export function countForMode(mode: WordRushMode): number {
  if (mode === 'mixed') return CHALLENGE_BANK.length
  return CHALLENGE_BANK.filter((c) => c.modes.includes(mode)).length
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase()
}

export function validateAnswer(challenge: Challenge, raw: string): boolean {
  return normalizeAnswer(raw) === normalizeAnswer(challenge.answer)
}
