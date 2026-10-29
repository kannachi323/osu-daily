import { addDays, type DayKey } from '../daily/day'

export interface DayResult {
  score: number
  maxScore: number
  won: boolean
  /** UTC day the puzzle was finished; differs from `day` for archive plays. */
  finishedOn: DayKey
}

/** One player's progress on one game's puzzle for one day. */
export interface DayRecord<State> {
  day: DayKey
  /** Identifies the generated puzzle, so a dataset update can't resume a different one. */
  signature: string
  state: State
  result?: DayResult
}

export interface GameStats {
  played: number
  wins: number
  currentStreak: number
  maxStreak: number
  /** `distribution[score]` = number of finished days with that score. */
  distribution: number[]
}

/**
 * Picks up an interrupted session when the stored record belongs to the same
 * puzzle; otherwise starts from `initialState`.
 */
export function resumeOrStart<State>(
  stored: DayRecord<State> | undefined,
  day: DayKey,
  signature: string,
  initialState: State,
): DayRecord<State> {
  if (stored && stored.day === day && stored.signature === signature) return stored
  return { day, signature, state: initialState }
}

function playedOnTheDay(record: DayRecord<unknown> | undefined): boolean {
  return record?.result !== undefined && record.result.finishedOn === record.day
}

/**
 * A streak counts consecutive days whose puzzle was finished on that day.
 * Today's unfinished puzzle doesn't break a streak until the day is over.
 */
export function computeStats(
  records: Record<DayKey, DayRecord<unknown>>,
  today: DayKey,
  maxScore: number,
): GameStats {
  const finished = Object.values(records).filter((record) => record.result)
  const distribution = Array.from({ length: maxScore + 1 }, () => 0)
  for (const record of finished) {
    const score = record.result!.score
    if (score >= 0 && score <= maxScore) distribution[score]++
  }

  let currentStreak = 0
  let cursor = playedOnTheDay(records[today]) ? today : addDays(today, -1)
  while (playedOnTheDay(records[cursor])) {
    currentStreak++
    cursor = addDays(cursor, -1)
  }

  const onTheDayDays = Object.values(records)
    .filter(playedOnTheDay)
    .map((record) => record.day)
    .sort()
  let maxStreak = 0
  let run = 0
  onTheDayDays.forEach((day, index) => {
    run = index > 0 && addDays(onTheDayDays[index - 1], 1) === day ? run + 1 : 1
    maxStreak = Math.max(maxStreak, run)
  })

  return {
    played: finished.length,
    wins: finished.filter((record) => record.result!.won).length,
    currentStreak,
    maxStreak,
    distribution,
  }
}
