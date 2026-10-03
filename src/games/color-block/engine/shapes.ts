/** Polyomino shapes for Color Block (grid cells relative to origin). */

export type Cell = { r: number; c: number }

export interface ShapeDef {
  id: string
  cells: Cell[]
}

/** All shapes use cells relative to (0,0) top-left of bounding box. */
export const SHAPE_DEFS: ShapeDef[] = [
  { id: '1', cells: [{ r: 0, c: 0 }] },
  { id: '2h', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }] },
  { id: '2v', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }] },
  { id: '3h', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }] },
  { id: '3v', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }] },
  { id: '3L', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }] },
  { id: 'O', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }] },
  { id: 'T', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 1 }] },
  { id: 'L', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 2, c: 1 }] },
  { id: 'J', cells: [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 0 }, { r: 2, c: 1 }] },
  { id: 'S', cells: [{ r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 1, c: 1 }] },
  { id: 'Z', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }] },
  { id: '5h', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }] },
  { id: '5v', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }] },
  {
    id: 'bigL',
    cells: [
      { r: 0, c: 0 },
      { r: 1, c: 0 },
      { r: 2, c: 0 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
    ],
  },
]

export const COLORS = [
  '#22d3ee',
  '#4ade80',
  '#60a5fa',
  '#f97316',
  '#a78bfa',
  '#facc15',
  '#f87171',
  '#2dd4bf',
] as const

export function shapeBounds(cells: Cell[]) {
  const maxR = Math.max(...cells.map((c) => c.r))
  const maxC = Math.max(...cells.map((c) => c.c))
  return { rows: maxR + 1, cols: maxC + 1 }
}

export function randomShape(): { def: ShapeDef; color: string } {
  const def = SHAPE_DEFS[Math.floor(Math.random() * SHAPE_DEFS.length)]!
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]!
  return { def, color }
}
