import {
  DIFFICULTIES,
  type Difficulty,
  type SudokuPuzzle,
} from './types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function isValid(board: number[], pos: number, num: number): boolean {
  const r = Math.floor(pos / 9)
  const c = pos % 9
  for (let i = 0; i < 9; i++) {
    if (board[r * 9 + i] === num) return false
    if (board[i * 9 + c] === num) return false
  }
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[(br + i) * 9 + (bc + j)] === num) return false
    }
  }
  return true
}

function fillBoard(board: number[]): boolean {
  const empty = board.indexOf(0)
  if (empty === -1) return true
  for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isValid(board, empty, num)) {
      board[empty] = num
      if (fillBoard(board)) return true
      board[empty] = 0
    }
  }
  return false
}

function countSolutions(board: number[], limit = 2): number {
  const copy = [...board]
  let count = 0

  function solve(): boolean {
    const empty = copy.indexOf(0)
    if (empty === -1) {
      count++
      return count >= limit
    }
    for (let num = 1; num <= 9; num++) {
      if (isValid(copy, empty, num)) {
        copy[empty] = num
        if (solve()) return true
        copy[empty] = 0
      }
    }
    return false
  }

  solve()
  return count
}

function clueRange(difficulty: Difficulty): [number, number] {
  const d = DIFFICULTIES.find((x) => x.key === difficulty)
  return d ? d.clues : [30, 36]
}

export function generatePuzzle(difficulty: Difficulty = 'easy'): SudokuPuzzle {
  const solution = Array(81).fill(0) as number[]
  fillBoard(solution)

  const givens = [...solution]
  const [minClues, maxClues] = clueRange(difficulty)
  const targetClues = minClues + Math.floor(Math.random() * (maxClues - minClues + 1))

  const order = shuffle(Array.from({ length: 81 }, (_, i) => i))
  let clues = 81

  for (const pos of order) {
    if (clues <= targetClues) break
    const backup = givens[pos]!
    givens[pos] = 0
    clues--

    const shouldCheck =
      difficulty === 'easy' || difficulty === 'medium'
        ? clues <= targetClues + 4 || Math.random() < 0.25
        : true

    if (shouldCheck && countSolutions(givens, 2) !== 1) {
      givens[pos] = backup
      clues++
    }
  }

  if (countSolutions(givens, 2) !== 1) {
    for (const pos of order) {
      if (givens[pos] === 0) {
        givens[pos] = solution[pos]!
        if (countSolutions(givens, 2) === 1) break
      }
    }
  }

  return { givens, solution, difficulty }
}

export function isComplete(board: number[]): boolean {
  return board.every((v) => v >= 1 && v <= 9)
}

export function isCorrect(board: number[], solution: number[]): boolean {
  return board.every((v, i) => v === solution[i])
}

export function hasConflict(board: number[], pos: number): boolean {
  const val = board[pos]!
  if (val === 0) return false
  const r = Math.floor(pos / 9)
  const c = pos % 9
  for (let i = 0; i < 9; i++) {
    const ri = r * 9 + i
    const ci = i * 9 + c
    if (i !== c && board[ri] === val) return true
    if (i !== r && board[ci] === val) return true
  }
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const p = (br + i) * 9 + (bc + j)
      if (p !== pos && board[p] === val) return true
    }
  }
  return false
}

export function scoreForWin(
  difficulty: Difficulty,
  elapsedSeconds: number,
  mistakes: number,
): number {
  const base: Record<Difficulty, number> = {
    easy: 1000,
    medium: 2000,
    hard: 3500,
    expert: 5000,
    master: 7000,
    extreme: 10000,
  }
  const timeBonus = Math.max(0, 600 - elapsedSeconds) * 2
  const mistakePenalty = mistakes * 150
  return Math.max(100, base[difficulty] + timeBonus - mistakePenalty)
}

const BEST_KEY = 'brainilens_sudoku_best'
const STREAK_KEY = 'brainilens_sudoku_streak'

export function loadBestScore(): number {
  if (typeof window === 'undefined') return 0
  const n = Number(localStorage.getItem(BEST_KEY) ?? '0')
  return Number.isFinite(n) ? n : 0
}

export function saveBestScore(score: number) {
  if (typeof window === 'undefined') return
  if (score > loadBestScore()) localStorage.setItem(BEST_KEY, String(score))
}

export function loadStreak(): { count: number; lastDate: string } {
  if (typeof window === 'undefined') return { count: 0, lastDate: '' }
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return { count: 0, lastDate: '' }
    return JSON.parse(raw) as { count: number; lastDate: string }
  } catch {
    return { count: 0, lastDate: '' }
  }
}

export function recordStreakWin(): number {
  if (typeof window === 'undefined') return 0
  const now = new Date()
  const utc1 = new Date(now.getTime() + 60 * 60 * 1000)
  const today = utc1.toISOString().slice(0, 10)
  const prev = loadStreak()
  let count = 1
  if (prev.lastDate === today) {
    count = prev.count
  } else {
    const y = new Date(utc1)
    y.setUTCDate(y.getUTCDate() - 1)
    const yesterday = y.toISOString().slice(0, 10)
    count = prev.lastDate === yesterday ? prev.count + 1 : 1
  }
  localStorage.setItem(STREAK_KEY, JSON.stringify({ count, lastDate: today }))
  return count
}

export function idx(r: number, c: number) {
  return r * 9 + c
}
