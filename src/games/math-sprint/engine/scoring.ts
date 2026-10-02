/** Math Sprint scoring - local during a round; persisted at session end. */

export function scoreCorrectAnswer(
  difficulty: number,
  streak: number,
  responseMs: number,
): number {
  const base = 10 + difficulty * 5
  const streakBonus = Math.min(streak, 10) * 2
  const speedBonus = responseMs < 3000 ? 8 : responseMs < 6000 ? 4 : 0
  return base + streakBonus + speedBonus
}

export function xpForCorrect(difficulty: number): number {
  return 3 + difficulty
}

export function adjustDifficulty(
  current: 1 | 2 | 3 | 4 | 5,
  correct: boolean,
): 1 | 2 | 3 | 4 | 5 {
  if (correct) {
    return (Math.min(5, current + 1) as 1 | 2 | 3 | 4 | 5)
  }
  return (Math.max(1, current - 1) as 1 | 2 | 3 | 4 | 5)
}
