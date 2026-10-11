import { applyMove, inCheck, legalMoves } from './board'
import { PIECE_VALUE, type Color, type GameState, type Move } from './types'
import { fileOf, rankOf } from './types'

function evaluate(state: GameState): number {
  let score = 0
  for (let i = 0; i < 64; i++) {
    const p = state.board[i]
    if (!p) continue
    const v = PIECE_VALUE[p.type]
    const center =
      fileOf(i) >= 2 && fileOf(i) <= 5 && rankOf(i) >= 2 && rankOf(i) <= 5 ? 10 : 0
    const sign = p.color === 'w' ? 1 : -1
    score += sign * (v + center)
    if (p.type === 'p') {
      score += sign * (p.color === 'w' ? rankOf(i) : 7 - rankOf(i)) * 4
    }
  }
  return score
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
): number {
  if (depth === 0) return evaluate(state)

  const moves = legalMoves(state)
  if (moves.length === 0) {
    if (inCheck(state, state.turn)) {
      return state.turn === 'w' ? -100000 + depth : 100000 - depth
    }
    return 0
  }

  if (maximizing) {
    let best = -Infinity
    for (const m of moves) {
      const val = minimax(applyMove(state, m), depth - 1, alpha, beta, false)
      best = Math.max(best, val)
      alpha = Math.max(alpha, val)
      if (beta <= alpha) break
    }
    return best
  }

  let best = Infinity
  for (const m of moves) {
    const val = minimax(applyMove(state, m), depth - 1, alpha, beta, true)
    best = Math.min(best, val)
    beta = Math.min(beta, val)
    if (beta <= alpha) break
  }
  return best
}

export function chooseAiMove(state: GameState, depth: number, side: Color = 'b'): Move | null {
  const moves = legalMoves(state)
  if (!moves.length) return null

  for (let i = moves.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[moves[i], moves[j]] = [moves[j]!, moves[i]!]
  }

  const maximizing = side === 'w'
  let bestMove = moves[0]!
  let bestScore = maximizing ? -Infinity : Infinity

  for (const m of moves) {
    const next = applyMove(state, m)
    const score = minimax(next, Math.max(0, depth - 1), -Infinity, Infinity, !maximizing)
    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMove = m
    }
  }

  return bestMove
}

export function scoreForWin(tierIndex: number, level: number, moveCount: number): number {
  const base = 500 + tierIndex * 400 + level * 80
  const speed = Math.max(0, 80 - moveCount) * 5
  return base + speed
}
