import { isDayKey, type DayKey } from '../daily/day'
import type { DayRecord } from './records'

const STORAGE_PREFIX = 'osu-daily:v1:'

/** The subset of the Web Storage API this module needs, so tests can pass a fake. */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

export type GameRecords<State> = Record<DayKey, DayRecord<State>>

export interface ProgressStore<State> {
  load(): GameRecords<State>
  save(record: DayRecord<State>): void
}

function browserStorage(): KeyValueStorage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    // Some privacy modes throw on access; play still works, it just isn't saved.
    return undefined
  }
}

function isRecord<State>(value: unknown, isState: (state: unknown) => state is State): value is DayRecord<State> {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Partial<DayRecord<unknown>>
  return isDayKey(record.day) && typeof record.signature === 'string' && isState(record.state)
}

export function createProgressStore<State>(
  gameId: string,
  isState: (state: unknown) => state is State,
  storage: KeyValueStorage | undefined = browserStorage(),
): ProgressStore<State> {
  const key = STORAGE_PREFIX + gameId

  function load(): GameRecords<State> {
    try {
      const parsed: unknown = JSON.parse(storage?.getItem(key) ?? '{}')
      if (typeof parsed !== 'object' || parsed === null) return {}
      const records: GameRecords<State> = {}
      for (const value of Object.values(parsed)) {
        if (isRecord(value, isState)) records[value.day] = value
      }
      return records
    } catch {
      return {}
    }
  }

  function save(record: DayRecord<State>) {
    try {
      storage?.setItem(key, JSON.stringify({ ...load(), [record.day]: record }))
    } catch {
      // Storage full or blocked: keep playing without persistence.
    }
  }

  return { load, save }
}
