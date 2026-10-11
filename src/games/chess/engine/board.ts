import type { Color, GameState, Move, Piece, PieceType, Square } from './types'
import { fileOf, rankOf, sq } from './types'

export function initialState(): GameState {
  const board: (Piece | null)[] = Array(64).fill(null)
  const back: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
  for (let f = 0; f < 8; f++) {
    board[sq(f, 0)] = { type: back[f]!, color: 'w' }
    board[sq(f, 1)] = { type: 'p', color: 'w' }
    board[sq(f, 6)] = { type: 'p', color: 'b' }
    board[sq(f, 7)] = { type: back[f]!, color: 'b' }
  }
  return {
    board,
    turn: 'w',
    castle: { K: true, Q: true, k: true, q: true },
    ep: null,
    halfmove: 0,
    fullmove: 1,
  }
}

export function cloneState(s: GameState): GameState {
  return {
    board: s.board.map((p) => (p ? { ...p } : null)),
    turn: s.turn,
    castle: { ...s.castle },
    ep: s.ep,
    halfmove: s.halfmove,
    fullmove: s.fullmove,
  }
}

function inBounds(f: number, r: number) {
  return f >= 0 && f < 8 && r >= 0 && r < 8
}

export function attackedBy(state: GameState, color: Color, target: Square): boolean {
  const tf = fileOf(target)
  const tr = rankOf(target)
  const pr = color === 'w' ? tr - 1 : tr + 1
  for (const df of [-1, 1]) {
    const f = tf + df
    if (inBounds(f, pr)) {
      const p = state.board[sq(f, pr)]
      if (p && p.color === color && p.type === 'p') return true
    }
  }
  for (const [df, dr] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]] as const) {
    const f = tf + df, r = tr + dr
    if (inBounds(f, r)) {
      const p = state.board[sq(f, r)]
      if (p && p.color === color && p.type === 'n') return true
    }
  }
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue
      const f = tf + df, r = tr + dr
      if (inBounds(f, r)) {
        const p = state.board[sq(f, r)]
        if (p && p.color === color && p.type === 'k') return true
      }
    }
  }
  for (const [df, dr] of [[1,0],[-1,0],[0,1],[0,-1]] as const) {
    let f = tf + df, r = tr + dr
    while (inBounds(f, r)) {
      const p = state.board[sq(f, r)]
      if (p) {
        if (p.color === color && (p.type === 'r' || p.type === 'q')) return true
        break
      }
      f += df; r += dr
    }
  }
  for (const [df, dr] of [[1,1],[1,-1],[-1,1],[-1,-1]] as const) {
    let f = tf + df, r = tr + dr
    while (inBounds(f, r)) {
      const p = state.board[sq(f, r)]
      if (p) {
        if (p.color === color && (p.type === 'b' || p.type === 'q')) return true
        break
      }
      f += df; r += dr
    }
  }
  return false
}

export function findKing(state: GameState, color: Color): Square {
  for (let i = 0; i < 64; i++) {
    const p = state.board[i]
    if (p && p.color === color && p.type === 'k') return i
  }
  return -1
}

export function inCheck(state: GameState, color: Color): boolean {
  const k = findKing(state, color)
  if (k < 0) return true
  return attackedBy(state, color === 'w' ? 'b' : 'w', k)
}

function pushSlide(state: GameState, from: Square, color: Color, deltas: readonly [number, number][], moves: Move[]) {
  const piece = state.board[from]!
  for (const [df, dr] of deltas) {
    let f = fileOf(from) + df, r = rankOf(from) + dr
    while (inBounds(f, r)) {
      const to = sq(f, r)
      const t = state.board[to]
      if (!t) moves.push({ from, to, piece })
      else {
        if (t.color !== color) moves.push({ from, to, piece, captured: t })
        break
      }
      f += df; r += dr
    }
  }
}

