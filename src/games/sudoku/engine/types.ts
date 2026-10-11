export type Difficulty =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'expert'
  | 'master'
  | 'extreme'

/** 0 = empty; 1–9 = digit */
export type CellValue = number

export interface SudokuPuzzle {
  /** Immutable given cells (0 empty) — length 81, row-major */
  givens: number[]
  /** Full solution — length 81 */
  solution: number[]
  difficulty: Difficulty
}

export interface CellNotes {
  [digit: number]: boolean
}

export const DIFFICULTIES: { key: Difficulty; label: string; clues: [number, number] }[] = [
  { key: 'easy', label: 'Easy', clues: [40, 46] },
  { key: 'medium', label: 'Medium', clues: [32, 38] },
  { key: 'hard', label: 'Hard', clues: [26, 31] },
  { key: 'expert', label: 'Expert', clues: [24, 27] },
  { key: 'master', label: 'Master', clues: [22, 24] },
  { key: 'extreme', label: 'Extreme', clues: [17, 22] },
]

export const MAX_MISTAKES = 3

export function idx(r: number, c: number) {
  return r * 9 + c
}

export function rc(i: number) {
  return { r: Math.floor(i / 9), c: i % 9 }
}
