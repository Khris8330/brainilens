import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Lightbulb, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui'
import { routes } from '@/routes'
import {
  checkPuzzle,
  generatePuzzle,
  loadCrossmathBest,
  saveCrossmathBest,
  type Puzzle,
} from '@/games/crossmath/engine/generator'

type Phase = 'menu' | 'playing' | 'won'

function cellKey(r: number, c: number) {
  return `${r},${c}`
}

export function CrossmathPage() {
  const [phase, setPhase] = useState<Phase>('menu')
  const [level, setLevel] = useState(1)
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [fills, setFills] = useState<Record<string, number | null>>({})
  const [selectedBlank, setSelectedBlank] = useState<string | null>(null)
  const [wrong, setWrong] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => loadCrossmathBest())
  const [message, setMessage] = useState('')

  const start = (lvl = level) => {
    const p = generatePuzzle(lvl)
    setPuzzle(p)
    setFills(Object.fromEntries(p.blankIds.map((id) => [id, null])))
    setSelectedBlank(p.blankIds[0] ?? null)
    setWrong([])
    setMessage('')
    setLevel(lvl)
    setPhase('playing')
  }

  const placeNumber = (n: number) => {
    if (!puzzle || !selectedBlank || phase !== 'playing') return
    const nextFills = { ...fills, [selectedBlank]: n }
    setFills(nextFills)
    setWrong((w) => w.filter((id) => id !== selectedBlank))
    setMessage('')
    const remaining = puzzle.blankIds.filter(
      (id) => (id === selectedBlank ? false : nextFills[id] === null),
    )
    if (remaining[0]) setSelectedBlank(remaining[0])
  }

  const clearBlank = (id: string) => {
    setFills((f) => ({ ...f, [id]: null }))
    setWrong((w) => w.filter((x) => x !== id))
    setSelectedBlank(id)
  }

  const isChipUsed = (val: number, idx: number) => {
    if (!puzzle) return false
    const need = Object.values(fills).filter((v) => v === val).length
    let seen = 0
    for (let i = 0; i <= idx; i++) {
      if (puzzle.palette[i] === val) {
        if (i === idx) return seen < need
        seen++
      }
    }
    return false
  }

  const onCheck = () => {
    if (!puzzle) return
    const result = checkPuzzle(puzzle, fills)
    if (!result.complete) {
      setMessage('Fill every blank first.')
      return
    }
    if (result.correct) {
      const gained = 100 * level
      const next = score + gained
      setScore(next)
      saveCrossmathBest(next)
      setBest(loadCrossmathBest())
      setWrong([])
      setMessage('All equations correct!')
      setPhase('won')
    } else {
      setWrong(result.wrongIds)
      setMessage(
        `${result.wrongIds.length} answer${result.wrongIds.length === 1 ? '' : 's'} need fixing.`,
      )
    }
  }

  const onHint = () => {
    if (!puzzle || !selectedBlank) return
    const answer = puzzle.answers[selectedBlank]
    if (answer === undefined) return
    setFills((f) => ({ ...f, [selectedBlank]: answer }))
    setWrong((w) => w.filter((id) => id !== selectedBlank))
    setMessage('Hint filled one cell.')
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col gap-4">
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
          Best {best}
        </div>
      </div>

      {phase === 'menu' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-surface px-6 py-12 shadow-sm">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
            +×
          </div>
          <h1 className="text-3xl font-bold text-text">Crossmath</h1>
          <p className="max-w-sm text-center text-sm text-text-muted">
            Fill the blanks so every equation is true. Pick a number from the tray, then tap a blank
            cell.
          </p>
          <div className="flex gap-2">
            {[1, 2, 3].map((lvl) => (
              <Button
                key={lvl}
                variant={level === lvl ? 'primary' : 'outline'}
                onClick={() => setLevel(lvl)}
              >
                Level {lvl}
              </Button>
            ))}
          </div>
          <Button size="lg" onClick={() => start(level)}>
            Start puzzle
          </Button>
        </div>
      )}

      {(phase === 'playing' || phase === 'won') && puzzle && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text">Level {level}</span>
            <span className="tabular-nums text-text-muted">Score {score}</span>
          </div>

          <div
            className="mx-auto grid w-full max-w-sm gap-1.5"
            style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: puzzle.rows * puzzle.cols }, (_, i) => {
              const r = Math.floor(i / puzzle.cols)
              const c = i % puzzle.cols
              const cell = puzzle.cells[cellKey(r, c)]
              if (!cell) return <div key={i} className="aspect-square" />
              if (cell.kind === 'op' || cell.kind === 'eq') {
                return (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-lg bg-amber-50 text-lg font-semibold text-amber-900"
                  >
                    {cell.value}
                  </div>
                )
              }
              if (cell.kind === 'given' || cell.kind === 'result') {
                return (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-lg border border-border bg-surface text-lg font-semibold text-text"
                  >
                    {cell.value}
                  </div>
                )
              }
              const id = cell.blankId!
              const val = fills[id]
              const isSelected = selectedBlank === id
              const isWrong = wrong.includes(id)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (phase !== 'playing') return
                    if (val !== null && val !== undefined) clearBlank(id)
                    else setSelectedBlank(id)
                  }}
                  className={[
                    'flex aspect-square items-center justify-center rounded-lg border-2 text-lg font-semibold transition',
                    isSelected
                      ? 'border-violet-500 bg-violet-50 text-violet-900'
                      : isWrong
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-dashed border-border bg-amber-50/50 text-text',
                  ].join(' ')}
                >
                  {val ?? ''}
                </button>
              )
            })}
          </div>

          {phase === 'playing' && (
            <>
              <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-border bg-surface p-4">
                {puzzle.palette.map((n, idx) => {
                  const used = isChipUsed(n, idx)
                  return (
                    <button
                      key={`${n}-${idx}`}
                      type="button"
                      disabled={used}
                      onClick={() => placeNumber(n)}
                      className={[
                        'flex h-12 min-w-12 items-center justify-center rounded-xl border text-base font-semibold transition',
                        used
                          ? 'border-transparent bg-slate-100 text-slate-300'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
                      ].join(' ')}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={onCheck}>
                  <Check className="size-4" aria-hidden="true" />
                  Check
                </Button>
                <Button variant="outline" onClick={onHint}>
                  <Lightbulb className="size-4" aria-hidden="true" />
                  Hint
                </Button>
                <Button variant="outline" onClick={() => start(level)}>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  New
                </Button>
              </div>
            </>
          )}

          {message && (
            <p
              className={`text-center text-sm ${
                phase === 'won' ? 'text-emerald-600' : 'text-text-muted'
              }`}
            >
              {message}
            </p>
          )}

          {phase === 'won' && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="font-semibold text-emerald-900">Puzzle solved!</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => start(Math.min(5, level + 1))}>Next level</Button>
                <Button variant="outline" onClick={() => start(level)}>
                  Same level
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

export default CrossmathPage
