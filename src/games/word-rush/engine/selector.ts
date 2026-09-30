import type { Challenge, ChallengeType, WordRushTier } from './types'
import { CHALLENGE_BANK } from './content'

/** Simple selection: prefer tier, avoid type >2 in a row, avoid same id recently. */
export function selectChallenge(opts: {
  tier: WordRushTier
  difficulty: 1 | 2 | 3 | 4 | 5
  recentIds: string[]
  recentTypes: ChallengeType[]
}): Challenge {
  const tierOrder: WordRushTier[] = [
    'starter',
    'explorer',
    'challenger',
    'advanced',
    'master',
  ]
  const tierIdx = tierOrder.indexOf(opts.tier)
  const allowedTiers = new Set(tierOrder.slice(0, Math.max(1, tierIdx + 1)))

  const lastType = opts.recentTypes[opts.recentTypes.length - 1]
  const sameTypeCount =
    opts.recentTypes.length >= 2 &&
    opts.recentTypes[opts.recentTypes.length - 1] === opts.recentTypes[opts.recentTypes.length - 2]
      ? 2
      : lastType
        ? 1
        : 0

  let pool = CHALLENGE_BANK.filter((c) => allowedTiers.has(c.tier))
  pool = pool.filter((c) => !opts.recentIds.includes(c.id))
  if (sameTypeCount >= 2 && lastType) {
    pool = pool.filter((c) => c.type !== lastType)
  }

  const near = pool.filter((c) => Math.abs(c.difficulty - opts.difficulty) <= 1)
  const candidates = near.length > 0 ? near : pool.length > 0 ? pool : CHALLENGE_BANK

  const pick = candidates[Math.floor(Math.random() * candidates.length)]
  return pick
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase()
}

export function validateAnswer(challenge: Challenge, raw: string): boolean {
  return normalizeAnswer(raw) === normalizeAnswer(challenge.answer)
}
