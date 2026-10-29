import { describe, expect, it } from 'vitest'
import { dataset } from '../../../shared/data/dataset'
import { daysFrom, makeSet } from '../../../test/fixtures'
import { buildChain, createHigherLowerPuzzle, ROUNDS, STATS, type StatKey } from './puzzle'
import {
  higherLowerMarks,
  higherLowerResult,
  initialHigherLowerState,
  isCallCorrect,
  isHigherLowerFinished,
  makeCall,
  type Call,
} from './session'

describe('createHigherLowerPuzzle', () => {
  it('is deterministic per day', () => {
    expect(createHigherLowerPuzzle(dataset, '2026-11-04')).toEqual(createHigherLowerPuzzle(dataset, '2026-11-04'))
  })

  it('rotates through every stat', () => {
    const stats = daysFrom('2026-10-28', 5).map((day) => createHigherLowerPuzzle(dataset, day).stat.key)
    expect(new Set(stats)).toEqual(new Set(Object.keys(STATS)))
  })

  it.each(daysFrom('2026-10-28', 365))('builds a fair chain on %s', (day) => {
    const { chain, stat } = createHigherLowerPuzzle(dataset, day)
    expect(chain).toHaveLength(ROUNDS + 1)
    expect(new Set(chain.map((set) => set.id)).size).toBe(chain.length)
    chain.slice(1).forEach((set, index) => expect(stat.isApart(stat.value(chain[index]), stat.value(set))).toBe(true))
  })

  it('fails loudly when the data cannot support a fair chain', () => {
    const flat = [1, 2, 3].map((id) => makeSet({ id, playCount: 1000 }))
    expect(() => buildChain(flat, STATS.playCount, 'seed')).toThrow()
  })

  it.each(Object.keys(STATS) as StatKey[])('can always chain %s with the bundled data', (key) => {
    expect(() => buildChain(dataset.beatmapsets, STATS[key], `check:${key}`)).not.toThrow()
  })
})

describe('higher or lower session', () => {
  const puzzle = createHigherLowerPuzzle(dataset, '2026-11-04')
  const rightCall = (round: number): Call => (isCallCorrect(puzzle, round, 'higher') ? 'higher' : 'lower')
  const wrongCall = (round: number): Call => (rightCall(round) === 'higher' ? 'lower' : 'higher')

  it('ends at the first wrong call and scores the run before it', () => {
    let state = initialHigherLowerState
    state = makeCall(puzzle, state, rightCall(0))
    state = makeCall(puzzle, state, rightCall(1))
    state = makeCall(puzzle, state, wrongCall(2))
    expect(isHigherLowerFinished(puzzle, state)).toBe(true)
    expect(makeCall(puzzle, state, rightCall(3))).toBe(state)
    expect(higherLowerMarks(puzzle, state)).toEqual(['hit', 'hit', 'miss'])
    expect(higherLowerResult(puzzle, state, '2026-11-04')).toMatchObject({ score: 2, won: false })
  })

  it('wins with a perfect run of ten', () => {
    let state = initialHigherLowerState
    for (let round = 0; round < ROUNDS; round++) state = makeCall(puzzle, state, rightCall(round))
    expect(isHigherLowerFinished(puzzle, state)).toBe(true)
    expect(higherLowerResult(puzzle, state, '2026-11-04')).toMatchObject({ score: ROUNDS, maxScore: ROUNDS, won: true })
  })
})
