import { describe, expect, it } from 'vitest'
import { dataset } from '../../../shared/data/dataset'
import { addDays, LAUNCH_DAY } from '../../../shared/daily/day'
import { makeDataset, makeMapper, makeSet } from '../../../test/fixtures'
import { answerPool, createMapperPuzzle, MAPPER_GUESSES, MIN_ANSWER_FOLLOWERS, visibleClueCount } from './puzzle'

describe('createMapperPuzzle', () => {
  it('is deterministic per day', () => {
    expect(createMapperPuzzle(dataset, '2026-11-04')).toEqual(createMapperPuzzle(dataset, '2026-11-04'))
  })

  it('only picks well-followed mappers who host a set in the dataset', () => {
    const pool = answerPool(dataset)
    expect(pool.length).toBeGreaterThanOrEqual(30)
    for (let index = 0; index < pool.length; index++) {
      const puzzle = createMapperPuzzle(dataset, addDays(LAUNCH_DAY, index))
      expect(puzzle.answer.mappingFollowers).toBeGreaterThanOrEqual(MIN_ANSWER_FOLLOWERS)
      expect(puzzle.featuredSet.creatorId).toBe(puzzle.answer.id)
    }
  })

  it('features the mapper’s most played set and ends with their initial', () => {
    const data = makeDataset(
      [makeSet({ id: 1, creatorId: 7, playCount: 10 }), makeSet({ id: 2, creatorId: 7, playCount: 99 })],
      [makeMapper({ id: 7, username: 'Sotarks' })],
    )
    const puzzle = createMapperPuzzle(data, '2026-11-04')
    expect(puzzle.featuredSet.id).toBe(2)
    expect(puzzle.clues).toHaveLength(MAPPER_GUESSES)
    expect(puzzle.clues.at(-1)).toMatchObject({ kind: 'song', value: 'Name starts with “S”' })
  })

  it('shows one clue to start and one more per miss', () => {
    expect(visibleClueCount(0, false)).toBe(1)
    expect(visibleClueCount(3, false)).toBe(4)
    expect(visibleClueCount(9, false)).toBe(MAPPER_GUESSES)
    expect(visibleClueCount(0, true)).toBe(MAPPER_GUESSES)
  })
})
