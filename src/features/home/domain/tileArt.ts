import type { Dataset } from '../../../shared/data/types'
import { createRng } from '../../../shared/daily/random'
import type { DayKey } from '../../../shared/daily/day'
import { createBackdropPuzzle } from '../../backdrop/domain/puzzle'
import { createMapperPuzzle } from '../../mapper/domain/puzzle'

/**
 * Artwork for the home tiles, fresh each day. Today's Backdrop answer and the
 * Mapper's featured set are left out so the home screen never spoils them.
 */
export function tileArtwork(data: Dataset, day: DayKey, count: number): number[] {
  const secrets = new Set([createBackdropPuzzle(data, day).answer.id, createMapperPuzzle(data, day).featuredSet.id])
  const pool = data.beatmapsets.filter((set) => !secrets.has(set.id) && set.playCount >= 1_000_000)
  return createRng(`tiles:${day}`)
    .shuffle(pool)
    .slice(0, count)
    .map((set) => set.id)
}
