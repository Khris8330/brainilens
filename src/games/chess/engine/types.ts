export type Color = 'w' | 'b'
export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p'
export type Piece = { type: PieceType; color: Color }

export type Square = number // 0–63, a1=0 … h8=63 (file + rank*8)

export interface Move {
  from: Square
  to: Square
  piece: Piece
  captured?: Piece
  promotion?: PieceType
  castle?: 'K' | 'Q' | 'k' | 'q'
  enPassant?: boolean
}

export interface GameState {
  board: (Piece | null)[]
  turn: Color
  castle: { K: boolean; Q: boolean; k: boolean; q: boolean }
  ep: Square | null
  halfmove: number
  fullmove: number
}

export type ChessTier = 'starter' | 'learner' | 'player' | 'strategist' | 'master'

export const TIERS: { key: ChessTier; label: string; levels: number; aiDepth: number }[] = [
  { key: 'starter', label: 'Starter', levels: 5, aiDepth: 1 },
  { key: 'learner', label: 'Learner', levels: 5, aiDepth: 2 },
  { key: 'player', label: 'Player', levels: 5, aiDepth: 2 },
  { key: 'strategist', label: 'Strategist', levels: 5, aiDepth: 3 },
  { key: 'master', label: 'Master', levels: 5, aiDepth: 3 },
]

export const PIECE_VALUE: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
}

export const UNICODE: Record<Color, Record<PieceType, string>> = {
  w: { k: '\u2654', q: '\u2655', r: '\u2656', b: '\u2657', n: '\u2658', p: '\u2659' },
  b: { k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F' },
}

export function fileOf(sq: Square) {
  return sq % 8
}
export function rankOf(sq: Square) {
  return Math.floor(sq / 8)
}
export function sq(file: number, rank: number): Square {
  return rank * 8 + file
}
