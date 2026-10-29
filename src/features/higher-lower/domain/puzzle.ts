import { formatCount, formatLength } from '../../../shared/data/dataset'
import type { Beatmapset, Dataset } from '../../../shared/data/types'
import { createRng, pickInRotation } from '../../../shared/daily/random'
import { puzzleNumberOf, type DayKey } from '../../../shared/daily/day'

export const ROUNDS = 10

export type StatKey = 'playCount' | 'favouriteCount' | 'bpm' | 'length' | 'stars'

export interface Stat {
  key: StatKey
  /** Short noun shown on cards, e.g. "plays". */
  name: string
  value(set: Beatmapset): number
  format(value: number): string
  /** Values must differ this much to be a fair comparison. */
  isApart(a: number, b: number): boolean
  /** True when the value can drift after the snapshot. */
  isSnapshot: boolean
}

const ratioApart = (ratio: number) => (a: number, b: number) => Math.max(a, b) / Math.max(1, Math.min(a, b)) >= ratio

export const STATS: Record<StatKey, Stat> = {
  playCount: {
    key: 'playCount',
    name: 'plays',
    value: (set) => set.playCount,
    format: formatCount,
    isApart: ratioApart(1.2),
    isSnapshot: true,
  },
  favouriteCount: {
    key: 'favouriteCount',
    name: 'favourites',
    value: (set) => set.favouriteCount,
    format: formatCount,
    isApart: ratioApart(1.2),
    isSnapshot: true,
  },
  bpm: {
    key: 'bpm',
    name: 'BPM',
    value: (set) => set.hardest.bpm,
    format: (value) => String(Math.round(value)),
    isApart: (a, b) => Math.abs(a - b) >= 5,
    isSnapshot: false,
  },
  length: {
    key: 'length',
    name: 'length',
    value: (set) => set.hardest.lengthSeconds,
    format: formatLength,
    isApart: (a, b) => Math.abs(a - b) >= 8,
    isSnapshot: false,
  },
  stars: {
    key: 'stars',
    name: 'stars',
    value: (set) => set.hardest.stars,
    format: (value) => value.toFixed(2),
    isApart: (a, b) => Math.abs(a - b) >= 0.2,
    isSnapshot: true,
  },
}

export interface HigherLowerPuzzle {
  day: DayKey
  stat: Stat
  /** ROUNDS + 1 sets; round i compares chain[i] with chain[i + 1]. */
  chain: Beatmapset[]
  signature: string
}

/** Greedily chains shuffled sets so every neighbouring pair is clearly apart. */
export function buildChain(sets: readonly Beatmapset[], stat: Stat, seed: string, length = ROUNDS + 1): Beatmapset[] {
  const rng = createRng(seed)
  const remaining = rng.shuffle(sets)
  const chain = [remaining.shift()!]
  while (chain.length < length) {
    const previous = stat.value(chain[chain.length - 1])
    const index = remaining.findIndex((set) => stat.isApart(previous, stat.value(set)))
    if (index === -1) throw new Error(`Not enough distinct ${stat.key} values for a chain`)
    chain.push(remaining.splice(index, 1)[0])
  }
  return chain
}

export function createHigherLowerPuzzle(data: Dataset, day: DayKey): HigherLowerPuzzle {
  const stat = STATS[pickInRotation(Object.keys(STATS) as StatKey[], 'higher-lower', puzzleNumberOf(day))]
  const chain = buildChain(data.beatmapsets, stat, `higher-lower:${day}`)
  return { day, stat, chain, signature: `higher-lower:${stat.key}:${chain.map((set) => set.id).join(',')}` }
}