export function generatePseudoMoves(state: GameState): Move[] {
  const moves: Move[] = []
  const color = state.turn
  const enemy = color === 'w' ? 'b' : 'w'
  for (let from = 0; from < 64; from++) {
    const piece = state.board[from]
    if (!piece || piece.color !== color) continue
    const f = fileOf(from), r = rankOf(from)
    if (piece.type === 'p') {
      const dir = color === 'w' ? 1 : -1
      const startRank = color === 'w' ? 1 : 6
      const promoRank = color === 'w' ? 7 : 0
      const one = sq(f, r + dir)
      if (inBounds(f, r + dir) && !state.board[one]) {
        if (r + dir === promoRank) {
          for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) moves.push({ from, to: one, piece, promotion: promo })
        } else {
          moves.push({ from, to: one, piece })
          if (r === startRank) {
            const two = sq(f, r + 2 * dir)
            if (!state.board[two]) moves.push({ from, to: two, piece })
          }
        }
      }
      for (const df of [-1, 1]) {
        const cf = f + df, cr = r + dir
        if (!inBounds(cf, cr)) continue
        const to = sq(cf, cr)
        const t = state.board[to]
        if (t && t.color === enemy) {
          if (cr === promoRank) {
            for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) moves.push({ from, to, piece, captured: t, promotion: promo })
          } else moves.push({ from, to, piece, captured: t })
        }
        if (state.ep === to && !t) {
          const cap = state.board[sq(cf, r)]
          if (cap && cap.type === 'p' && cap.color === enemy) moves.push({ from, to, piece, captured: cap, enPassant: true })
        }
      }
    } else if (piece.type === 'n') {
      for (const [df, dr] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]] as const) {
        const nf = f + df, nr = r + dr
        if (!inBounds(nf, nr)) continue
        const to = sq(nf, nr)
        const t = state.board[to]
        if (!t) moves.push({ from, to, piece })
        else if (t.color === enemy) moves.push({ from, to, piece, captured: t })
      }
    } else if (piece.type === 'b') {
      pushSlide(state, from, color, [[1,1],[1,-1],[-1,1],[-1,-1]], moves)
    } else if (piece.type === 'r') {
      pushSlide(state, from, color, [[1,0],[-1,0],[0,1],[0,-1]], moves)
    } else if (piece.type === 'q') {
      pushSlide(state, from, color, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], moves)
    } else if (piece.type === 'k') {
      for (let df = -1; df <= 1; df++) {
        for (let dr = -1; dr <= 1; dr++) {
          if (df === 0 && dr === 0) continue
          const nf = f + df, nr = r + dr
          if (!inBounds(nf, nr)) continue
          const to = sq(nf, nr)
          const t = state.board[to]
          if (!t) moves.push({ from, to, piece })
          else if (t.color === enemy) moves.push({ from, to, piece, captured: t })
        }
      }
      if (color === 'w' && r === 0 && f === 4) {
        if (state.castle.K && !state.board[sq(5,0)] && !state.board[sq(6,0)] && !attackedBy(state,'b',sq(4,0)) && !attackedBy(state,'b',sq(5,0)) && !attackedBy(state,'b',sq(6,0)))
          moves.push({ from, to: sq(6,0), piece, castle: 'K' })
        if (state.castle.Q && !state.board[sq(3,0)] && !state.board[sq(2,0)] && !state.board[sq(1,0)] && !attackedBy(state,'b',sq(4,0)) && !attackedBy(state,'b',sq(3,0)) && !attackedBy(state,'b',sq(2,0)))
          moves.push({ from, to: sq(2,0), piece, castle: 'Q' })
      }
      if (color === 'b' && r === 7 && f === 4) {
        if (state.castle.k && !state.board[sq(5,7)] && !state.board[sq(6,7)] && !attackedBy(state,'w',sq(4,7)) && !attackedBy(state,'w',sq(5,7)) && !attackedBy(state,'w',sq(6,7)))
          moves.push({ from, to: sq(6,7), piece, castle: 'k' })
        if (state.castle.q && !state.board[sq(3,7)] && !state.board[sq(2,7)] && !state.board[sq(1,7)] && !attackedBy(state,'w',sq(4,7)) && !attackedBy(state,'w',sq(3,7)) && !attackedBy(state,'w',sq(2,7)))
          moves.push({ from, to: sq(2,7), piece, castle: 'q' })
      }
    }
  }
  return moves
}

