/**
 * Every player gets the same puzzle for the same UTC calendar day, whatever
 * their local time zone. A "day key" is that UTC date as `YYYY-MM-DD`.
 */
export type DayKey = string

const MS_PER_DAY = 86_400_000

/** Day #1 of osu! daily. Puzzle numbers count up from here. */
export const LAUNCH_DAY: DayKey = '2026-10-28'

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function dayKeyOf(instant: Date): DayKey {
  return instant.toISOString().slice(0, 10)
}

export function isDayKey(value: unknown): value is DayKey {
  return typeof value === 'string' && DAY_KEY_PATTERN.test(value) && !Number.isNaN(startOfDay(value))
}

function startOfDay(day: DayKey): number {
  return Date.parse(`${day}T00:00:00Z`)
}

/** Puzzle number for a day: the launch day is #1. */
export function puzzleNumberOf(day: DayKey): number {
  return Math.round((startOfDay(day) - startOfDay(LAUNCH_DAY)) / MS_PER_DAY) + 1
}

export function dayKeyOfPuzzle(puzzleNumber: number): DayKey {
  return dayKeyOf(new Date(startOfDay(LAUNCH_DAY) + (puzzleNumber - 1) * MS_PER_DAY))
}

export function addDays(day: DayKey, amount: number): DayKey {
  return dayKeyOf(new Date(startOfDay(day) + amount * MS_PER_DAY))
}

/** Milliseconds from `now` until the next UTC midnight, when a new puzzle unlocks. */
export function msUntilNextPuzzle(now: Date): number {
  const nextDay = startOfDay(addDays(dayKeyOf(now), 1))
  return nextDay - now.getTime()
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}
