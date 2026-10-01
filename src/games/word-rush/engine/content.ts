import type { Challenge } from './types'
import { BANK_A } from './content-a'
import { BANK_B } from './content-b'

/** Large seed bank so a single round rarely repeats. Expand over time. */
export const CHALLENGE_BANK: Challenge[] = [...BANK_A, ...BANK_B]
