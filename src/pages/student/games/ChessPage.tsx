import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui'
import { routes } from '@/routes'
import {
  applyMove,
  initialState,
  isCheckmate,
  isStalemate,
  inCheck,
  legalMoves,
  loadBestScore,
  loadProgress,
  saveBestScore,
  saveProgress,
} from '@/games/chess/engine/board'
import { chooseAiMove, scoreForWin } from '@/games/chess/engine/ai'
import {
  TIERS,
  UNICODE,
  type ChessTier,
  type GameState,
  type Move,
  type Square,
} from '@/games/chess/engine/types'
import { fileOf, rankOf } from '@/games/chess/engine/types'

type Phase = 'menu' | 'playing' | 'won' | 'lost' | 'draw'

function sqLabel(s: Square) {
  return `${'abcdefgh'[fileOf(s)]}${'12345678'[rankOf(s)]}`
}

export function ChessPage() {
  const [phase, setPhase] = useState<Phase>('menu')
  const [tier, setTier] = useState<ChessTier>('starter')
  const [level, setLevel] = useState(1)
  const [state, setState] = useState<GameState>(() => initialState())
  const [selected, setSelected] = useState<Square | null>(null)
  const [legal, setLegal] = useState<Move[]>([])
  const [lastMove, setLastMove] = useState<Move | null>(null)
  const [thinking, setThinking] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [history, setHistory] = useState<GameState[]>([])

  useEffect(() => {
    setBest(loadBestScore())
    const p = loadProgress()
    setTier((p.tier as ChessTier) || 'starter')
    setLevel(p.level || 1)
  }, [])

  const tierMeta = TIERS.find((t) => t.key === tier) ?? TIERS[0]!
  const aiDepth = tierMeta.aiDepth + (level >= 4 ? 1 : 0)

  const startGame = (t: ChessTier, lv: number) => {
    setTier(t)
    setLevel(lv)
    setState(initialState())
    setSelected(null)
    setLegal([])
    setLastMove(null)
    setThinking(false)
    setMoveCount(0)
    setScore(0)
    setStatusMsg('Your turn — you play White')
    setHistory([])
    setPhase('playing')
  }

  const finishWin = useCallback(() => {
    const ti = TIERS.findIndex((t) => t.key === tier)
    const s = scoreForWin(Math.max(0, ti), level, moveCount)
    setScore(s)
    saveBestScore(s)
    setBest(loadBestScore())
    const meta = TIERS.find((t) => t.key === tier)!
    let nextLevel = level + 1
    let nextTier = tier
    if (nextLevel > meta.levels) {
      const idx = TIERS.findIndex((t) => t.key === tier)
      if (idx < TIERS.length - 1) {
        nextTier = TIERS[idx + 1]!.key
        nextLevel = 1
      } else {
        nextLevel = meta.levels
      }
    }
    const prev = loadProgress()
    saveProgress({ tier: nextTier, level: nextLevel, wins: (prev.wins ?? 0) + 1 })
    setStatusMsg('Checkmate — you win!')
    setPhase('won')
  }, [tier, level, moveCount])

  const applyPlayerMove = (move: Move) => {
    const next = applyMove(state, move)
    setHistory((h) => [...h, state])
    setState(next)
    setLastMove(move)
    setSelected(null)
    setLegal([])
    setMoveCount((c) => c + 1)

    if (isCheckmate(next)) {
      finishWin()
      return
    }
    if (isStalemate(next)) {
      setStatusMsg('Stalemate — draw')
      setPhase('draw')
      return
    }
    setStatusMsg(inCheck(next, 'b') ? 'Check!' : 'AI thinking…')
    setThinking(true)

    window.setTimeout(() => {
      const depth = Math.min(3, aiDepth)
      const aiMove = chooseAiMove(next, depth, 'b')
      if (!aiMove) {
        setThinking(false)
        if (isCheckmate(next)) finishWin()
        else {
          setStatusMsg('Stalemate — draw')
          setPhase('draw')
        }
        return
      }
      const after = applyMove(next, aiMove)
      setState(after)
      setLastMove(aiMove)
      setThinking(false)

      if (isCheckmate(after)) {
        setStatusMsg('Checkmate — AI wins')
        setPhase('lost')
        return
      }
      if (isStalemate(after)) {
        setStatusMsg('Stalemate — draw')
        setPhase('draw')
        return
      }
      setStatusMsg(inCheck(after, 'w') ? 'You are in check!' : 'Your turn')
    }, 80)
  }

  const onSquareClick = (sqIndex: Square) => {
    if (phase !== 'playing' || thinking || state.turn !== 'w') return

    if (selected !== null) {
      const move = legal.find((m) => m.to === sqIndex)
      if (move) {
        if (move.promotion) applyPlayerMove({ ...move, promotion: 'q' })
        else applyPlayerMove(move)
        return
      }
    }

    const piece = state.board[sqIndex]
    if (piece && piece.color === 'w') {
      setSelected(sqIndex)
      setLegal(legalMoves(state).filter((m) => m.from === sqIndex))
    } else {
      setSelected(null)
      setLegal([])
    }
  }

  const legalTos = useMemo(() => new Set(legal.map((m) => m.to)), [legal])

  const displayOrder = useMemo(() => {
    const cells: number[] = []
    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) cells.push(rank * 8 + file)
    }
    return cells
  }, [])

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col gap-4">
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
        <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-3xl border border-border bg-surface px-6 py-10">
          <h1 className="text-3xl font-bold text-text">Chess</h1>
          <p className="max-w-sm text-center text-sm text-text-muted">
            Standard rules. You play White against the AI. Climb tiers by winning games.
          </p>
          <div className="w-full max-w-xs space-y-2">
            <p className="text-xs font-medium text-text-muted">Tier</p>
            <div className="grid grid-cols-2 gap-2">
              {TIERS.map((t) => (
                <Button
                  key={t.key}
                  size="sm"
                  variant={tier === t.key ? 'primary' : 'outline'}
                  onClick={() => setTier(t.key)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <p className="pt-2 text-xs font-medium text-text-muted">Level (1–{tierMeta.levels})</p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: tierMeta.levels }, (_, i) => i + 1).map((lv) => (
                <Button
                  key={lv}
                  size="sm"
                  variant={level === lv ? 'primary' : 'outline'}
                  onClick={() => setLevel(lv)}
                >
                  {lv}
                </Button>
              ))}
            </div>
          </div>
          <Button size="lg" onClick={() => startGame(tier, level)}>
            Play
          </Button>
        </div>
      )}

      {phase !== 'menu' && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text">
              {tierMeta.label} · Level {level}
            </span>
            <span className="text-text-muted">{statusMsg}</span>
          </div>

          <div
            className="mx-auto grid aspect-square w-full max-w-md overflow-hidden rounded-lg border-2 border-slate-800 shadow-md"
            style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}
          >
            {displayOrder.map((i) => {
              const f = fileOf(i)
              const r = rankOf(i)
              const light = (f + r) % 2 === 1
              const piece = state.board[i]
              const isSel = selected === i
              const isTarget = legalTos.has(i)
              const isLast = lastMove && (lastMove.from === i || lastMove.to === i)

              return (
                <button
                  key={i}
                  type="button"
                  disabled={thinking || phase !== 'playing'}
                  onClick={() => onSquareClick(i)}
                  className={[
                    'relative flex aspect-square items-center justify-center text-3xl sm:text-4xl transition',
                    light ? 'bg-amber-100' : 'bg-amber-700',
                    isSel ? 'ring-2 ring-inset ring-sky-500' : '',
                    isLast && !isSel ? 'bg-yellow-300/50' : '',
                  ].join(' ')}
                  aria-label={sqLabel(i)}
                >
                  {piece && (
                    <span
                      className={
                        piece.color === 'w'
                          ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'
                          : 'text-slate-900'
                      }
                    >
                      {UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                  {isTarget && (
                    <span
                      className={[
                        'absolute rounded-full',
                        piece ? 'inset-1 border-4 border-emerald-500/70' : 'size-3 bg-emerald-600/70',
                      ].join(' ')}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {(phase === 'won' || phase === 'lost' || phase === 'draw') && (
              <>
                {phase === 'won' && (
                  <p className="w-full text-center text-lg font-semibold text-emerald-600">
                    +{score.toLocaleString()} points
                  </p>
                )}
                <Button onClick={() => startGame(tier, level)}>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Rematch
                </Button>
                <Button variant="outline" onClick={() => setPhase('menu')}>
                  Change level
                </Button>
                <Link to={routes.studentGames}>
                  <Button variant="outline">Hub</Button>
                </Link>
              </>
            )}
            {phase === 'playing' && (
              <Button
                variant="outline"
                size="sm"
                disabled={!history.length || thinking}
                onClick={() => {
                  setHistory((h) => {
                    if (h.length < 1) return h
                    const prev = h[h.length - 1]!
                    setState(prev)
                    setLastMove(null)
                    setSelected(null)
                    setLegal([])
                    setStatusMsg('Your turn')
                    return h.slice(0, -1)
                  })
                }}
              >
                Undo
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ChessPage
