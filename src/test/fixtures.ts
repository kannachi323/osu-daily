import type { Beatmapset, Dataset, Mapper } from '../shared/data/types'

export function makeSet(overrides: Partial<Beatmapset> & { id: number }): Beatmapset {
  return {
    artist: `Artist ${overrides.id}`,
    title: `Title ${overrides.id}`,
    creator: `Mapper ${overrides.id}`,
    creatorId: overrides.id,
    status: 'ranked',
    rankedDate: '2016-01-01',
    playCount: 1000,
    favouriteCount: 100,
    source: '',
    difficultyCount: 4,
    hardest: { name: 'Insane', stars: 5, bpm: 180, lengthSeconds: 120 },
    ...overrides,
  }
}

export function makeMapper(overrides: Partial<Mapper> & { id: number }): Mapper {
  return {
    username: `Mapper ${overrides.id}`,
    countryCode: 'JP',
    countryName: 'Japan',
    previousUsernames: [],
    joinedYear: 2012,
    mappingFollowers: 1000,
    ...overrides,
  }
}

export function makeDataset(beatmapsets: Beatmapset[], mappers: Mapper[] = []): Dataset {
  return { version: 1, snapshotDate: '2026-10-28', source: 'test', beatmapsets, mappers }
}

/** Every day in a year starting at `start`, for "works on any day" checks. */
export function daysFrom(start: string, count: number): string[] {
  const first = Date.parse(`${start}T00:00:00Z`)
  return Array.from({ length: count }, (_, index) => new Date(first + index * 86_400_000).toISOString().slice(0, 10))
}
