import { describe, expect, it } from 'vitest'
import {
  addDays,
  dayKeyOf,
  dayKeyOfPuzzle,
  formatCountdown,
  isDayKey,
  LAUNCH_DAY,
  msUntilNextPuzzle,
  puzzleNumberOf,
} from './day'

describe('dayKeyOf', () => {
  it('uses the UTC date, whatever the local offset of the instant', () => {
    // The same instant written in three time zones.
    expect(dayKeyOf(new Date('2026-11-03T23:30:00-08:00'))).toBe('2026-11-04')
    expect(dayKeyOf(new Date('2026-11-04T07:30:00Z'))).toBe('2026-11-04')
    expect(dayKeyOf(new Date('2026-11-04T16:30:00+09:00'))).toBe('2026-11-04')
  })

  it('gives players in Tokyo and Los Angeles the same puzzle at the same moment', () => {
    const tokyoMorning = new Date('2026-11-05T08:00:00+09:00')
    const losAngelesAfternoon = new Date('2026-11-04T15:00:00-08:00')
    expect(tokyoMorning.getTime()).toBe(losAngelesAfternoon.getTime())
    expect(dayKeyOf(tokyoMorning)).toBe(dayKeyOf(losAngelesAfternoon))
  })

  it('rolls over exactly at UTC midnight', () => {
    expect(dayKeyOf(new Date('2026-12-31T23:59:59.999Z'))).toBe('2026-12-31')
    expect(dayKeyOf(new Date('2027-01-01T00:00:00.000Z'))).toBe('2027-01-01')
  })
})

describe('puzzle numbers', () => {
  it('starts at #1 on launch day and counts up daily', () => {
    expect(puzzleNumberOf(LAUNCH_DAY)).toBe(1)
    expect(puzzleNumberOf(addDays(LAUNCH_DAY, 1))).toBe(2)
    expect(puzzleNumberOf('2027-10-28')).toBe(366)
  })

  it('round-trips between numbers and days, across DST changes elsewhere', () => {
    for (const number of [1, 2, 5, 30, 150, 400]) {
      expect(puzzleNumberOf(dayKeyOfPuzzle(number))).toBe(number)
    }
  })
})

describe('countdown', () => {
  it('measures the time left until the next UTC midnight', () => {
    expect(msUntilNextPuzzle(new Date('2026-11-04T23:59:00Z'))).toBe(60_000)
    expect(msUntilNextPuzzle(new Date('2026-11-04T00:00:00Z'))).toBe(86_400_000)
    expect(msUntilNextPuzzle(new Date('2026-11-04T12:00:00+05:30'))).toBe((17 * 60 + 30) * 60_000)
  })

  it('formats as hh:mm:ss and never goes negative', () => {
    expect(formatCountdown(3_723_000)).toBe('01:02:03')
    expect(formatCountdown(-5)).toBe('00:00:00')
  })
})

describe('isDayKey', () => {
  it('accepts real dates only', () => {
    expect(isDayKey('2026-10-28')).toBe(true)
    expect(isDayKey('2026-13-01')).toBe(false)
    expect(isDayKey('yesterday')).toBe(false)
    expect(isDayKey(20261028)).toBe(false)
  })
})
