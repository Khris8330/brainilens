/** Gradual adaptive difficulty — one wrong answer does not crash difficulty. */

export function adjustDifficulty(
  current: 1 | 2 | 3 | 4 | 5,
  correct: boolean,
): 1 | 2 | 3 | 4 | 5 {
  if (correct) {
    return Math.min(5, current + 1) as 1 | 2 | 3 | 4 | 5
  }
  return Math.max(1, current - 1) as 1 | 2 | 3 | 4 | 5
}
