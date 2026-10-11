import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Eraser,
  Lightbulb,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Trophy,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { routes } from '@/routes'
import {
  DIFFICULTIES,
  MAX_MISTAKES,
  type Difficulty,
} from '@/games/sudoku/engine/types'
import {
  generatePuzzle,
  hasConflict,
  isComplete,
  isCorrect,
  loadBestScore,
  recordStreakWin,
  saveBestScore,
  scoreForWin,
} from '@/games/sudoku/engine/generator'

type Phase = 'menu' | 'playing' | 'paused' | 'won' | 'lost'

type HistoryEntry = {
  board: number[]
  notes: Record<number, number[]>
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function emptyNotes(): Record<number, number[]> {
  return {}
}

export function SudokuPage() {
  const [phase, setPhase] = useState<Phase>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [givens, setGivens] = useState<number[]>(() => Array(81).fill(0))
  const [solution, setSolution] = useState<number[]>(() => Array(81).fill(0))
  const [board, setBoard] = useState<number[]>(() => Array(81).fill(0))
  const [notes, setNotes] = useState<Record<number, number[]>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [notesMode, setNotesMode] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [streak, setStreak] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [flashWrong, setFlashWrong] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setBest(loadBestScore())
  }, [])

  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
      return
    }
    timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [phase])

  const startGame = useCallback((diff: Difficulty) => {
    const puzzle = generatePuzzle(diff)
    setDifficulty(diff)
    setGivens(puzzle.givens)
    setSolution(puzzle.solution)
    setBoard([...puzzle.givens])
    setNotes(emptyNotes())
    setSelected(null)
    setNotesMode(false)
    setMistakes(0)
    setElapsed(0)
    setScore(0)
    setHistory([])
    setFlashWrong(null)
    setPhase('playing')
  }, [])

  const pushHistory = useCallback(() => {
    setHistory((h) => [
      ...h.slice(-40),
      { board: [...board], notes: JSON.parse(JSON.stringify(notes)) as Record<number, number[]> },
    ])
  }, [board, notes])

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h
      const prev = h[h.length - 1]!
      setBoard(prev.board)
      setNotes(prev.notes)
      return h.slice(0, -1)
    })
  }

  const erase = () => {
    if (selected === null || givens[selected] !== 0) return
    pushHistory()
    setBoard((b) => {
      const next = [...b]
      next[selected] = 0
      return next
    })
    setNotes((n) => {
      const next = { ...n }
      delete next[selected]
      return next
    })
  }

  const placeDigit = (digit: number) => {
    if (selected === null || phase !== 'playing') return
    if (givens[selected] !== 0) return

    if (notesMode) {
      pushHistory()
      setNotes((n) => {
        const cur = new Set(n[selected] ?? [])
        if (cur.has(digit)) cur.delete(digit)
        else cur.add(digit)
        const next = { ...n }
        if (cur.size === 0) delete next[selected]
        else next[selected] = [...cur].sort()
        return next
      })
      setBoard((b) => {
        const next = [...b]
        next[selected] = 0
        return next
      })
      return
    }

    pushHistory()
    const correct = solution[selected] === digit
    if (!correct) {
      setMistakes((m) => {
        const next = m + 1
        if (next >= MAX_MISTAKES) setPhase('lost')
        return next
      })
      setFlashWrong(selected)
      window.setTimeout(() => setFlashWrong(null), 400)
      setBoard((b) => {
        const next = [...b]
        next[selected] = digit
        return next
      })
      window.setTimeout(() => {
        setBoard((b) => {
          if (b[selected] === digit && solution[selected] !== digit) {
            const next = [...b]
            next[selected] = 0
            return next
          }
          return b
        })
      }, 450)
      return
    }

    setBoard((b) => {
      const next = [...b]
      next[selected] = digit
      return next
    })
    setNotes((n) => {
      const next = { ...n }
      delete next[selected]
      const r = Math.floor(selected / 9)
      const c = selected % 9
      for (let i = 0; i < 9; i++) {
        const ri = r * 9 + i
        const ci = i * 9 + c
        if (next[ri]) next[ri] = next[ri]!.filter((d) => d !== digit)
        if (next[ci]) next[ci] = next[ci]!.filter((d) => d !== digit)
      }
      const br = Math.floor(r / 3) * 3
      const bc = Math.floor(c / 3) * 3
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const p = (br + i) * 9 + (bc + j)
          if (next[p]) next[p] = next[p]!.filter((d) => d !== digit)
        }
      }
      return next
    })

    window.setTimeout(() => {
      setBoard((b) => {
        if (isComplete(b) && isCorrect(b, solution)) {
          const s = scoreForWin(difficulty, elapsed, mistakes)
          setScore(s)
          saveBestScore(s)
          setBest(loadBestScore())
          setStreak(recordStreakWin())
          setPhase('won')
        }
        return b
      })
    }, 0)
  }

  const hint = () => {
    if (phase !== 'playing') return
    let target = selected
    if (target === null || board[target] !== 0 || givens[target] !== 0) {
      target = board.findIndex((v, i) => v === 0 && givens[i] === 0)
    }
    if (target < 0) return
    setSelected(target)
    placeDigit(solution[target]!)
  }

  const selectedVal = selected !== null ? board[selected] : 0
  const related = useMemo(() => {
    if (selected === null) return new Set<number>()
    const r = Math.floor(selected / 9)
    const c = selected % 9
    const set = new Set<number>()
    for (let i = 0; i < 9; i++) {
      set.add(r * 9 + i)
      set.add(i * 9 + c)
    }
    const br = Math.floor(r / 3) * 3
    const bc = Math.floor(c / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) set.add((br + i) * 9 + (bc + j))
    }
    return set
  }, [selected])

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link
          to={routes.studentGames}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Games
        </Link>
        <div className="flex items-center gap-2 text-sm font-medium text-text">
          <Trophy className="size-4 text-amber-500" aria-hidden="true" />
          Best {best.toLocaleString()}
        </div>
      </div>

      {phase === 'menu' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-surface px-6 py-12">
          <h1 className="text-3xl font-bold text-text">Sudoku</h1>
          <p className="max-w-xs text-center text-sm text-text-muted">
            Fill the grid so every row, column, and 3×3 box contains 1–9. Limited mistakes — choose
            your difficulty.
          </p>
          <div className="grid w-full max-w-xs grid-cols-2 gap-2">
            {DIFFICULTIES.map((d) => (
              <Button
                key={d.key}
                variant={difficulty === d.key ? 'primary' : 'outline'}
                onClick={() => setDifficulty(d.key)}
              >
                {d.label}
              </Button>
            ))}
          </div>
          <Button size="lg" onClick={() => startGame(difficulty)}>
            New Game
          </Button>
        </div>
      )}

      {(phase === 'playing' || phase === 'paused' || phase === 'won' || phase === 'lost') && (
        <>
          <div className="grid grid-cols-4 gap-2 text-center text-xs text-text-muted">
            <div>
              <p className="font-semibold text-text">
                {DIFFICULTIES.find((d) => d.key === difficulty)?.label}
              </p>
              <p>Difficulty</p>
            </div>
            <div>
              <p className="font-semibold text-text">
                {mistakes}/{MAX_MISTAKES}
              </p>
              <p>Mistakes</p>
            </div>
            <div>
              <p className="font-semibold tabular-nums text-text">{formatTime(elapsed)}</p>
              <p>Time</p>
            </div>
            <div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-border p-1.5"
                onClick={() =>
                  setPhase((p) => (p === 'paused' ? 'playing' : p === 'playing' ? 'paused' : p))
                }
                aria-label={phase === 'paused' ? 'Resume' : 'Pause'}
                disabled={phase === 'won' || phase === 'lost'}
              >
                {phase === 'paused' ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            </div>
          </div>

          {phase === 'paused' && (
            <div className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
              Paused — tap play to continue
            </div>
          )}

          <div
            className={[
              'mx-auto grid aspect-square w-full max-w-md border-2 border-slate-800',
              phase === 'paused' ? 'pointer-events-none opacity-40' : '',
            ].join(' ')}
            style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}
          >
            {board.map((val, i) => {
              const r = Math.floor(i / 9)
              const c = i % 9
              const isGiven = givens[i] !== 0
              const isSel = selected === i
              const isRel = related.has(i)
              const sameNum = selectedVal > 0 && val === selectedVal
              const conflict = val !== 0 && hasConflict(board, i)
              const wrongFlash = flashWrong === i
              const thickRight = c === 2 || c === 5
              const thickBottom = r === 2 || r === 5

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={[
                    'relative flex aspect-square items-center justify-center text-lg font-semibold transition',
                    'border border-slate-200',
                    thickRight ? 'border-r-2 border-r-slate-800' : '',
                    thickBottom ? 'border-b-2 border-b-slate-800' : '',
                    isSel
                      ? 'bg-sky-200'
                      : sameNum
                        ? 'bg-sky-100'
                        : isRel
                          ? 'bg-slate-100'
                          : 'bg-white',
                    wrongFlash ? 'bg-red-200 text-red-700' : '',
                    conflict && !isGiven
                      ? 'text-red-600'
                      : isGiven
                        ? 'text-slate-900'
                        : 'text-sky-700',
                  ].join(' ')}
                >
                  {val !== 0 ? (
                    val
                  ) : notes[i]?.length ? (
                    <span className="grid grid-cols-3 gap-0 p-0.5 text-[9px] leading-none text-slate-400">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                        <span key={d} className="text-center">
                          {notes[i]!.includes(d) ? d : ''}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="flex justify-around text-xs text-text-muted">
            <button
              type="button"
              className="flex flex-col items-center gap-1 disabled:opacity-40"
              onClick={undo}
              disabled={!history.length || phase !== 'playing'}
            >
              <Undo2 className="size-5" />
              Undo
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 disabled:opacity-40"
              onClick={erase}
              disabled={selected === null || phase !== 'playing'}
            >
              <Eraser className="size-5" />
              Erase
            </button>
            <button
              type="button"
              className={['flex flex-col items-center gap-1', notesMode ? 'text-sky-600' : ''].join(
                ' ',
              )}
              onClick={() => setNotesMode((n) => !n)}
              disabled={phase !== 'playing'}
            >
              <Pencil className="size-5" />
              Notes {notesMode ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 disabled:opacity-40"
              onClick={hint}
              disabled={phase !== 'playing'}
            >
              <Lightbulb className="size-5" />
              Hint
            </button>
          </div>

          <div className="flex justify-between gap-1 px-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
              const remaining = 9 - board.filter((v) => v === d).length
              return (
                <button
                  key={d}
                  type="button"
                  disabled={phase !== 'playing' || remaining <= 0}
                  onClick={() => placeDigit(d)}
                  className="flex h-12 flex-1 flex-col items-center justify-center rounded-lg text-xl font-semibold text-sky-700 transition hover:bg-sky-50 disabled:opacity-30"
                >
                  {d}
                  <span className="text-[10px] font-normal text-text-muted">{remaining}</span>
                </button>
              )
            })}
          </div>

          {(phase === 'won' || phase === 'lost') && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center">
              {phase === 'won' ? (
                <>
                  <p className="text-lg font-semibold text-text">Puzzle solved!</p>
                  <p className="text-3xl font-bold tabular-nums text-sky-600">
                    {score.toLocaleString()}
                  </p>
                  <p className="text-sm text-text-muted">
                    Time {formatTime(elapsed)} · Mistakes {mistakes}
                    {streak > 0 ? ` · Streak ${streak}` : ''}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-text">Too many mistakes</p>
                  <p className="text-sm text-text-muted">You used all {MAX_MISTAKES} mistakes.</p>
                </>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => startGame(difficulty)}>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  New Game
                </Button>
                <Button variant="outline" onClick={() => setPhase('menu')}>
                  Difficulty
                </Button>
                <Link to={routes.studentGames}>
                  <Button variant="outline">Hub</Button>
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SudokuPage
