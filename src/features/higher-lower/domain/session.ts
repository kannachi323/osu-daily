import type { DayKey } from '../../../shared/daily/day'
import type { DayResult } from '../../../shared/progress/records'
import type { Mark } from '../../../shared/share/shareText'
import { ROUNDS, type HigherLowerPuzzle } from './puzzle'

export type Call = 'higher' | 'lower'

export interface HigherLowerState {
  calls: Call[]
}

export const initialHigherLowerState: HigherLowerState = { calls: [] }

export function isHigherLowerState(value: unknown): value is HigherLowerState {
  const calls = (value as HigherLowerState | null)?.calls
  return Array.isArray(calls) && calls.every((call) => call === 'higher' || call === 'lower')
}

export function isCallCorrect(puzzle: HigherLowerPuzzle, round: number, call: Call): boolean {
  const current = puzzle.stat.value(puzzle.chain[round])
  const next = puzzle.stat.value(puzzle.chain[round + 1])
  return call === (next > current ? 'higher' : 'lower')
}

/** Correct calls in a row from the start; the run ends at the first miss. */
export function streakOf(puzzle: HigherLowerPuzzle, state: HigherLowerState): number {
  const firstMiss = state.calls.findIndex((call, round) => !isCallCorrect(puzzle, round, call))
  return firstMiss === -1 ? state.calls.length : firstMiss
}

export function isHigherLowerFinished(puzzle: HigherLowerPuzzle, state: HigherLowerState): boolean {
  return state.calls.length >= ROUNDS || streakOf(puzzle, state) < state.calls.length
}

export function makeCall(puzzle: HigherLowerPuzzle, state: HigherLowerState, call: Call): HigherLowerState {
  if (isHigherLowerFinished(puzzle, state)) return state
  return { calls: [...state.calls, call] }
}

export function higherLowerMarks(puzzle: HigherLowerPuzzle, state: HigherLowerState): Mark[] {
  return state.calls.map((call, round) => (isCallCorrect(puzzle, round, call) ? 'hit' : 'miss'))
}

export function higherLowerResult(puzzle: HigherLowerPuzzle, state: HigherLowerState, finishedOn: DayKey): DayResult {
  const score = streakOf(puzzle, state)
  return { score, maxScore: ROUNDS, won: score === ROUNDS, finishedOn }
}
