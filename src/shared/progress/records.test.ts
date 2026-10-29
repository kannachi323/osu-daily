import { describe, expect, it } from 'vitest'
import { computeStats, resumeOrStart, type DayRecord } from './records'

function finished(day: string, score: number, finishedOn = day, won = score > 0): DayRecord<unknown> {
  return { day, signature: 'sig', state: {}, result: { score, maxScore: 5, won, finishedOn } }
}

function records(...list: DayRecord<unknown>[]) {
  return Object.fromEntries(list.map((record) => [record.day, record]))
}

describe('computeStats', () => {
  it('counts consecutive days ending today', () => {
    const stats = computeStats(
      records(finished('2026-11-02', 3), finished('2026-11-03', 5), finished('2026-11-04', 4)),
      '2026-11-04',
      5,
    )
    expect(stats.currentStreak).toBe(3)
    expect(stats.maxStreak).toBe(3)
    expect(stats.played).toBe(3)
    expect(stats.distribution).toEqual([0, 0, 0, 1, 1, 1])
  })

  it('keeps yesterday’s streak alive while today is still unplayed', () => {
    const stats = computeStats(records(finished('2026-11-02', 3), finished('2026-11-03', 5)), '2026-11-04', 5)
    expect(stats.currentStreak).toBe(2)
  })

  it('keeps the streak alive while today is in progress but unfinished', () => {
    const inProgress: DayRecord<unknown> = { day: '2026-11-04', signature: 'sig', state: {} }
    const stats = computeStats(records(finished('2026-11-03', 5), inProgress), '2026-11-04', 5)
    expect(stats.currentStreak).toBe(1)
    expect(stats.played).toBe(1)
  })

  it('resets after a missed day but remembers the best run', () => {
    const stats = computeStats(
      records(
        finished('2026-10-28', 1),
        finished('2026-10-29', 1),
        finished('2026-10-30', 1),
        finished('2026-11-02', 2),
      ),
      '2026-11-04',
      5,
    )
    expect(stats.currentStreak).toBe(0)
    expect(stats.maxStreak).toBe(3)
  })

  it('does not count archive plays towards streaks', () => {
    const stats = computeStats(
      records(finished('2026-11-03', 5, '2026-11-04'), finished('2026-11-04', 5)),
      '2026-11-04',
      5,
    )
    expect(stats.currentStreak).toBe(1)
    expect(stats.played).toBe(2)
  })

  it('streaks across a month and year boundary', () => {
    const stats = computeStats(
      records(finished('2026-12-30', 2), finished('2026-12-31', 2), finished('2027-01-01', 2)),
      '2027-01-01',
      5,
    )
    expect(stats.currentStreak).toBe(3)
  })

  it('counts wins separately from plays', () => {
    const stats = computeStats(records(finished('2026-11-03', 0), finished('2026-11-04', 4)), '2026-11-04', 5)
    expect(stats.wins).toBe(1)
  })
})

describe('resumeOrStart', () => {
  const initial = { answers: [] as number[] }

  it('resumes an interrupted session for the same puzzle', () => {
    const stored = { day: '2026-11-04', signature: 'trivia:abc', state: { answers: [2, 0] } }
    expect(resumeOrStart(stored, '2026-11-04', 'trivia:abc', initial)).toBe(stored)
  })

  it('starts fresh when the dataset changed the puzzle', () => {
    const stored = { day: '2026-11-04', signature: 'trivia:old', state: { answers: [2, 0] } }
    expect(resumeOrStart(stored, '2026-11-04', 'trivia:new', initial).state).toBe(initial)
  })

  it('starts fresh with no stored record', () => {
    expect(resumeOrStart(undefined, '2026-11-04', 'trivia:abc', initial)).toEqual({
      day: '2026-11-04',
      signature: 'trivia:abc',
      state: initial,
    })
  })
})
