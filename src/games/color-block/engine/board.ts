import { randomShape, type Cell } from './shapes'

export const GRID_SIZE = 8

export type CellColor = string | null

export interface Piece {
  id: string
  def: { id: string; cells: Cell[] }
  color: string
  available: boolean
}

export interface PlaceResult {
  ok: boolean
  grid: CellColor[][]
  clearedRows: number[]
  clearedCols: number[]
  points: number
  cellsPlaced: number
}

export function emptyGrid(): CellColor[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null as CellColor),
  )
}

export function cloneGrid(grid: CellColor[][]): CellColor[][] {
  return grid.map((row) => [...row])
}

export function canPlace(
  grid: CellColor[][],
  cells: Cell[],
  atR: number,
  atC: number,
): boolean {
  for (const cell of cells) {
    const r = atR + cell.r
    const c = atC + cell.c
    if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE) return false
    if (grid[r]![c] !== null) return false
  }
  return true
}

export function canPlaceAnywhere(grid: CellColor[][], cells: Cell[]): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canPlace(grid, cells, r, c)) return true
    }
  }
  return false
}

export function placePiece(
  grid: CellColor[][],
  cells: Cell[],
  color: string,
  atR: number,
  atC: number,
): PlaceResult {
  if (!canPlace(grid, cells, atR, atC)) {
    return { ok: false, grid, clearedRows: [], clearedCols: [], points: 0, cellsPlaced: 0 }
  }

  const next = cloneGrid(grid)
  for (const cell of cells) {
    next[atR + cell.r]![atC + cell.c] = color
  }

  const clearedRows: number[] = []
  const clearedCols: number[] = []

  for (let r = 0; r < GRID_SIZE; r++) {
    if (next[r]!.every((cell) => cell !== null)) clearedRows.push(r)
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    if (next.every((row) => row[c] !== null)) clearedCols.push(c)
  }

  for (const r of clearedRows) {
    for (let c = 0; c < GRID_SIZE; c++) next[r]![c] = null
  }
  for (const c of clearedCols) {
    for (let r = 0; r < GRID_SIZE; r++) next[r]![c] = null
  }

  const cellsPlaced = cells.length
  const lines = clearedRows.length + clearedCols.length
  const points =
    cellsPlaced * 10 +
    (lines > 0 ? lines * 50 + (lines > 1 ? (lines - 1) * 40 : 0) : 0)

  return { ok: true, grid: next, clearedRows, clearedCols, points, cellsPlaced }
}

export function makeTray(): Piece[] {
  return Array.from({ length: 3 }, (_, i) => {
    const { def, color } = randomShape()
    return {
      id: `${Date.now()}-${i}-${def.id}`,
      def,
      color,
      available: true,
    }
  })
}

export function refillTrayIfEmpty(pieces: Piece[]): Piece[] {
  if (pieces.some((p) => p.available)) return pieces
  return makeTray()
}

export function isGameOver(grid: CellColor[][], pieces: Piece[]): boolean {
  const available = pieces.filter((p) => p.available)
  if (available.length === 0) return false
  return available.every((p) => !canPlaceAnywhere(grid, p.def.cells))
}

export function loadBestScore(): number {
  if (typeof window === 'undefined') return 0
  const n = Number(localStorage.getItem('brainilens_color_block_best') ?? '0')
  return Number.isFinite(n) ? n : 0
}

export function saveBestScore(score: number) {
  if (typeof window === 'undefined') return
  const prev = loadBestScore()
  if (score > prev) localStorage.setItem('brainilens_color_block_best', String(score))
}
