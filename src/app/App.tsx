import { useEffect, useState, type ComponentType } from 'react'
import { ArchivePage } from '../features/archive/ArchivePage'
import { BackdropPage } from '../features/backdrop/BackdropPage'
import { HigherLowerPage } from '../features/higher-lower/HigherLowerPage'
import { HomePage } from '../features/home/HomePage'
import { MapperPage } from '../features/mapper/MapperPage'
import { TriviaPage } from '../features/trivia/TriviaPage'
import { dayKeyOfPuzzle, puzzleNumberOf, type DayKey } from '../shared/daily/day'
import { useToday } from '../shared/daily/useToday'
import { gameById, parseRoute, type GameId, type GamePageProps } from './games'
import { Link } from './Link'
import { usePathname } from './router'
import { SiteFooter } from './SiteFooter'

const GAME_PAGES: Record<GameId, ComponentType<GamePageProps>> = {
  trivia: TriviaPage,
  backdrop: BackdropPage,
  'higher-lower': HigherLowerPage,
  mapper: MapperPage,
}

const SITE_NAME = 'osu! daily'

function GameRoute({ gameId, puzzleNumber, today }: { gameId: GameId; puzzleNumber?: number; today: DayKey }) {
  // Pin the day when the page opens, so a game in progress at midnight isn't swapped out.
  const [openedOn] = useState(today)
  const isArchive = puzzleNumber !== undefined && puzzleNumber < puzzleNumberOf(openedOn)
  const day = isArchive ? dayKeyOfPuzzle(puzzleNumber) : openedOn
  const Page = GAME_PAGES[gameId]
  if (puzzleNumber !== undefined && puzzleNumber > puzzleNumberOf(openedOn)) return <NotFound />
  return <Page key={`${gameId}:${day}`} day={day} today={today} isArchive={isArchive} />
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight">Miss.</h1>
      <p className="mt-3 text-lg text-muted">That page isn’t here.</p>
      <Link to="/" className="mt-8 inline-block font-semibold text-pink-bright underline-offset-4 hover:underline">
        Back to today’s games
      </Link>
    </div>
  )
}

export function App() {
  const pathname = usePathname()
  const today = useToday()
  const route = parseRoute(pathname)

  const pageName = route.page === 'game' ? gameById(route.gameId).name : route.page === 'archive' ? 'Archive' : undefined
  useEffect(() => {
    document.title = pageName ? `${pageName} · ${SITE_NAME}` : `${SITE_NAME}: daily osu! mini-games`
  }, [pageName])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-pink focus:px-4 focus:py-2 focus:font-semibold focus:text-pink-ink"
      >
        Skip to content
      </a>
      {route.page !== 'game' && <SiteHeader />}
      <main id="main" className="flex-1">
        {route.page === 'home' && <HomePage today={today} />}
        {route.page === 'archive' && <ArchivePage today={today} />}
        {route.page === 'game' && <GameRoute gameId={route.gameId} puzzleNumber={route.puzzleNumber} today={today} />}
        {route.page === 'not-found' && <NotFound />}
      </main>
      <SiteFooter />
    </div>
  )
}

function SiteHeader() {
  return (
    <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
      <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight" aria-label="osu! daily home">
        <Mark />
        <span>
          osu! <span className="text-pink">daily</span>
        </span>
      </Link>
      <Link to="/archive" className="rounded-full px-4 py-2 font-semibold text-muted transition-colors hover:bg-white/5 hover:text-fg">
        Archive
      </Link>
    </header>
  )
}

/** Original mark: a filled dot inside a ring, like a target to click. */
function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--color-pink)" strokeWidth="3.5" />
      <circle cx="16" cy="16" r="5.5" fill="var(--color-fg)" />
    </svg>
  )
}
