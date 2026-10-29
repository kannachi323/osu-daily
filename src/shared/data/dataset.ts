import rawDataset from './dataset.json'
import type { Beatmapset, Dataset, Mapper } from './types'

export const dataset = rawDataset as Dataset

export type CoverSize = 'card' | 'card@2x' | 'cover' | 'cover@2x' | 'list@2x' | 'fullsize'

/** Beatmap artwork is hot-linked from the osu! asset server, never bundled. */
export function coverUrl(beatmapsetId: number, size: CoverSize = 'card@2x'): string {
  return `https://assets.ppy.sh/beatmaps/${beatmapsetId}/covers/${size}.jpg`
}

export function beatmapsetUrl(beatmapsetId: number): string {
  return `https://osu.ppy.sh/beatmapsets/${beatmapsetId}`
}

export function userUrl(userId: number): string {
  return `https://osu.ppy.sh/users/${userId}`
}

export function songLabel(set: Pick<Beatmapset, 'artist' | 'title'>): string {
  return `${set.artist} – ${set.title}`
}

export function findBeatmapset(data: Dataset, id: number): Beatmapset {
  const set = data.beatmapsets.find((candidate) => candidate.id === id)
  if (!set) throw new Error(`Beatmapset ${id} is not in the dataset`)
  return set
}

export function findMapper(data: Dataset, id: number): Mapper | undefined {
  return data.mappers.find((mapper) => mapper.id === id)
}

export function formatLength(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}
