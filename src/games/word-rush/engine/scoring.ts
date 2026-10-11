/** Word Rush scoring — local only during a round; persisted at session end. */

const DIFFICULTY_MODIFIER: Record<number, number> = {
  1: 1.0,
  2: 1.1,
  3: 1.25,
  4: 1.5,
  5: 2.0,
}

function streakModifier(streak: number): number {
  if (streak >= 10) return 2.0
  if (streak >= 5) return 1.5
  if (streak >= 3) return 1.2
  return 1.0
}

function speedBonus(responseMs: number): number {
  if (responseMs < 4000) return 20
  if (responseMs < 10000) return 10
  return 0
}

const BASE = 100

export function scoreCorrectAnswer(
  difficulty: number,
  streakAfterCorrect: number,
  responseMs: number,
): number {
  const diff = DIFFICULTY_MODIFIER[difficulty] ?? 1
  const streak = streakModifier(streakAfterCorrect)
  const speed = speedBonus(responseMs)
  return Math.round(BASE * diff * streak + speed)
}

export function xpForCorrect(difficulty: number): number {
  return 10 + difficulty * 2
}
