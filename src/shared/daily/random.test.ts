import { describe, expect, it } from 'vitest'
import { createRng, hashString, pickInRotation } from './random'

describe('createRng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRng('trivia:2026-11-04')
    const b = createRng('trivia:2026-11-04')
    const sequence = () => Array.from({ length: 5 }, () => a.next())
    expect(sequence()).toEqual(Array.from({ length: 5 }, () => b.next()))
  })

  it('produces a different sequence for a different day', () => {
    expect(createRng('trivia:2026-11-04').next()).not.toBe(createRng('trivia:2026-11-05').next())
  })

  it('pins the generator so a refactor cannot silently change everyone’s puzzle', () => {
    expect(hashString('osu')).toMatchInlineSnapshot(`2921352006`)
    expect(createRng('osu').int(1_000_000)).toBe(createRng('osu').int(1_000_000))
    expect(createRng('trivia:2026-10-28').shuffle([1, 2, 3, 4, 5, 6])).toMatchInlineSnapshot(`
      [
        3,
        4,
        6,
        1,
        2,
        5,
      ]
    `)
  })

  it('stays within bounds', () => {
    const rng = createRng('bounds')
    for (let index = 0; index < 1000; index++) {
      const value = rng.int(7)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(7)
    }
  })

  it('shuffles into a permutation without touching the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const shuffled = createRng('shuffle').shuffle(input)
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect([...shuffled].sort((a, b) => a - b)).toEqual(input)
  })
})

describe('pickInRotation', () => {
  it('uses every item once before repeating', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const firstCycle = [1, 2, 3, 4, 5].map((day) => pickInRotation(items, 'salt', day))
    expect(new Set(firstCycle).size).toBe(items.length)
    expect(pickInRotation(items, 'salt', 6)).toBe(firstCycle[0])
  })

  it('handles puzzle numbers before launch without crashing', () => {
    expect(['a', 'b']).toContain(pickInRotation(['a', 'b'], 'salt', -3))
  })
})
