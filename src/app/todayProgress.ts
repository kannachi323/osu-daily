import type { DayKey } from '../shared/daily/day'
import type { DayResult } from '../shared/progress/records'
import { createProgressStore } from '../shared/progress/storage'
import { GAMES, type GameId } from './games'

const anyState = (state: unknown): state is unknown => state !== undefined

/** Each game's result for a day, without needing to know game state shapes. */
export function resultsForDay(day: DayKey): Partial<Record<GameId, DayResult>> {
  const results: Partial<Record<GameId, DayResult>> = {}
  for (const game of GAMES) {
    const result = createProgressStore(game.id, anyState).load()[day]?.result
    if (result) results[game.id] = result
  }
  return results
}

export function inProgressForDay(day: DayKey): Set<GameId> {
  return new Set(GAMES.filter((game) => createProgressStore(game.id, anyState).load()[day]).map((game) => game.id))
}

/** Where "Next" should go after finishing a game: the next unfinished one, else home. */
export function nextDestination(current: GameId, day: DayKey): { to: string; label: string } {
  const results = resultsForDay(day)
  const start = GAMES.findIndex((game) => game.id === current)
  for (let offset = 1; offset < GAMES.length; offset++) {
    const game = GAMES[(start + offset) % GAMES.length]
    if (!results[game.id]) return { to: game.path, label: game.name }
  }
  return { to: '/', label: 'All games' }
}
