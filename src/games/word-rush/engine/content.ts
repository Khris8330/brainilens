import type { Challenge } from './types'
import { BANK_A } from './content-a'
import { BANK_B } from './content-b'

/** Full multi-mode Word Rush bank (merged, non-overlapping). */
export const CHALLENGE_BANK: Challenge[] = [...BANK_A, ...BANK_B]