export function applyMove(state: GameState, move: Move): GameState {
  const s = cloneState(state)
  const piece = { ...move.piece }
  if (move.enPassant) {
    s.board[sq(fileOf(move.to), rankOf(move.from))] = null
  }
  s.board[move.from] = null
  s.board[move.to] = move.promotion ? { type: move.promotion, color: piece.color } : piece
  if (move.castle === 'K') { s.board[sq(7,0)] = null; s.board[sq(5,0)] = { type: 'r', color: 'w' } }
  else if (move.castle === 'Q') { s.board[sq(0,0)] = null; s.board[sq(3,0)] = { type: 'r', color: 'w' } }
  else if (move.castle === 'k') { s.board[sq(7,7)] = null; s.board[sq(5,7)] = { type: 'r', color: 'b' } }
  else if (move.castle === 'q') { s.board[sq(0,7)] = null; s.board[sq(3,7)] = { type: 'r', color: 'b' } }
  if (piece.type === 'k') {
    if (piece.color === 'w') { s.castle.K = false; s.castle.Q = false }
    else { s.castle.k = false; s.castle.q = false }
  }
  if (piece.type === 'r') {
    if (move.from === sq(0,0)) s.castle.Q = false
    if (move.from === sq(7,0)) s.castle.K = false
    if (move.from === sq(0,7)) s.castle.q = false
    if (move.from === sq(7,7)) s.castle.k = false
  }
  if (move.captured?.type === 'r') {
    if (move.to === sq(0,0)) s.castle.Q = false
    if (move.to === sq(7,0)) s.castle.K = false
    if (move.to === sq(0,7)) s.castle.q = false
    if (move.to === sq(7,7)) s.castle.k = false
  }
  s.ep = null
  if (piece.type === 'p' && Math.abs(rankOf(move.to) - rankOf(move.from)) === 2) {
    s.ep = sq(fileOf(move.from), (rankOf(move.from) + rankOf(move.to)) / 2)
  }
  s.halfmove = piece.type === 'p' || move.captured ? 0 : s.halfmove + 1
  if (s.turn === 'b') s.fullmove++
  s.turn = s.turn === 'w' ? 'b' : 'w'
  return s
}

export function legalMoves(state: GameState): Move[] {
  const color = state.turn
  return generatePseudoMoves(state).filter((m) => !inCheck(applyMove(state, m), color))
}

export function isCheckmate(state: GameState): boolean {
  return inCheck(state, state.turn) && legalMoves(state).length === 0
}

export function isStalemate(state: GameState): boolean {
  return !inCheck(state, state.turn) && legalMoves(state).length === 0
}

const BEST_KEY = 'brainilens_chess_best'
const PROGRESS_KEY = 'brainilens_chess_progress'

export function loadBestScore(): number {
  if (typeof window === 'undefined') return 0
  const n = Number(localStorage.getItem(BEST_KEY) ?? '0')
  return Number.isFinite(n) ? n : 0
}

export function saveBestScore(score: number) {
  if (typeof window === 'undefined') return
  if (score > loadBestScore()) localStorage.setItem(BEST_KEY, String(score))
}

export function loadProgress(): { tier: string; level: number; wins: number } {
  if (typeof window === 'undefined') return { tier: 'starter', level: 1, wins: 0 }
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return { tier: 'starter', level: 1, wins: 0 }
    return JSON.parse(raw) as { tier: string; level: number; wins: number }
  } catch {
    return { tier: 'starter', level: 1, wins: 0 }
  }
}

export function saveProgress(p: { tier: string; level: number; wins: number }) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
}
