import { useCallback, useMemo, useState } from 'react'
import type { DayKey } from '../daily/day'
import { computeStats, resumeOrStart, type DayRecord, type DayResult, type GameStats } from './records'
import type { ProgressStore } from './storage'

export interface DailyRecord<State> {
  record: DayRecord<State>
  stats: GameStats
  /** Saves the new state immediately, so closing the tab never loses a move. */
  save(state: State, result?: DayResult): void
}

export function useDailyRecord<State>(
  store: ProgressStore<State>,
  day: DayKey,
  signature: string,
  initialState: State,
  today: DayKey,
  maxScore: number,
): DailyRecord<State> {
  const [records, setRecords] = useState(() => store.load())
  const record = resumeOrStart(records[day], day, signature, initialState)

  const save = useCallback(
    (state: State, result?: DayResult) => {
      const next: DayRecord<State> = { day, signature, state, result }
      store.save(next)
      setRecords((current) => ({ ...current, [day]: next }))
    },
    [store, day, signature],
  )

  const stats = useMemo(() => computeStats(records, today, maxScore), [records, today, maxScore])
  return { record, stats, save }
}
