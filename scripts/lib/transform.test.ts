import { describe, expect, it } from 'vitest'
import { buildDataset, toBeatmapset, type ApiBeatmapset, type ApiUser } from './transform.ts'

function apiSet(overrides: Partial<ApiBeatmapset> = {}): ApiBeatmapset {
  return {
    id: 1,
    artist: 'xi',
    title: 'FREEDOM DiVE',
    creator: 'Nakagawa-Kanon',
    user_id: 10,
    status: 'approved',
    ranked_date: '2012-06-23T04:21:52Z',
    play_count: 100,
    favourite_count: 10,
    source: ' BMS ',
    beatmaps: [
      { mode: 'osu', version: 'Normal', difficulty_rating: 3.1, bpm: 222.22, total_length: 258 },
      { mode: 'osu', version: 'FOUR DIMENSIONS', difficulty_rating: 7.814, bpm: 222.22, total_length: 258 },
      { mode: 'taiko', version: 'Oni', difficulty_rating: 9, bpm: 222.22, total_length: 258 },
    ],
    ...overrides,
  }
}

const user: ApiUser = {
  id: 10,
  username: 'Nakagawa-Kanon',
  join_date: '2009-03-01T00:00:00Z',
  country: { code: 'KR', name: 'South Korea' },
  mapping_follower_count: 338,
  previous_usernames: ['dksslqj'],
}

describe('toBeatmapset', () => {
  it('keeps the hardest osu!standard difficulty and rounds stars', () => {
    expect(toBeatmapset(apiSet())).toMatchObject({
      status: 'approved',
      rankedDate: '2012-06-23',
      source: 'BMS',
      difficultyCount: 2,
      hardest: { name: 'FOUR DIMENSIONS', stars: 7.81, bpm: 222.22, lengthSeconds: 258 },
    })
  })

  it('drops explicit sets and sets that are not ranked/approved or lack a standard difficulty', () => {
    expect(toBeatmapset(apiSet({ status: 'loved' }))).toBeUndefined()
    expect(toBeatmapset(apiSet({ nsfw: true }))).toBeUndefined()
    expect(toBeatmapset(apiSet({ beatmaps: [] }))).toBeUndefined()
    expect(toBeatmapset(apiSet({ ranked_date: null }))).toBeUndefined()
  })
})

describe('buildDataset', () => {
  it('keeps the most played set per song and uses current usernames', () => {
    const dataset = buildDataset(
      [apiSet({ id: 1, play_count: 5, creator: 'old name' }), apiSet({ id: 2, play_count: 50, creator: 'old name' })],
      [user],
      '2026-10-28',
      'test',
    )
    expect(dataset.beatmapsets.map((set) => set.id)).toEqual([2])
    expect(dataset.beatmapsets[0].creator).toBe('Nakagawa-Kanon')
    expect(dataset.mappers).toEqual([
      {
        id: 10,
        username: 'Nakagawa-Kanon',
        countryCode: 'KR',
        countryName: 'South Korea',
        previousUsernames: ['dksslqj'],
        joinedYear: 2009,
        mappingFollowers: 338,
      },
    ])
  })
})
