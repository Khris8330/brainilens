/** Crossmath puzzle generator — crossword of arithmetic equations. */

export type Op = '+' | '-' | '×' | '÷'

export type CellKind = 'empty' | 'given' | 'blank' | 'op' | 'eq' | 'result'

export interface PuzzleCell {
  kind: CellKind
  value: string
  blankId?: string
}

export interface Puzzle {
  rows: number
  cols: number
  cells: Record<string, PuzzleCell>
  blankIds: string[]
  answers: Record<string, number>
  palette: number[]
  difficulty: number
}

function key(r: number, c: number) {
  return `${r},${c}`
}

function pickOp(level: number): Op {
  const ops: Op[] =
    level <= 1 ? ['+', '-'] : level === 2 ? ['+', '-', '×'] : ['+', '-', '×', '÷']
  return ops[Math.floor(Math.random() * ops.length)]!
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeTriple(level: number): { a: number; op: Op; b: number; c: number } {
  for (let attempt = 0; attempt < 40; attempt++) {
    const op = pickOp(level)
    let a: number
    let b: number
    let c: number
    if (op === '+') {
      a = randomInt(1, level <= 1 ? 12 : 20)
      b = randomInt(1, level <= 1 ? 12 : 20)
      c = a + b
    } else if (op === '-') {
      a = randomInt(3, level <= 1 ? 15 : 25)
      b = randomInt(1, a)
      c = a - b
    } else if (op === '×') {
      a = randomInt(2, level <= 2 ? 9 : 12)
      b = randomInt(2, level <= 2 ? 9 : 12)
      c = a * b
    } else {
      b = randomInt(2, 9)
      c = randomInt(2, 9)
      a = b * c
    }
    if (c >= 0 && c <= 99) return { a, op, b, c }
  }
  return { a: 3, op: '+', b: 4, c: 7 }
}

export function generatePuzzle(difficulty = 1): Puzzle {
  const level = Math.max(1, Math.min(5, difficulty))
  const cells: Record<string, PuzzleCell> = {}
  const answers: Record<string, number> = {}
  const blankIds: string[] = []

  const t1 = makeTriple(level)
  const t2 = makeTriple(level)
  const t3 = makeTriple(level)

  function put(r: number, c: number, cell: PuzzleCell) {
    cells[key(r, c)] = cell
  }

  const hide1 = Math.floor(Math.random() * 3)
  put(0, 0, hide1 === 0 ? { kind: 'blank', value: '', blankId: 'h1a' } : { kind: 'given', value: String(t1.a) })
  put(0, 1, { kind: 'op', value: t1.op })
  put(0, 2, hide1 === 1 ? { kind: 'blank', value: '', blankId: 'h1b' } : { kind: 'given', value: String(t1.b) })
  put(0, 3, { kind: 'eq', value: '=' })
  put(0, 4, hide1 === 2 ? { kind: 'blank', value: '', blankId: 'h1c' } : { kind: 'result', value: String(t1.c) })
  if (hide1 === 0) { answers.h1a = t1.a; blankIds.push('h1a') }
  if (hide1 === 1) { answers.h1b = t1.b; blankIds.push('h1b') }
  if (hide1 === 2) { answers.h1c = t1.c; blankIds.push('h1c') }

  const hide2 = Math.floor(Math.random() * 3)
  put(2, 0, hide2 === 0 ? { kind: 'blank', value: '', blankId: 'h2a' } : { kind: 'given', value: String(t2.a) })
  put(2, 1, { kind: 'op', value: t2.op })
  put(2, 2, hide2 === 1 ? { kind: 'blank', value: '', blankId: 'h2b' } : { kind: 'given', value: String(t2.b) })
  put(2, 3, { kind: 'eq', value: '=' })
  put(2, 4, hide2 === 2 ? { kind: 'blank', value: '', blankId: 'h2c' } : { kind: 'result', value: String(t2.c) })
  if (hide2 === 0) { answers.h2a = t2.a; blankIds.push('h2a') }
  if (hide2 === 1) { answers.h2b = t2.b; blankIds.push('h2b') }
  if (hide2 === 2) { answers.h2c = t2.c; blankIds.push('h2c') }

  const hide3 = Math.floor(Math.random() * 3)
  put(4, 0, hide3 === 0 ? { kind: 'blank', value: '', blankId: 'h3a' } : { kind: 'given', value: String(t3.a) })
  put(4, 1, { kind: 'op', value: t3.op })
  put(4, 2, hide3 === 1 ? { kind: 'blank', value: '', blankId: 'h3b' } : { kind: 'given', value: String(t3.b) })
  put(4, 3, { kind: 'eq', value: '=' })
  put(4, 4, hide3 === 2 ? { kind: 'blank', value: '', blankId: 'h3c' } : { kind: 'result', value: String(t3.c) })
  if (hide3 === 0) { answers.h3a = t3.a; blankIds.push('h3a') }
  if (hide3 === 1) { answers.h3b = t3.b; blankIds.push('h3b') }
  if (hide3 === 2) { answers.h3c = t3.c; blankIds.push('h3c') }

  if (blankIds.length < 3) {
    for (const [id, val, r, c] of [
      ['h1c', t1.c, 0, 4],
      ['h2c', t2.c, 2, 4],
      ['h3c', t3.c, 4, 4],
    ] as const) {
      if (!answers[id]) {
        put(r, c, { kind: 'blank', value: '', blankId: id })
        answers[id] = val
        blankIds.push(id)
      }
      if (blankIds.length >= 3) break
    }
  }

  const correct = Object.values(answers)
  const distractors: number[] = []
  while (distractors.length < 4) {
    const n = randomInt(1, 30)
    if (!correct.includes(n) && !distractors.includes(n)) distractors.push(n)
  }
  const palette = [...correct, ...distractors].sort(() => Math.random() - 0.5)

  return {
    rows: 5,
    cols: 5,
    cells,
    blankIds,
    answers,
    palette,
    difficulty: level,
  }
}

export function checkPuzzle(
  puzzle: Puzzle,
  fills: Record<string, number | null>,
): { complete: boolean; correct: boolean; wrongIds: string[] } {
  const wrongIds: string[] = []
  let complete = true
  for (const id of puzzle.blankIds) {
    const v = fills[id]
    if (v === null || v === undefined) {
      complete = false
      continue
    }
    if (v !== puzzle.answers[id]) wrongIds.push(id)
  }
  return { complete, correct: complete && wrongIds.length === 0, wrongIds }
}

export function loadCrossmathBest(): number {
  if (typeof window === 'undefined') return 0
  const n = Number(localStorage.getItem('brainilens_crossmath_best') ?? '0')
  return Number.isFinite(n) ? n : 0
}

export function saveCrossmathBest(score: number) {
  if (typeof window === 'undefined') return
  const prev = loadCrossmathBest()
  if (score > prev) localStorage.setItem('brainilens_crossmath_best', String(score))
}
