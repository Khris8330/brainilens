import type { MathChallenge, MathOp, MathSprintMode } from './types'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function uniqueOptions(correct: number, makeWrong: () => number): number[] {
  const set = new Set<number>([correct])
  let guard = 0
  while (set.size < 4 && guard < 40) {
    const w = makeWrong()
    if (w !== correct && w >= 0) set.add(w)
    guard++
  }
  while (set.size < 4) {
    set.add(correct + set.size + 1)
  }
  return shuffle([...set])
}

type Diff = 1 | 2 | 3 | 4 | 5

function ranges(d: Diff): { lo: number; hi: number; mulHi: number } {
  switch (d) {
    case 1:
      return { lo: 1, hi: 10, mulHi: 5 }
    case 2:
      return { lo: 2, hi: 20, mulHi: 8 }
    case 3:
      return { lo: 5, hi: 50, mulHi: 10 }
    case 4:
      return { lo: 10, hi: 99, mulHi: 12 }
    default:
      return { lo: 20, hi: 200, mulHi: 15 }
  }
}

function pickOp(mode: MathSprintMode): MathOp {
  if (mode === 'addition') return '+'
  if (mode === 'subtraction') return '-'
  if (mode === 'multiplication') return '×'
  if (mode === 'division') return '÷'
  return (['+', '-', '×', '÷'] as MathOp[])[randInt(0, 3)]
}

function generateOnce(
  mode: MathSprintMode,
  difficulty: Diff,
  avoid: Set<string>,
): MathChallenge {
  const op = pickOp(mode)
  const r = ranges(difficulty)
  let a = 0
  let b = 0
  let answer = 0
  let prompt = ''

  if (op === '+') {
    a = randInt(r.lo, r.hi)
    b = randInt(r.lo, r.hi)
    answer = a + b
    prompt = `${a} + ${b} = ?`
  } else if (op === '-') {
    a = randInt(r.lo, r.hi)
    b = randInt(r.lo, Math.min(a, r.hi))
    answer = a - b
    prompt = `${a} − ${b} = ?`
  } else if (op === '×') {
    a = randInt(1, r.mulHi)
    b = randInt(1, r.mulHi)
    answer = a * b
    prompt = `${a} × ${b} = ?`
  } else {
    b = randInt(1, r.mulHi)
    const quot = randInt(1, r.mulHi)
    a = b * quot
    answer = quot
    prompt = `${a} ÷ ${b} = ?`
  }

  if (avoid.has(prompt)) {
    return generateOnce(mode, difficulty, avoid)
  }

  const options = uniqueOptions(answer, () => {
    const delta = randInt(1, 8 + difficulty * 2)
    return Math.random() < 0.5 ? answer + delta : Math.max(0, answer - delta)
  })

  return {
    id: `ms_${Date.now()}_${randInt(1000, 9999)}`,
    mode,
    op,
    difficulty,
    prompt,
    answer,
    options,
    a,
    b,
  }
}

export function generateChallenge(
  mode: MathSprintMode,
  difficulty: Diff,
  recentPrompts: string[] = [],
): MathChallenge {
  const avoid = new Set(recentPrompts.slice(-12))
  let last: MathChallenge | null = null
  for (let i = 0; i < 8; i++) {
    try {
      const c = generateOnce(mode, difficulty, avoid)
      if (!avoid.has(c.prompt)) return c
      last = c
    } catch {
      // continue
    }
  }
  return last ?? generateOnce(mode, difficulty, new Set())
}

export function validateMathAnswer(challenge: MathChallenge, raw: string | number): boolean {
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim())
  if (!Number.isFinite(n)) return false
  return n === challenge.answer
}
