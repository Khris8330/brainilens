import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui'
import { routes } from '@/routes'
import {
  GRID_SIZE,
  canPlace,
  emptyGrid,
  isGameOver,
  loadBestScore,
  makeTray,
  placePiece,
  refillTrayIfEmpty,
  saveBestScore,
  type CellColor,
  type Piece,
} from '@/games/color-block/engine/board'
import { shapeBounds } from '@/games/color-block/engine/shapes'

type Phase = 'menu' | 'playing' | 'gameover'

function PiecePreview({
  piece,
  selected,
  onSelect,
  disabled,
}: {
  piece: Piece
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}) {
  const { rows, cols } = shapeBounds(piece.def.cells)
  const cell = 14
  return (
    <button
      type="button"
      disabled={disabled || !piece.available}
      onClick={onSelect}
      className={[
        'flex h-24 w-24 items-center justify-center rounded-2xl border-2 transition',
        !piece.available
          ? 'border-transparent opacity-20'
          : selected
            ? 'border-white bg-white/15 scale-105 shadow-lg'
            : 'border-white/20 bg-white/5 hover:bg-white/10',
      ].join(' ')}
      aria-label={`Piece ${piece.def.id}`}
    >
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
          gridTemplateRows: `repeat(${rows}, ${cell}px)`,
        }}
      >
        {Array.from({ length: rows * cols }, (_, i) => {
          const r = Math.floor(i / cols)
          const c = i % cols
          const on = piece.def.cells.some((x) => x.r === r && x.c === c)
          return (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: cell,
                height: cell,
                backgroundColor: on ? piece.color : 'transparent',
                boxShadow: on ? 'inset 0 1px 0 rgba(255,255,255,0.35)' : undefined,
              }}
            />
          )
        })}
      </div>
    </button>
  )
}

export function ColorBlockPage() {
  const [phase, setPhase] = useState<Phase>('menu')
  const [grid, setGrid] = useState<CellColor[][]>(() => emptyGrid())
  const [pieces, setPieces] = useState<Piece[]>(() => makeTray())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)
  const [flash, setFlash] = useState<{ rows: number[]; cols: number[] } | null>(null)

  useEffect(() => {
    setBest(loadBestScore())
  }, [])

  const selected = useMemo(
    () => pieces.find((p) => p.id === selectedId && p.available) ?? null,
    [pieces, selectedId],
  )

  const startGame = () => {
    setGrid(emptyGrid())
    setPieces(makeTray())
    setSelectedId(null)
    setScore(0)
    setHover(null)
    setFlash(null)
    setPhase('playing')
  }

  const tryPlace = useCallback(
    (r: number, c: number) => {
      if (!selected || phase !== 'playing') return
      const result = placePiece(grid, selected.def.cells, selected.color, r, c)
      if (!result.ok) return

      let nextPieces = pieces.map((p) =>
        p.id === selected.id ? { ...p, available: false } : p,
      )
      nextPieces = refillTrayIfEmpty(nextPieces)

      const nextScore = score + result.points
      setGrid(result.grid)
      setPieces(nextPieces)
      setSelectedId(null)
      setScore(nextScore)
      setHover(null)

      if (result.clearedRows.length || result.clearedCols.length) {
        setFlash({ rows: result.clearedRows, cols: result.clearedCols })
        window.setTimeout(() => setFlash(null), 280)
      }

      if (isGameOver(result.grid, nextPieces)) {
        saveBestScore(nextScore)
        setBest(loadBestScore())
        setPhase('gameover')
      }
    },
    [selected, phase, grid, pieces, score],
  )

  const ghostOk =
    selected && hover && canPlace(grid, selected.def.cells, hover.r, hover.c)

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
        <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl bg-gradient-to-b from-indigo-600 to-violet-800 px-6 py-12 text-white shadow-xl">
          <h1 className="text-center text-4xl font-black tracking-tight">Color Block</h1>
          <p className="max-w-xs text-center text-sm text-white/80">
            Place colorful pieces. Fill a full row or column to clear it. Keep going until no piece
            fits.
          </p>
          <div className="rounded-2xl bg-white/10 px-5 py-3 text-sm">
            Best score: <span className="font-bold text-amber-300">{best}</span>
          </div>
          <Button
            size="lg"
            className="rounded-full bg-amber-400 px-10 text-base font-bold text-slate-900 hover:bg-amber-300"
            onClick={startGame}
          >
            Play
          </Button>
        </div>
      )}

      {(phase === 'playing' || phase === 'gameover') && (
        <>
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums text-text">{score}</p>
            <p className="text-xs text-text-muted">Score</p>
          </div>

          <div
            className="mx-auto grid aspect-square w-full max-w-md gap-1 rounded-2xl bg-slate-800 p-2 shadow-inner"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            onMouseLeave={() => setHover(null)}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isFlash = flash && (flash.rows.includes(r) || flash.cols.includes(c))
                let ghost = false
                if (selected && hover && ghostOk) {
                  ghost = selected.def.cells.some(
                    (cellOff) => hover.r + cellOff.r === r && hover.c + cellOff.c === c,
                  )
                }
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    className={[
                      'aspect-square rounded-md transition',
                      isFlash ? 'animate-pulse bg-white' : '',
                    ].join(' ')}
                    style={{
                      backgroundColor: cell ? cell : ghost ? selected!.color : '#1e293b',
                      opacity: ghost && !cell ? 0.45 : 1,
                      boxShadow: cell ? 'inset 0 1px 0 rgba(255,255,255,0.25)' : undefined,
                    }}
                    onMouseEnter={() => setHover({ r, c })}
                    onClick={() => tryPlace(r, c)}
                    aria-label={`Cell ${r + 1}, ${c + 1}`}
                  />
                )
              }),
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            {pieces.map((p) => (
              <PiecePreview
                key={p.id}
                piece={p}
                selected={selectedId === p.id}
                onSelect={() => setSelectedId(p.id)}
                disabled={phase === 'gameover'}
              />
            ))}
          </div>

          {phase === 'gameover' && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center">
              <p className="text-lg font-semibold text-text">No more moves</p>
              <p className="text-sm text-text-muted">
                Final score <span className="font-bold text-text">{score}</span>
                {score >= best && score > 0 ? ' · New best!' : ''}
              </p>
              <div className="flex gap-2">
                <Button onClick={startGame}>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Play again
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

export default ColorBlockPage
