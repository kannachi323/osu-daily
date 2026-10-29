import { describe, expect, it } from 'vitest'
import { dataset } from '../../../shared/data/dataset'
import { addDays, LAUNCH_DAY } from '../../../shared/daily/day'
import { artworkView, BACKDROP_GUESSES, backdropHints, createBackdropPuzzle, revealedHints } from './puzzle'

describe('createBackdropPuzzle', () => {
  it('is deterministic per day', () => {
    expect(createBackdropPuzzle(dataset, '2026-11-04')).toEqual(createBackdropPuzzle(dataset, '2026-11-04'))
  })

  it('does not repeat a beatmapset until every set has been used', () => {
    const answers = dataset.beatmapsets.map((_, index) => createBackdropPuzzle(dataset, addDays(LAUNCH_DAY, index)).answer.id)
    expect(new Set(answers).size).toBe(dataset.beatmapsets.length)
  })

  it('keeps the zoom focus inside the artwork', () => {
    for (let index = 0; index < 60; index++) {
      const { focus } = createBackdropPuzzle(dataset, addDays(LAUNCH_DAY, index))
      expect(focus.x).toBeGreaterThanOrEqual(25)
      expect(focus.x).toBeLessThanOrEqual(75)
      expect(focus.y).toBeGreaterThanOrEqual(30)
      expect(focus.y).toBeLessThanOrEqual(70)
    }
  })
})

describe('reveal', () => {
  it('zooms out and sharpens with each miss, and is clear once finished', () => {
    const views = Array.from({ length: BACKDROP_GUESSES }, (_, misses) => artworkView(misses, false))
    views.slice(1).forEach((view, index) => {
      expect(view.zoom).toBeLessThan(views[index].zoom)
      expect(view.blur).toBeLessThanOrEqual(views[index].blur)
    })
    expect(artworkView(0, true)).toEqual({ zoom: 1, blur: 0 })
  })

  it('reveals one more hint per miss, ending with the artist', () => {
    const answer = dataset.beatmapsets[0]
    expect(revealedHints(answer, 0)).toEqual([])
    expect(revealedHints(answer, 2)).toHaveLength(2)
    expect(backdropHints(answer)).toHaveLength(BACKDROP_GUESSES - 1)
    expect(backdropHints(answer).at(-1)).toEqual({ label: 'Artist', value: answer.artist })
  })
})
