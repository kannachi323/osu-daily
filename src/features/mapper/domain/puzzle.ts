import { formatCount, songLabel } from '../../../shared/data/dataset'
import type { Beatmapset, Dataset, Mapper } from '../../../shared/data/types'
import { pickInRotation } from '../../../shared/daily/random'
import { puzzleNumberOf, type DayKey } from '../../../shared/daily/day'

export const MAPPER_GUESSES = 5

/** Only mappers with a real following are answers; anyone in the dataset can be guessed. */
export const MIN_ANSWER_FOLLOWERS = 300

export type Clue =
  | { kind: 'joined'; label: string; value: string }
  | { kind: 'country'; label: string; value: string; countryCode: string }
  | { kind: 'followers'; label: string; value: string }
  | { kind: 'artwork'; label: string; setId: number }
  | { kind: 'song'; label: string; value: string }

export interface MapperPuzzle {
  day: DayKey
  answer: Mapper
  /** The answer's most played set in the dataset. */
  featuredSet: Beatmapset
  clues: Clue[]
  signature: string
}

export function answerPool(data: Dataset): Mapper[] {
  const hosts = new Set(data.beatmapsets.map((set) => set.creatorId))
  return data.mappers.filter((mapper) => hosts.has(mapper.id) && mapper.mappingFollowers >= MIN_ANSWER_FOLLOWERS)
}

/** Clues go from vague to specific; the last one names a song and the first letter. */
export function mapperClues(mapper: Mapper, featuredSet: Beatmapset, snapshotDate: string): Clue[] {
  return [
    { kind: 'joined', label: 'Joined osu!', value: String(mapper.joinedYear) },
    { kind: 'country', label: 'From', value: mapper.countryName, countryCode: mapper.countryCode },
    {
      kind: 'followers',
      label: `Mapping subscribers (${snapshotDate.slice(0, 7)})`,
      value: formatCount(mapper.mappingFollowers),
    },
    { kind: 'artwork', label: 'Hosted this set', setId: featuredSet.id },
    {
      kind: 'song',
      label: `Hosted ${songLabel(featuredSet)}`,
      value: `Name starts with “${mapper.username[0]}”`,
    },
  ]
}

export function createMapperPuzzle(data: Dataset, day: DayKey): MapperPuzzle {
  const answer = pickInRotation(answerPool(data), 'mapper', puzzleNumberOf(day))
  const featuredSet = data.beatmapsets
    .filter((set) => set.creatorId === answer.id)
    .reduce((top, set) => (set.playCount > top.playCount ? set : top))
  return {
    day,
    answer,
    featuredSet,
    clues: mapperClues(answer, featuredSet, data.snapshotDate),
    signature: `mapper:${answer.id}`,
  }
}

/** Clue count visible after a number of misses. */
export function visibleClueCount(misses: number, finished: boolean): number {
  return finished ? MAPPER_GUESSES : Math.min(misses + 1, MAPPER_GUESSES)
}
