import type { DayKey } from '../daily/day'
import type { DayResult } from '../progress/records'
import type { Mark } from '../share/shareText'

/**
 * State for "name the answer in N tries" games. Each guess is the ID of the
 * guessed item, or null for a skip. Every miss reveals a little more.
 */
export interface GuessState {
  guesses: (number | null)[]
}

export const initialGuessState: GuessState = { guesses: [] }

export function isGuessState(value: unknown): value is GuessState {
  const guesses = (value as GuessState | null)?.guesses
  return Array.isArray(guesses) && guesses.every((guess) => guess === null || Number.isInteger(guess))
}

export interface GuessProgress {
  solved: boolean
  finished: boolean
  /** Wrong guesses and skips so far. */
  misses: number
  remaining: number
}

export function guessProgress(state: GuessState, answerId: number, maxGuesses: number): GuessProgress {
  const solved = state.guesses.includes(answerId)
  const misses = state.guesses.filter((guess) => guess !== answerId).length
  return {
    solved,
    finished: solved || state.guesses.length >= maxGuesses,
    misses,
    remaining: Math.max(0, maxGuesses - state.guesses.length),
  }
}

/** Records a guess or skip. Repeating a wrong guess is ignored. */
export function makeGuess(state: GuessState, answerId: number, maxGuesses: number, guess: number | null): GuessState {
  if (guessProgress(state, answerId, maxGuesses).finished) return state
  if (guess !== null && state.guesses.includes(guess)) return state
  return { guesses: [...state.guesses, guess] }
}

export function guessMarks(state: GuessState, answerId: number, maxGuesses: number): Mark[] {
  return Array.from({ length: maxGuesses }, (_, index): Mark => {
    if (index >= state.guesses.length) return 'unused'
    const guess = state.guesses[index]
    if (guess === answerId) return 'hit'
    return guess === null ? 'skip' : 'miss'
  })
}

/** Solving on the first try scores `maxGuesses`; failing scores 0. */
export function guessResult(state: GuessState, answerId: number, maxGuesses: number, finishedOn: DayKey): DayResult {
  const { solved } = guessProgress(state, answerId, maxGuesses)
  const score = solved ? maxGuesses - state.guesses.indexOf(answerId) : 0
  return { score, maxScore: maxGuesses, won: solved, finishedOn }
}

export function guessScoreLabel(state: GuessState, answerId: number, maxGuesses: number): string {
  const { solved } = guessProgress(state, answerId, maxGuesses)
  return solved ? `${state.guesses.indexOf(answerId) + 1}/${maxGuesses}` : `X/${maxGuesses}`
}
