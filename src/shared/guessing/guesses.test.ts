import { describe, expect, it } from 'vitest'
import { guessMarks, guessProgress, guessResult, guessScoreLabel, initialGuessState, makeGuess } from './guesses'

const ANSWER = 42
const MAX = 6

function play(...guesses: (number | null)[]) {
  return guesses.reduce((state, guess) => makeGuess(state, ANSWER, MAX, guess), initialGuessState)
}

describe('guess games', () => {
  it('scores a first-try solve as the maximum', () => {
    const state = play(42)
    expect(guessProgress(state, ANSWER, MAX)).toMatchObject({ solved: true, finished: true, misses: 0 })
    expect(guessResult(state, ANSWER, MAX, '2026-11-04').score).toBe(6)
    expect(guessScoreLabel(state, ANSWER, MAX)).toBe('1/6')
  })

  it('counts misses and skips before a solve', () => {
    const state = play(1, null, 42)
    expect(guessProgress(state, ANSWER, MAX).misses).toBe(2)
    expect(guessMarks(state, ANSWER, MAX)).toEqual(['miss', 'skip', 'hit', 'unused', 'unused', 'unused'])
    expect(guessResult(state, ANSWER, MAX, '2026-11-04')).toMatchObject({ score: 4, won: true })
  })

  it('ends after the last guess with a score of zero', () => {
    const state = play(1, 2, 3, 4, 5, 6, 42)
    expect(state.guesses).toHaveLength(6)
    expect(guessProgress(state, ANSWER, MAX)).toMatchObject({ solved: false, finished: true, remaining: 0 })
    expect(guessResult(state, ANSWER, MAX, '2026-11-04')).toMatchObject({ score: 0, won: false })
    expect(guessScoreLabel(state, ANSWER, MAX)).toBe('X/6')
  })

  it('ignores a repeated wrong guess but allows repeated skips', () => {
    expect(play(1, 1).guesses).toEqual([1])
    expect(play(null, null).guesses).toEqual([null, null])
  })

  it('ignores guesses after solving', () => {
    expect(play(42, 1).guesses).toEqual([42])
  })
})
