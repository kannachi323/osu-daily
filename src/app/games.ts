export type GameId = 'trivia' | 'backdrop' | 'higher-lower' | 'mapper'

export interface GameInfo {
  id: GameId
  name: string
  /** A few words under the name on the home tile. */
  tagline: string
  path: string
  maxScore: number
}

export const GAMES: GameInfo[] = [
  { id: 'trivia', name: 'Trivia', tagline: 'Five questions', path: '/trivia', maxScore: 5 },
  { id: 'backdrop', name: 'Backdrop', tagline: 'Name the map from its art', path: '/backdrop', maxScore: 6 },
  { id: 'higher-lower', name: 'Higher or Lower', tagline: 'Ten calls in a row', path: '/higher-lower', maxScore: 10 },
  { id: 'mapper', name: 'Mapper', tagline: 'Guess the host from clues', path: '/mapper', maxScore: 5 },
]

export function gameById(id: GameId): GameInfo {
  return GAMES.find((game) => game.id === id)!
}

export type Route =
  | { page: 'home' }
  | { page: 'archive' }
  | { page: 'game'; gameId: GameId; puzzleNumber?: number }
  | { page: 'not-found' }

export function parseRoute(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return { page: 'home' }
  if (parts.length === 1 && parts[0] === 'archive') return { page: 'archive' }
  const game = GAMES.find((candidate) => candidate.path === `/${parts[0]}`)
  if (!game || parts.length > 2) return { page: 'not-found' }
  if (parts.length === 1) return { page: 'game', gameId: game.id }
  const puzzleNumber = Number(parts[1])
  return Number.isInteger(puzzleNumber) && puzzleNumber >= 1
    ? { page: 'game', gameId: game.id, puzzleNumber }
    : { page: 'not-found' }
}

/** Props every game page receives from the app. */
export interface GamePageProps {
  /** The puzzle's day; today's for normal play, earlier for the archive. */
  day: string
  today: string
  isArchive: boolean
}
