import { describe, expect, it } from 'vitest'
import { dataset } from '../../../shared/data/dataset'
import { daysFrom } from '../../../test/fixtures'
import { createBackdropPuzzle } from '../../backdrop/domain/puzzle'
import { createMapperPuzzle } from '../../mapper/domain/puzzle'
import { tileArtwork } from './tileArt'

describe('tileArtwork', () => {
  it('never shows today’s Backdrop answer or Mapper set on the home screen', () => {
    for (const day of daysFrom('2026-10-28', 365)) {
      const art = tileArtwork(dataset, day, 4)
      expect(art).toHaveLength(4)
      expect(new Set(art).size).toBe(4)
      expect(art).not.toContain(createBackdropPuzzle(dataset, day).answer.id)
      expect(art).not.toContain(createMapperPuzzle(dataset, day).featuredSet.id)
    }
  })
})
